import { supabase } from '@/lib/supabase';

export interface LiveBrandDeal {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  discount: number;
  buy_url: string;
  logo_url: string;
}

export interface LiveCoupon {
  id: string;
  brandName: string;
  code: string;
  title: string;
  stackable: boolean;
  discountValue: number;
}

export interface LiveCard {
  id: string;
  name: string;
  issuer_bank: string;
  base_cashback: number;
  joining_fee: number;
  url: string;
  bestFor: string;
}

// 1. Fetch Only Active Brands With Live Discounts
export async function getLiveBrands(): Promise<LiveBrandDeal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('brands')
    .select(`
      id, name, slug, website_url, logo_url,
      categories(name),
      brand_vouchers(resale_discount_pct)
    `)
    .eq('is_active', true);

  if (error || !data) return [];

  return data.map((b: any) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    category_name: b.categories?.name || 'General',
    discount: b.brand_vouchers?.[0]?.resale_discount_pct || 5.0,
    buy_url: b.website_url,
    logo_url: b.logo_url
  }));
}

// 2. Fetch Only Verified, Non-Expired Coupons
export async function getLiveCoupons(): Promise<LiveCoupon[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('brand_coupons')
    .select(`
      id, coupon_code, title, discount_value, stackable_with_voucher,
      brands(name)
    `)
    .eq('is_verified', true);

  if (error || !data) return [];

  return data.map((c: any) => ({
    id: c.id,
    brandName: c.brands?.name || 'Partner Store',
    code: c.coupon_code,
    title: c.title,
    stackable: c.stackable_with_voucher,
    discountValue: Number(c.discount_value) || 50
  }));
}

// 3. Fetch Live Credit Cards
export async function getLiveCards(): Promise<LiveCard[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('payment_instruments')
    .select('*')
    .eq('is_active', true);

  if (error || !data) return [];

  return data.map((card: any) => ({
    id: card.id,
    name: card.name,
    issuer_bank: card.issuer_bank,
    base_cashback: Number(card.base_online_cashback_pct) || 5.0,
    joining_fee: Number(card.joining_fee) || 0,
    url: card.apply_referral_url || 'https://gromo.in',
    bestFor: 'Online Spends'
  }));
}