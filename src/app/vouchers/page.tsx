'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CreditCard, 
  Zap, 
  Check, 
  ArrowRight, 
  Ticket, 
  Search, 
  Layers, 
  ShieldCheck, 
  Percent,
  Flame,
  ArrowUpRight,
  Wallet,
  TrendingDown
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';

export default function VouchersHubPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Stacking Calculator States
  const [selectedBrandSlug, setSelectedBrandSlug] = useState('');
  const [cartAmount, setCartAmount] = useState('2000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Modals & Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCheckoutBrand, setSelectedCheckoutBrand] = useState<any>(null);

  useEffect(() => {
    async function loadHubData() {
      try {
        setLoading(true);
        if (!supabase) return;

        const { data: bData } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        const { data: vData } = await supabase.from('brand_vouchers').select('*');

        if (bData && bData.length > 0) {
          const liveMerged = bData.map((b: any) => {
            const voucherRule = vData?.find((v: any) => v.brand_id === b.id);
            const discountPct = Number(voucherRule?.resale_discount_pct) || 10;
            const maxVal = Number(voucherRule?.max_denomination) || 10000;
            const baseFace = Number(voucherRule?.min_denomination) === 500 ? 500 : 1000;
            const dealPay = Math.round(baseFace - (baseFace * discountPct) / 100);

            return {
              id: b.id,
              name: b.name,
              slug: b.slug,
              discount: discountPct,
              faceValue: baseFace,
              maxCap: maxVal,
              dealPrice: dealPay,
              buy_url: b.website_url || 'https://google.com',
              logoUrl: b.logo_url || '/logo.png',
              category: b.category || 'Shopping'
            };
          });

          setBrands(liveMerged);
          if (liveMerged.length > 0) {
            setSelectedBrandSlug(liveMerged[0].slug);
            calculateArbitrage(cartAmount, liveMerged[0].slug, liveMerged, coupons, hasSbiCard);
          }
        }

        const { data: cData } = await supabase
          .from('brand_coupons')
          .select('*, brands(name, slug)')
          .eq('is_verified', true);

        if (cData && cData.length > 0) {
          setCoupons(cData.map((c: any) => ({
            id: c.id,
            brandSlug: c.brands?.slug || 'store',
            code: c.coupon_code,
            discountValue: Number(c.discount_value) || 150,
            stackable: c.stackable_with_voucher
          })));
        }
      } catch (err) {
        console.error("Voucher Hub load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHubData();
  }, []);

  // 3X Arbitrage Stacking Engine Logic
  const calculateArbitrage = (
    amt: string, 
    slug: string, 
    brandList = brands, 
    couponList = coupons, 
    cardActive = hasSbiCard
  ) => {
    let numCart = Number(amt) || 2000;
    if (numCart > 10000) numCart = 10000;

    const curr = brandList.find((b) => b.slug === slug) || brandList[0];
    const discountPct = Number(curr?.discount) || 10;
    const voucherCut = Math.round((numCart * discountPct) / 100);
    const postVoucher = numCart - voucherCut;

    const matchCoupon = couponList.find((c) => c.brandSlug === slug && c.stackable);
    const couponCut = matchCoupon ? matchCoupon.discountValue : 150;
    const afterCoupon = Math.max(0, postVoucher - couponCut);
    const cardCashback = cardActive ? Math.round((afterCoupon * 5) / 100) : 0;
    const finalCost = Math.max(0, afterCoupon - cardCashback);
    const totalSaved = numCart - finalCost;

    setResult({
      originalCart: numCart,
      bestEffectiveCost: finalCost,
      totalSavings: totalSaved,
      voucherCut,
      couponCut,
      couponCode: matchCoupon ? matchCoupon.code : 'SAVE150',
      cardCashback,
      brandName: curr?.name || 'Selected Brand',
      discountPct
    });
  };

  const handleCalculateTrigger = (overrideAmt?: string, overrideSlug?: string) => {
    const actAmt = overrideAmt || cartAmount;
    const actSlug = overrideSlug || selectedBrandSlug;
    setCalcLoading(true);
    setTimeout(() => {
      calculateArbitrage(actAmt, actSlug);
      setCalcLoading(false);
    }, 100);
  };

  // Secure Auth-Protected Checkout Transition
  const triggerVoucherCheckout = (brandObj: any, customFaceValue?: number) => {
    setSelectedCheckoutBrand(brandObj);
    const activeFace = customFaceValue || brandObj.faceValue || 1000;
    setCartAmount(String(activeFace));
    setSelectedBrandSlug(brandObj.slug);
    calculateArbitrage(String(activeFace), brandObj.slug);

    const isUserLoggedIn = (typeof window !== 'undefined' && (localStorage.getItem('user_email') || localStorage.getItem('user_phone')));
    if (isUserLoggedIn) {
      setIsCheckoutOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const filteredBrands = brands.filter((b) => {
    const matchCat = selectedCategory === 'ALL' || b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-white font-sans antialiased selection:bg-[#E51B24] selection:text-white relative overflow-hidden">
      
      {/* Skiper / Aceternity Mesh Glow Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-red-600/15 via-[#0B2B5C]/20 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[600px] -right-40 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Dynamic Navbar */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} brandCount={brands.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-24 relative z-10 space-y-16">
        
        {/* HEADER HERO */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner text-[11px] font-black uppercase tracking-wider text-red-400">
            <Sparkles className="w-3.5 h-3.5 text-[#E51B24]" />
            <span>Skiper 3.0 Arbitrage Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Wholesale Gift Cards & <br />
            <span className="bg-gradient-to-r from-[#E51B24] via-red-400 to-amber-300 bg-clip-text text-transparent">
              3X Stacking Engine
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
            Stack wholesale corporate gift cards, verified merchant coupons, and credit card cashbacks to purchase real vouchers with 0-minute vault PIN delivery.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. INTERACTIVE 3X STACKING CALCULATOR (RESTORED & UPGRADED) */}
        {/* ======================================================== */}
        <div id="calculator" className="relative rounded-[36px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-10 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#E51B24] to-transparent" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E51B24] bg-red-500/10 px-2.5 py-0.5 rounded-md border border-red-500/20">
                Live Arbitrage Optimizer
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Simulate Your Maximum Savings
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Selected Store:</span>
              <select
                value={selectedBrandSlug}
                onChange={(e) => {
                  setSelectedBrandSlug(e.target.value);
                  handleCalculateTrigger(cartAmount, e.target.value);
                }}
                className="bg-white/10 border border-white/15 text-white rounded-xl px-3 py-1.5 text-xs font-black outline-none cursor-pointer hover:bg-white/15 transition"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.slug} className="bg-slate-900 text-white">
                    {b.name} ({b.discount}% Off)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
            
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Enter Cart / Voucher Value (₹)</span>
                  <span className="text-slate-500">Max ₹10,000</span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={cartAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > 10000) {
                        setCartAmount('10000');
                        handleCalculateTrigger('10000', selectedBrandSlug);
                      } else {
                        setCartAmount(e.target.value);
                        handleCalculateTrigger(e.target.value, selectedBrandSlug);
                      }
                    }}
                    className="w-full bg-white/[0.05] border-2 border-white/10 focus:border-[#E51B24] rounded-2xl px-4 py-3.5 text-2xl font-black text-white outline-none transition shadow-inner font-mono"
                  />

                  {/* Quick Presets */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                    {['1000', '2000', '5000', '10000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setCartAmount(preset);
                          handleCalculateTrigger(preset, selectedBrandSlug);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition cursor-pointer ${
                          cartAmount === preset
                            ? 'bg-[#E51B24] border-[#E51B24] text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SBI Cashback Card Toggle Switch */}
              <div
                onClick={() => {
                  setHasSbiCard(!hasSbiCard);
                  calculateArbitrage(cartAmount, selectedBrandSlug, brands, coupons, !hasSbiCard);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  hasSbiCard 
                    ? 'bg-red-500/10 border-[#E51B24]' 
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasSbiCard ? 'bg-[#E51B24] text-white' : 'bg-white/10 text-slate-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">SBI Cashback Credit Card</h4>
                    <p className="text-[11px] text-slate-400">Applies additional 5% statement credit</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${hasSbiCard ? 'bg-[#E51B24] border-[#E51B24] text-white' : 'border-white/20 bg-white/5'}`}>
                  {hasSbiCard && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCalculateTrigger()}
                disabled={calcLoading}
                className="w-full py-4 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-[0_4px_25px_rgba(229,27,36,0.35)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{calcLoading ? 'Optimizing...' : 'Calculate Stacked Price'}</span>
              </button>
            </div>

            {/* Live Arbitrage Receipt Breakdown */}
            <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Breakdown: {result?.brandName || 'Selected'}
                </span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 3X Stacked
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-bold pt-1">
                <div className="flex justify-between text-slate-400">
                  <span>Standard Retail Cart</span>
                  <span className="text-white font-mono font-black">₹{result ? result.originalCart : cartAmount}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Wholesale Voucher Cut ({result?.discountPct || 10}%)</span>
                  <span className="font-mono">-₹{result ? result.voucherCut : 0}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Verified Coupon ({result?.couponCode || 'SAVE150'})</span>
                  <span className="font-mono">-₹{result ? result.couponCut : 0}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Card Cashback (5%)</span>
                  <span className="font-mono">-₹{result ? result.cardCashback : 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Final Out-of-Pocket
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5">
                    ₹{result ? result.bestEffectiveCost : cartAmount}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Total Saved</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ₹{result ? result.totalSavings : 0}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetBrand = brands.find((b) => b.slug === selectedBrandSlug) || brands[0];
                  if (targetBrand) triggerVoucherCheckout(targetBrand, Number(cartAmount));
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E51B24] to-red-600 hover:from-red-600 hover:to-[#E51B24] text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
              >
                <span>Instant Buy at ₹{result ? result.bestEffectiveCost : cartAmount}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. FILTER & SEARCH BAR */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
            {['ALL', 'Food', 'Shopping', 'Travel', 'Entertainment'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-[#E51B24] text-white shadow-md shadow-red-500/20' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400'
                }`}
              >
                {cat}
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
              className="w-full bg-white/5 border border-white/10 focus:border-[#E51B24] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white outline-none transition"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. PREMIUM SKIPER-STYLE VOUCHER CARDS GRID */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBrands.map((b) => {
            const faceVal = b.faceValue || 1000;
            const discount = b.discount || 10;
            const dealCost = Math.round(faceVal - (faceVal * discount) / 100);
            const savingsVal = faceVal - dealCost;

            return (
              <motion.div 
                key={b.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-5 flex flex-col justify-between hover:border-red-500/40 hover:shadow-[0_15px_35px_rgba(229,27,36,0.15)] transition-all group relative overflow-hidden"
              >
                {/* Top Card Bar */}
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-md flex items-center justify-center">
                    <img 
                      src={b.logoUrl} 
                      alt={b.name} 
                      className="max-h-8 max-w-[80px] object-contain"
                      onError={(e: any) => { e.currentTarget.src = "https://placehold.co/60x30/png?text=" + b.name[0]; }}
                    />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[#E51B24] font-black text-xs">
                    {discount}% OFF
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-black text-white truncate">{b.name} Gift Card</h3>
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Instant ₹{savingsVal} direct cut</span>
                    </p>
                  </div>

                  {/* Price Row */}
                  <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Payable Deal</span>
                      <span className="text-2xl font-black text-white font-mono">₹{dealCost}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Face Value</span>
                      <span className="text-sm font-semibold text-slate-500 line-through font-mono">₹{faceVal}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => triggerVoucherCheckout(b, faceVal)}
                      className="py-2.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
                    >
                      Buy Voucher
                    </button>

                    <a
                      href={b.buy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Shop Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </main>

      {/* MODALS */}
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
        brandName={selectedCheckoutBrand?.name || result?.brandName || 'Selected Store'}
        brandSlug={selectedCheckoutBrand?.slug || selectedBrandSlug}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 850}
        savings={result?.totalSavings || 150}
      />

      <LiveArbitrageTicker />
    </div>
  );
}