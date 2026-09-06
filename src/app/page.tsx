'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Flame,
  BadgeCheck,
  Send,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Brand specific graphics, logo visual fallbacks and color palettes
const BRAND_VISUALS: Record<string, { banner: string; accent: string; iconText: string }> = {
  dominos: {
    banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=60',
    accent: '#006491',
    iconText: '🍕',
  },
  swiggy: {
    banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&auto=format&fit=crop&q=60',
    accent: '#fc8019',
    iconText: '🛵',
  },
  zomato: {
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=60',
    accent: '#e23744',
    iconText: '🍽️',
  },
  myntra: {
    banner: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&auto=format&fit=crop&q=60',
    accent: '#ff3f6c',
    iconText: '👗',
  },
  blinkit: {
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=60',
    accent: '#f8cb46',
    iconText: '⚡',
  },
  amazon: {
    banner: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=60',
    accent: '#ff9900',
    iconText: '📦',
  },
};

const INITIAL_BRANDS = [
  { id: '1', name: "Domino's Pizza", slug: 'dominos', discount: 13.0, category_name: 'Food & Dining' },
  { id: '2', name: "Swiggy", slug: 'swiggy', discount: 4.5, category_name: 'Food & Dining' },
  { id: '3', name: "Zomato", slug: 'zomato', discount: 5.5, category_name: 'Food & Dining' },
  { id: '4', name: "Myntra", slug: 'myntra', discount: 7.5, category_name: 'Fashion & Lifestyle' },
  { id: '5', name: "Blinkit", slug: 'blinkit', discount: 4.0, category_name: 'Quick Commerce' },
  { id: '6', name: "Amazon India", slug: 'amazon', discount: 1.5, category_name: 'Electronics & Marketplaces' },
];

const INITIAL_COUPONS = [
  { brandName: "Domino's Pizza", code: "DOM50", title: "Flat ₹50 OFF on orders above ₹300", stackable: true },
  { brandName: "Domino's Pizza", code: "PIZZA20", title: "20% OFF on gourmet pizzas", stackable: false },
  { brandName: "Myntra", code: "MYNTRA200", title: "Flat ₹200 OFF on Fashion cart", stackable: true },
];

const INITIAL_CARDS = [
  { id: '1', name: "SBI Cashback Credit Card", issuer_bank: "SBI Card", base_cashback: 5.0, joining_fee: 0, url: "https://gromo.in" },
  { id: '2', name: "Axis Bank Flipkart Card", issuer_bank: "Axis Bank", base_cashback: 1.5, joining_fee: 500, url: "https://gromo.in" },
  { id: '3', name: "HDFC Millennia Credit Card", issuer_bank: "HDFC Bank", base_cashback: 1.0, joining_fee: 1000, url: "https://gromo.in" },
];

const FAQS = [
  { 
    q: "Ye normal coupon websites se alag kaise kaam karta hai?", 
    a: "Normal websites par 90% coupons expire ho chuke hote hain. Humara platform live Wholesale E-Vouchers, verified coupons aur payment card rewards ko ek sath stack karke aapke liye lowest effective price calculate karta hai." 
  },
  { 
    q: "Discounted E-Voucher ko kaise redeem karein?", 
    a: "Voucher khareedte hi 2 seconds ke andar 16-digit voucher code aur PIN screen par milta hai. Domino's ya Swiggy ke checkout payment option me 'Gift Card' choose karke code enter karne par bill pay ho jata hai." 
  },
  { 
    q: "Kya credit card cashback sach me add hota hai?", 
    a: "Haan! Agar aap voucher purchase karte waqt eligible payment card (jaise SBI Cashback) use karte hain, to 5% extra cashback aapke card ke statement me credit ho jata hai." 
  }
];

