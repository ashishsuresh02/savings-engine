import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { brandSlug, cartValue, hasSbiCard } = await req.json();
    const numCart = Number(cartValue);

    if (!brandSlug || isNaN(numCart) || numCart <= 0) {
      return NextResponse.json({ error: 'Valid brand and cart value required' }, { status: 400 });
    }

    // Fetch brand with associated vouchers & coupons
    const { data: brand, error } = await supabase
      .from('brands')
      .select(`
        id, name, slug, logo_url,
        brand_vouchers (*),
        brand_coupons (*)
      `)
      .eq('slug', brandSlug)
      .single();

    if (error || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // 1. Direct Coupon Route
    let directCouponSaving = 0;
    let appliedCoupon = null;

    if (brand.brand_coupons && brand.brand_coupons.length > 0) {
      const validCoupons = brand.brand_coupons.filter(
        (c: any) => numCart >= Number(c.min_cart_value) && c.is_verified
      );

      validCoupons.forEach((c: any) => {
        let saving = (numCart * Number(c.discount_value)) / 100;
        if (c.max_discount_cap && saving > Number(c.max_discount_cap)) {
          saving = Number(c.max_discount_cap);
        }
        if (saving > directCouponSaving) {
          directCouponSaving = saving;
          appliedCoupon = c;
        }
      });
    }

    const directPayable = numCart - directCouponSaving;
    const directCardReward = hasSbiCard ? directPayable * 0.05 : 0;
    const directEffectiveCost = directPayable - directCardReward;

    // 2. Discounted E-Voucher Route
    let voucherSaving = 0;
    let voucherBuyPrice = numCart;
    const voucher = brand.brand_vouchers?.[0];

    if (voucher) {
      voucherSaving = (numCart * Number(voucher.resale_discount_pct)) / 100;
      voucherBuyPrice = numCart - voucherSaving;
    }

    const voucherCardReward = hasSbiCard ? voucherBuyPrice * 0.05 : 0;
    const voucherEffectiveCost = voucherBuyPrice - voucherCardReward;

    // 3. Stacking Route (If coupon permits voucher)
    let stackedEffectiveCost = 999999;
    let stackedVoucherSaving = 0;

    if (appliedCoupon && appliedCoupon.stackable_with_voucher && voucher) {
      const postCouponCart = numCart - directCouponSaving;
      stackedVoucherSaving = (postCouponCart * Number(voucher.resale_discount_pct)) / 100;
      const stackedBuyPrice = postCouponCart - stackedVoucherSaving;
      const stackedCardReward = hasSbiCard ? stackedBuyPrice * 0.05 : 0;
      stackedEffectiveCost = stackedBuyPrice - stackedCardReward;
    }

    // Determine absolute lowest cost
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
      brandName: brand.name,
      originalCart: numCart,
      bestRoute,
      bestEffectiveCost: Number(bestCost.toFixed(2)),
      totalSavings: Number(totalSaved.toFixed(2)),
      breakdown: {
        couponCut: directCouponSaving,
        voucherCut: bestRoute === 'STACKED' ? stackedVoucherSaving : voucherSaving,
        cardCashback: hasSbiCard ? Number((bestCost * 0.05).toFixed(2)) : 0,
        couponCode: appliedCoupon?.coupon_code || null,
        buyUrl: voucher?.direct_buy_url || brand.brand_coupons?.[0]?.affiliate_redirect_url || '#'
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}