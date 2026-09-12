'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CreditCard, 
  Zap, 
  Check, 
  ArrowRight, 
  Ticket, 
  Search, 
  Copy, 
  Percent, 
  ArrowUpRight, 
  ShieldCheck, 
  Tag 
} from 'lucide-react';
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Stacking Calculator States (Capped at 10000)
  const [selectedBrandSlug, setSelectedBrandSlug] = useState('');
  const [cartAmount, setCartAmount] = useState('1000');
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

        // Fetch Real Database Brands
        const { data: bData } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        // Fetch Real Database Voucher Rules
        const { data: vData } = await supabase.from('brand_vouchers').select('*');

        if (bData && bData.length > 0) {
          const liveMerged = bData.map((b: any) => {
            const voucherRule = vData?.find((v: any) => v.brand_id === b.id);
            const discountPct = Number(voucherRule?.resale_discount_pct) || 10;
            
            // Strictly cap at max 10,000 limit
            const rawFaceValue = Number(voucherRule?.min_denomination) || 1000;
            const realFaceValue = Math.min(rawFaceValue, 10000);
            const realMaxCap = Math.min(Number(voucherRule?.max_denomination) || 10000, 10000);
            const dealPay = Math.round(realFaceValue - (realFaceValue * discountPct) / 100);

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
              category: b.category || 'Shopping'
            };
          });

          setBrands(liveMerged);
          if (liveMerged.length > 0) {
            setSelectedBrandSlug(liveMerged[0].slug);
            const initialAmt = String(Math.min(liveMerged[0].faceValue, 10000));
            setCartAmount(initialAmt);
            calculateArbitrage(initialAmt, liveMerged[0].slug, liveMerged, coupons, hasSbiCard);
          }
        }

        // Fetch Real Verified Coupons
        const { data: cData } = await supabase
          .from('brand_coupons')
          .select('*, brands(name, slug)')
          .eq('is_verified', true);

        if (cData && cData.length > 0) {
          setCoupons(cData.map((c: any) => ({
            id: c.id,
            brandName: c.brands?.name || 'Store',
            brandSlug: c.brands?.slug || 'store',
            code: c.coupon_code,
            title: c.title,
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

  // Strict 10,000 capped Calculation Engine
  const calculateArbitrage = (
    amt: string, 
    slug: string, 
    brandList = brands, 
    couponList = coupons, 
    cardActive = hasSbiCard
  ) => {
    let numCart = Number(amt) || 1000;
    
    // HARD LIMIT: Maximum coupon / voucher limit is strictly 10,000
    if (numCart > 10000) numCart = 10000;
    if (numCart < 100) numCart = 100;

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

  const handleAmountChange = (rawVal: string) => {
    const num = Number(rawVal);
    if (num > 10000) {
      setCartAmount('10000');
      handleCalculateTrigger('10000', selectedBrandSlug);
    } else {
      setCartAmount(rawVal);
      handleCalculateTrigger(rawVal, selectedBrandSlug);
    }
  };

  const handleCalculateTrigger = (overrideAmt?: string, overrideSlug?: string) => {
    let actAmt = overrideAmt || cartAmount;
    if (Number(actAmt) > 10000) actAmt = '10000';
    const actSlug = overrideSlug || selectedBrandSlug;
    
    setCalcLoading(true);
    setTimeout(() => {
      calculateArbitrage(actAmt, actSlug);
      setCalcLoading(false);
    }, 100);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const triggerVoucherCheckout = (brandObj: any) => {
    setSelectedCheckoutBrand(brandObj);
    const realAmount = Math.min(brandObj.faceValue || 1000, 10000);
    setCartAmount(String(realAmount));
    setSelectedBrandSlug(brandObj.slug);
    calculateArbitrage(String(realAmount), brandObj.slug);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white relative w-full overflow-x-hidden">
      
      {/* Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-red-100/50 via-slate-100 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Dynamic Navbar */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} brandCount={brands.length} />

      <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 pt-20 sm:pt-28 pb-16 relative z-10 space-y-8 sm:space-y-12">
        
        {/* HERO HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#E51B24] shadow-sm">
            <Sparkles className="w-3 h-3 text-[#E51B24]" />
            <span>Official Wholesale Vouchers</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Pay Less. Get Full Balance.<br />
            <span className="text-[#E51B24]">Instant Brand Vouchers</span>
          </h1>

          <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
            100% verified codes with secret PIN delivery. Instant checkout supported up to ₹10,000 limit per order[cite: 3].
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. HORIZONTAL COUPONS STRIP (Mobile Smooth Snap)        */}
        {/* ======================================================== */}
        {coupons.length > 0 && (
          <div className="space-y-2 w-full overflow-hidden">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E51B24]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Store Promo Codes
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Swipe right →</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x w-full">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="snap-start shrink-0 w-64 sm:w-72 bg-white border border-slate-200 shadow-sm rounded-2xl p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase text-[#E51B24] block leading-none mb-0.5">{c.brandName}</span>
                    <span className="text-xs font-bold text-slate-800 block truncate">{c.title || `Flat ₹${c.discountValue} Off`}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyCoupon(c.code)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#E51B24] hover:text-white text-slate-700 font-mono text-[11px] font-black transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
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
        {/* 2. THE 3X SAVINGS STACKER (STRICT ₹10,000 MAX CAP)       */}
        {/* ======================================================== */}
        <div id="calculator" className="w-full rounded-3xl bg-white border border-slate-200 shadow-sm p-4 sm:p-7 space-y-5 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#E51B24] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                Live Calculator
              </span>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-1">
                Simulate Your Net Savings
              </h2>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] text-slate-500 font-bold shrink-0">Store:</span>
              <select
                value={selectedBrandSlug}
                onChange={(e) => {
                  const b = brands.find((x) => x.slug === e.target.value);
                  setSelectedBrandSlug(e.target.value);
                  if (b) {
                    const cappedAmt = String(Math.min(b.faceValue, 10000));
                    setCartAmount(cappedAmt);
                    handleCalculateTrigger(cappedAmt, e.target.value);
                  }
                }}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-black outline-none cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name} ({b.discount}% Off)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Order Value to Calculate (₹)
                  </label>
                  <span className="text-[10px] font-extrabold text-[#E51B24] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    Max Limit: ₹10,000
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={cartAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#E51B24] rounded-2xl px-3.5 py-2.5 text-xl font-black text-slate-900 outline-none transition font-mono"
                  />
                  
                  {/* Preset Buttons up to ₹10,000 only */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex gap-1">
                    {['1000', '2000', '5000', '10000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setCartAmount(preset);
                          handleCalculateTrigger(preset, selectedBrandSlug);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black border transition cursor-pointer ${
                          cartAmount === preset
                            ? 'bg-[#E51B24] border-[#E51B24] text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SBI Card Toggle */}
              <div
                onClick={() => {
                  setHasSbiCard(!hasSbiCard);
                  calculateArbitrage(cartAmount, selectedBrandSlug, brands, coupons, !hasSbiCard);
                }}
                className={`p-3 sm:p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                  hasSbiCard 
                    ? 'bg-red-50/70 border-[#E51B24]' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${hasSbiCard ? 'bg-[#E51B24] text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">SBI Cashback Card</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Extra 5% statement credit</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${hasSbiCard ? 'bg-[#E51B24] border-[#E51B24] text-white' : 'border-slate-300 bg-white'}`}>
                  {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCalculateTrigger()}
                disabled={calcLoading}
                className="w-full py-3 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{calcLoading ? 'Calculating...' : 'Recalculate Savings'}</span>
              </button>
            </div>

            {/* Receipt Summary Box */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  Receipt Breakdown
                </span>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Max Cap Enforced
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex justify-between text-slate-500">
                  <span>Balance Value</span>
                  <span className="text-slate-900 font-mono font-black">₹{result ? result.originalCart : cartAmount}</span>
                </div>
                <div className="flex justify-between text-[#E51B24]">
                  <span>Wholesale Discount ({result?.discountPct || 10}%)</span>
                  <span className="font-mono">-₹{result ? result.voucherCut : 0}</span>
                </div>
                <div className="flex justify-between text-[#E51B24]">
                  <span>Promo Code</span>
                  <span className="font-mono">-₹{result ? result.couponCut : 0}</span>
                </div>
                <div className="flex justify-between text-[#E51B24]">
                  <span>Card Cashback (5%)</span>
                  <span className="font-mono">-₹{result ? result.cardCashback : 0}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    You Pay
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{result ? result.bestEffectiveCost : cartAmount}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase block">Total Saved</span>
                  <span className="text-base font-black text-emerald-600 font-mono">
                    ₹{result ? result.totalSavings : 0}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetBrand = brands.find((b) => b.slug === selectedBrandSlug) || brands[0];
                  if (targetBrand) triggerVoucherCheckout(targetBrand);
                }}
                className="w-full py-3 rounded-xl bg-[#0B2B5C] hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer mt-1"
              >
                <span>Instant Buy at ₹{result ? result.bestEffectiveCost : cartAmount}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SEARCH & CATEGORY FILTER                             */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
            {['ALL', 'Shopping', 'Food', 'Travel'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-[#E51B24] text-white shadow-sm' 
                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                }`}
              >
                {cat === 'ALL' ? 'All Vouchers' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Amazon, Swiggy..."
              className="w-full bg-white border border-slate-200 focus:border-[#E51B24] rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. PASS VOUCHER CARDS (Max Capped to 10,000)             */}
        {/* ======================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-medium">
            No vouchers found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            {filteredBrands.map((b) => {
              const faceVal = Math.min(b.faceValue || 1000, 10000);
              const discount = b.discount || 10;
              const youPay = Math.round(faceVal - (faceVal * discount) / 100);
              const saved = faceVal - youPay;

              return (
                <motion.div 
                  key={b.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.18 }}
                  className="relative bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group w-full"
                >
                  {/* Top Details */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                          <img 
                            src={b.logoUrl} 
                            alt={b.name} 
                            className="max-h-7 max-w-[65px] object-contain"
                            onError={(e: any) => { e.currentTarget.src = "https://placehold.co/60x30/png?text=" + b.name[0]; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">{b.name}</h3>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Verified Digital Code</span>
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[#E51B24] font-black text-[11px] shrink-0">
                        {discount}% OFF
                      </span>
                    </div>

                    {/* Perforated Divider */}
                    <div className="py-2">
                      <div className="border-t border-dashed border-slate-200 w-full" />
                    </div>

                    {/* Value Breakdown */}
                    <div className="py-1 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Card Value</span>
                        <span className="text-sm font-black text-slate-800 font-mono">₹{faceVal}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-emerald-600 block">Instant Savings</span>
                        <span className="text-xs font-black text-emerald-600 font-mono">+₹{saved} Saved</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Payable Price</span>
                        <span className="text-xl font-black text-slate-900 font-mono leading-none">
                          ₹{youPay}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ₹{faceVal}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => triggerVoucherCheckout(b)}
                        className="w-full py-2.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-[11px] uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Buy Voucher</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <a
                        href={b.buy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Visit Store</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </main>

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
        brandName={selectedCheckoutBrand?.name || result?.brandName || 'Brand Gift Card'}
        brandSlug={selectedCheckoutBrand?.slug || selectedBrandSlug}
        faceValue={Math.min(Number(cartAmount) || 1000, 10000)}
        dealPrice={result?.bestEffectiveCost || 900}
        savings={result?.totalSavings || 100}
      />

      <LiveArbitrageTicker />
    </div>
  );
}