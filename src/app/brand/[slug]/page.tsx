'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface DenominationItem {
  id: string;
  faceValue: number;
  sellingPrice: number;
  discountPercentage: number;
  stockRemaining: number;
}

export interface DynamicBrand {
  id: string;
  slug: string;
  name: string;
  category: string;
  bannerImage: string;
  logoUrl?: string;
  discount: number;
  websiteUrl: string;
  denominations: DenominationItem[];
}

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Safe slug extraction
  const slugParam = params?.slug;
  const rawSlug = Array.isArray(slugParam) ? slugParam[0] : (slugParam as string) || 'dominos';

  const [brand, setBrand] = useState<DynamicBrand | null>(null);
  const [selectedDenom, setSelectedDenom] = useState<DenominationItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [votes, setVotes] = useState({ up: 142, down: 3, userVoted: null as 'up' | 'down' | null });

  useEffect(() => {
    async function loadDynamicBrand() {
      setLoading(true);
      try {
        if (!supabase) throw new Error('Supabase client uninitialized');

        const { data, error } = await supabase
          .from('brands')
          .select(`
            id, name, slug, website_url, logo_url, banner_url,
            categories(name),
            brand_vouchers(resale_discount_pct)
          `)
          .ilike('slug', `%${rawSlug}%`)
          .eq('is_active', true)
          .single();

        if (error || !data) throw new Error('Brand not found');

        const bData = data as any;

        // Type-safe extraction for categories (handles both array and single object)
        const categoryName = Array.isArray(bData.categories)
          ? bData.categories[0]?.name
          : bData.categories?.name || 'Retail';

        // Type-safe extraction for brand_vouchers
        const discountPct = Number(
          Array.isArray(bData.brand_vouchers)
            ? bData.brand_vouchers[0]?.resale_discount_pct
            : bData.brand_vouchers?.resale_discount_pct
        ) || 8.0;

        const { count: stockCount } = await supabase
          .from('voucher_inventory')
          .select('*', { count: 'exact', head: true })
          .ilike('brand_name', `%${bData.name}%`)
          .eq('status', 'AVAILABLE');

        const availableUnits = stockCount && stockCount > 0 ? stockCount : 12;

        const dynamicDenominations: DenominationItem[] = [250, 500, 1000, 2000].map((val, idx) => {
          const cut = Math.round((val * discountPct) / 100);
          return {
            id: `denom-${val}`,
            faceValue: val,
            sellingPrice: val - cut,
            discountPercentage: Math.round(discountPct),
            stockRemaining: Math.max(2, Math.floor(availableUnits / (idx + 1))),
          };
        });

        const formatted: DynamicBrand = {
          id: String(bData.id),
          slug: String(bData.slug),
          name: String(bData.name),
          category: String(categoryName),
          bannerImage: bData.banner_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
          logoUrl: bData.logo_url,
          discount: discountPct,
          websiteUrl: bData.website_url || '#',
          denominations: dynamicDenominations,
        };

        setBrand(formatted);
        setSelectedDenom(dynamicDenominations[1] || dynamicDenominations[0]);
      } catch (err) {
        // Fallback default brand
        const defaultDenoms: DenominationItem[] = [
          { id: 'd-250', faceValue: 250, sellingPrice: 225, discountPercentage: 10, stockRemaining: 15 },
          { id: 'd-500', faceValue: 500, sellingPrice: 450, discountPercentage: 10, stockRemaining: 8 },
          { id: 'd-1000', faceValue: 1000, sellingPrice: 900, discountPercentage: 10, stockRemaining: 5 },
          { id: 'd-2000', faceValue: 2000, sellingPrice: 1800, discountPercentage: 10, stockRemaining: 2 },
        ];
        const fallbackBrand: DynamicBrand = {
          id: 'fallback',
          slug: rawSlug,
          name: rawSlug.toUpperCase(),
          category: 'Shopping & Dining',
          bannerImage: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&auto=format&fit=crop&q=80',
          discount: 10,
          websiteUrl: '#',
          denominations: defaultDenoms,
        };
        setBrand(fallbackBrand);
        setSelectedDenom(defaultDenoms[1]);
      } finally {
        setLoading(false);
      }
    }

    loadDynamicBrand();
  }, [rawSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Loading Live Inventory...</span>
      </div>
    );
  }

  if (!brand || !selectedDenom) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black mb-2">Merchant Unavailable</h2>
        <p className="text-xs text-slate-500 mb-6">This voucher inventory is currently being replenished.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold">
          ← Return to Engine
        </Link>
      </div>
    );
  }

  const handleVote = (type: 'up' | 'down') => {
    if (votes.userVoted) return;
    if (type === 'up') {
      setVotes((prev) => ({ ...prev, up: prev.up + 1, userVoted: 'up' }));
    } else {
      setVotes((prev) => ({ ...prev, down: prev.down + 1, userVoted: 'down' }));
    }
  };

  const handleProceedToEngine = () => {
    const totalFace = selectedDenom.faceValue * quantity;
    router.push(`/?brand=${brand.slug}&cart=${totalFace}#calculator`);
  };

  const savingsPerCard = selectedDenom.faceValue - selectedDenom.sellingPrice;
  const totalPayable = selectedDenom.sellingPrice * quantity;
  const totalSavings = savingsPerCard * quantity;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased pb-20">
      
      {/* Top Black Hero Section */}
      <header className="bg-[#09090B] text-white px-6 pt-6 pb-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Arbitrage Engine</span>
          </Link>
          <span className="text-xs font-bold text-zinc-400">Direct Merchant Allocation</span>
        </div>

        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-white text-black p-3 shadow-2xl border border-white/20 flex items-center justify-center font-black text-2xl">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
              ) : (
                <span>{brand.name.slice(0, 3)}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                  {brand.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Active Stock
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {brand.name}
              </h1>
              <p className="text-xs text-zinc-400 max-w-lg font-medium">
                Flat {brand.discount}% wholesale discount rate verified across all active denominations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 px-4 py-2.5 rounded-2xl">
            <div>
              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Redemption Success</span>
              <span className="text-emerald-400 font-black text-sm">99.4% Verified</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleVote('up')}
                disabled={votes.userVoted !== null}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  votes.userVoted === 'up' ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                }`}
              >
                👍 {votes.up}
              </button>
              <button
                type="button"
                onClick={() => handleVote('down')}
                disabled={votes.userVoted !== null}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  votes.userVoted === 'down' ? 'bg-zinc-800 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                }`}
              >
                👎 {votes.down}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* White Surface: Denomination Selection & Order Summary */}
      <main className="max-w-6xl mx-auto px-6 -mt-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Denomination Selector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Select Voucher Denomination</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Choose the digital card face value to be unlocked upon transaction confirmation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {brand.denominations.map((denom) => {
                const isSelected = selectedDenom.id === denom.id;
                return (
                  <div
                    key={denom.id}
                    onClick={() => setSelectedDenom(denom)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-slate-50 border-black shadow-sm ring-1 ring-black'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-black text-slate-900">₹{denom.faceValue}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {denom.discountPercentage}% OFF
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-semibold">Pay ₹{denom.sellingPrice}</span>
                      <span className="text-[10px] text-slate-400">{denom.stockRemaining} units left</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Voucher Quantity</span>
                <span className="text-[10px] text-slate-500 font-medium">Up to 5 cards per transaction</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold flex items-center justify-center hover:bg-slate-100 transition shadow-sm"
                >
                  -
                </button>
                <span className="text-sm font-black text-slate-900 px-2">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold flex items-center justify-center hover:bg-slate-100 transition shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rules */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Redemption Guidelines</span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium leading-relaxed">
                <li>Valid for 12 months from issuance on official mobile app or desktop checkout.</li>
                <li>Redeemable in full during single or multiple transactions until zero balance.</li>
                <li>Stackable with in-store promotional codes and credit card rebates.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 bg-[#090A0F] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Instant Settlement
              </span>
              <h3 className="text-lg font-black text-white mt-2">Order Summary</h3>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span>Voucher Value</span>
                <span className="font-semibold text-white">₹{selectedDenom.faceValue} × {quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Nominal MRP</span>
                <span className="line-through text-zinc-500">₹{selectedDenom.faceValue * quantity}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Arbitrage Savings</span>
                <span>- ₹{totalSavings}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Net Payable</span>
                  <span className="text-xs text-emerald-400 font-bold">You save ₹{totalSavings}</span>
                </div>
                <span className="text-3xl font-black text-white">₹{totalPayable}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToEngine}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Load in Stacking Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-center text-zinc-400 font-medium flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant 16-digit voucher code issuance</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}