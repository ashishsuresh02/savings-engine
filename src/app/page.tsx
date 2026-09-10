'use client';

import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  useScroll, 
  useMotionValueEvent 
} from 'framer-motion';
import { 
  ArrowUpRight, 
  CreditCard, 
  Zap, 
  Check, 
  Copy, 
  User, 
  X, 
  Gift, 
  ArrowRight, 
  ChevronDown, 
  Ticket, 
  Layers, 
  Search,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Percent
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';
import WhatsAppAlerts from '@/components/WhatsAppAlerts';
import CardEligibilityQuiz from '@/components/CardEligibilityQuiz';
import SpotlightSearch from '@/components/SpotlightSearch';
import SponsoredReelsFeed from '@/components/SponsoredReelsFeed';
import CheckoutModal from '@/components/CheckoutModal';

// REAL BRAND VISUALS & LOGO ASSETS
const BRAND_VISUALS: Record<string, { banner: string; logoUrl: string; fallbackText: string }> = {
  dominos: {
    banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=70',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Dominos_pizza_logo.svg',
    fallbackText: "Domino's",
  },
  swiggy: {
    banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=70',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
    fallbackText: 'Swiggy',
  },
  zomato: {
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=70',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
    fallbackText: 'Zomato',
  },
  myntra: {
    banner: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=70',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    fallbackText: 'Myntra',
  },
  blinkit: {
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=70',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Blinkit-yellow-app-icon.svg',
    fallbackText: 'Blinkit',
  },
  amazon: {
    banner: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=70',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    fallbackText: 'Amazon',
  },
};

const FAQS = [
  { 
    q: "How does the savings stacking engine work?", 
    a: "Unlike typical coupon directories where most promo codes fail at checkout, our engine stacks wholesale discounted brand vouchers, verified merchant promo codes, and credit card cashbacks to uncover the true lowest net price." 
  },
  { 
    q: "How do I redeem an unlocked voucher code?", 
    a: "Upon checkout confirmation, your 16-digit voucher number and secret PIN are displayed immediately on-screen and synced to your vault. In the merchant application (such as Domino's or Swiggy), select 'Gift Card' during payment to deduct 100% of the balance." 
  },
  { 
    q: "When is the credit card cashback credited?", 
    a: "If you pay via eligible cashback instruments (like SBI Cashback), your 5% rebate reflects automatically in your credit card billing cycle statement as an official statement credit." 
  }
];

function AnimatedRupee({ value, className }: { value: number; className?: string }) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 140, damping: 22 });
  const display = useTransform(spring, (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`);
  const [text, setText] = useState(`₹${value.toLocaleString('en-IN')}`);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v));
    return () => unsub();
  }, [display]);

  return <span className={className}>{text}</span>;
}

// 3-LAYER STACKING VISUALIZER[cite: 3]
const STACK_BASE_CART = 2000;
const STACK_LAYERS = [
  { id: 'coupon', title: 'Store Promo Coupon', sub: 'Verified promo code applied', cut: 200, icon: Ticket, tint: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'voucher', title: 'Wholesale Brand Voucher', sub: 'Discounted wholesale e-card balance', cut: 150, icon: Gift, tint: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'card', title: 'Credit Card Rebate', sub: '5% SBI statement cash return', cut: 82, icon: CreditCard, tint: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

function StackingVisualizer() {
  const [step, setStep] = useState(0);
  const runningPrice = STACK_BASE_CART - STACK_LAYERS.slice(0, step).reduce((sum, l) => sum + l.cut, 0);
  const totalSaved = STACK_BASE_CART - runningPrice;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-10 shadow-xl">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Stacking Demonstration
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How a ₹2,000 cart melts down layer by layer.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto font-medium">
            Drag the slider to preview how store coupons, wholesale vouchers, and card cashbacks combine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          <div className="space-y-4 order-2 lg:order-1">
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />

            <div className="space-y-2.5">
              {STACK_LAYERS.map((layer, i) => {
                const active = step > i;
                const Icon = layer.icon;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setStep(active ? i : i + 1)}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      active ? `${layer.bg} ${layer.border}` : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-white shadow-sm' : 'bg-slate-200/60'}`}>
                      <Icon className={`w-4 h-4 ${active ? layer.tint : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                        Layer {i + 1}: {layer.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{layer.sub}</p>
                    </div>
                    <span className={`text-xs font-black ${active ? layer.tint : 'text-slate-400'}`}>-₹{layer.cut}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:block w-px h-64 bg-slate-200 order-2" />

          <div className="order-1 lg:order-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Standard Checkout Price</span>
              <span className="text-slate-400 line-through">₹{STACK_BASE_CART.toLocaleString()}</span>
            </div>

            <AnimatePresence>
              {STACK_LAYERS.slice(0, step).map((layer) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-between text-xs overflow-hidden font-bold"
                >
                  <span className={layer.tint}>{layer.title}</span>
                  <span className={layer.tint}>-₹{layer.cut}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Your Effective Payment</p>
              <AnimatedRupee value={runningPrice} className="text-4xl font-black text-slate-900" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-700">Total Net Saved: <AnimatedRupee value={totalSaved} /></span>
            </div>

            <button
              onClick={() => setStep((s) => (s >= 3 ? 0 : s + 1))}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 transition-all shadow-sm"
            >
              {step >= 3 ? 'Reset Simulation' : `Simulate Layer ${step + 1}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// MAIN PAGE COMPONENT[cite: 3]
export default function Home() {
  const [brands, setBrands] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('1000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // SUPABASE DATA FETCH[cite: 3]
  useEffect(() => {
    async function loadRealData() {
      try {
        if (!supabase) return;

        const { data: bData } = await supabase
          .from('brands')
          .select(`
            id, name, slug, website_url, logo_url,
            categories(name),
            brand_vouchers(resale_discount_pct)
          `)
          .eq('is_active', true);

        if (bData && bData.length > 0) {
          const formattedBrands = bData.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            category_name: b.categories?.name || 'Shopping',
            discount: b.brand_vouchers?.[0]?.resale_discount_pct || 5.0,
            buy_url: b.website_url,
            logo_url: b.logo_url
          }));
          setBrands(formattedBrands);
          setSelectedBrand(formattedBrands[0].slug);
        }

        const { data: cData } = await supabase
          .from('brand_coupons')
          .select(`
            id, coupon_code, title, discount_value, stackable_with_voucher, is_verified,
            brands(name, slug)
          `)
          .eq('is_verified', true);

        if (cData && cData.length > 0) {
          setCoupons(cData.map((c: any) => ({
            id: c.id,
            brandName: c.brands?.name || 'Partner Store',
            brandSlug: c.brands?.slug || 'store',
            code: c.coupon_code,
            title: c.title,
            stackable: c.stackable_with_voucher,
            discountValue: Number(c.discount_value) || 50,
          })));
        }

        const { data: cardData } = await supabase
          .from('payment_instruments')
          .select('*')
          .eq('is_active', true);

        if (cardData && cardData.length > 0) {
          setCards(cardData.map((cd: any) => ({
            id: cd.id,
            name: cd.name,
            issuer_bank: cd.issuer_bank,
            base_cashback: Number(cd.base_online_cashback_pct) || 5.0,
            joining_fee: Number(cd.joining_fee) || 0,
            url: cd.apply_referral_url || 'https://gromo.in',
            bestFor: 'Online Spends'
          })));
        }
      } catch (e) {
        console.warn('Real DB Sync error', e);
      }
    }
    loadRealData();
  }, []);

  // Keyboard shortcut listener (⌘K)[cite: 3]
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Live Stacker Calculation Logic[cite: 3]
  const handleCalculate = (overrideAmount?: string, overrideBrand?: string) => {
    const activeAmount = overrideAmount || cartAmount;
    const activeBrandSlug = overrideBrand || selectedBrand;

    const numCart = Number(activeAmount);
    if (!numCart || numCart <= 0) return;
    
    setCalcLoading(true);
    setTimeout(() => {
      const currentBrand = brands.find((b) => b.slug === activeBrandSlug) || brands[0];
      const discountPct = Number(currentBrand?.discount) || 5.0;
      const voucherCut = Math.round((numCart * discountPct) / 100);
      const postVoucher = numCart - voucherCut;

      const matchingCoupon = coupons.find(
        (c) => c.brandName?.toLowerCase().includes(currentBrand?.name?.toLowerCase()) && c.stackable
      );

      const couponCut = matchingCoupon ? matchingCoupon.discountValue : 0;
      const afterCoupon = Math.max(0, postVoucher - couponCut);
      const cardCashback = hasSbiCard ? Number(((afterCoupon * 5) / 100).toFixed(2)) : 0;
      const finalCost = Number((afterCoupon - cardCashback).toFixed(2));
      const totalSaved = Number((numCart - finalCost).toFixed(2));

      setResult({
        bestRoute: matchingCoupon && hasSbiCard ? 'STACKED' : 'VOUCHER',
        originalCart: numCart,
        bestEffectiveCost: finalCost,
        totalSavings: totalSaved,
        breakdown: {
          voucherCut,
          couponCut,
          couponCode: matchingCoupon ? matchingCoupon.code : null,
          cardCashback,
          buyUrl: currentBrand?.buy_url || 'https://google.com',
        },
      });
      setCalcLoading(false);
    }, 180);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const categoriesList = ['All', 'Food Delivery', 'Shopping', 'Quick Commerce', 'Fashion'];

  const filteredCoupons = coupons.filter(c => {
    const matchCat = activeCategory === 'All' || brands.find(b => b.slug === c.brandSlug)?.category_name.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch = c.brandName.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black">

      {/* 1. NAVBAR[cite: 3] */}
      <DynamicFintechNavbar 
        onOpenAuth={() => setIsAuthOpen(true)}
        brandCount={brands.length || 6}
      />

      {/* 2. SPLIT 3D HERO SECTION (Inspired by Mockup) */}
      <header className="relative pt-24 sm:pt-28 pb-16 px-4 sm:px-6 overflow-hidden border-b border-white/10">
        {/* Background Ambience & Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* LEFT: High Conversion Copy & Controls */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Verified Deals • Zero Coupon Failure</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Save More.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Shop Smarter.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-lg font-medium leading-relaxed">
              Buy wholesale discounted brand vouchers, stack verified merchant promo codes, and pocket direct cashback on top brands — all in one engine.
            </p>

            {/* Interactive Search Bar */}
            <div className="max-w-lg relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands (Swiggy, Amazon, Myntra...)"
                className="w-full bg-[#11131C] border border-white/15 focus:border-emerald-400 rounded-2xl py-4 pl-12 pr-32 text-sm text-white placeholder:text-zinc-500 outline-none shadow-2xl font-medium transition"
              />
              <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                onClick={() => document.getElementById('vouchers')?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Search
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-lg">
              <div>
                <span className="text-xl sm:text-2xl font-black text-white block">12,000+</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Live Offers</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 block">Up to 70%</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Wholesale Cut</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-white block">Instant</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Vault Delivery</span>
              </div>
            </div>
          </div>

          {/* RIGHT: 3D Floating Ecosystem Mockup (Device + Brand Badges) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* 3D Main Device Frame */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="relative z-10 w-72 sm:w-80 rounded-[38px] p-2 bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/20 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="w-full h-full bg-gradient-to-b from-[#0e1018] to-[#06070a] rounded-[32px] p-6 flex flex-col items-center text-center border border-white/5 shadow-inner">
                
                {/* Square Logo Emblem (logo.png) */}
                <div className="w-24 h-24 rounded-3xl bg-white/[0.04] border border-white/15 p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center mb-4">
                  <Image 
                    src="/logo.png" 
                    alt="AllInOneVouchers" 
                    width={80} 
                    height={80} 
                    className="object-contain drop-shadow-[0_4px_15px_rgba(0,0,0,0.7)]"
                    priority
                  />
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">AllInOneVouchers</span>
                <h3 className="text-2xl font-black text-white mt-1">Big Brands.<br />Bigger Savings.</h3>
                <p className="text-xs text-zinc-400 mt-2 font-medium">Vouchers • Deals • Cashback</p>

                {/* Micro Receipt Preview */}
                <div className="w-full mt-5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between text-zinc-400">
                    <span>Retail Cart Price</span>
                    <span className="line-through">₹2,000</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Net Effective Price</span>
                    <span>₹1,470</span>
                  </div>
                </div>

                <button 
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(52,211,153,0.3)] active:scale-95 transition"
                >
                  Launch Savings Engine ⚡
                </button>
              </div>
            </motion.div>

            {/* Floating Brand Badges (Orbiting Mockup) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 sm:-left-6 z-20 px-3 py-2 rounded-2xl bg-[#121420]/90 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-black font-black text-xs flex items-center justify-center">A</div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-white block">Amazon</span>
                <span className="text-[9px] font-black text-emerald-400">UP TO 70% OFF</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute top-1/2 -right-4 sm:-right-8 z-20 px-3.5 py-2 rounded-2xl bg-[#121420]/90 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-500 text-white font-black text-xs flex items-center justify-center">M</div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-white block">Myntra</span>
                <span className="text-[9px] font-black text-emerald-400">15% INSTANT</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
              className="absolute -bottom-4 left-6 z-20 px-3.5 py-2 rounded-2xl bg-[#121420]/90 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">S</div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-white block">Swiggy</span>
                <span className="text-[9px] font-black text-emerald-400">₹120 OFF CODE</span>
              </div>
            </motion.div>

          </div>

        </div>
      </header>

      {/* 3. HORIZONTAL STORE CAROUSEL (Top Brands Row) */}
      <section id="brands" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-black text-zinc-300 uppercase tracking-wider">Top Brands • Direct Inventory</h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">Swipe to explore →</span>
        </div>

        {/* Carousel Container (Smooth Horizontal Scrollbar) */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-4 scrollbar-none snap-x">
          {brands.map((b) => {
            const visual = BRAND_VISUALS[b.slug];
            return (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedBrand(b.slug);
                  handleCalculate(cartAmount, b.slug);
                  document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`snap-start shrink-0 w-36 sm:w-44 p-3 rounded-2xl border cursor-pointer transition-all duration-300 group flex flex-col items-center text-center ${
                  selectedBrand === b.slug 
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                    : 'bg-[#0f111a] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition">
                  {visual?.logoUrl ? (
                    <img src={visual.logoUrl} alt={b.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs font-black text-white">{b.name.slice(0, 3)}</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white truncate w-full">{b.name}</h4>
                <span className="mt-1 text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {b.discount}% DISCOUNT
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TODAY'S BEST SAVINGS (VOUCHER CARDS CAROUSEL) */}
      <section id="vouchers" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Today's Deals</span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Wholesale Vouchers & Cashback</h2>
          </div>
          <a href="#calculator" className="text-xs font-bold text-emerald-400 hover:underline">
            Calculate Net Cost →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((b) => {
            const visual = BRAND_VISUALS[b.slug] || {
              banner: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=800&auto=format&fit=crop&q=70',
              logoUrl: '',
              fallbackText: b.name,
            };
            const savingsAmt = Math.round((1000 * (b.discount || 5)) / 100);
            const finalPay = 1000 - savingsAmt;

            return (
              <div 
                key={b.id} 
                className="relative rounded-[28px] p-5 border border-white/10 bg-[#0d0f18] shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-emerald-500/30 transition-all"
              >
                {/* Top Banner Accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-28 bg-cover bg-center opacity-25 group-hover:opacity-35 transition"
                  style={{ backgroundImage: `url(${b.banner_url || visual.banner})` }}
                />
                <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#0d0f18]" />

                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
                    {visual.logoUrl ? (
                      <img src={visual.logoUrl} alt={b.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-black font-black text-xs">{visual.fallbackText.slice(0, 3)}</span>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs">
                    {b.discount}% OFF
                  </span>
                </div>

                <div className="relative z-10 space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-white">{b.name}</h3>
                    <p className="text-xs text-emerald-400 font-bold">Instant ₹{savingsAmt} off on ₹1,000 Voucher</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Deal Price</span>
                      <span className="text-2xl font-black text-white">₹{finalPay}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">MRP</span>
                      <span className="text-sm font-semibold text-zinc-500 line-through">₹1,000</span>
                    </div>
                  </div>

                  {/* Dual Monetization Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedBrand(b.slug);
                        setCartAmount('1000');
                        handleCalculate('1000', b.slug);
                        setIsCheckoutOpen(true);
                      }}
                      className="py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 active:scale-95"
                    >
                      <span>Buy Voucher</span>
                    </button>

                    <a
                      href={b.buy_url || 'https://google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>Shop Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ARBITRAGE STACKING CALCULATOR (The Earning Logic)[cite: 3] */}
      <section id="calculator" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#0b0d14] border border-white/15 rounded-[36px] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Arbitrage Engine</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Calculate Lowest Checkout Price</h2>
            </div>
            <div className="text-xs text-zinc-400 font-medium bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10">
              Active Store: <strong className="text-emerald-400">{brands.find(b => b.slug === selectedBrand)?.name || 'Store'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  1. Order Cart Value (₹)
                </label>
                <input
                  type="number"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-white/[0.04] border border-white/15 focus:border-emerald-400 rounded-2xl px-4 py-3.5 text-xl font-black text-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  2. Payment Instrument
                </label>
                <div
                  onClick={() => setHasSbiCard(!hasSbiCard)}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    hasSbiCard ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/[0.02] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-5 h-5 ${hasSbiCard ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-white">SBI Cashback Credit Card</h4>
                      <p className="text-[11px] text-zinc-400">5% Statement Cashback applied at purchase</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${hasSbiCard ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-zinc-700'}`}>
                    {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCalculate()}
                disabled={calcLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-black" />
                {calcLoading ? 'Calculating Lowest Net Price...' : 'Stack Savings & Calculate'}
              </button>
            </div>

            {/* Live Effective Output Receipt */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#141724] to-[#0d0f17] rounded-3xl p-6 border border-white/15 flex flex-col justify-between shadow-2xl">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Final Effective Cost</span>
                <div className="text-4xl font-black text-white mt-1">
                  ₹{result ? result.bestEffectiveCost : cartAmount}
                </div>
                {result && (
                  <span className="text-xs font-bold text-emerald-400 block mt-1.5">
                    🎉 You save ₹{result.totalSavings} with stacked arbitrage!
                  </span>
                )}
              </div>

              <div className="space-y-2 mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Buy Prepaid Voucher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={brands.find(b => b.slug === selectedBrand)?.buy_url || 'https://google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                >
                  <span>Visit Store with Promo</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED COUPONS DIRECTORY[cite: 3] */}
      <section id="coupons" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">Verified Coupons & Promo Codes</h2>
            <p className="text-xs text-zinc-400">Showing {filteredCoupons.length} active coupons in database</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-emerald-400 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-[#10121d] border border-white/10 text-zinc-300 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredCoupons.length === 0 ? (
            <div className="bg-[#0e101a] rounded-2xl border border-white/10 p-8 text-center text-xs text-zinc-500">
              No active coupons found for this search.
            </div>
          ) : (
            filteredCoupons.map((c) => (
              <div
                key={c.id}
                className="bg-[#0e101a] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 font-bold text-sm text-emerald-400">
                    {c.brandName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{c.brandName}</span>
                      {c.stackable && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                          Stackable with Voucher
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">{c.title}</p>
                    <span className="text-[10px] text-zinc-500">Verified & active today</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-dashed border-white/20 font-mono text-xs font-bold text-emerald-400">
                    {c.code}
                  </div>
                  <button
                    onClick={() => copyCoupon(c.code)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Get Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 7. WHITE SURFACE: EDUCATIONAL STACKING SLIDER[cite: 3] */}
      <StackingVisualizer />

      {/* 8. FINANCIAL CASHBACK CARDS[cite: 3] */}
      <section id="cards" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Financial Rails</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Recommended Cashback Cards</h2>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Stack extra 5% statement cash on every spend</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div key={c.id} className="relative h-[220px] rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-[#121422] to-[#07090e] shadow-xl flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-zinc-400 uppercase">{c.issuer_bank}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {c.base_cashback}% Cashback
                </span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white leading-tight">{c.name}</h4>
                <span className="text-[10px] text-zinc-400">Joining Fee: ₹{c.joining_fee}</span>
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>Apply Online</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 9. REELS, QUIZZES & ALERTS[cite: 3] */}
      <SponsoredReelsFeed
        onSelectBrand={(slug) => {
          setSelectedBrand(slug);
          handleCalculate(cartAmount, slug);
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <CardEligibilityQuiz />
      <WhatsAppAlerts />

      {/* 10. FAQS SECTION[cite: 3] */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400 font-medium">Everything you need to know about stacking & voucher issuance</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="p-5 rounded-2xl bg-[#0e101a] border border-white/10 cursor-pointer shadow-sm"
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm font-bold text-zinc-200">{faq.q}</h4>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-400' : ''}`} />
              </div>
              {openFaq === i && (
                <p className="text-xs text-zinc-400 mt-2.5 pt-2.5 border-t border-white/10 leading-relaxed font-medium">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MODALS[cite: 3] */}
      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        brands={brands}
        cards={cards}
        coupons={coupons}
        onSelectBrand={(slug) => {
          if (slug === 'cards') {
            document.getElementById('cards')?.scrollIntoView({ behavior: 'smooth' });
          } else if (slug === 'coupons') {
            document.getElementById('coupons')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            setSelectedBrand(slug);
            handleCalculate(cartAmount, slug);
            document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={brands.find((b) => b.slug === selectedBrand)?.name || selectedBrand}
        brandSlug={selectedBrand}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 950}
        savings={result?.totalSavings || 50}
      />

      {/* MEMBER VAULT AUTH MODAL[cite: 3] */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e101a] rounded-3xl p-7 max-w-sm w-full space-y-5 relative shadow-2xl border border-white/15 text-white">
            <button 
              onClick={() => {
                setIsAuthOpen(false);
                setOtpSent(false);
                setOtp('');
              }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">
                {otpSent ? 'Enter Code' : 'Member Vault'}
              </h3>
              <p className="text-xs text-zinc-400">
                {otpSent ? `Code sent to +91 ${phoneNumber}` : 'Access your purchased vouchers'}
              </p>
            </div>

            {!otpSent ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (phoneNumber.replace(/\D/g, '').length !== 10) {
                    alert('Enter a valid 10-digit mobile number.');
                    return;
                  }
                  setAuthLoading(true);
                  setTimeout(() => {
                    setAuthLoading(false);
                    setOtpSent(true);
                  }, 250);
                }}
                className="space-y-3"
              >
                <div className="flex">
                  <span className="bg-white/[0.04] border border-r-0 border-white/15 px-3 py-2.5 rounded-l-xl text-zinc-400 text-sm font-bold flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white/[0.03] border border-white/15 rounded-r-xl py-2.5 px-3.5 text-white font-bold text-sm outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  {authLoading ? 'Sending...' : 'Send Access OTP'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (otp.length < 6) {
                    alert('Enter 6-digit code.');
                    return;
                  }
                  try {
                    localStorage.setItem('bachat_user_phone', phoneNumber);
                    localStorage.setItem('bachat_auth_token', 'active');
                  } catch (e) {}
                  setIsAuthOpen(false);
                  window.location.href = '/dashboard';
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-white/[0.03] border border-white/15 rounded-xl py-3 text-center font-mono text-xl font-black text-white outline-none focus:border-emerald-400"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Verify & Open Vault
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TICKER[cite: 3] */}
      <LiveArbitrageTicker />

      {/* FOOTER[cite: 3] */}
      <footer className="bg-[#05060a] text-white border-t border-white/10 py-12 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">AllInOneVouchers • Real-Time Savings Discovery & Stacking Engine</span>
          </div>
          <div className="flex gap-6 text-zinc-400 font-medium">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}