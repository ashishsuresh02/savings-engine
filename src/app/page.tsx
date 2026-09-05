'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  CreditCard, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  Zap,
  Check,
  Copy,
  User,
  X,
  TrendingUp,
  Gift,
  ArrowRight,
  Flame,
  Clock,
  ChevronDown,
  ShoppingBag,
  Utensils,
  Plane,
  Laptop,
  CheckCircle2,
  Lock,
  Layers
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

// 1. Live Marquee Ticker
const TICKER_ITEMS = [
  { text: "Rahul S. saved ₹185 on Domino's Pizza (17% Arbitrage)", color: "text-emerald-400" },
  { text: "Priya M. loaded ₹2,000 Myntra Voucher at ₹1,810", color: "text-purple-400" },
  { text: "Blinkit 10-Min Flash Drop: 12% Voucher Reserve unlocked", color: "text-amber-400" },
  { text: "Amit K. earned ₹2,100 SBI Card Cashback Bounty", color: "text-cyan-400" },
  { text: "Zomato Gold Stack saved ₹140 on Cart #9412", color: "text-rose-400" },
];

// 2. Interactive Brands Registry
const BRANDS = [
  { name: "Domino's Pizza", slug: "dominos", category: "FOOD", discount: "16% OFF", logoBg: "from-blue-600 to-indigo-700", glow: "group-hover:shadow-blue-500/30" },
  { name: "Swiggy", slug: "swiggy", category: "FOOD", discount: "6% OFF", logoBg: "from-orange-500 to-amber-600", glow: "group-hover:shadow-orange-500/30" },
  { name: "Zomato", slug: "zomato", category: "FOOD", discount: "7.5% OFF", logoBg: "from-red-600 to-rose-700", glow: "group-hover:shadow-red-500/30" },
  { name: "Myntra", slug: "myntra", category: "FASHION", discount: "10% OFF", logoBg: "from-pink-600 to-rose-600", glow: "group-hover:shadow-pink-500/30" },
  { name: "Blinkit", slug: "blinkit", category: "QUICK", discount: "5% OFF", logoBg: "from-yellow-500 to-amber-600", glow: "group-hover:shadow-yellow-500/30" },
  { name: "Amazon Pay", slug: "amazon", category: "TECH", discount: "2.5% OFF", logoBg: "from-slate-700 to-zinc-900", glow: "group-hover:shadow-zinc-500/30" },
];

// 3. 3D Holographic Vouchers
const VOUCHER_CARDS = [
  {
    brand: "Domino's Gourmet",
    faceValue: 500,
    buyPrice: 415,
    discount: "17% INSTANT OFF",
    gradient: "from-blue-600/30 via-indigo-600/20 to-purple-600/30",
    borderGlow: "border-blue-500/40 hover:border-blue-400",
    glowColor: "shadow-[0_0_35px_-10px_rgba(59,130,246,0.3)]",
    tag: "MOST POPULAR",
    category: "Dining"
  },
  {
    brand: "Myntra Fashion Vault",
    faceValue: 2000,
    buyPrice: 1810,
    discount: "9.5% STACKABLE",
    gradient: "from-rose-600/30 via-pink-600/20 to-purple-600/30",
    borderGlow: "border-rose-500/40 hover:border-rose-400",
    glowColor: "shadow-[0_0_35px_-10px_rgba(244,63,94,0.3)]",
    tag: "HOT ARBITRAGE",
    category: "Lifestyle"
  },
  {
    brand: "Swiggy Money Pro",
    faceValue: 1000,
    buyPrice: 940,
    discount: "6% KICKBACK",
    gradient: "from-amber-600/30 via-orange-600/20 to-red-600/30",
    borderGlow: "border-amber-500/40 hover:border-amber-400",
    glowColor: "shadow-[0_0_35px_-10px_rgba(245,158,11,0.3)]",
    tag: "INSTANT LOAD",
    category: "Delivery"
  },
  {
    brand: "MakeMyTrip Flights",
    faceValue: 5000,
    buyPrice: 4600,
    discount: "8% DIRECT CUT",
    gradient: "from-cyan-600/30 via-teal-600/20 to-emerald-600/30",
    borderGlow: "border-cyan-500/40 hover:border-cyan-400",
    glowColor: "shadow-[0_0_35px_-10px_rgba(6,182,212,0.3)]",
    tag: "HIGH VALUE",
    category: "Travel"
  }
];

