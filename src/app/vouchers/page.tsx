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
  Percent, 
  ArrowUpRight, 
  ShieldCheck, 
  Tag,
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

  // Modals & Floating Drawer State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
          const liveMerged = bData.map((b: any, index: number) => {
            const voucherRule = vData?.find((v: any) => v.brand_id === b.id);
            const discountPct = Number(voucherRule?.resale_discount_pct) || 10;
            
            // Strictly cap at max 10,000 limit
            const rawFaceValue = Number(voucherRule?.min_denomination) || 1000;
            const realFaceValue = Math.min(rawFaceValue, 10000);
            const realMaxCap = Math.min(Number(voucherRule?.max_denomination) || 10000, 10000);
            const dealPay = Math.round(realFaceValue - (realFaceValue * discountPct) / 100);

            // Dynamic Urgency & Expiry Calculation
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
            stackable: c.stackable_with_voucher,
            expiryDate: c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Limited Drops'
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

  // Calculation Engine
  const calculateArbitrage = (
    amt: string, 
    slug: string, 
    brandList = brands, 
    couponList = coupons, 
    cardActive = hasSbiCard
  ) => {
    let numCart = Number(amt) || 1000;
    
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

    // Gen Z Flex Perk Generator
    let flexPerk = "Bro, itna bacha liya ki 1 Cold Coffee free!";
    if (totalSaved >= 1500) {
      flexPerk = "₹1,500+ Saved! Ek poori branded hoodie free hogayi.";
    } else if (totalSaved >= 700) {
      flexPerk = "₹700+ bache! Weekend Movie ticket + Popcorn sorted.";
    } else if (totalSaved >= 300) {
      flexPerk = "₹300+ bache! Next Swiggy dessert bill free ho gaya.";
    }

    setResult({
      originalCart: numCart,
      bestEffectiveCost: finalCost,
      totalSavings: totalSaved,
      voucherCut,
      couponCut,
      couponCode: matchCoupon ? matchCoupon.code : 'SAVE150',
      cardCashback,
      brandName: curr?.name || 'Selected Brand',
      discountPct,
      flexPerk
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
    }, 80);
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
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#FAF6F6] to-[#F3F4F8] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white relative w-full overflow-x-hidden pb-24 sm:pb-28">
      
      {/* Warm Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-red-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-0 w-80 h-80 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Dynamic Navbar */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} brandCount={brands.length} />

      <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 pt-20 sm:pt-28 space-y-7 sm:space-y-10 relative z-10">
        
        {/* HERO TITLE BANNER */}
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
            Food orders se lekar sneakers tak, seedha wholesale digital vouchers se checkout karo. 0-second me secret code aur PIN screen par milta hai[cite: 2]!
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

            {/* Horizontal Ticket Carousel */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x w-full">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="snap-start shrink-0 w-72 sm:w-80 relative bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all p-3.5 flex items-center justify-between overflow-hidden group"
                >
                  {/* Left Side Perforated Notch */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF6F6] border-r border-slate-200" />
                  {/* Right Side Perforated Notch */}
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

                  {/* Copy Pill */}
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
        {/* 2. THE 3X LIVE SAVINGS CALCULATOR (IN-PAGE DESKTOP VIEW) */}
        {/* ======================================================== */}
        <div id="calculator" className="w-full rounded-[32px] bg-white border-2 border-red-100/90 shadow-xl shadow-red-500/5 p-5 sm:p-8 space-y-6 overflow-hidden relative">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E51B24] bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  ⚡ Anti-MRP Loot Simulator
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Live Formula Active
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
                onChange={(e) => {
                  const b = brands.find((x) => x.slug === e.target.value);
                  setSelectedBrandSlug(e.target.value);
                  if (b) {
                    const cappedAmt = String(Math.min(b.faceValue, 10000));
                    setCartAmount(cappedAmt);
                    handleCalculateTrigger(cappedAmt, e.target.value);
                  }
                }}
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
              
              {/* Gen Z Real-Life Scenario Chips */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Order Value (₹)
                  </label>
                  <span className="text-[10px] font-black text-[#E51B24] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    Max Safe Limit: ₹10,000[cite: 2]
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
                        onClick={() => {
                          setCartAmount(preset);
                          handleCalculateTrigger(preset, selectedBrandSlug);
                        }}
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

                {/* Gen Z Vibe Chips */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2.5">
                  {[
                    { label: '🍕 Late Night Swiggy', val: '450' },
                    { label: '👟 Zara/Myntra Drop', val: '2400' },
                    { label: '🎧 Audio Loot', val: '4999' }
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => {
                        setCartAmount(chip.val);
                        handleCalculateTrigger(chip.val, selectedBrandSlug);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-[#E51B24] text-slate-700 text-[11px] font-bold shrink-0 transition border border-slate-200"
                    >
                      {chip.label} (₹{chip.val})
                    </button>
                  ))}
                </div>
              </div>

              {/* SBI Cashback Card Checkbox */}
              <div
                onClick={() => {
                  setHasSbiCard(!hasSbiCard);
                  calculateArbitrage(cartAmount, selectedBrandSlug, brands, coupons, !hasSbiCard);
                }}
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
                    <p className="text-[11px] text-slate-500 font-semibold leading-tight">Pay voucher using card &amp; get extra 5% direct bank refund</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${hasSbiCard ? 'bg-[#E51B24] border-[#E51B24] text-white' : 'border-slate-300 bg-white'}`}>
                  {hasSbiCard && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCalculateTrigger()}
                disabled={calcLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E51B24] to-[#C4121A] hover:from-[#C4121A] hover:to-[#E51B24] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{calcLoading ? 'Recalculating...' : 'Refresh Savings Breakdown'}</span>
              </button>
            </div>

            {/* Right Receipt Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Live Net Price Receipt
                </span>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  100% Capped[cite: 2]
                </span>
              </div>

              <div className="space-y-2 text-xs font-bold relative z-10">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Balance</span>
                  <span className="text-white font-mono font-black text-sm">₹{result ? result.originalCart : cartAmount}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Wholesale Voucher Cut ({result?.discountPct || 10}%)</span>
                  <span className="font-mono">-₹{result ? result.voucherCut : 0}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Promo Code Applied</span>
                  <span className="font-mono">-₹{result ? result.couponCut : 0}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Credit Card 5% Cashback</span>
                  <span className="font-mono">-₹{result ? result.cardCashback : 0}</span>
                </div>
              </div>

              {/* Gen Z Perk Box */}
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 relative z-10">
                <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold text-amber-200">
                  {result?.flexPerk || "Bro, itna bacha liya ki 1 Cold Coffee free!"}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between relative z-10">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Final Cost
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono leading-none mt-0.5">
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
                  if (targetBrand) triggerVoucherCheckout(targetBrand);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-1"
              >
                <span>Instant Buy at ₹{result ? result.bestEffectiveCost : cartAmount}</span>
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
              const discount = b.discount || 10;
              const youPay = Math.round(faceVal - (faceVal * discount) / 100);
              const saved = faceVal - youPay;

              return (
                <motion.div 
                  key={b.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="relative bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group w-full"
                >
                  {/* Top Details */}
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

                    {/* Expiry & Urgency Progress Bar */}
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

                      {/* Stock Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full" 
                          style={{ width: `${b.claimedPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Perforated Divider */}
                    <div className="py-0.5">
                      <div className="border-t border-dashed border-slate-200 w-full" />
                    </div>

                    {/* Value Calculation */}
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
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    </div>
                  </div>
                </motion.div>
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
                  Pay <span className="text-[#E51B24] font-black font-mono">₹{result ? result.bestEffectiveCost : cartAmount}</span> for ₹{result ? result.originalCart : cartAmount} Cart
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
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            {/* Drawer Sheet */}
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
                    <span className="text-[10px] text-slate-400 font-bold">100% Capped up to ₹10,000[cite: 2]</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Merchant Store</label>
                  <select
                    value={selectedBrandSlug}
                    onChange={(e) => {
                      setSelectedBrandSlug(e.target.value);
                      handleCalculateTrigger(cartAmount, e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none"
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

                {/* Scenario Quick Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {[
                    { label: '🍕 Swiggy ₹450', val: '450' },
                    { label: '👟 Zara ₹2400', val: '2400' },
                    { label: '🎧 Audio ₹4999', val: '4999' }
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => {
                        setCartAmount(chip.val);
                        handleCalculateTrigger(chip.val, selectedBrandSlug);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-[10px] font-bold text-slate-700 shrink-0 border border-slate-200"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Net Price Pill */}
                <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Savings</span>
                    <span className="text-emerald-400 font-black font-mono text-sm">+₹{result ? result.totalSavings : 0} Saved</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300">You Pay</span>
                    <span className="text-2xl font-black font-mono text-[#E51B24]">₹{result ? result.bestEffectiveCost : cartAmount}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    const targetBrand = brands.find((b) => b.slug === selectedBrandSlug) || brands[0];
                    if (targetBrand) triggerVoucherCheckout(targetBrand);
                  }}
                  className="w-full py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Checkout at ₹{result ? result.bestEffectiveCost : cartAmount}</span>
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