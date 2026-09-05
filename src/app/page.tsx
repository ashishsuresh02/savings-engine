'use client';

import { useState } from 'react';
import { 
  ArrowUpRight, 
  CreditCard, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  Zap,
  Check,
  Copy,
  ChevronRight,
  User,
  X,
  TrendingUp,
  Tag,
  Gift,
  ArrowRight
} from 'lucide-react';

interface CalculationResult {
  brandName: string;
  originalCart: number;
  bestRoute: 'VOUCHER' | 'COUPON' | 'STACKED';
  bestEffectiveCost: number;
  totalSavings: number;
  breakdown: {
    couponCut: number;
    voucherCut: number;
    cardCashback: number;
    couponCode: string | null;
    buyUrl: string;
  };
}

// 1. Live Marquee Ticker Deals
const LIVE_TICKER_DATA = [
  "DOMINO'S: ₹500 VOUCHER SECURED AT ₹415",
  "MYNTRA: ₹2,000 VOUCHER SAVED ₹240 VIA STACKING",
  "SWIGGY: 6.0% DIRECT RESALE DISCOUNT UNLOCKED",
  "SBI CASHBACK: 5% EXTRA SETTLED TO USER LEDGER",
  "AMAZON PAY: ₹1,000 BALANCE LOADED AT ₹975",
];

// 2. Curated Brand Inventory
const BRANDS_DATABASE = [
  { name: "Domino's Pizza", slug: "dominos", category: "FOOD", voucherOff: "16% OFF", couponCode: "DOM50" },
  { name: "Swiggy", slug: "swiggy", category: "FOOD", voucherOff: "6% OFF", couponCode: "SWIGGYIT" },
  { name: "Zomato", slug: "zomato", category: "FOOD", voucherOff: "7% OFF", couponCode: "TASTY" },
  { name: "Myntra", slug: "myntra", category: "FASHION", voucherOff: "9.5% OFF", couponCode: "MYNTRA200" },
  { name: "Blinkit", slug: "blinkit", category: "QUICK", voucherOff: "4.5% OFF", couponCode: "BLINK10" },
  { name: "Amazon Pay", slug: "amazon", category: "SHOPPING", voucherOff: "2.5% OFF", couponCode: "AMZSAVE" },
];

// 3. Featured Vouchers Catalog (Woohoo / GyFTR Spread)
const FEATURED_VOUCHERS = [
  { brand: "Domino's", faceValue: 500, buyPrice: 425, discount: "15% OFF", category: "Food & Dining", badge: "HOT ARBITRAGE" },
  { brand: "Myntra", faceValue: 2000, buyPrice: 1810, discount: "9.5% OFF", category: "Fashion", badge: "POPULAR" },
  { brand: "Swiggy Money", faceValue: 1000, buyPrice: 940, discount: "6% OFF", category: "Food Delivery", badge: "INSTANT LOAD" },
  { brand: "MakeMyTrip", faceValue: 5000, buyPrice: 4600, discount: "8% OFF", category: "Travel", badge: "HIGH VALUE" },
];

// 4. Verified Merchant Coupons
const VERIFIED_COUPONS = [
  { brand: "Domino's", code: "DOM50", offer: "Flat ₹50 OFF on cart > ₹300", stackable: true, expiry: "Ends in 2 days" },
  { brand: "Myntra", code: "MYNTRA200", offer: "Flat ₹200 OFF on Fashion orders", stackable: true, expiry: "Verified Today" },
  { brand: "Swiggy", code: "WELCOME50", offer: "50% OFF up to ₹100 on first 3 orders", stackable: false, expiry: "Live Now" },
  { brand: "Blinkit", code: "INSTANT25", offer: "Flat ₹25 OFF on grocery cart > ₹499", stackable: false, expiry: "Expiring Soon" },
];

