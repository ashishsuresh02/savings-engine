'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  CreditCard, 
  Sparkles, 
  Zap, 
  Check, 
  Copy, 
  User, 
  X, 
  Gift, 
  ArrowRight, 
  Clock, 
  ChevronDown, 
  ShieldCheck, 
  CheckCircle2,
  Tag
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

const BRANDS = [
  { name: "Domino's", slug: "dominos", offer: "Flat 16% Off", color: "border-blue-500/30 hover:border-blue-500" },
  { name: "Swiggy", slug: "swiggy", offer: "6% Off Voucher", color: "border-orange-500/30 hover:border-orange-500" },
  { name: "Zomato", slug: "zomato", offer: "7.5% Off", color: "border-rose-500/30 hover:border-rose-500" },
  { name: "Myntra", slug: "myntra", offer: "10% Off Voucher", color: "border-pink-500/30 hover:border-pink-500" },
  { name: "Blinkit", slug: "blinkit", offer: "Instant 5% Off", color: "border-yellow-500/30 hover:border-yellow-500" },
  { name: "Amazon Pay", slug: "amazon", offer: "2.5% Savings", color: "border-emerald-500/30 hover:border-emerald-500" },
];

const VOUCHER_CARDS = [
  {
    brand: "Domino's Pizza",
    value: 500,
    price: 415,
    discount: "Save ₹85 (17% Off)",
    category: "Food & Dining",
    glow: "from-blue-600/20 via-slate-900 to-indigo-950/40",
    tag: "Best Seller"
  },
  {
    brand: "Myntra Shopping",
    value: 2000,
    price: 1810,
    discount: "Save ₹190 (9.5% Off)",
    category: "Fashion",
    glow: "from-pink-600/20 via-slate-900 to-rose-950/40",
    tag: "Trending"
  },
  {
    brand: "Swiggy Food & Instamart",
    value: 1000,
    price: 940,
    discount: "Save ₹60 (6% Off)",
    category: "Food Delivery",
    glow: "from-amber-600/20 via-slate-900 to-orange-950/40",
    tag: "Instant Load"
  },
  {
    brand: "MakeMyTrip Flights",
    value: 5000,
    price: 4600,
    discount: "Save ₹400 (8% Off)",
    category: "Travel",
    glow: "from-cyan-600/20 via-slate-900 to-teal-950/40",
    tag: "Big Savings"
  }
];

const COUPONS = [
  { brand: "Domino's", code: "DOM50", offer: "Flat ₹50 Off on orders above ₹300", stackable: true },
  { brand: "Myntra", code: "MYNTRA200", offer: "Flat ₹200 Off on fashion items", stackable: true },
  { brand: "Swiggy", code: "WELCOME50", offer: "50% Off up to ₹100 on first 3 orders", stackable: false },
  { brand: "Blinkit", code: "FRESH20", offer: "Flat ₹20 Off on grocery cart above ₹499", stackable: false },
];

const BANK_CARDS = [
  {
    name: "SBI Cashback Credit Card",
    bank: "SBI Card",
    reward: "5% Flat Cashback on all online spends",
    joining: "Joining Fee: ₹999",
    tag: "Recommended for Maximum Savings",
    url: "https://gromo.in/referral/sbi-cashback"
  },
  {
    name: "Axis Bank Flipkart Card",
    bank: "Axis Bank",
    reward: "5% Unlimited Cashback on Shopping",
    joining: "Joining Fee: ₹500",
    tag: "Best for E-Commerce",
    url: "https://gromo.in/referral/axis-flipkart"
  },
  {
    name: "HDFC Millennia Credit Card",
    bank: "HDFC Bank",
    reward: "5% Cashback on Amazon, Swiggy & Zomato",
    joining: "Joining Fee: ₹1,000",
    tag: "Best for Food Delivery",
    url: "https://gromo.in/referral/hdfc-millennia"
  }
];