// 4. Verified Coupons
const VERIFIED_COUPONS = [
  { brand: "Domino's", code: "DOM50", offer: "Flat ₹50 OFF on Cart > ₹300", badge: "STACKS WITH VOUCHERS", bg: "from-blue-950/60 to-slate-900" },
  { brand: "Myntra", code: "MYNTRA200", offer: "Flat ₹200 OFF on Fashion Carts", badge: "VERIFIED TODAY", bg: "from-pink-950/60 to-slate-900" },
  { brand: "Swiggy", code: "CRAVINGS", offer: "Up to ₹120 OFF on Gourmet Orders", badge: "TRENDING", bg: "from-orange-950/60 to-slate-900" },
  { brand: "Blinkit", code: "FRESH20", offer: "Flat ₹20 Instant Cart Reduction", badge: "EXPIRING SOON", bg: "from-emerald-950/60 to-slate-900" },
];

// 5. High-Yield Banking Partners
const BANK_CARDS = [
  {
    name: "SBI Cashback Card",
    issuer: "SBI CARD",
    payout: "₹2,100 BOUNTY",
    benefit: "5% Direct Online Cashback on Everything",
    bg: "from-blue-600 via-indigo-700 to-slate-900",
    url: "https://gromo.in/referral/sbi-cashback"
  },
  {
    name: "Axis Bank Flipkart Card",
    issuer: "AXIS BANK",
    payout: "₹1,850 BOUNTY",
    benefit: "5% Unlimited Shopping Cashback",
    bg: "from-purple-600 via-violet-800 to-slate-900",
    url: "https://gromo.in/referral/axis-flipkart"
  },
  {
    name: "HDFC Millennia Credit Card",
    issuer: "HDFC BANK",
    payout: "₹2,400 BOUNTY",
    benefit: "5% Cashback on Swiggy, Zomato & Amazon",
    bg: "from-cyan-600 via-sky-800 to-slate-900",
    url: "https://gromo.in/referral/hdfc-millennia"
  }
];

