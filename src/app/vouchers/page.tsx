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
  Copy,
  TrendingDown,
  Wifi,
  ShieldCheck,
  Percent,
  Flame,
  ArrowUpRight
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

  // Stacking Calculator States
  const [selectedBrandSlug, setSelectedBrandSlug] = useState('');
  const [cartAmount, setCartAmount] = useState('2000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Selected denomination per card { [brandSlug]: number }
  const [cardDenominations, setCardDenominations] = useState<{ [key: string]: number }>({});

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
              category: b.category || 'Shopping',
              denominations: [500, 1000, 2000, 5000]
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

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const triggerVoucherCheckout = (brandObj: any, customFaceValue?: number) => {
    setSelectedCheckoutBrand(brandObj);
    const activeFace = customFaceValue || cardDenominations[brandObj.slug] || brandObj.faceValue || 1000;
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
      
      {/* Background Skiper Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[580px] bg-gradient-to-b from-red-600/20 via-[#0B2B5C]/25 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] -right-32 w-[650px] h-[650px] bg-red-600/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Dynamic Navbar */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} brandCount={brands.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-24 relative z-10 space-y-16">
        
        {/* HERO TITLE */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-red-400">
            <Sparkles className="w-3.5 h-3.5 text-[#E51B24]" />
            <span>Instant Digital Gift Cards</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Pay Less. Get Full Value.<br />
            <span className="bg-gradient-to-r from-[#E51B24] via-red-400 to-amber-300 bg-clip-text text-transparent">
              Instant Brand Vouchers
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl mx-auto">
            Choose your favorite brand, pick a card value, and unlock your 16-digit voucher number and secret PIN right after payment. Works 100% like real cash on checkout.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. HORIZONTAL COUPONS CAROUSEL (CLEAN & INTERACTIVE)   */}
        {/* ======================================================== */}
        {coupons.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#E51B24]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Verified Store Promo Codes
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
                Click "Copy" & apply in app
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="snap-start shrink-0 w-72 sm:w-80 bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 backdrop-blur-md hover:border-red-500/40 transition"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-red-400 block">{c.brandName}</span>
                    <span className="text-xs font-bold text-white block truncate">{c.title || `Save extra ₹${c.discountValue}`}</span>
                  </div>

                  <button
                    onClick={() => copyCoupon(c.code)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#E51B24] text-white font-mono text-xs font-black transition flex items-center gap-1.5 shrink-0 active:scale-95"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
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
        {/* 2. THE 3X SAVINGS STACKER (CALCULATOR RESTORED)       */}
        {/* ======================================================== */}
        <div id="calculator" className="relative rounded-[36px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 left-10 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#E51B24] to-transparent" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E51B24] bg-red-500/10 px-2.5 py-0.5 rounded-md border border-red-500/20">
                Live Savings Simulator
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Calculate What You Pay vs What You Save
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Choose Brand:</span>
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
                    {b.name} (Flat {b.discount}% Off)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>How much are you spending? (₹)</span>
                  <span className="text-slate-500">Upto ₹10,000</span>
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

              {/* SBI Credit Card Cashback Switch */}
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
                    <h4 className="text-xs font-black text-white">I have an SBI Cashback Credit Card</h4>
                    <p className="text-[11px] text-slate-400">Gives an extra 5% direct cash back on your statement</p>
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
                <span>{calcLoading ? 'Calculating...' : 'Recalculate Savings'}</span>
              </button>
            </div>

            {/* Receipt Result */}
            <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Receipt: {result?.brandName || 'Store'}
                </span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Best Rate Found
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-bold pt-1">
                <div className="flex justify-between text-slate-400">
                  <span>Shopping Cart Value</span>
                  <span className="text-white font-mono font-black">₹{result ? result.originalCart : cartAmount}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Voucher Instant Cut ({result?.discountPct || 10}%)</span>
                  <span className="font-mono">-₹{result ? result.voucherCut : 0}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Merchant Promo Code ({result?.couponCode || 'SAVE150'})</span>
                  <span className="font-mono">-₹{result ? result.couponCut : 0}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Credit Card Cashback (5%)</span>
                  <span className="font-mono">-₹{result ? result.cardCashback : 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    You Actually Pay
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5">
                    ₹{result ? result.bestEffectiveCost : cartAmount}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Total Cash Saved</span>
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
                <span>Get This Voucher Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SEARCH & STORE FILTERS                               */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
            {['ALL', 'Shopping', 'Food', 'Travel'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-[#E51B24] text-white shadow-md shadow-red-500/20' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400'
                }`}
              >
                {cat === 'ALL' ? 'All Gift Cards' : cat}
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
        {/* 4. ATM / PLATINUM CARD STYLE VOUCHERS GRID            */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBrands.map((b) => {
            const currentFace = cardDenominations[b.slug] || b.faceValue || 1000;
            const discount = b.discount || 10;
            const youPay = Math.round(currentFace - (currentFace * discount) / 100);
            const saved = currentFace - youPay;

            return (
              <motion.div 
                key={b.id}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-[32px] p-6 flex flex-col justify-between overflow-hidden group shadow-[0_20px_45px_rgba(0,0,0,0.6)] border border-white/15 bg-gradient-to-br from-[#1A1F2C] via-[#0E131F] to-[#0A0D14]"
              >
                {/* Subtle Metallic Card Background Accents */}
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div>
                  {/* Top Row: Brand Logo + Wireless Icon + Discount Tag */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
                        <img 
                          src={b.logoUrl} 
                          alt={b.name} 
                          className="max-h-7 max-w-[80px] object-contain"
                          onError={(e: any) => { e.currentTarget.src = "https://placehold.co/60x30/png?text=" + b.name[0]; }}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white leading-tight">{b.name}</h3>
                        <span className="text-[11px] font-bold text-slate-400">Digital Gift Card</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-slate-500 rotate-90" />
                      <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-black text-xs">
                        SAVE {discount}%
                      </span>
                    </div>
                  </div>

                  {/* Golden Smart EMV Chip Visual */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-sm">
                      <div className="w-full h-full rounded-[7px] bg-amber-400/90 border border-amber-300/60 flex items-center justify-center">
                        <div className="w-7 h-4 border-y border-amber-800/40" />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase">
                      INSTANT UNLOCK
                    </span>
                  </div>

                  {/* Denomination Selector (Pick ₹500, ₹1000, etc.) */}
                  <div className="space-y-1.5 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Select Card Value:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {b.denominations.map((val: number) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCardDenominations({ ...cardDenominations, [b.slug]: val })}
                          className={`py-1.5 rounded-xl font-mono text-xs font-black transition cursor-pointer border ${
                            currentFace === val
                              ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Summary & Action */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">You Pay Only</span>
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                        ₹{youPay}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Direct Savings</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        +₹{saved} Pocketed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => triggerVoucherCheckout(b, currentFace)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E51B24] to-[#CC141D] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Get Voucher</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={b.buy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
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
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 850}
        savings={result?.totalSavings || 150}
      />

      <LiveArbitrageTicker />
    </div>
  );
}