// --- 3D INTERACTIVE TILT VOUCHER CARD COMPONENT ---
function Interactive3DVoucherCard({ 
  brand, 
  nominalVal, 
  onSelect 
}: { 
  brand: any; 
  nominalVal: number; 
  onSelect: () => void 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const visual = BRAND_VISUALS[brand.slug] || {
    banner: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=700&auto=format&fit=crop&q=60',
    accent: '#10b981',
    iconText: '🏷️',
  };

  const savingsAmt = Math.round((nominalVal * brand.discount) / 100);
  const finalPay = nominalVal - savingsAmt;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="w-full" style={{ perspective: '1100px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${glare.opacity ? 1.02 : 1}, ${glare.opacity ? 1.02 : 1}, 1)`,
          transition: glare.opacity ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
        }}
        className="relative h-[390px] rounded-3xl p-6 flex flex-col justify-between overflow-hidden border border-white/[0.08] bg-[#0c0c12] shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer select-none group"
      >
        {/* Dynamic Interactive Glare / Shine Effect */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`,
          }}
        />

        {/* Real Brand Background Cover Image with Vignette Gradient */}
        <div 
          className="absolute top-0 left-0 w-full h-44 bg-cover bg-center opacity-35 group-hover:opacity-45 transition-opacity duration-500 z-0"
          style={{ 
            backgroundImage: `url(${brand.banner_url || visual.banner})`,
            maskImage: 'linear-gradient(to bottom, black 35%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 35%, transparent 100%)'
          }}
        />

        {/* Card Header (Icon & Floating Discount Badge) */}
        <div className="relative z-10 flex items-center justify-between" style={{ transform: 'translateZ(30px)' }}>
          <div className="w-12 h-12 rounded-2xl bg-white/[0.07] border border-white/15 flex items-center justify-center text-2xl shadow-xl backdrop-blur-md">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.name} className="w-7 h-7 object-contain" />
            ) : (
              visual.iconText
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-emerald-400" />
            <span>FLAT {brand.discount}% OFF</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="relative z-10 mt-auto" style={{ transform: 'translateZ(35px)' }}>
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            <span>{brand.category_name}</span>
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight mb-1 truncate">
            {brand.name}
          </h3>

          <p className="text-xs text-emerald-400 font-semibold mb-4">
            Instant ₹{savingsAmt} saving on ₹{nominalVal} Voucher
          </p>

          <div className="pt-3 border-t border-white/[0.08] space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Offer Price</span>
                <span className="text-2xl font-black text-white">₹{finalPay}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Face Value</span>
                <span className="text-sm font-semibold text-zinc-500 line-through">₹{nominalVal}</span>
              </div>
            </div>

            <button
              onClick={onSelect}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span>Instant Calculate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUBMIT COMMUNITY COUPON MODAL ---
function SubmitCouponModal({
  isOpen,
  onClose,
  brands,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  brands: any[];
  onSuccess: (newCoupon: any) => void;
}) {
  const [selectedSlug, setSelectedSlug] = useState(brands[0]?.slug || 'dominos');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [stackable, setStackable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/coupons/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: selectedSlug,
          code,
          title,
          stackable,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Coupon submission failed');
      }

      const brandObj = brands.find((b) => b.slug === selectedSlug);
      onSuccess({
        brandName: brandObj?.name || 'Store',
        code: code.trim().toUpperCase(),
        title: title || `Flat discount code (${code.trim().toUpperCase()})`,
        stackable: stackable,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 relative shadow-2xl animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Live Crowd-Sourced Registry
          </div>
          <h3 className="text-xl font-black text-white">Share a Working Code</h3>
          <p className="text-xs text-zinc-400">
            Unused Google Pay, Cred ya PhonePe codes ko instant live database me drop karein.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Select Merchant / Brand
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.slug} className="bg-[#0E0E14] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Coupon Code (e.g. PIZZA50)
            </label>
            <input
              type="text"
              required
              placeholder="FLAT100"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-wider outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Offer Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Flat ₹100 off on bills above ₹499"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <label className="flex items-center gap-2 text-zinc-300 font-medium cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={stackable}
              onChange={(e) => setStackable(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-emerald-400 focus:ring-0 cursor-pointer"
            />
            Stackable with Gift Vouchers
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Publishing to Database...' : 'Publish to Live Registry'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MAIN HOMEPAGE EXPORT ---
export default function Home() {
  // Database States
  const [brands, setBrands] = useState<any[]>(INITIAL_BRANDS);
  const [coupons, setCoupons] = useState<any[]>(INITIAL_COUPONS);
  const [cards, setCards] = useState<any[]>(INITIAL_CARDS);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Calculation States
  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Interactive UI States
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState({ minutes: 24, seconds: 35 });

  // 1. Fetch Dynamic Live Data From Supabase Database
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        if (!supabase) return;

        // Categories Fetch
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name, slug, icon_name')
          .order('display_order');
        if (catData && catData.length > 0) setCategories(catData);

        // Brands & Vouchers Fetch
        const { data: brandsData } = await supabase
          .from('brands')
          .select(`
            id, name, slug, website_url, logo_url,
            categories (name),
            brand_vouchers (resale_discount_pct, direct_buy_url, min_denomination, max_denomination)
          `)
          .eq('is_active', true);

        if (brandsData && brandsData.length > 0) {
          const mappedBrands = brandsData.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            logo_url: b.logo_url,
            category_name: b.categories?.name || 'General',
            discount: b.brand_vouchers?.[0]?.resale_discount_pct || 5.0,
            buy_url: b.brand_vouchers?.[0]?.direct_buy_url || b.website_url,
            min_val: b.brand_vouchers?.[0]?.min_denomination || 100,
            max_val: b.brand_vouchers?.[0]?.max_denomination || 5000,
          }));
          setBrands(mappedBrands);
        }

        // Verified Coupons Fetch
        const { data: couponsData } = await supabase
          .from('brand_coupons')
          .select(`
            coupon_code, title, stackable_with_voucher,
            brands (name)
          `)
          .eq('is_verified', true);

        if (couponsData && couponsData.length > 0) {
          const mappedCoupons = couponsData.map((c: any) => ({
            brandName: c.brands?.name || 'Partner Store',
            code: c.coupon_code,
            title: c.title,
            stackable: c.stackable_with_voucher
          }));
          setCoupons(mappedCoupons);
        }

        // Payment Cards Fetch
        const { data: cardsData } = await supabase
          .from('payment_instruments')
          .select('id, name, issuer_bank, base_online_cashback_pct, joining_fee, apply_referral_url')
          .eq('is_active', true);

        if (cardsData && cardsData.length > 0) {
          const mappedCards = cardsData.map((cd: any) => ({
            id: cd.id,
            name: cd.name,
            issuer_bank: cd.issuer_bank,
            base_cashback: Number(cd.base_online_cashback_pct),
            joining_fee: Number(cd.joining_fee || 0),
            url: cd.apply_referral_url || 'https://gromo.in'
          }));
          setCards(mappedCards);
        }

      } catch (err) {
        console.error('Supabase fetch error:', err);
      }
    }

    loadDatabaseData();

    // Urgency timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Calculation Engine API Call
  const handleCalculate = async () => {
    if (!cartAmount || Number(cartAmount) <= 0) return;
    setCalcLoading(true);
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
      console.error('API calculation error:', e);
    } finally {
      setCalcLoading(false);
    }
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredBrands = activeCategory === 'ALL'
    ? brands
    : brands.filter(b => b.category_name?.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans antialiased selection:bg-emerald-400 selection:text-black overflow-x-hidden">
      
      {/* 3D Ambient Lighting Glows */}
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-[450px] -right-[150px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-[950px] -left-[150px] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-[#0D0D11] border-b border-white/[0.06] py-2.5 px-4 text-center text-xs text-zinc-300">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <strong className="text-white font-semibold">Live Arbitrage Database Active:</strong> 
          Connected to {brands.length} active merchant partners & verified vouchers.
        </span>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className="border-b border-white/[0.08] backdrop-blur-xl sticky top-0 z-40 bg-[#070709]/85">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                Bachat<span className="text-emerald-400">Engine</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">AI Savings Discovery Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#calculator" className="hover:text-emerald-400 transition">Savings Calculator</a>
            <a href="#vouchers" className="hover:text-emerald-400 transition">3D Vouchers</a>
            <a href="#coupons" className="hover:text-emerald-400 transition">Coupons</a>
            <a href="#cards" className="hover:text-emerald-400 transition">Card Perks</a>
          </div>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] px-4 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-95 shadow-md"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Member Login</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION WITH 3D FLOATING BADGES */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 space-y-12">
        {/* Floating Badge Left */}
        <div className="hidden xl:flex absolute -left-12 top-28 items-center gap-3 bg-[#0d0d14]/80 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-2xl animate-[bounce_4s_infinite]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl">
            🍕
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight">Domino's Redeemed</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Saved ₹120 just now</p>
          </div>
        </div>

        {/* Floating Badge Right */}
        <div className="hidden xl:flex absolute -right-8 top-44 items-center gap-3 bg-[#0d0d14]/80 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-2xl animate-[bounce_5s_infinite_reverse]">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight">Instant PIN Issuance</p>
            <p className="text-[10px] text-cyan-400 font-semibold">0.4s Delivery Speed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Before you checkout anywhere online, calculate your real price
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Stop paying full price <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                on things you buy every day.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              We discover hidden discounted e-vouchers, stack active store coupons, and calculate bank cashback so you always pay the net lowest amount.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <a 
                href="#calculator"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-extrabold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Calculate My Savings Now
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero guesswork. 100% mathematical savings.</span>
              </div>
            </div>
          </div>

          {/* Interactive Scratch Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl p-6 bg-[#0E0E14] border border-white/[0.08] shadow-2xl space-y-4 relative overflow-hidden group">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Live Database Example</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md font-bold">17% Instant Off</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Domino's ₹500 Pizza Voucher</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Click below to uncover the net effective checkout price.</p>
              </div>

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
                    <p className="text-xs font-bold text-white">Tap to scratch & reveal real cost</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-in zoom-in-95">
                    <p className="text-xs text-emerald-400 font-bold">Special Voucher Price</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-black text-white">₹415</span>
                      <span className="text-sm text-zinc-500 line-through">₹500</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      With SBI Card: <strong className="text-emerald-400 font-bold">₹394.25 final cost</strong>
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 text-center">
                Instant delivery. Use code directly in Domino's App payment screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLASH SALE URGENCY TICKER */}
      <div className="border-y border-white/[0.06] bg-[#0A0A0F] py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-white font-semibold">Wholesale Voucher Allocation Ending In:</span>
            <div className="flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-md font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          </div>
          <div className="text-zinc-400">
            Swiggy (4.5% Off) • Myntra (7.5% Off) • Domino's (13% Off)
          </div>
        </div>
      </div>

      {/* 5. SAVINGS CALCULATOR */}
      <section id="calculator" className="max-w-4xl mx-auto px-6 py-20 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Real-Time Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Calculate Your Bottom Line
          </h2>
          <p className="text-sm text-zinc-400">
            Select a store from your database, enter your cart amount, and inspect your total savings.
          </p>
        </div>

        <div className="bg-[#0E0E14] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Brand Picker */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                1. Select Store / Merchant
              </label>
              <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl text-[11px]">
                {['ALL', 'Food', 'Fashion', 'Quick'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      activeCategory === cat ? 'bg-emerald-400 text-black shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBrands.map((b) => {
                const active = selectedBrand === b.slug;
                const visual = BRAND_VISUALS[b.slug];
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 ${
                      active 
                        ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10' 
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-xl shrink-0">
                      {visual?.iconText || '🏷️'}
                    </div>
                    <div className="truncate">
                      <span className="text-xs text-emerald-400 font-bold block">{b.discount}% Off</span>
                      <span className="font-extrabold text-sm text-white block truncate">{b.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Stacking Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                2. Order Cart Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-lg">₹</span>
                <input
                  type="number"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white/[0.03] border border-white/[0.1] focus:border-emerald-400 rounded-xl py-3 pl-9 pr-4 text-xl font-black text-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                3. Card Stacking Offer
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
                    <p className="text-xs font-bold text-white">SBI Cashback Credit Card</p>
                    <p className="text-[11px] text-zinc-400">5.0% flat cashback on online spend</p>
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

          {/* Action Button */}
          <button
            onClick={handleCalculate}
            disabled={calcLoading}
            className="w-full py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm tracking-wide transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-black" />
            {calcLoading ? 'Comparing Vouchers, Coupons & Cards...' : 'Calculate Lowest Effective Price'}
          </button>

          {/* Results Display */}
          {result && (
            <div className="mt-6 bg-[#08080C] border border-emerald-400/30 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Optimal Route: {result.bestRoute}
                </span>
                <span className="text-zinc-400">Regular Checkout: <del>₹{result.originalCart}</del></span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-baseline">
                <div>
                  <p className="text-xs text-zinc-400 font-bold uppercase">Net Payable Amount</p>
                  <p className="text-4xl font-black text-white mt-0.5">₹{result.bestEffectiveCost}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-400 font-bold uppercase">Total Rupee Savings</p>
                  <p className="text-3xl font-black text-emerald-400 mt-0.5">Save ₹{result.totalSavings}</p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/[0.06] rounded-xl p-3.5 text-xs space-y-2 text-zinc-300">
                {result.breakdown?.voucherCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">E-Voucher Instant Discount:</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.voucherCut}</span>
                  </div>
                )}
                {result.breakdown?.couponCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Merchant Code ({result.breakdown.couponCode}):</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.couponCut}</span>
                  </div>
                )}
                {result.breakdown?.cardCashback > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Card Cashback (5%):</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.cardCashback}</span>
                  </div>
                )}
              </div>

              <a
                href={result.breakdown?.buyUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                Claim Deal & Buy Voucher
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 6. 3D INTERACTIVE GIFT CARDS CATALOG */}
      <section id="vouchers" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Wholesale E-Vouchers
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Featured 3D Brand Cards
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Interactive Gyroscopic Perspective • Real-Time Stock</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((b) => (
            <Interactive3DVoucherCard
              key={b.id}
              brand={b}
              nominalVal={1000}
              onSelect={() => {
                setSelectedBrand(b.slug);
                setCartAmount('1000');
                const calcElement = document.getElementById('calculator');
                calcElement?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      </section>

      {/* 7. VERIFIED PROMO CODES (WITH SUBMIT MODAL TRIGGER) */}
      <section id="coupons" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Promotional Registry</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Verified Coupons In Database</h2>
          </div>
          
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-bold transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Submit A Working Code</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c, i) => (
            <div
              key={i}
              className="bg-[#0E0E14] border border-white/[0.08] hover:border-pink-500/30 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all shadow-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white">{c.brandName}</span>
                  {c.stackable && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      Stackable with Voucher
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{c.title}</p>
              </div>

              <button
                onClick={() => copyCoupon(c.code)}
                className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition active:scale-95 shrink-0"
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

        {/* Modal render */}
        <SubmitCouponModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          brands={brands}
          onSuccess={(newCoupon) => {
            setCoupons((prev) => [newCoupon, ...prev]);
          }}
        />
      </section>

      {/* 8. BANK CARDS REGISTRY */}
      <section id="cards" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">High-Yield Financial Rails</span>
          <h2 className="text-3xl font-black text-white tracking-tight">Cashback Cards In Database</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-[#0E0E14] border border-white/[0.08] hover:border-cyan-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-400 font-extrabold bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-md">
                    {card.base_cashback}% Unlimited Cashback
                  </span>
                  <span className="text-zinc-500 font-medium">{card.issuer_bank}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{card.name}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Earn unlimited {card.base_cashback}% reward on e-vouchers and online shopping.
                </p>
                <p className="text-xs text-zinc-500">Joining Fee: ₹{card.joining_fee}</p>
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
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400">Everything you need to know about vouchers, coupons and banking cashback</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="bg-[#0E0E14] border border-white/[0.08] rounded-2xl p-5 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm font-bold text-white">{faq.q}</h4>
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

      {/* 10. AUTH MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
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
              <h3 className="text-xl font-bold text-white">Member Identification</h3>
              <p className="text-xs text-zinc-400">Enter your mobile number to view and track your personal savings ledger.</p>
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
                  placeholder="98765 43210"
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-r-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-emerald-400"
                />
              </div>

              <button
                onClick={() => alert("OTP login feature connected to Supabase Auth.")}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold rounded-xl transition"
              >
                Send Verification OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#050507] py-12 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-white font-bold block">BachatEngine Technologies</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Automating optimal price discovery across Indian online commerce.</p>
          </div>
          <div className="flex gap-6 text-[11px]">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}