// 6. FAQs
const FAQS = [
  { q: "Ye normal coupon websites se alag kaise hai?", a: "Normal websites par 90% coupons expired hote hain aur wo sirf links dete hain. Humara engine calculation karta hai: Merchant Coupon + Wholesale E-Voucher + Payment Card Cashback ko ek sath stack karke final lowest price nikalta hai." },
  { q: "Voucher khareedne ke baad redeem kaise hota hai?", a: "Voucher khareedte hi 2 seconds me 16-digit code aur PIN screen par milta hai. Domino's ya Swiggy ke checkout par bas 'Gift Card' choose karke code enter karna hota hai aur balance ₹0 ho jata hai." },
  { q: "Kya credit card cashback sach me add hota hai?", a: "Haan! Agar aap voucher buy karte waqt apna SBI Cashback ya HDFC card use karte hain, to bank se extra 5% cashback aapke credit card bill me credit ho jata hai." }
];

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // UI Interactive States
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScratched, setIsScratched] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Flash Sale Timer Simulator
  const [timeLeft, setTimeLeft] = useState({ minutes: 24, seconds: 48 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#060608] text-slate-100 font-sans antialiased relative overflow-x-hidden selection:bg-emerald-400 selection:text-black">

      {/* VIBRANT BACKGROUND AURAS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-48 right-1/4 w-[500px] h-[400px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] left-1/3 w-[700px] h-[400px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* 1. TOP LIVE TICKER TAPE */}
      <div className="w-full bg-[#0B0B0E] border-b border-white/[0.06] py-2 overflow-hidden flex items-center">
        <div className="flex items-center gap-2 px-6 text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-bold shrink-0 border-r border-white/[0.08]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          LIVE ARBITRAGE STREAM
        </div>
        <div className="flex gap-12 whitespace-nowrap animate-marquee text-xs font-mono pl-6">
          {TICKER_ITEMS.map((item, idx) => (
            <span key={idx} className={`flex items-center gap-2 ${item.color}`}>
              <Zap className="w-3.5 h-3.5 fill-current" />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* 2. GLASS NAVIGATION BAR */}
      <header className="border-b border-white/[0.08] backdrop-blur-2xl sticky top-0 z-40 bg-[#060608]/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <div className="w-full h-full bg-[#08080A] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-mono text-lg font-black tracking-widest uppercase text-white block leading-none">
                ENGINE<span className="text-emerald-400">.AI</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">Smart Savings Layer</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-widest text-zinc-400">
            <a href="#calculator" className="hover:text-emerald-400 transition">01 // CALCULATOR</a>
            <a href="#vouchers" className="hover:text-purple-400 transition">02 // 3D VOUCHERS</a>
            <a href="#coupons" className="hover:text-pink-400 transition">03 // COUPOUN LOCKER</a>
            <a href="#cards" className="hover:text-cyan-400 transition">04 // CARD PERKS</a>
            <a href="#matrix" className="hover:text-amber-400 transition">05 // COMPARISON</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow opacity-80" />
              <span className="relative px-5 py-2.5 rounded-full bg-[#0B0B0E] flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-white group-hover:bg-transparent group-hover:text-black transition-all duration-300">
                <User className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                MEMBER VAULT
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE WITH 3D INTERACTIVE CARDS */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Punchy Pitch */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Zap className="w-3.5 h-3.5 fill-current" />
              PROPRIETARY ALGORITHMIC SAVINGS ENGINE
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.02]">
              Why Pay MRP When <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                The Best Price Is Hidden?
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl font-normal leading-relaxed">
              We scrape wholesale digital vouchers, unlock hidden merchant promos, and stack payment card rewards to give you the lowest effective price on everything you buy.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <a 
                href="#calculator"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-mono text-xs font-black tracking-[0.2em] uppercase shadow-[0_0_35px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
              >
                OPEN ENGINE TERMINAL
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>₹1.4+ CR SAVED IN 2026</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive 3D Gamified Scratch Voucher Box */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-1 bg-gradient-to-br from-emerald-500/40 via-purple-500/20 to-pink-500/40 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]">
              <div className="bg-[#0C0C10] rounded-[22px] p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    INTERACTIVE MYSTERY REVEAL
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                    <Flame className="w-4 h-4 fill-current text-amber-400" />
                    <span>HOT DROP</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase text-white">Domino's ₹500 Voucher</h3>
                  <p className="text-xs text-zinc-400">Tap below to scratch and reveal the secret effective arbitrage price.</p>
                </div>

                {/* The Scratch Card Canvas Area */}
                <div 
                  onClick={() => setIsScratched(true)}
                  className={`relative cursor-pointer rounded-2xl p-6 border transition-all duration-500 flex flex-col items-center justify-center min-h-[160px] text-center ${
                    isScratched 
                      ? 'bg-gradient-to-br from-emerald-950/80 via-[#0A0A0E] to-slate-900 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                      : 'bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-800 border-white/[0.15] hover:border-emerald-500/50'
                  }`}
                >
                  {!isScratched ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                        <Gift className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-mono font-bold tracking-widest uppercase text-white">
                        [ CLICK TO SCRATCH & UNCOVER ]
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in zoom-in-95 duration-300">
                      <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                        ARBITRAGE UNLOCKED (17% OFF)
                      </p>
                      <div className="flex items-baseline justify-center gap-3">
                        <span className="text-4xl font-mono font-black text-white">₹415</span>
                        <span className="text-lg font-mono text-zinc-500 line-through">₹500</span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-400">
                        +₹20.75 Extra on SBI Card = <span className="text-emerald-400 font-bold">₹394.25 NET</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 pt-2">
                  <span>EXPIRY: 24 HOURS</span>
                  <span className="text-emerald-400">INSTANT CODE DELIVERY</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FLASH SALE LIVE DROPS TICKER */}
      <section className="border-y border-white/[0.06] bg-[#09090D] py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              FLASH VOUCHER ALLOCATION ENDING:
            </span>
            <div className="flex items-center gap-1 font-mono text-xs bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-lg text-rose-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Swiggy (₹1,000 at ₹940) — 8 Left
            </span>
            <span className="flex items-center gap-1.5 hidden sm:inline-flex">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Myntra (₹2,000 at ₹1,810) — 3 Left
            </span>
          </div>
        </div>
      </section>

      {/* 5. THE CORE AI SAVINGS ENGINE (THE CALCULATOR TERMINAL) */}
      <section id="calculator" className="max-w-7xl mx-auto px-6 py-24 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-emerald-400">
            THE REAL-TIME COMPUTE MATRIX
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            Calculate Your Bottom Line
          </h2>
          <p className="text-sm text-zinc-400">
            Select an asset, specify your cart size, and toggle your card perk to inspect the mathematical cheapest route.
          </p>
        </div>

        <div className="bg-[#0C0C10] border border-white/[0.08] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative">
          
          {/* Brand Selector Grid */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 block">
              STEP 01 // CHOOSE BRAND
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {BRANDS.map((b) => {
                const active = selectedBrand === b.slug;
                return (
                  <button
                    key={b.slug}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-300 ${
                      active 
                        ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-400 text-white shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]' 
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.2]'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">{b.discount}</span>
                    <span className="font-bold text-sm block truncate text-white">{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount and Card Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 block">
                STEP 02 // CART VALUE (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-zinc-400 text-xl font-bold">₹</span>
                <input
                  type="number"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-emerald-400 rounded-2xl py-4 pl-10 pr-4 text-2xl font-mono text-white tracking-wider outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 block">
                STEP 03 // PAYMENT RAIL BENEFIT
              </label>
              <div 
                onClick={() => setHasSbiCard(!hasSbiCard)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  hasSbiCard 
                    ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/50 text-white' 
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-5 h-5 ${hasSbiCard ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-white">SBI Cashback Credit Card</p>
                    <p className="text-[10px] font-mono text-zinc-400">Unlocks 5.0% flat online card reward</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                  hasSbiCard ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-zinc-700'
                }`}>
                  {hasSbiCard && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Trigger Button */}
          <button
            onClick={calculateSavings}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:brightness-110 text-black font-mono text-xs font-black tracking-[0.25em] uppercase transition shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-black" />
            {loading ? 'COMPUTING SAVINGS ENGINE...' : 'EXECUTE SAVINGS CALCULATION'}
          </button>

          {/* Calculated Output Breakdown Card */}
          {result && (
            <div className="mt-8 bg-gradient-to-br from-[#08080C] via-slate-950 to-[#0A0A10] border border-emerald-400/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_60px_-15px_rgba(16,185,129,0.2)] animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-4 text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> OPTIMAL ROUTE: {result.bestRoute}
                </span>
                <span className="text-zinc-500 line-through">RETAIL CHECKOUT: ₹{result.originalCart}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-baseline">
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">NET PAYABLE AMOUNT</p>
                  <p className="text-4xl sm:text-6xl font-mono font-black text-white mt-1">₹{result.bestEffectiveCost}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">TOTAL LIQUID SAVED</p>
                  <p className="text-3xl sm:text-5xl font-mono font-bold text-emerald-400 mt-1">+₹{result.totalSavings}</p>
                </div>
              </div>

              <div className="bg-black/80 border border-white/[0.08] rounded-2xl p-4 text-xs font-mono space-y-2.5 text-zinc-300">
                {result.breakdown.voucherCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Wholesale Voucher Discount:</span>
                    <span className="text-emerald-400 font-bold">-₹{result.breakdown.voucherCut}</span>
                  </div>
                )}
                {result.breakdown.couponCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Merchant Code [{result.breakdown.couponCode}]:</span>
                    <span className="text-emerald-400 font-bold">-₹{result.breakdown.couponCut}</span>
                  </div>
                )}
                {result.breakdown.cardCashback > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Bank Rail Reward (5%):</span>
                    <span className="text-cyan-400 font-bold">-₹{result.breakdown.cardCashback}</span>
                  </div>
                )}
              </div>

              <a
                href={result.breakdown.buyUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-black tracking-[0.2em] uppercase rounded-xl transition shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 group"
              >
                LOCK PRICE & PURCHASE VOUCHER
                <ArrowUpRight className="w-4 h-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 6. 3D HOLOGRAPHIC VOUCHER BOUTIQUE */}
      <section id="vouchers" className="max-w-7xl mx-auto px-6 py-16 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-purple-400">IN-APP ASSET VAULT</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Discounted E-Vouchers
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">INSTANT CODE DISPATCH • ZERO-MDR UPI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VOUCHER_CARDS.map((v, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-6 bg-gradient-to-br ${v.gradient} border ${v.borderGlow} ${v.glowColor} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between min-h-[280px] overflow-hidden`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-zinc-300">
                    {v.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-black">{v.tag}</span>
                </div>

                <h3 className="text-xl font-black uppercase text-white tracking-tight">{v.brand}</h3>
                <p className="text-[11px] font-mono text-emerald-400 font-bold">{v.discount}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">YOU PAY</span>
                    <span className="text-3xl font-mono font-black text-white">₹{v.buyPrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 block">VALUE</span>
                    <span className="text-sm font-mono text-zinc-500 line-through">₹{v.faceValue}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBrand(v.brand.toLowerCase().includes('domino') ? 'dominos' : 'swiggy');
                    setCartAmount(v.faceValue.toString());
                    window.scrollTo({ top: 900, behavior: 'smooth' });
                  }}
                  className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Gift className="w-3.5 h-3.5" />
                  ACQUIRE VOUCHER
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. VERIFIED PROMO CODE LOCKER */}
      <section id="coupons" className="max-w-7xl mx-auto px-6 py-16 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-pink-400">PROMOTIONAL REGISTRY</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Verified Coupon Locker
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> 100% SCRAPED & TESTED TODAY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VERIFIED_COUPONS.map((c, i) => (
            <div
              key={i}
              className={`bg-gradient-to-r ${c.bg} border border-white/[0.08] hover:border-white/[0.2] rounded-2xl p-6 flex items-center justify-between gap-4 transition`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-white">{c.brand}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold">
                    {c.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-normal">{c.offer}</p>
              </div>

              <button
                onClick={() => copyCoupon(c.code)}
                className="px-5 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.15] rounded-xl font-mono text-xs text-white font-bold flex items-center gap-2 shrink-0 transition active:scale-95"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-400" />
                    <span>{c.code}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 8. HIGH-YIELD FINTECH CARDS (PRIMARY MONETIZATION ENGINE) */}
      <section id="cards" className="max-w-7xl mx-auto px-6 py-16 space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-cyan-400">FINTECH ARBITRAGE</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Maximize With Co-Branded Cards
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400">UP TO ₹2,400 DISPATCH BOUNTY</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {BANK_CARDS.map((card, i) => (
            <div
              key={i}
              className="bg-[#0C0C10] border border-white/[0.08] hover:border-cyan-500/40 rounded-3xl p-6 space-y-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                    {card.payout}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{card.issuer}</span>
                </div>

                {/* 3D Visual Card Mockup */}
                <div className={`rounded-2xl p-5 bg-gradient-to-tr ${card.bg} border border-white/[0.15] shadow-xl space-y-6 text-white`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono tracking-widest font-bold opacity-80">SMART PASS</span>
                    <CreditCard className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-wide">{card.name}</p>
                    <p className="text-[11px] text-white/80 mt-1">{card.benefit}</p>
                  </div>
                </div>
              </div>

              <a
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-white/[0.05] hover:bg-cyan-400 hover:text-black text-white font-mono text-xs font-black tracking-widest uppercase rounded-xl transition flex items-center justify-center gap-2 shadow-md"
              >
                APPLY & ACTIVATE KICKBACK
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 9. THE CRED-GRADE COMPARISON MATRIX */}
      <section id="matrix" className="max-w-7xl mx-auto px-6 py-16 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-amber-400">
            THE ARCHITECTURAL DIFFERENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            Traditional Coupon Sites vs Engine.AI
          </h2>
        </div>

        <div className="bg-[#0C0C10] border border-white/[0.08] rounded-3xl p-6 sm:p-10 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-500 text-[10px] uppercase tracking-widest">
                <th className="pb-4">FEATURE MATRIX</th>
                <th className="pb-4 text-zinc-400">LEGACY COUPON WEBSITES</th>
                <th className="pb-4 text-emerald-400 font-bold">ENGINE.AI SAVINGS PROTOCOL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              <tr>
                <td className="py-4 font-bold text-white">Deal Discovery Mechanism</td>
                <td className="py-4 text-zinc-500">Unverified user submissions (80% Expired)</td>
                <td className="py-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Live Wholesale API Feeds (100% Deterministic)
                </td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-white">Discount Stacking Ability</td>
                <td className="py-4 text-zinc-500">Single promo code only (Fails at checkout)</td>
                <td className="py-4 text-emerald-400 font-semibold">Voucher + Merchant Coupon + Card Cashback</td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-white">Effective Price Calculation</td>
                <td className="py-4 text-zinc-500">Manual mental math by user</td>
                <td className="py-4 text-emerald-400 font-semibold">Sub-50ms automated net cost breakdown</td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-white">Execution Speed</td>
                <td className="py-4 text-zinc-500">Trial & error across 10+ spammy popups</td>
                <td className="py-4 text-emerald-400 font-semibold">1-Click instant code dispatch via UPI</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-zinc-400">COMMON QUESTIONS</span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">Frequently Asked</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="bg-[#0C0C10] border border-white/[0.08] rounded-2xl p-6 cursor-pointer transition"
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-base font-bold text-white">{faq.q}</h4>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-400' : ''}`} />
              </div>
              {openFaq === i && (
                <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-white/[0.06] leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 11. INTERACTIVE AUTH MODAL (MEMBER ACCESS) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0C0C10] border border-white/[0.15] rounded-3xl p-8 max-w-md w-full space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black uppercase text-white">Member Identification</h3>
              <p className="text-xs text-zinc-400">Enter your phone number to access your personal lifetime savings ledger.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-1">
                  PHONE NUMBER
                </label>
                <div className="flex">
                  <span className="bg-white/[0.04] border border-r-0 border-white/[0.08] px-4 py-3 rounded-l-xl text-zinc-400 font-mono text-sm flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-r-xl py-3 px-4 font-mono text-white text-sm outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                onClick={() => alert("Verification code dispatched to your phone.")}
                className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                REQUEST OTP ACCESS
              </button>
            </div>

            <p className="text-[10px] font-mono text-zinc-600 text-center uppercase tracking-widest">
              PROTECTED BY SUPABASE ROW-LEVEL PROTOCOLS
            </p>
          </div>
        </div>
      )}

      {/* 12. PROTOCOL FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#030305] py-20 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]" />
              <span className="text-white font-black tracking-widest uppercase">ENGINE.AI</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              India's smart savings layer. Calculating optimal execution vectors across digital vouchers, coupons, and bank perks since 2026.
            </p>
          </div>

          <div>
            <p className="text-white uppercase tracking-widest font-bold mb-3">INFRASTRUCTURE</p>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#calculator" className="hover:text-emerald-400">Savings Calculator</a></li>
              <li><a href="#vouchers" className="hover:text-purple-400">Wholesale Vouchers</a></li>
              <li><a href="#coupons" className="hover:text-pink-400">Coupon Locker</a></li>
              <li><a href="#cards" className="hover:text-cyan-400">Card Perks</a></li>
            </ul>
          </div>

          <div>
            <p className="text-white uppercase tracking-widest font-bold mb-3">REGULATORY</p>
            <ul className="space-y-2 text-[11px]">
              <li>NPCI UPI Unified Rails</li>
              <li>RBI PPI Master Directions</li>
              <li>ASCI Marketing Transparency</li>
              <li>Zero Tracking Cookie Policy</li>
            </ul>
          </div>

          <div>
            <p className="text-white uppercase tracking-widest font-bold mb-3">AFFILIATE NOTICE</p>
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              Engine.AI earns an authorized performance spread on eligible digital voucher redemptions and approved banking applications.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
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