// 5. High-Yield Credit Card Partners (Monetization Bounty: ₹1,500 - ₹2,500)
const RECOMMENDED_CARDS = [
  {
    name: "SBI Cashback Credit Card",
    issuer: "SBI Card",
    benefit: "5% Flat Cashback on all online transactions",
    joiningFee: "₹999",
    tag: "MAX ARBITRAGE",
    applyUrl: "https://gromo.in/referral/sbi-cashback"
  },
  {
    name: "Axis Bank Flipkart Card",
    issuer: "Axis Bank",
    benefit: "5% Unlimited Cashback on Flipkart & Cleartrip",
    joiningFee: "₹500",
    tag: "BEST FOR SHOPPING",
    applyUrl: "https://gromo.in/referral/axis-flipkart"
  },
  {
    name: "HDFC Millennia Credit Card",
    issuer: "HDFC Bank",
    benefit: "5% Cashback on Amazon, Swiggy, Zomato & Uber",
    joiningFee: "₹1,000",
    tag: "LIFESTYLE ALL-ROUNDER",
    applyUrl: "https://gromo.in/referral/hdfc-millennia"
  }
];

export default function Home() {
  // Calculator States
  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Interaction States
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const calculateSavings = async () => {
    if (!cartAmount || Number(cartAmount) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: selectedBrand,
          cartValue: Number(cartAmount),
          hasSbiCard,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredBrands = activeCategory === 'ALL' 
    ? BRANDS_DATABASE 
    : BRANDS_DATABASE.filter(b => b.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] selection:bg-[#00E599] selection:text-black font-sans antialiased relative overflow-x-hidden">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#1c1917]/40 via-[#00E599]/[0.02] to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-48 w-96 h-96 bg-[#00E599]/[0.02] blur-[120px] pointer-events-none -z-10" />

      {/* 1. TOP LIVE TICKER TAPE */}
      <div className="w-full bg-[#080809] border-b border-white/[0.05] py-2 overflow-hidden flex items-center">
        <div className="flex items-center gap-2 px-6 text-[10px] font-mono tracking-widest uppercase text-[#00E599] shrink-0 border-r border-white/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" />
          ARBITRAGE FEED
        </div>
        <div className="flex gap-12 whitespace-nowrap animate-marquee text-[11px] font-mono text-zinc-400 pl-6">
          {LIVE_TICKER_DATA.map((ticker, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#00E599]" />
              {ticker}
            </span>
          ))}
        </div>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className="border-b border-white/[0.06] backdrop-blur-xl sticky top-0 z-40 bg-[#050505]/80">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#00E599] rounded-full shadow-[0_0_15px_#00E599]" />
            <span className="font-mono text-base tracking-[0.25em] font-black uppercase text-white">
              ENGINE<span className="text-[#00E599]">.AI</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono tracking-widest bg-white/[0.04] border border-white/[0.08] text-zinc-400">
              V2.4 OBSIDIAN
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-zinc-400">
            <a href="#terminal" className="hover:text-white transition">01 // CALCULATOR</a>
            <a href="#vouchers" className="hover:text-white transition">02 // VOUCHERS</a>
            <a href="#coupons" className="hover:text-white transition">03 // COUPOUNS</a>
            <a href="#cards" className="hover:text-white transition">04 // CARDS</a>
            <a href="#ledger" className="hover:text-white transition">05 // LEDGER</a>
          </div>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] px-4 py-2 rounded-full text-xs font-mono tracking-wider text-white transition active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-[#00E599]" />
            <span>MEMBER ACCESS</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 pt-12 pb-32 space-y-24">

        {/* 3. HERO HEADLINE & PROTOCOL STATS */}
        <section className="space-y-6 text-center sm:text-left pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-xs font-mono tracking-widest">
            <Sparkles className="w-3 h-3 text-[#00E599]" />
            DETERMINISTIC VALUE EXTRACTION ENGINE
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.02]">
                Stop Paying Full Price <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                  Before Checkout.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl font-normal leading-relaxed">
                India's first smart savings engine that scans live wholesale vouchers, extracts stackable merchant coupons, and calculates payment rail kickbacks in 50 milliseconds.
              </p>
            </div>

            {/* Protocol Telemetry Metrics */}
            <div className="lg:col-span-4 bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-5 space-y-4 font-mono text-xs">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500">AGGREGATED STORES</span>
                <span className="text-white font-bold">2,500+ NODES</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500">AVERAGE DISCOUNT SPREAD</span>
                <span className="text-[#00E599] font-bold">14.8% YIELD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CHECKOUT LATENCY</span>
                <span className="text-white font-bold">&lt; 42 MS</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE CORE AI SAVINGS ENGINE (THE CALCULATOR TERMINAL) */}
        <section id="terminal" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-[#00E599]" />
              THE ARBITRAGE TERMINAL
            </div>
            <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] p-1 rounded-lg text-[10px] font-mono">
              {['ALL', 'FOOD', 'FASHION', 'QUICK'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded transition ${
                    activeCategory === cat ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0C0C0E] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-8 relative shadow-2xl">
            {/* 1. Brand Asset Grid */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 block">
                STEP 01 // SELECT ASSET
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {filteredBrands.map((b) => {
                  const active = selectedBrand === b.slug;
                  return (
                    <button
                      key={b.slug}
                      onClick={() => setSelectedBrand(b.slug)}
                      className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        active
                          ? 'bg-white/[0.08] border-[#00E599] text-white shadow-[0_0_20px_-8px_#00E599]'
                          : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-[#00E599] block mb-1 font-semibold">{b.voucherOff}</span>
                      <span className="font-bold text-sm block truncate">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Amount Input & Card Rail Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 block">
                  STEP 02 // NOTIONAL BASKET (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-lg">₹</span>
                  <input
                    type="number"
                    value={cartAmount}
                    onChange={(e) => setCartAmount(e.target.value)}
                    placeholder="500"
                    className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#00E599] rounded-xl py-3.5 pl-9 pr-4 text-xl font-mono text-white tracking-wider outline-none transition placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 block">
                  STEP 03 // PAYMENT RAIL STACK
                </label>
                <div 
                  onClick={() => setHasSbiCard(!hasSbiCard)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    hasSbiCard 
                      ? 'bg-white/[0.06] border-white/[0.25] text-white' 
                      : 'bg-white/[0.01] border-white/[0.06] text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-4 h-4 ${hasSbiCard ? 'text-[#00E599]' : 'text-zinc-600'}`} />
                    <div>
                      <p className="text-xs font-semibold">SBI Cashback Card Active</p>
                      <p className="text-[10px] font-mono text-zinc-400">Stacks 5.0% flat online kickback</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    hasSbiCard ? 'bg-[#00E599] border-[#00E599] text-black' : 'border-zinc-700'
                  }`}>
                    {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={calculateSavings}
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black py-4 px-6 rounded-xl font-bold text-xs font-mono tracking-[0.25em] uppercase transition flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 fill-black" />
              {loading ? 'SOLVING SAVINGS MATRICES...' : 'EXECUTE ARBITRAGE CALCULATION'}
            </button>

            {/* 3. Output Receipt Screen */}
            {result && (
              <div className="mt-8 bg-[#08080A] border border-[#00E599]/40 rounded-xl p-6 space-y-6 shadow-[0_0_50px_-10px_rgba(0,229,153,0.15)] animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs font-mono">
                  <span className="text-[#00E599] font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" /> OPTIMAL VECTOR: {result.bestRoute}
                  </span>
                  <span className="text-zinc-500 line-through">RETAIL: ₹{result.originalCart}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-baseline">
                  <div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">NET PAYABLE COST</p>
                    <p className="text-4xl sm:text-5xl font-mono font-black text-white mt-1">₹{result.bestEffectiveCost}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] font-mono text-[#00E599] uppercase tracking-widest">EFFECTIVE YIELD CAPTURED</p>
                    <p className="text-3xl sm:text-4xl font-mono font-bold text-[#00E599] mt-1">+₹{result.totalSavings}</p>
                  </div>
                </div>

                <div className="bg-black/60 border border-white/[0.06] rounded-lg p-3.5 text-xs font-mono space-y-2 text-zinc-300">
                  {result.breakdown.voucherCut > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Wholesale Voucher Discount:</span>
                      <span className="text-[#00E599]">-₹{result.breakdown.voucherCut}</span>
                    </div>
                  )}
                  {result.breakdown.couponCut > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Promo Code [{result.breakdown.couponCode}]:</span>
                      <span className="text-[#00E599]">-₹{result.breakdown.couponCut}</span>
                    </div>
                  )}
                  {result.breakdown.cardCashback > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Bank Rail Reward (5%):</span>
                      <span className="text-[#00E599]">-₹{result.breakdown.cardCashback}</span>
                    </div>
                  )}
                </div>

                <a
                  href={result.breakdown.buyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center py-4 bg-[#00E599] hover:bg-[#00c985] text-black font-mono text-xs font-bold tracking-[0.2em] uppercase rounded-xl transition shadow-[0_0_30px_-5px_#00E599] flex items-center justify-center gap-2 group"
                >
                  SECURE PRICE & ACQUIRE VOUCHER
                  <ArrowUpRight className="w-4 h-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* 5. SECTION: DISCOUNTED E-VOUCHER VAULT (WOOHOO / GYFTR RESELLER) */}
        <section id="vouchers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500">IN-APP ASSET STORE</p>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">Wholesale E-Vouchers</h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 hidden sm:block">ZERO-MDR UPI INSTANT ISSUANCE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_VOUCHERS.map((v, i) => (
              <div 
                key={i}
                className="bg-[#0A0A0C] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl p-5 space-y-4 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300">
                      {v.category}
                    </span>
                    <span className="text-[9px] font-mono text-[#00E599] font-bold">{v.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{v.brand}</h3>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-mono font-bold text-white">₹{v.buyPrice}</span>
                    <span className="text-xs font-mono text-zinc-500 line-through">₹{v.faceValue}</span>
                    <span className="text-xs font-mono text-[#00E599] font-semibold ml-auto">{v.discount}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedBrand(v.brand.toLowerCase().replace(/[^a-z]/g, ''));
                    setCartAmount(v.faceValue.toString());
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 bg-white/[0.05] hover:bg-white text-white hover:text-black font-mono text-[11px] font-bold tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  BUY VOUCHER
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 6. SECTION: VERIFIED MERCHANT PROMO CODE LOCKER */}
        <section id="coupons" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500">PROMOTIONAL REGISTRY</p>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">Verified Coupon Codes</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% SCRAPED & TESTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VERIFIED_COUPONS.map((c, i) => (
              <div 
                key={i}
                className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{c.brand}</span>
                    {c.stackable && (
                      <span className="text-[9px] font-mono bg-[#00E599]/10 border border-[#00E599]/20 text-[#00E599] px-2 py-0.5 rounded">
                        STACKABLE WITH VOUCHER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{c.offer}</p>
                  <p className="text-[10px] font-mono text-zinc-500">{c.expiry}</p>
                </div>

                <button
                  onClick={() => copyCoupon(c.code)}
                  className="px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl font-mono text-xs text-white font-bold flex items-center gap-2 shrink-0 transition active:scale-95"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00E599]" />
                      <span className="text-[#00E599]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{c.code}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 7. SECTION: HIGH-YIELD BANKING & CARDS (PRIMARY MONETIZATION ENGINE) */}
        <section id="cards" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500">PAYMENT RAIL INFRASTRUCTURE</p>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">Fintech Card Arbitrage</h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">UP TO ₹2,500 JOINING REWARD</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {RECOMMENDED_CARDS.map((card, i) => (
              <div 
                key={i}
                className="bg-[#0A0A0C] border border-white/[0.08] rounded-2xl p-6 space-y-6 relative flex flex-col justify-between group hover:border-[#00E599]/30 transition"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono tracking-widest text-[#00E599] bg-[#00E599]/10 px-2 py-0.5 rounded border border-[#00E599]/20 font-semibold">
                      {card.tag}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{card.issuer}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{card.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{card.benefit}</p>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-500 border-t border-white/[0.06] pt-3">
                    Joining Fee: <span className="text-zinc-300">{card.joiningFee}</span>
                  </div>
                </div>

                <a
                  href={card.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-white/[0.04] hover:bg-[#00E599] text-white hover:text-black font-mono text-xs font-bold tracking-widest uppercase rounded-xl transition flex items-center justify-center gap-2"
                >
                  APPLY & UNLOCK PERK
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 8. SECTION: MEMBER SAVINGS LEDGER (CRED PROOF-OF-WORK) */}
        <section id="ledger" className="bg-[#0A0A0C] border border-white/[0.08] rounded-3xl p-8 sm:p-12 space-y-8 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#00E599]">
                PROOF OF LIQUID SAVINGS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                The Obsidian Member Ledger
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Every rupee saved across brand vouchers, merchant promo codes, and card cashbacks is cryptographically audited and recorded into your personal ledger.
              </p>
              <div className="pt-2 flex items-center gap-6 font-mono text-xs">
                <div>
                  <p className="text-zinc-500">MEMBER TIER</p>
                  <p className="text-white font-bold mt-0.5">OBSIDIAN PRIVILEGE</p>
                </div>
                <div className="border-l border-white/[0.08] pl-6">
                  <p className="text-zinc-500">REINVESTMENT YIELD</p>
                  <p className="text-[#00E599] font-bold mt-0.5">14.2% ANNUALIZED</p>
                </div>
              </div>
            </div>

            {/* Simulated Live Ledger Card */}
            <div className="bg-black border border-white/[0.08] rounded-2xl p-6 space-y-4 font-mono">
              <div className="flex justify-between text-xs border-b border-white/[0.06] pb-3">
                <span className="text-zinc-400">LEDGER IDENTIFIER: #8294</span>
                <span className="text-[#00E599]">STATUS: AUDITED</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase">LIFETIME RETENTION BALANCE</p>
                <p className="text-4xl font-black text-white">₹14,820.50</p>
              </div>
              <div className="space-y-2 pt-2 text-[11px] text-zinc-400">
                <div className="flex justify-between">
                  <span>Domino's Arbitrage:</span>
                  <span className="text-white">+₹96.25</span>
                </div>
                <div className="flex justify-between">
                  <span>Myntra Fashion Voucher:</span>
                  <span className="text-white">+₹190.00</span>
                </div>
                <div className="flex justify-between">
                  <span>SBI Card Cashbacks:</span>
                  <span className="text-white">+₹412.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 9. INTERACTIVE AUTH / MEMBERSHIP MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0C0C0E] border border-white/[0.1] rounded-3xl p-8 max-w-md w-full space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="w-10 h-10 bg-[#00E599]/10 border border-[#00E599]/30 rounded-2xl flex items-center justify-center mx-auto text-[#00E599]">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black uppercase text-white">Member Identification</h3>
              <p className="text-xs text-zinc-400">Enter your phone number to access your personal savings ledger.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
                  PHONE NUMBER
                </label>
                <div className="flex">
                  <span className="bg-white/[0.04] border border-r-0 border-white/[0.08] px-3.5 py-3 rounded-l-xl text-zinc-400 font-mono text-sm flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-r-xl py-3 px-4 font-mono text-white text-sm outline-none focus:border-[#00E599]"
                  />
                </div>
              </div>

              <button
                onClick={() => setOtpSent(true)}
                className="w-full py-3.5 bg-[#00E599] hover:bg-[#00c985] text-black font-mono text-xs font-bold tracking-widest uppercase rounded-xl transition"
              >
                {otpSent ? 'VERIFY SECURE OTP' : 'REQUEST OTP ACCESS'}
              </button>
            </div>

            <p className="text-[10px] font-mono text-zinc-600 text-center uppercase tracking-widest">
              PROTECTED BY SUPABASE ROW-LEVEL PROTOCOLS
            </p>
          </div>
        </div>
      )}

      {/* 10. PROTOCOL FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#030303] py-16 text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#00E599] rounded-full" />
              <span className="text-white font-bold tracking-widest uppercase">ENGINE.AI</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              India's proprietary deterministic discount discovery engine. Arbitraging retail checkout prices since 2026.
            </p>
          </div>

          <div>
            <p className="text-white uppercase tracking-widest font-semibold mb-3">INFRASTRUCTURE</p>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#terminal" className="hover:text-white">Savings Calculator</a></li>
              <li><a href="#vouchers" className="hover:text-white">Wholesale Vouchers</a></li>
              <li><a href="#coupons" className="hover:text-white">Verified Coupons</a></li>
              <li><a href="#cards" className="hover:text-white">Credit Card Router</a></li>
            </ul>
          </div>

          <div>
            <p className="text-white uppercase tracking-widest font-semibold mb-3">COMPLIANCE</p>
            <ul className="space-y-2 text-[11px]">
              <li>NPCI UPI Framework</li>
              <li>RBI PPI Master Guidelines</li>
              <li>ASCI Marketing Standards</li>
              <li>Zero-Data Retention Policy</li>
            </ul>
          </div>

          <div>
            <p className="text-white uppercase tracking-widest font-semibold mb-3">AFFILIATE DISCLOSURE</p>
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              Engine.AI may earn a commission from eligible voucher acquisitions and banking approvals through merchant partner networks.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-12 mt-12 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
          <span>© 2026 ENGINE.AI TECHNOLOGIES. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-zinc-400 cursor-pointer">TERMS OF SERVICE</span>
            <span className="hover:text-zinc-400 cursor-pointer">SECURITY DISCLOSURE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}