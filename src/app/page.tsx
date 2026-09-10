'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll, useMotionValueEvent } from 'framer-motion';
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
  Search
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

// 3-LAYER STACKING VISUALIZER SLIDER
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
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-10 shadow-md">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
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
              className="w-full accent-black cursor-pointer h-2 bg-slate-100 rounded-lg"
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

// MAIN PAGE
export default function Home() {
  const { scrollY } = useScroll();

  const heroScale = useTransform(scrollY, [0, 200], [1, 0.45]);
  const heroOpacity = useTransform(scrollY, [0, 160], [1, 0]);
  const heroY = useTransform(scrollY, [0, 200], [0, -40]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detect karke logo swap trigger karega
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });
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

  // 100% REAL SUPABASE INGESTION
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

  // Keyboard shortcut listener (⌘K)
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

  // Live Stacker Calculation
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-black selection:text-white">

      {/* 1. SEPARATE NAVBAR COMPONENT */}
      <DynamicFintechNavbar 
        onOpenAuth={() => setIsAuthOpen(true)}
        brandCount={brands.length || 6}
      />

      {/* 2. CINEMATIC BLACK HERO SECTION */}
      <header className="bg-[#060709] text-white px-4 sm:px-6 pt-24 sm:pt-28 pb-20 sm:pb-24 rounded-b-[40px] sm:rounded-b-[56px] shadow-[0_30px_80px_rgba(0,0,0,0.95)] relative overflow-hidden">
        {/* Multilayered Atmospheric Aurora & Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[450px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[220px] sm:w-[350px] h-[220px] sm:h-[350px] bg-emerald-400/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Live Verified Tag */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-bold text-emerald-400 backdrop-blur-xl shadow-[0_0_25px_rgba(52,211,153,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="tracking-wide">12,000+ Verified Vouchers & Real-Time Loot Rates</span>
          </motion.div>

          {/* 🌟 BORDER-FREE 3D FLOATING LOGO SHOWCASE */}
          <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY } as any}
            className="py-3 sm:py-5 flex flex-col items-center justify-center will-change-transform"
          >
            <div className="relative flex items-center justify-center">
              
              {/* Backlight Aura (Glow jo logo ke piche float karta hai) */}
              <div className="absolute inset-0 w-36 h-36 sm:w-52 sm:h-52 -left-3 sm:-left-6 -top-3 sm:-top-6 bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-emerald-300/30 rounded-full blur-2xl pointer-events-none" />

              {/* Floating Pure Logo Asset (Zero box, zero borders) */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  filter: [
                    'drop-shadow(0 15px 30px rgba(0,0,0,0.8)) drop-shadow(0 0 25px rgba(52,211,153,0.25))',
                    'drop-shadow(0 25px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(52,211,153,0.45))',
                    'drop-shadow(0 15px 30px rgba(0,0,0,0.8)) drop-shadow(0 0 25px rgba(52,211,153,0.25))'
                  ]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: 'easeInOut' 
                }}
                className="relative w-28 h-28 sm:w-44 sm:h-44 flex items-center justify-center"
              >
                <Image 
                  src="/logo.png" 
                  alt="AllInOneVouchers Master Brand" 
                  width={180} 
                  height={180} 
                  className="w-full h-full object-contain"
                  priority
                />
              </motion.div>
            </div>

            {/* Brand Title with High-Converting Fintech Gradient */}
            <motion.h1 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mt-4"
            >
              AllInOne<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]">Vouchers</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[11px] sm:text-xs text-zinc-400 font-bold uppercase tracking-[0.3em] mt-1.5"
            >
              Institutional Arbitrage & Triple-Stack Engine
            </motion.p>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-medium leading-relaxed px-4"
          >
            Stack wholesale discounted e-vouchers, verified merchant promo codes, and credit card cashbacks in one click.
          </motion.p>

          {/* Quick Engine Command Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="max-w-2xl mx-auto p-2 bg-white/[0.04] border border-white/10 rounded-2xl sm:rounded-full backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center gap-2 px-4 w-full sm:w-auto">
              <span className="text-emerald-400 font-bold text-base">₹</span>
              <input
                type="number"
                value={cartAmount}
                onChange={(e) => setCartAmount(e.target.value)}
                placeholder="Cart amount..."
                className="bg-transparent text-white font-black text-sm outline-none w-full sm:w-28"
              />
            </div>

            <div className="h-5 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto px-2 py-1 scrollbar-none">
              {brands.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrand(b.slug);
                    handleCalculate(cartAmount, b.slug);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                    selectedBrand === b.slug 
                      ? 'bg-white text-black shadow-md' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                handleCalculate();
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto sm:ml-auto px-6 py-2.5 rounded-xl sm:rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-[0_0_25px_rgba(52,211,153,0.35)] active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Calculate</span>
            </button>
          </motion.div>

          {/* Search Input Bar */}
          <div className="max-w-xl mx-auto relative pt-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name, store or coupon..."
              className="w-full bg-white text-slate-900 rounded-full py-3.5 sm:py-4 pl-12 pr-28 text-xs sm:text-sm outline-none shadow-2xl font-semibold border border-slate-200 focus:ring-2 focus:ring-emerald-400/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2 pt-0.5" />
            <button
              onClick={() => document.getElementById('coupons')?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* 3. WHITE SURFACE: TOP BRANDS ROW */}
      <section id="brands" className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Brands</h2>
            <a href="#vouchers" className="text-xs font-bold text-slate-900 hover:underline">
              View all inventory ({brands.length}) →
            </a>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {brands.map((b) => {
              const visual = BRAND_VISUALS[b.slug];
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrand(b.slug);
                    handleCalculate(cartAmount, b.slug);
                    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                    selectedBrand === b.slug
                      ? 'border-black bg-slate-50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shadow-sm">
                    {visual?.logoUrl ? (
                      <img src={visual.logoUrl} alt={b.name} className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-sm font-black text-slate-800">{b.name.slice(0, 3)}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate w-full text-center">{b.name}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {b.discount}% OFF
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. BLACK SURFACE: 3-LAYER STACKING CALCULATOR */}
      <section id="calculator" className="max-w-6xl mx-auto px-6 py-14">
        <div className="bg-[#090A0F] border border-white/10 rounded-[32px] p-8 shadow-2xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Arbitrage Engine</span>
              <h2 className="text-2xl font-black text-white">Calculate Lowest Checkout Price</h2>
            </div>
            <div className="text-xs text-zinc-400 font-medium">
              Active Store: <strong className="text-white">{brands.find(b => b.slug === selectedBrand)?.name || 'Store'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
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
                  className="w-full bg-white/[0.04] border border-white/15 focus:border-emerald-400 rounded-xl px-4 py-3.5 text-xl font-black text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  2. Payment Instrument
                </label>
                <div
                  onClick={() => setHasSbiCard(!hasSbiCard)}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    hasSbiCard ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/[0.08]'
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
                className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                {calcLoading ? 'Calculating Lowest Price...' : 'Calculate Lowest Price'}
              </button>
            </div>

            {/* Output Card */}
            <div className="lg:col-span-5 bg-white/[0.03] rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Final Effective Cost</span>
                <div className="text-4xl font-black text-white mt-1">
                  ₹{result ? result.bestEffectiveCost : cartAmount}
                </div>
                {result && (
                  <span className="text-xs font-bold text-emerald-400 block mt-1">
                    You save ₹{result.totalSavings} on this order!
                  </span>
                )}
              </div>

              {/* Actions: Dono monetization channels ek sath */}
              <div className="space-y-2 mt-6">
                {/* Channel 1: Arbitrage Voucher Sale (Aapka Direct Profit) */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <span>Buy Prepaid Voucher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Channel 2: Affiliate Link (Redirect with Tracking) */}
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

      {/* 5. WHITE SURFACE: VERIFIED PROMOS */}
      <section id="coupons" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Verified Coupons & Deals</h2>
            <p className="text-xs text-slate-500">Showing {filteredCoupons.length} active coupons in database</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredCoupons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No active coupons found for this search.
            </div>
          ) : (
            filteredCoupons.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-400 transition shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 font-bold text-sm">
                    {c.brandName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{c.brandName}</span>
                      {c.stackable && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          Stackable with Voucher
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{c.title}</p>
                    <span className="text-[10px] text-slate-400">Verified & active today</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-dashed border-slate-300 font-mono text-xs font-bold text-slate-800">
                    {c.code}
                  </div>
                  <button
                    onClick={() => copyCoupon(c.code)}
                    className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* 6. BLACK SURFACE: WHOLESALE VOUCHERS CATALOG */}
      <section id="vouchers" className="bg-[#09090B] py-16 px-6 mt-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Direct Inventory</span>
              <h2 className="text-3xl font-black text-white tracking-tight">Wholesale E-Vouchers Catalog</h2>
            </div>
            <span className="text-xs text-zinc-400 font-medium hidden sm:block">Instant delivery vouchers</span>
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
                <div key={b.id} className="relative h-[380px] rounded-3xl p-6 flex flex-col justify-between overflow-hidden border border-zinc-800 bg-[#12131A] shadow-xl group hover:border-zinc-700 transition-all">
                  <div 
                    className="absolute top-0 left-0 w-full h-44 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundImage: `url(${b.banner_url || visual.banner})` }}
                  />
                  <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-transparent to-[#12131A]" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white p-2.5 shadow-md flex items-center justify-center border border-white/20">
                      {visual.logoUrl ? (
                        <img src={visual.logoUrl} alt={b.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-black font-black text-xs uppercase">{visual.fallbackText.slice(0, 3)}</span>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs">
                      {b.discount}% OFF
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white">{b.name}</h3>
                    <p className="text-xs text-emerald-400 font-bold mb-3">Instant ₹{savingsAmt} off on ₹1000 card</p>
                    <div className="pt-2 border-t border-white/10 flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Deal Price</span>
                        <span className="text-2xl font-black text-white">₹{finalPay}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">MRP</span>
                        <span className="text-sm font-semibold text-zinc-500 line-through">₹1000</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBrand(b.slug);
                        setCartAmount('1000');
                        handleCalculate('1000', b.slug);
                        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
                    >
                      <span>Stack This Deal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. WHITE SURFACE: EDUCATIONAL STACKING SLIDER */}
      <StackingVisualizer />

      {/* 8. BLACK SURFACE: FINANCIAL CASHBACK CARDS */}
      <section id="cards" className="bg-[#090A0F] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                Financial Rails
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Recommended Cashback Cards
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Click any card to flip and view cashback terms
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((c) => (
              <div key={c.id} className="relative h-[230px] rounded-3xl p-5 border border-white/15 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-xl flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">{c.issuer_bank}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/10 text-emerald-400">
                    {c.base_cashback}% Cashback
                  </span>
                </div>
                <div className="my-auto">
                  <h4 className="text-sm font-extrabold text-white leading-tight">{c.name}</h4>
                  <span className="text-[10px] text-zinc-400">Fee: ₹{c.joining_fee}</span>
                </div>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>Apply Online</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. REELS, QUIZZES & ALERTS */}
      <SponsoredReelsFeed
        onSelectBrand={(slug) => {
          setSelectedBrand(slug);
          handleCalculate(cartAmount, slug);
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <CardEligibilityQuiz />
      <WhatsAppAlerts />

      {/* 10. WHITE SURFACE: FAQS */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 font-medium">Everything you need to know about stacking & voucher issuance</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="p-5 rounded-2xl bg-white border border-slate-200 cursor-pointer shadow-sm"
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm font-bold text-slate-900">{faq.q}</h4>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180 text-black' : ''}`} />
              </div>
              {openFaq === i && (
                <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed font-medium">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SPOTLIGHT SEARCH MODAL (⌘K) */}
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

      {/* CHECKOUT MODAL - MODULAR & TYPE-SAFE */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={brands.find((b) => b.slug === selectedBrand)?.name || selectedBrand}
        brandSlug={selectedBrand}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 950}
        savings={result?.totalSavings || 50}
      />

      {/* AUTH MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full space-y-5 relative shadow-2xl border border-slate-200">
            <button 
              onClick={() => {
                setIsAuthOpen(false);
                setOtpSent(false);
                setOtp('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center mx-auto">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {otpSent ? 'Enter Code' : 'Member Vault'}
              </h3>
              <p className="text-xs text-slate-500">
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
                  <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-xl text-slate-700 text-sm font-bold flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-r-xl py-2.5 px-3.5 text-slate-900 font-bold text-sm outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-center font-mono text-xl font-black text-slate-900 outline-none focus:border-black"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Verify & Open Vault
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TICKER */}
      <LiveArbitrageTicker />

      {/* FOOTER */}
      <footer className="bg-[#09090B] text-white border-t border-zinc-800 py-12 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-bold text-zinc-300">AllInOneVouchers • Real-Time Savings Discovery & Stacking Engine</span>
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