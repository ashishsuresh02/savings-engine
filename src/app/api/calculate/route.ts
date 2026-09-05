import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { brandSlug, cartValue, hasSbiCard } = await req.json();
    const numCart = Number(cartValue);

    if (!brandSlug || isNaN(numCart) || numCart <= 0) {
      return NextResponse.json({ error: 'Valid brand and cart value required' }, { status: 400 });
    }

    // 1. Fetch brand details along with its vouchers and coupons from Supabase
    const { data: brand, error: brandError } = await (supabase
      .from('brands')
      .select(`
        id, name, slug, website_url,
        brand_vouchers (*),
        brand_coupons (*)
      `)
      .eq('slug', brandSlug)
      .single() as any);

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found in database' }, { status: 404 });
    }

    // 2. Fetch specific card perk for this brand (if any)
    let cardRewardPct = hasSbiCard ? 5.0 : 0.0;
    if (hasSbiCard) {
      const { data: perk } = await (supabase
        .from('card_merchant_perks')
        .select('exclusive_cashback_pct, payment_instruments!inner(slug)')
        .eq('brand_id', brand.id)
        .eq('payment_instruments.slug', 'sbi-cashback')
        .maybeSingle() as any);

      if (perk && perk.exclusive_cashback_pct) {
        cardRewardPct = Number(perk.exclusive_cashback_pct);
      }
    }

    // 3. Direct Coupon Route Calculation
    let directCouponSaving = 0;
    let appliedCoupon: any = null;

    if (brand.brand_coupons && brand.brand_coupons.length > 0) {
      const validCoupons = brand.brand_coupons.filter(
        (c: any) => numCart >= Number(c.min_cart_value || 0) && c.is_verified
      );

      validCoupons.forEach((c: any) => {
        let saving = 0;
        if (c.discount_type === 'FLAT') {
          saving = Number(c.discount_value);
        } else {
          saving = (numCart * Number(c.discount_value)) / 100;
          if (c.max_discount_cap && saving > Number(c.max_discount_cap)) {
            saving = Number(c.max_discount_cap);
          }
        }
        if (saving > directCouponSaving) {
          directCouponSaving = saving;
          appliedCoupon = c;
        }
      });
    }

    const directPayable = Math.max(0, numCart - directCouponSaving);
    const directCardReward = (directPayable * cardRewardPct) / 100;
    const directEffectiveCost = directPayable - directCardReward;

    // 4. E-Voucher Route Calculation
    let voucherSaving = 0;
    let voucherBuyPrice = numCart;
    const activeVoucher: any = brand.brand_vouchers?.[0];

    if (activeVoucher) {
      voucherSaving = (numCart * Number(activeVoucher.resale_discount_pct)) / 100;
      voucherBuyPrice = numCart - voucherSaving;
    }

    const voucherCardReward = (voucherBuyPrice * cardRewardPct) / 100;
    const voucherEffectiveCost = voucherBuyPrice - voucherCardReward;

    // 5. Stacking Route (Where coupon allows voucher combination)
    let stackedEffectiveCost = 999999;
    let stackedVoucherSaving = 0;

    if (appliedCoupon && appliedCoupon.stackable_with_voucher && activeVoucher) {
      const postCouponCart = Math.max(0, numCart - directCouponSaving);
      stackedVoucherSaving = (postCouponCart * Number(activeVoucher.resale_discount_pct)) / 100;
      const stackedBuyPrice = postCouponCart - stackedVoucherSaving;
      const stackedCardReward = (stackedBuyPrice * cardRewardPct) / 100;
      stackedEffectiveCost = stackedBuyPrice - stackedCardReward;
    }

    // 6. Optimal Execution Selection
    let bestRoute: 'VOUCHER' | 'COUPON' | 'STACKED' = 'VOUCHER';
    let bestCost = voucherEffectiveCost;

    if (stackedEffectiveCost < bestCost) {
      bestRoute = 'STACKED';
      bestCost = stackedEffectiveCost;
    } else if (directEffectiveCost < bestCost) {
      bestRoute = 'COUPON';
      bestCost = directEffectiveCost;
    }

    const totalSaved = numCart - bestCost;

    return NextResponse.json({
      brandId: brand.id,
      brandName: brand.name,
      originalCart: numCart,
      bestRoute,
      bestEffectiveCost: Number(bestCost.toFixed(2)),
      totalSavings: Number(totalSaved.toFixed(2)),
      breakdown: {
        couponCut: directCouponSaving,
        voucherCut: bestRoute === 'STACKED' ? stackedVoucherSaving : voucherSaving,
        cardCashback: Number((hasSbiCard ? (numCart - totalSaved) * (cardRewardPct / 100) : 0).toFixed(2)),
        couponCode: appliedCoupon ? appliedCoupon.coupon_code : null,
        buyUrl: activeVoucher?.direct_buy_url || brand.website_url
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}