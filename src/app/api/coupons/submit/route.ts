import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandSlug, code, title, stackable } = body;

    if (!brandSlug || !code) {
      return NextResponse.json(
        { error: 'Brand aur Coupon code dono zaroori hain.' }, 
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database missing' }, { status: 500 });
    }

    // 1. Check brand in Supabase
    const { data: brandMatch, error: brandErr } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', brandSlug)
      .single();

    if (brandErr || !brandMatch) {
      return NextResponse.json({ error: 'Brand database me nahi mila.' }, { status: 404 });
    }

    // 2. Insert into brand_coupons
    const cleanCode = code.trim().toUpperCase();
    const { data, error: insertErr } = await supabase
      .from('brand_coupons')
      .insert({
        brand_id: brandMatch.id,
        coupon_code: cleanCode,
        title: title || `Flat discount code (${cleanCode})`,
        stackable_with_voucher: Boolean(stackable),
        is_verified: true, // Community submitted, live immediately
      })
      .select()
      .single();

    if (insertErr) {
      if (insertErr.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Ye code already hamare database me registered hai!' }, 
          { status: 409 }
        );
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon successfully submitted and live on BachatEngine!',
      coupon: data
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}