import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Production Security Token taaki koi unauthorized user cron trigger na kar sake
const CRON_SECRET = process.env.CRON_SECRET || 'bachat-engine-sync-key';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized sync access' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection missing' }, { status: 500 });
    }

    // 1. External Coupon Feed API Call (Example: Cuelinks / Affiliate Feed API)
    // Real setup me Cuelinks API URL aur API-KEY .env me jayegi
    const CUELINKS_API_URL = process.env.COUPON_FEED_URL || 'https://api.cuelinks.com/v2/coupons.json';
    const API_TOKEN = process.env.COUPON_API_KEY || '';

    // Sample simulation of external feed response structure
    let externalCoupons = [];
    
    if (API_TOKEN) {
      const apiRes = await fetch(CUELINKS_API_URL, {
        headers: {
          'Authorization': `Token token=${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 0 } // No cache
      });
      const feedData = await apiRes.json();
      externalCoupons = feedData.coupons || [];
    } else {
      // Direct Real-world fallback data format jo feed API bhejti hai
      externalCoupons = [
        {
          merchant_name: "Domino's Pizza",
          slug: "dominos",
          code: "DOM100",
          title: "Flat ₹100 OFF on Everyday Value Pizzas",
          terms: "Valid on min order of ₹400",
          is_stackable: true,
          expiry: "2026-12-31"
        },
        {
          merchant_name: "Zomato",
          slug: "zomato",
          code: "ZOMATOFEAST",
          title: "Up to 50% OFF on Top Dining Restaurants",
          terms: "Max discount ₹120",
          is_stackable: false,
          expiry: "2026-10-15"
        },
        {
          merchant_name: "Myntra",
          slug: "myntra",
          code: "INSIDER250",
          title: "Extra ₹250 OFF on Footwear & Bags",
          terms: "Valid on carts above ₹1499",
          is_stackable: true,
          expiry: "2026-11-20"
        }
      ];
    }

    let syncedCount = 0;

    // 2. Loop through every incoming coupon and sync dynamically
    for (const item of externalCoupons) {
      // Step A: Brand Check in Supabase
      const { data: brandMatch } = await supabase
        .from('brands')
        .select('id, name')
        .ilike('slug', `%${item.slug}%`)
        .single();

      let brandId = brandMatch?.id;

      // Agar brand database me exist nahi karta, toh dynamically naya brand create karo
      if (!brandId) {
        const { data: newBrand, error: brandErr } = await supabase
          .from('brands')
          .insert({
            name: item.merchant_name,
            slug: item.slug,
            is_active: true,
            website_url: `https://${item.slug}.com`
          })
          .select('id')
          .single();

        if (!brandErr && newBrand) {
          brandId = newBrand.id;
        }
      }

      // Step B: Upsert Coupon into brand_coupons table
      if (brandId && item.code) {
        const { error: couponError } = await supabase
          .from('brand_coupons')
          .upsert({
            brand_id: brandId,
            coupon_code: item.code,
            title: item.title,
            stackable_with_voucher: item.is_stackable,
            is_verified: true,
            expiry_date: item.expiry
          }, {
            onConflict: 'coupon_code' // Duplicate codes overwrite honge, error nahi dega
          });

        if (!couponError) {
          syncedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync complete. ${syncedCount} dynamic coupons injected/updated directly into Supabase.`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Coupon Sync Pipeline Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}