const FAQS = [
  {
    q: "Ye normal coupon websites se kaise alag hai?",
    a: "Normal websites par 90% coupons expire ho chuke hote hain. Humara engine calculation karta hai: Brand Coupon + Discounted Voucher + Payment Card Cashback teeno ko ek sath jodkar batata hai ki aapko sabse sasta kahan padega."
  },
  {
    q: "Discounted Voucher kya hota hai aur ye kaise use hota hai?",
    a: "Voucher ek tarah ka prepaid digital gift card hota hai. Jaise ₹500 ka Domino's voucher aapko ₹415 me mil gaya. Khareedte hi code milta hai, jise Domino's app me 'Gift Card' section me daal kar payment ₹0 ho jati hai."
  },
  {
    q: "Kya credit card cashback sach me milta hai?",
    a: "Haan! Agar aap voucher buy karte waqt eligible card (jaise SBI Cashback ya HDFC) use karte hain, to 5% extra cashback aapke card ke statement me add ho jata hai."
  }
];

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScratched, setIsScratched] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState({ minutes: 18, seconds: 45 });
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
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans antialiased selection:bg-emerald-400 selection:text-black">
      
      {/* Soft Ambient Background Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 1. TOP NOTIFICATION BAR */}
      <div className="bg-[#0D0D11] border-b border-white/[0.06] py-2.5 px-4 text-center text-xs text-zinc-300">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <strong className="text-white font-semibold">Today's Best Deal:</strong> 
          Domino's ₹500 voucher available at just ₹415 + extra 5% card cashback.
        </span>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <header className="border-b border-white/[0.08] backdrop-blur-xl sticky top-0 z-40 bg-[#070709]/80">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">
                Bachat<span className="text-emerald-400">Engine</span>
              </span>
              <span className="text-xs text-zinc-400">Smart Savings Assistant</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#calculator" className="hover:text-emerald-400 transition">Savings Calculator</a>
            <a href="#vouchers" className="hover:text-emerald-400 transition">Gift Cards</a>
            <a href="#coupons" className="hover:text-emerald-400 transition">Coupons</a>
            <a href="#cards" className="hover:text-emerald-400 transition">Bank Offers</a>
          </div>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] px-4 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-95"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Member Login</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Before you buy anything online, check here first
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Never pay full price <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                when you checkout.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              We find hidden discounted vouchers, valid coupons, and bank card cashback to calculate the lowest price you actually have to pay.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <a 
                href="#calculator"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                Calculate My Savings
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Over ₹1.2 Lakh saved this week</span>
              </div>
            </div>
          </div>

          {/* Right: Clean Interactive Scratch Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl p-6 bg-[#0E0E14] border border-white/[0.08] shadow-2xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Live Deal Example</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md font-medium">17% Instant Discount</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Domino's ₹500 Voucher</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Click below to see how much you actually pay.</p>
              </div>

              {/* The Scratch Card */}
              <div 
                onClick={() => setIsScratched(true)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] text-center ${
                  isScratched 
                    ? 'bg-emerald-950/30 border-emerald-500/30' 
                    : 'bg-zinc-900/90 border-white/[0.1] hover:border-emerald-500/40'
                }`}
              >
                {!isScratched ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Gift className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-white">Tap here to reveal secret price</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-in zoom-in-95">
                    <p className="text-xs text-emerald-400 font-semibold">Special Voucher Price</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-extrabold text-white">₹415</span>
                      <span className="text-sm text-zinc-500 line-through">₹500</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      With SBI Card: <strong className="text-emerald-400 font-bold">₹394.25 only</strong>
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 text-center">
                Instant delivery via WhatsApp & SMS after checkout.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FLASH SALE BANNER */}
      <div className="border-y border-white/[0.06] bg-[#0A0A0F] py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-white font-semibold">Flash Voucher Offer Ends In:</span>
            <div className="flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-md font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          </div>
          <div className="text-zinc-400">
            Swiggy ₹1,000 at ₹940 (6 left) • Myntra ₹2,000 at ₹1,810 (3 left)
          </div>
        </div>
      </div>

      {/* 5. THE CLEAN SAVINGS CALCULATOR (MAIN TOOL) */}
      <section id="calculator" className="max-w-4xl mx-auto px-6 py-20 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Real-Time Savings Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Calculate Your Best Price
          </h2>
          <p className="text-sm text-zinc-400">
            Choose where you are ordering from, enter your cart amount, and see your exact savings.
          </p>
        </div>

        <div className="bg-[#0E0E14] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Brand Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              1. Select Brand / App
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BRANDS.map((b) => {
                const active = selectedBrand === b.slug;
                return (
                  <button
                    key={b.slug}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      active 
                        ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md' 
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:border-white/[0.15]'
                    }`}
                  >
                    <span className="text-xs text-emerald-400 font-semibold block">{b.offer}</span>
                    <span className="font-bold text-sm text-white block mt-0.5">{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Payment Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                2. Order Cart Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white/[0.03] border border-white/[0.1] focus:border-emerald-400 rounded-xl py-3 pl-9 pr-4 text-xl font-bold text-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                3. Additional Card Offer
              </label>
              <div 
                onClick={() => setHasSbiCard(!hasSbiCard)}
                className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between ${
                  hasSbiCard 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className={`w-5 h-5 ${hasSbiCard ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-white">SBI Cashback Card</p>
                    <p className="text-[11px] text-zinc-400">Gives 5% extra cashback on spends</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                  hasSbiCard ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-zinc-700'
                }`}>
                  {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Action */}
          <button
            onClick={calculateSavings}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-sm tracking-wide transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-black" />
            {loading ? 'Finding Best Discounts...' : 'Calculate Lowest Effective Price'}
          </button>

          {/* Output Breakdown Card */}
          {result && (
            <div className="mt-6 bg-[#08080C] border border-emerald-400/30 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Best Savings Route Found
                </span>
                <span className="text-zinc-400">Regular Cart: <del>₹{result.originalCart}</del></span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-baseline">
                <div>
                  <p className="text-xs text-zinc-400">You Actually Pay</p>
                  <p className="text-3xl sm:text-4xl font-black text-white mt-0.5">₹{result.bestEffectiveCost}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-400 font-medium">Your Total Savings</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-0.5">Save ₹{result.totalSavings}</p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/[0.06] rounded-xl p-3.5 text-xs space-y-2 text-zinc-300">
                {result.breakdown.voucherCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">E-Voucher Discount:</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.voucherCut}</span>
                  </div>
                )}
                {result.breakdown.couponCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Promo Code ({result.breakdown.couponCode}):</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.couponCut}</span>
                  </div>
                )}
                {result.breakdown.cardCashback > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">SBI Card 5% Cashback:</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.cardCashback}</span>
                  </div>
                )}
              </div>

              <a
                href={result.breakdown.buyUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                Buy Voucher & Save Money Now
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 6. GIFT CARDS & VOUCHERS CATALOG */}
      <section id="vouchers" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Direct Discounts</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Popular Discounted Gift Cards</h2>
          </div>
          <span className="text-xs text-zinc-400">Delivered instantly on WhatsApp & SMS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VOUCHER_CARDS.map((v, i) => (
            <div
              key={i}
              className="bg-[#0E0E14] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">{v.category}</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">{v.tag}</span>
                </div>
                <h3 className="text-base font-bold text-white">{v.brand}</h3>
                <p className="text-xs font-semibold text-emerald-400">{v.discount}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Offer Price</span>
                    <span className="text-2xl font-bold text-white">₹{v.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 block">Value</span>
                    <span className="text-sm text-zinc-500 line-through">₹{v.value}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBrand(v.brand.toLowerCase().includes('domino') ? 'dominos' : 'swiggy');
                    setCartAmount(v.value.toString());
                    window.scrollTo({ top: 750, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 bg-white/[0.06] hover:bg-emerald-400 hover:text-black text-white text-xs font-bold rounded-xl transition"
                >
                  Buy for ₹{v.price}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. VERIFIED PROMO CODES */}
      <section id="coupons" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">Tested Codes</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Verified Brand Coupons</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {COUPONS.map((c, i) => (
            <div
              key={i}
              className="bg-[#0E0E14] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{c.brand}</span>
                  {c.stackable && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">
                      Works with Vouchers
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{c.offer}</p>
              </div>

              <button
                onClick={() => copyCoupon(c.code)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition active:scale-95 shrink-0"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
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

      {/* 8. BANK CARDS */}
      <section id="cards" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Double Your Savings</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Recommended Cashback Credit Cards</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {BANK_CARDS.map((card, i) => (
            <div
              key={i}
              className="bg-[#0E0E14] border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 transition"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-400 font-semibold">{card.tag}</span>
                  <span className="text-zinc-500">{card.bank}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{card.name}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{card.reward}</p>
                <p className="text-xs text-zinc-500">{card.joining}</p>
              </div>

              <a
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-white/[0.06] hover:bg-cyan-400 hover:text-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Apply Online & Get Cashback
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400">Everything you need to know about vouchers and discounts</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="bg-[#0E0E14] border border-white/[0.08] rounded-xl p-5 cursor-pointer transition"
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm font-semibold text-white">{faq.q}</h4>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-400' : ''}`} />
              </div>
              {openFaq === i && (
                <p className="text-xs text-zinc-400 mt-2.5 pt-2.5 border-t border-white/[0.06] leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. LOGIN MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101018] border border-white/[0.1] rounded-3xl p-7 max-w-sm w-full space-y-5 relative shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Login to Track Savings</h3>
              <p className="text-xs text-zinc-400">Enter your mobile number to view your lifetime savings ledger.</p>
            </div>

            <div className="space-y-3">
              <div className="flex">
                <span className="bg-white/[0.04] border border-r-0 border-white/[0.1] px-3 py-2.5 rounded-l-xl text-zinc-400 text-sm flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-r-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-emerald-400"
                />
              </div>

              <button
                onClick={() => alert("Verification code sent to your mobile number.")}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold rounded-xl transition"
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. SIMPLE CLEAN FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#050507] py-12 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-white font-bold block">BachatEngine Technologies</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Helping Indian shoppers discover the lowest price before checkout.</p>
          </div>
          <div className="flex gap-6 text-[11px]">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Contact Support</span>
          </div>
        </div>
      </footer>

    </div>
  );
}