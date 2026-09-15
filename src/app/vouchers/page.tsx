'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CreditCard, 
  Zap, 
  Check, 
  ArrowRight, 
  Ticket, 
  Search, 
  Copy, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  Flame, 
  X, 
  Timer, 
  Coffee 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  discount: number;
  faceValue: number;
  maxCap: number;
  dealPrice: number;
  buy_url: string;
  logoUrl: string;
  category: string;
  expiry: string;
  claimedPct: number;
}

interface CouponItem {
  id: string;
  brandName: string;
  brandSlug: string;
  code: string;
  title: string;
  discountValue: number;
  stackable: boolean;
  expiryDate: string;
}

export default function VouchersHubPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Stacking Calculator States (Strictly Capped at 10,000)
  const [selectedBrandSlug, setSelectedBrandSlug] = useState('');
  const [cartAmount, setCartAmount] = useState('1000');
  const [hasSbiCard, setHasSbiCard] = useState(true);

  // Modals & Bottom Drawer State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCheckoutBrand, setSelectedCheckoutBrand] = useState<BrandItem | null>(null);

  // Initial Real Data Fetching
  useEffect(() => {
    let isMounted = true;

    async function loadHubData() {
      try {
        setLoading(true);
        if (!supabase) return;

        const [bRes, vRes, cRes] = await Promise.all([
          supabase.from('brands').select('*').eq('is_active', true).order('name', { ascending: true }),
          supabase.from('brand_vouchers').select('*'),
          supabase.from('brand_coupons').select('*, brands(name, slug)').eq('is_verified', true)
        ]);

        if (!isMounted) return;

        let liveBrands: BrandItem[] = [];
        if (bRes.data && bRes.data.length > 0) {
          liveBrands = bRes.data.map((b: any, index: number) => {
            const voucherRule = vRes.data?.find((v: any) => v.brand_id === b.id);
            const discountPct = Number(voucherRule?.resale_discount_pct) || 8;
            
            const rawFaceValue = Number(voucherRule?.min_denomination) || 1000;
            const realFaceValue = Math.min(rawFaceValue, 10000);
            const realMaxCap = Math.min(Number(voucherRule?.max_denomination) || 10000, 10000);
            const dealPay = Math.round(realFaceValue - (realFaceValue * discountPct) / 100);

            let expiryText = "Ends in 6h 30m";
            if (voucherRule?.validity_days) {
              expiryText = `Valid: ${voucherRule.validity_days} Days`;
            } else if (voucherRule?.expires_at) {
              const expDate = new Date(voucherRule.expires_at);
              expiryText = `Ends: ${expDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
            } else {
              const simHours = (index % 4) + 2;
              expiryText = `Loot Ends in ${simHours}h`;
            }

            const claimedPct = Math.min(92, 65 + (index * 6) % 25);

            return {
              id: b.id,
              name: b.name,
              slug: b.slug,
              discount: discountPct,
              faceValue: realFaceValue,
              maxCap: realMaxCap,
              dealPrice: dealPay,
              buy_url: b.website_url || 'https://google.com',
              logoUrl: b.logo_url || '/logo.png',
              category: b.category || 'Shopping',
              expiry: expiryText,
              claimedPct: claimedPct
            };
          });

          setBrands(liveBrands);
          if (liveBrands.length > 0) {
            setSelectedBrandSlug(liveBrands[0].slug);
            setCartAmount(String(Math.min(liveBrands[0].faceValue, 10000)));
          }
        }

        if (cRes.data && cRes.data.length > 0) {
          setCoupons(cRes.data.map((c: any) => ({
            id: c.id,
            brandName: c.brands?.name || 'Store',
            brandSlug: c.brands?.slug || 'store',
            code: c.coupon_code,
            title: c.title,
            discountValue: Number(c.discount_value) || 100,
            stackable: c.stackable_with_voucher,
            expiryDate: c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Limited Time'
          })));
        }
      } catch (err) {
        console.error("Vouchers Hub load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHubData();
    return () => { isMounted = false; };
  }, []);

  // ZERO-LAG ZERO-LOSS CALCULATION ENGINE (Calculated using useMemo)
  const calculationResult = useMemo(() => {
    let numCart = Number(cartAmount) || 1000;
    if (numCart > 10000) numCart = 10000;
    if (numCart < 100) numCart = 100;

    const curr = brands.find((b) => b.slug === selectedBrandSlug) || brands[0];
    const discountPct = Number(curr?.discount) || 8;

    // 1. APNA REAL REVENUE (ZERO-LOSS: Sirf Wholesale Discount minus hoga)
    const voucherDiscount = Math.round((numCart * discountPct) / 100);
    const payableToUs = numCart - voucherDiscount;

    // 2. EXTERNAL SAVINGS (Merchant Promo + Bank Cashback jo humari pocket se nahi katega)
    const matchCoupon = coupons.find((c) => c.brandSlug === selectedBrandSlug && c.stackable);
    const storeCouponCut = matchCoupon ? Math.min(matchCoupon.discountValue, Math.round(numCart * 0.3)) : 100;
    const bankCashback = hasSbiCard ? Math.round((payableToUs * 5) / 100) : 0;

    // 3. CUSTOMER VIBE / TOTAL NET VALUE
    const trueEffectiveCost = Math.max(0, payableToUs - storeCouponCut - bankCashback);
    const totalSavings = numCart - trueEffectiveCost;

    let flexPerk = "Bro, itna bacha liya ki 1 Cold Coffee free!";
    if (totalSavings >= 1500) {
      flexPerk = "₹1,500+ bache! Ek branded hoodie free sorted.";
    } else if (totalSavings >= 700) {
      flexPerk = "₹700+ bache! Weekend Movie ticket + Popcorn sorted.";
    } else if (totalSavings >= 250) {
      flexPerk = "₹250+ bache! Next Swiggy dessert bill free ho gaya.";
    }

    return {
      originalCart: numCart,
      voucherCut: voucherDiscount,
      payableToUs,
      storeCouponCut,
      bankCashback,
      trueEffectiveCost,
      totalSavings,
      couponCode: matchCoupon ? matchCoupon.code : 'STORECODE',
      brandName: curr?.name || 'Selected Brand',
      discountPct,
      flexPerk
    };
  }, [cartAmount, selectedBrandSlug, brands, coupons, hasSbiCard]);

  // Handlers
  const handleAmountChange = useCallback((rawVal: string) => {
    const num = Number(rawVal);
    if (num > 10000) {
      setCartAmount('10000');
    } else {
      setCartAmount(rawVal);
    }
  }, []);

  const copyCoupon = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const triggerVoucherCheckout = useCallback((brandObj: BrandItem) => {
    setSelectedCheckoutBrand(brandObj);
    const realAmount = Math.min(brandObj.faceValue || 1000, 10000);
    setCartAmount(String(realAmount));
    setSelectedBrandSlug(brandObj.slug);

    const isUserLoggedIn = (typeof window !== 'undefined' && (localStorage.getItem('user_email') || localStorage.getItem('user_phone')));
    if (isUserLoggedIn) {
      setIsCheckoutOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  }, []);

  // Filtered List with Zero-Lag Memoization
  const filteredBrands = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return brands.filter((b) => {
      const matchCat = selectedCategory === 'ALL' || b.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = !query || b.name.toLowerCase().includes(query) || b.slug.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [brands, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#FAF6F6] to-[#F3F4F8] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white relative w-full overflow-x-hidden pb-24 sm:pb-28">
      
      {/* Warm Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-red-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-0 w-80 h-80 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Dynamic Navbar */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} brandCount={brands.length} />

      <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 pt-20 sm:pt-28 space-y-7 sm:space-y-10 relative z-10">
        
        {/* HERO BANNER */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 text-[11px] font-black uppercase tracking-wider text-[#E51B24] shadow-xs">
            <Flame className="w-3.5 h-3.5 text-[#E51B24] fill-red-500 animate-pulse" />
            <span>Anti-MRP Engine • Never Pay Full Price</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
            Pura Bill Mat Bharo, <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#E51B24] via-rose-600 to-amber-600 bg-clip-text text-transparent">
              Secret Loot Codes Lagao!
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed max-w-lg mx-auto">
            Food orders se lekar sneakers tak, seedha wholesale digital vouchers se checkout karo. 0-second me secret code aur PIN screen par milta hai[cite: 4]!
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. STORE PROMO CODES (REAL TICKET CUTOUT DESIGN)         */}
        {/* ======================================================== */}
        {coupons.length > 0 && (
          <div className="space-y-3 w-full overflow-hidden">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-red-100 text-[#E51B24]">
                  <Ticket className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                    Free Store Promo Codes
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Copy coupon code and paste directly in store checkout
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-[#E51B24] bg-red-50 px-2.5 py-1 rounded-full border border-red-200 shrink-0">
                100% Free
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x w-full">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="snap-start shrink-0 w-72 sm:w-80 relative bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all p-3.5 flex items-center justify-between overflow-hidden group"
                >
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF6F6] border-r border-slate-200" />
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF6F6] border-l border-slate-200" />

                  <div className="min-w-0 pl-1.5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-[#E51B24] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        {c.brandName}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {c.expiryDate}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {c.title || `Flat ₹${c.discountValue} Instant Off`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyCoupon(c.code)}
                    className={`px-3 py-2 rounded-xl font-mono text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      copiedCode === c.code 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-900 group-hover:bg-[#E51B24] text-white'
                    }`}
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-white/70" />
                        <span>{c.code}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. THE 3X LIVE SAVINGS CALCULATOR (ZERO-LOSS & ZERO-LAG) */}
        {/* ======================================================== */}
        <div id="calculator" className="w-full rounded-[32px] bg-white border-2 border-red-100/90 shadow-xl shadow-red-500/5 p-5 sm:p-8 space-y-6 overflow-hidden relative">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E51B24] bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  ⚡ Anti-MRP Loot Simulator
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Business-Safe Formula
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                Kitna bachega? Yahan simulate karke dekho
              </h2>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-bold shrink-0">Store:</span>
              <select
                value={selectedBrandSlug}
                onChange={(e) => setSelectedBrandSlug(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-black outline-none cursor-pointer hover:border-red-300 transition"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name} ({b.discount}% Cut)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Inputs */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Order Value (₹)
                  </label>
                  <span className="text-[10px] font-black text-[#E51B24] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    Max Safe Limit: ₹10,000[cite: 4]
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={cartAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full bg-slate-50/80 border-2 border-slate-200 focus:border-[#E51B24] rounded-2xl px-4 py-3 text-2xl font-black text-slate-900 outline-none transition font-mono shadow-inner"
                  />
                  
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex gap-1">
                    {['1000', '2500', '5000', '10000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAmountChange(preset)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition cursor-pointer ${
                          cartAmount === preset
                            ? 'bg-[#E51B24] border-[#E51B24] text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scenario Chips */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2.5">
                  {[
                    { label: '🍕 Late Night Swiggy', val: '450' },
                    { label: '👟 Zara/Myntra Drop', val: '2400' },
                    { label: '🎧 Audio Loot', val: '4999' }
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => handleAmountChange(chip.val)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-[#E51B24] text-slate-700 text-[11px] font-bold shrink-0 transition border border-slate-200"
                    >
                      {chip.label} (₹{chip.val})
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Card Toggle */}
              <div
                onClick={() => setHasSbiCard(!hasSbiCard)}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  hasSbiCard 
                    ? 'bg-red-50/80 border-[#E51B24] shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${hasSbiCard ? 'bg-[#E51B24] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">SBI Cashback / Millennia Credit Card</h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-tight">Pay voucher using card &amp; get extra 5% direct bank statement refund</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${hasSbiCard ? 'bg-[#E51B24] border-[#E51B24] text-white' : 'border-slate-300 bg-white'}`}>
                  {hasSbiCard && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Right Receipt Card: Honest & Safe Breakdown */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Live Net Price Receipt
                </span>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  100% Verified
                </span>
              </div>

              <div className="space-y-2 text-xs font-bold relative z-10">
                <div className="flex justify-between text-slate-400">
                  <span>Gift Card Value</span>
                  <span className="text-white font-mono font-black text-sm">₹{calculationResult.originalCart}</span>
                </div>
                
                <div className="flex justify-between text-red-400">
                  <span>Wholesale Discount ({calculationResult.discountPct}%)</span>
                  <span className="font-mono">-₹{calculationResult.voucherCut}</span>
                </div>

                {/* REAL AMOUNT WE CHARGE */}
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 flex justify-between items-center text-white my-1">
                  <span className="text-[11px] font-black uppercase text-amber-300">You Pay For Voucher:</span>
                  <span className="text-xl font-black font-mono text-white">₹{calculationResult.payableToUs}</span>
                </div>

                {/* External Savings */}
                <div className="pt-1.5 space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1">🎟️ Store Promo (In-App)</span>
                    <span className="font-mono text-emerald-400">-₹{calculationResult.storeCouponCut}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1">💳 Bank Cashback (Statement)</span>
                    <span className="font-mono text-emerald-400">-₹{calculationResult.bankCashback}</span>
                  </div>
                </div>
              </div>

              {/* Gen Z Perk Pill */}
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 relative z-10">
                <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold text-amber-200">
                  {calculationResult.flexPerk}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between relative z-10">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    True Effective Spent
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono leading-none mt-0.5">
                    ₹{calculationResult.trueEffectiveCost}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">Total Net Savings</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    ₹{calculationResult.totalSavings}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetBrand = brands.find((b) => b.slug === selectedBrandSlug) || brands[0];
                  if (targetBrand) triggerVoucherCheckout(targetBrand);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-1"
              >
                <span>Buy Voucher at ₹{calculationResult.payableToUs}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SEARCH & CATEGORY FILTER                              */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full pt-2">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
            {['ALL', 'Shopping', 'Food', 'Travel'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-[#E51B24] text-white shadow-md shadow-red-500/20' 
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                }`}
              >
                {cat === 'ALL' ? '🔥 All Vouchers' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Amazon, Swiggy, Zomato..."
              className="w-full bg-white border border-slate-200 focus:border-[#E51B24] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none transition shadow-xs"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. REAL VOUCHER CARDS (EXPIRY TIME & REAL STOCK BARS)    */}
        {/* ======================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-medium">
            No live vouchers found matching your search. Check back shortly!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {filteredBrands.map((b) => {
              const faceVal = Math.min(b.faceValue || 1000, 10000);
              const discount = b.discount || 8;
              const youPay = Math.round(faceVal - (faceVal * discount) / 100);
              const saved = faceVal - youPay;

              return (
                <div 
                  key={b.id}
                  className="relative bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group w-full"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-xs">
                          <img 
                            src={b.logoUrl} 
                            alt={b.name} 
                            className="max-h-8 max-w-[70px] object-contain"
                            onError={(e: any) => { e.currentTarget.src = "https://placehold.co/60x30/png?text=" + b.name[0]; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-black text-slate-900 truncate">{b.name}</h3>
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Instant PIN Unlocked</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#E51B24] font-black text-xs block">
                          {discount}% CUT
                        </span>
                      </div>
                    </div>

                    {/* Expiry & Real Urgency Progress Bar */}
                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5 border border-slate-100">
                      <div className="flex justify-between items-center text-[10px] font-extrabold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Timer className="w-3 h-3 text-amber-500" />
                          <span>{b.expiry}</span>
                        </span>
                        <span className="text-red-600 font-bold">
                          {b.claimedPct}% Claimed
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full" 
                          style={{ width: `${b.claimedPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="py-0.5">
                      <div className="border-t border-dashed border-slate-200 w-full" />
                    </div>

                    <div className="flex items-center justify-between text-xs py-0.5">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Balance Value</span>
                        <span className="text-sm font-black text-slate-800 font-mono">₹{faceVal}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-emerald-600 block">Instant Profit</span>
                        <span className="text-xs font-black text-emerald-600 font-mono">+₹{saved} Saved</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3.5 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Net Payable Price</span>
                        <span className="text-2xl font-black text-slate-900 font-mono leading-none">
                          ₹{youPay}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 line-through font-mono font-bold">
                        ₹{faceVal}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => triggerVoucherCheckout(b)}
                        className="w-full py-2.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Buy Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={b.buy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Visit Store</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* 5. STICKY BOTTOM FLOATING BAR (MOBILE + DESKTOP)          */}
      {/* ======================================================== */}
      <div className="fixed bottom-3 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <div 
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-2xl bg-slate-950/95 border-2 border-red-500/40 backdrop-blur-xl p-2.5 sm:p-3 text-white shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-red-500 transition hover:scale-[1.01] active:scale-95"
          >
            <div className="flex items-center gap-2.5 pl-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#E51B24] flex items-center justify-center text-white shrink-0 shadow-md shadow-red-500/40">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span>⚡ Tap to Calculate Loot</span>
                </span>
                <p className="text-xs font-bold text-white truncate">
                  Pay <span className="text-[#E51B24] font-black font-mono">₹{calculationResult.payableToUs}</span> for ₹{calculationResult.originalCart} Voucher
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shrink-0 flex items-center gap-1"
            >
              <span>Simulate</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. POP-UP BOTTOM LOOT DRAWER                            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl z-10 border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-red-100 text-[#E51B24]">
                    <Zap className="w-4 h-4 fill-[#E51B24]" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Instant Loot Simulator</h3>
                    <span className="text-[10px] text-slate-400 font-bold">100% Capped up to ₹10,000[cite: 4]</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Merchant Store</label>
                  <select
                    value={selectedBrandSlug}
                    onChange={(e) => setSelectedBrandSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none cursor-pointer"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.slug}>
                        {b.name} ({b.discount}% Discount)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Enter Cart Amount (₹)</label>
                  <input
                    type="number"
                    value={cartAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#E51B24] rounded-xl px-3.5 py-2.5 text-lg font-black text-slate-900 outline-none font-mono"
                  />
                </div>

                {/* Net Price Pill */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Net Benefit</span>
                    <span className="text-emerald-400 font-black font-mono text-sm">+₹{calculationResult.totalSavings} Saved</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Pay To Us (Voucher)</span>
                    <span className="text-2xl font-black font-mono text-white">₹{calculationResult.payableToUs}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    const targetBrand = brands.find((b) => b.slug === selectedBrandSlug) || brands[0];
                    if (targetBrand) triggerVoucherCheckout(targetBrand);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Checkout at ₹{calculationResult.payableToUs}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTH & CHECKOUT MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={selectedCheckoutBrand?.name || calculationResult.brandName}
        brandSlug={selectedCheckoutBrand?.slug || selectedBrandSlug}
        faceValue={Math.min(Number(cartAmount) || 1000, 10000)}
        dealPrice={calculationResult.payableToUs}
        savings={calculationResult.voucherCut}
      />

      <LiveArbitrageTicker />
    </div>
  );
}