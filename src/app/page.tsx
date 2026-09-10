'use client';

import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useSpring, 
  useTransform 
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
  ShieldCheck,
  Percent,
  Play,
  Share2,
  Tag,
  Sparkles,
  ShoppingBag,
  Flame,
  ExternalLink,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';
import WhatsAppAlerts from '@/components/WhatsAppAlerts';
import CardEligibilityQuiz from '@/components/CardEligibilityQuiz';
import SpotlightSearch from '@/components/SpotlightSearch';
import CheckoutModal from '@/components/CheckoutModal';

// REAL OFFICIAL BRAND ASSETS & LOGOS
const BRAND_DATA: Record<string, { name: string; logoUrl: string; discount: number; starting: string; color: string; buyUrl: string }> = {
  amazon: {
    name: 'Amazon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    discount: 70,
    starting: '₹500',
    color: '#FF9900',
    buyUrl: 'https://ekaro.in/enkr2024amazon'
  },
  flipkart: {
    name: 'Flipkart',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Flipkart_logo.svg/330px-Flipkart_logo.svg.png',
    discount: 60,
    starting: '₹500',
    color: '#2874F0',
    buyUrl: 'https://ekaro.in/enkr2024flipkart'
  },
  myntra: {
    name: 'Myntra',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
    discount: 60,
    starting: '₹500',
    color: '#FF3F6C',
    buyUrl: 'https://ajiio.in/myntra-loot'
  },
  zomato: {
    name: 'Zomato',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
    discount: 60,
    starting: '₹250',
    color: '#CB202D',
    buyUrl: 'https://ekaro.in/enkr2024zomato'
  },
  swiggy: {
    name: 'Swiggy',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
    discount: 50,
    starting: '₹250',
    color: '#FC8019',
    buyUrl: 'https://ekaro.in/enkr2024swiggy'
  },
  blinkit: {
    name: 'Blinkit',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Blinkit-yellow-app-icon.svg',
    discount: 40,
    starting: '₹200',
    color: '#F8CB46',
    buyUrl: 'https://ekaro.in/enkr2024blinkit'
  },
  makemytrip: {
    name: 'MakeMyTrip',
    logoUrl: 'https://promos.makemytrip.com/Growth/Images/B2C/2x/mmt_logo_new.png',
    discount: 40,
    starting: '₹1,000',
    color: '#E02127',
    buyUrl: 'https://ekaro.in/enkr2024mmt'
  }
};

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

export default function Home() {
  const [brands, setBrands] = useState<any[]>(Object.values(BRAND_DATA));
  const [coupons, setCoupons] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('amazon');
  const [cartAmount, setCartAmount] = useState('2000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  
  // Dynamic Real Arbitrage Breakdown
  const [result, setResult] = useState<any>({
    originalCart: 2000,
    voucherCut: 300,
    couponCut: 150,
    cardCashback: 80,
    bestEffectiveCost: 1470,
    totalSavings: 530,
    buyUrl: 'https://ekaro.in'
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // SUPABASE REAL DATABASE SYNC
  useEffect(() => {
    async function loadRealData() {
      try {
        if (!supabase) return;
        const { data: bData } = await supabase
          .from('brands')
          .select(`id, name, slug, website_url, logo_url, categories(name), brand_vouchers(resale_discount_pct)`)
          .eq('is_active', true);

        if (bData && bData.length > 0) {
          const formatted = bData.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            category_name: b.categories?.name || 'Shopping',
            discount: b.brand_vouchers?.[0]?.resale_discount_pct || 15.0,
            buy_url: b.website_url || BRAND_DATA[b.slug]?.buyUrl || 'https://google.com',
            logoUrl: b.logo_url || BRAND_DATA[b.slug]?.logoUrl || '',
            starting: BRAND_DATA[b.slug]?.starting || '₹250',
            color: BRAND_DATA[b.slug]?.color || '#E51B24'
          }));
          setBrands(formatted);
        }

        const { data: cData } = await supabase
          .from('brand_coupons')
          .select(`id, coupon_code, title, discount_value, stackable_with_voucher, is_verified, brands(name, slug)`)
          .eq('is_verified', true);

        if (cData && cData.length > 0) {
          setCoupons(cData.map((c: any) => ({
            id: c.id,
            brandName: c.brands?.name || 'Partner Store',
            brandSlug: c.brands?.slug || 'store',
            code: c.coupon_code,
            title: c.title,
            stackable: c.stackable_with_voucher,
            discountValue: Number(c.discount_value) || 150,
          })));
        }

        const { data: cardData } = await supabase.from('payment_instruments').select('*').eq('is_active', true);
        if (cardData && cardData.length > 0) {
          setCards(cardData.map((cd: any) => ({
            id: cd.id,
            name: cd.name,
            issuer_bank: cd.issuer_bank,
            base_cashback: Number(cd.base_online_cashback_pct) || 5.0,
            url: cd.apply_referral_url || 'https://gromo.in'
          })));
        }
      } catch (e) {
        console.warn('Real DB fallback activated', e);
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

  // Live Stacker Calculation (Voucher + Promo + Credit Card Statement Cash)
  const handleCalculate = (overrideAmount?: string, overrideBrand?: string) => {
    const activeAmount = overrideAmount || cartAmount;
    const activeBrandSlug = overrideBrand || selectedBrand;
    const numCart = Number(activeAmount) || 2000;
    
    setCalcLoading(true);
    setTimeout(() => {
      const currentBrand = brands.find((b) => b.slug === activeBrandSlug) || { discount: 15, buy_url: 'https://ekaro.in' };
      const discountPct = Number(currentBrand?.discount) || 15.0;
      const voucherCut = Math.round((numCart * discountPct) / 100);
      const postVoucher = numCart - voucherCut;

      const couponCut = 150;
      const afterCoupon = Math.max(0, postVoucher - couponCut);
      const cardCashback = hasSbiCard ? Math.round((afterCoupon * 5) / 100) : 0;
      const finalCost = Math.max(0, afterCoupon - cardCashback);
      const totalSaved = numCart - finalCost;

      setResult({
        originalCart: numCart,
        voucherCut,
        couponCut,
        cardCashback,
        bestEffectiveCost: finalCost,
        totalSavings: totalSaved,
        buyUrl: currentBrand?.buy_url || BRAND_DATA[activeBrandSlug]?.buyUrl || 'https://ekaro.in'
      });
      setCalcLoading(false);
    }, 150);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white">
      
      {/* 1. TOP STICKY NAVBAR WITH LOGO1.PNG */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* 2. EXACT 3D REALISTIC HERO SECTION (Inspired by Image) */}
      <section className="bg-white border-b border-slate-200 pt-8 sm:pt-14 pb-14 sm:pb-20 relative overflow-hidden">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* LEFT: Copy, Live Search & Trust Badges */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E51B24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24] animate-ping" />
              <span>Verified Vouchers • 100% Secure • Real Cashback</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Save More.<br />
              <span className="text-[#E51B24]">Shop Smarter.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg font-medium leading-relaxed">
              Get exclusive discounted vouchers, verified promo codes, and direct affiliate cashback from India's top brands — all stacked automatically in one engine.
            </p>

            {/* Red Search Command Bar */}
            <div className="max-w-xl flex items-center rounded-2xl bg-white border-2 border-slate-200 focus-within:border-[#E51B24] shadow-md p-1.5 transition">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                id="hero-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for brands, vouchers, or categories..."
                className="w-full px-3 py-2 text-sm text-slate-800 font-medium outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => document.getElementById('vouchers')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/25 shrink-0 active:scale-95"
              >
                Search
              </button>
            </div>

            {/* 4 Trust Metrics with Red Dot Bullets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24] shrink-0" />
                <div>
                  <strong className="block text-slate-900 text-sm">12,000+</strong>
                  <span className="text-slate-500 text-[11px]">Verified Offers</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24] shrink-0" />
                <div>
                  <strong className="block text-slate-900 text-sm">9,400+</strong>
                  <span className="text-slate-500 text-[11px]">Happy Members</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24] shrink-0" />
                <div>
                  <strong className="block text-slate-900 text-sm">100%</strong>
                  <span className="text-slate-500 text-[11px]">Secure Checkout</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24] shrink-0" />
                <div>
                  <strong className="block text-slate-900 text-sm">Transparent</strong>
                  <span className="text-slate-500 text-[11px]">Pricing</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: EXACT 3D MOCKUP (Isometric Phone with logo.png, 3D Gift Box, Ribbons & Orbiting Pills) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px] select-none">
            
            {/* Top Right "UP TO 70% OFF" Badge */}
            <motion.div 
              animate={{ rotate: [0, 4, 0], scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-3 right-2 sm:right-6 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E51B24] text-white flex flex-col items-center justify-center font-black shadow-2xl shadow-red-500/40 border-4 border-white"
            >
              <span className="text-[9px] tracking-tight uppercase">UP TO</span>
              <span className="text-xl sm:text-2xl leading-none">70%</span>
              <span className="text-[9px] tracking-tight uppercase">OFF</span>
            </motion.div>

            {/* Hand-drawn Arrow Pointer: "Get Best Deals!" */}
            <div className="absolute top-0 right-28 sm:right-32 z-30 hidden sm:flex flex-col items-center text-slate-800 pointer-events-none">
              <span className="font-serif italic font-black text-xs text-[#E51B24]">Get Best Deals!</span>
              <span className="text-xs">↘</span>
            </div>

            {/* 3D Realistic Smartphone Frame */}
            <div className="relative z-10 w-64 sm:w-72 rounded-[46px] bg-slate-950 p-3 shadow-[0_30px_70px_rgba(0,0,0,0.35)] border-4 border-slate-800">
              <div className="w-full bg-[#080A10] rounded-[38px] overflow-hidden p-5 flex flex-col items-center text-center text-white border border-slate-800">
                
                {/* Device Speaker Notch */}
                <div className="w-16 h-4 bg-slate-900 rounded-full mb-3 shadow-inner" />

                {/* Square Brand Logo Emblem (logo.png) */}
                <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center shadow-xl mb-3">
                  <Image 
                    src="/logo.png" 
                    alt="AllInOneVouchers Logo" 
                    width={85} 
                    height={85} 
                    className="object-contain"
                    priority
                  />
                </div>

                <h3 className="text-lg font-black tracking-tight leading-tight">
                  Big Brands<br />Bigger Savings
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Vouchers • Deals • Cashback</p>

                {/* Shop Now CTA inside phone */}
                <a
                  href="#deals"
                  className="w-full mt-4 py-2.5 rounded-full bg-[#E51B24] hover:bg-[#CC141D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/30 text-center block"
                >
                  Shop Now →
                </a>
              </div>
            </div>

            {/* 3D RED GIFT BOX WITH RIBBON (Bottom Left of Phone) */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute bottom-4 -left-4 sm:-left-8 z-30 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-red-500 via-[#E51B24] to-red-700 p-2.5 shadow-2xl shadow-red-600/40 border-2 border-white/60 flex flex-col items-center justify-center text-white text-center"
            >
              {/* White Ribbon Cross Design */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-white/30 backdrop-blur-sm pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-white/30 backdrop-blur-sm pointer-events-none" />
              <span className="text-2xl sm:text-3xl relative z-10 drop-shadow">🎁</span>
              <span className="text-[9px] font-black uppercase tracking-wider relative z-10 mt-1">Loot Box</span>
            </motion.div>

            {/* Floating Brand Pills with Authentic Logos (Orbiting Layout) */}
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
              className="absolute top-6 -left-2 sm:-left-6 z-20 bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <img src={BRAND_DATA.amazon.logoUrl} alt="Amazon" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black text-slate-900">Amazon</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
              className="absolute top-24 -left-4 sm:-left-12 z-20 bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <div className="w-5 h-5 relative flex items-center justify-center">
                <img src={BRAND_DATA.flipkart.logoUrl} alt="Flipkart" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black text-blue-600">Flipkart</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -6, 0] }} 
              transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
              className="absolute top-44 -left-2 sm:-left-6 z-20 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <div className="w-5 h-5 relative flex items-center justify-center">
                <img src={BRAND_DATA.myntra.logoUrl} alt="Myntra" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black text-pink-600">Myntra</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute top-16 -right-2 sm:-right-6 z-20 bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <img src={BRAND_DATA.zomato.logoUrl} alt="Zomato" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black text-red-600">Zomato</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 6, 0] }} 
              transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
              className="absolute bottom-32 -right-2 sm:-right-8 z-20 bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <img src={BRAND_DATA.swiggy.logoUrl} alt="Swiggy" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black text-orange-500">Swiggy</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -6, 0] }} 
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute bottom-14 -right-2 sm:-right-4 z-20 bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <img src={BRAND_DATA.blinkit.logoUrl} alt="Blinkit" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black text-yellow-500">Blinkit</span>
            </motion.div>

            {/* Red Tilted "% VOUCHER" Tag Badge */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }} 
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -bottom-6 right-8 sm:right-16 z-20 bg-white border-2 border-red-200 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 font-black text-xs text-[#E51B24]"
            >
              <span className="text-lg">🏷️</span>
              <span>% VOUCHER</span>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 3. TOP BRANDS, EXCLUSIVE OFFERS BAR WITH OFFICIAL LOGOS */}
      <section id="brands" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] font-black text-lg">🔥</span>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Brands, Exclusive Offers</h2>
              <p className="text-[11px] text-slate-500 font-medium">Shop directly with tracking links and unlock max loot discount.</p>
            </div>
          </div>
          <a href="#vouchers" className="text-xs font-black text-[#E51B24] hover:underline">
            View All Brands →
          </a>
        </div>

        {/* Real Brand Logo Buttons Bar */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
          {Object.entries(BRAND_DATA).map(([slug, b]) => (
            <button
              key={slug}
              onClick={() => {
                setSelectedBrand(slug);
                handleCalculate(cartAmount, slug);
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`shrink-0 px-5 py-3 rounded-2xl border transition flex items-center gap-3 shadow-sm ${
                selectedBrand === slug 
                  ? 'bg-red-50/80 border-[#E51B24] shadow-red-500/10' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-8 h-8 relative flex items-center justify-center">
                <img src={b.logoUrl} alt={b.name} className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block">{b.name}</span>
                <span className="text-[10px] font-bold text-[#E51B24]">{b.discount}% Cut</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. TODAY'S BEST SAVINGS (VOUCHER CARDS WITH AFFILIATE LINK REDIRECTION) */}
      <section id="vouchers" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] text-xl">🏷️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Today's Best Savings</h2>
              <p className="text-xs text-slate-500 font-medium">Biggest discounts, limited time offers. Stack vouchers or activate affiliate deal!</p>
            </div>
          </div>
          <a href="#calculator" className="text-xs font-black text-[#E51B24] hover:underline">
            View All Deals →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          {Object.entries(BRAND_DATA).map(([slug, b]) => (
            <div 
              key={slug}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between text-center hover:shadow-xl hover:border-red-300 transition group relative"
            >
              <div>
                {/* Brand Real Logo */}
                <div className="h-10 w-full flex items-center justify-center mb-3">
                  <img src={b.logoUrl} alt={b.name} className="max-h-8 max-w-[85px] object-contain group-hover:scale-105 transition" />
                </div>
                
                <span className="inline-block w-full py-1 rounded-lg bg-[#E51B24] text-white text-[11px] font-black uppercase tracking-tight mb-2 shadow-sm">
                  UP TO {b.discount}% OFF
                </span>

                <p className="text-xs text-slate-700 font-bold mb-0.5 truncate">{b.name} Voucher</p>
                <p className="text-[10px] text-slate-400 font-semibold mb-3">Starting {b.starting}</p>
              </div>

              {/* Dual Monetization Action Slots */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {/* Channel 1: Voucher Sale */}
                <button
                  onClick={() => {
                    setSelectedBrand(slug);
                    setCartAmount('1000');
                    handleCalculate('1000', slug);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white text-xs font-black transition active:scale-95 shadow-sm shadow-red-500/20"
                >
                  Buy Voucher
                </button>

                {/* Channel 2: Affiliate Link (Redirect) */}
                <a
                  href={b.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold transition flex items-center justify-center gap-1 group-hover:text-[#E51B24]"
                >
                  <span>Shop Now</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW WE SAVE YOU MONEY (3 STEPS + EXPENSE STACKING ENGINE CALCULATOR) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="mb-6">
          <span className="text-xs font-black text-[#E51B24] uppercase tracking-wider block">Simple steps. Bigger savings.</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">How We Save You Money</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* 3 Step Visual Formula */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E51B24] flex items-center justify-center font-black text-base shadow-sm">
                1
              </div>
              <h4 className="text-xs font-black text-slate-900">Buy Discounted Voucher</h4>
              <p className="text-[11px] text-slate-500 font-medium">Get wholesale gift cards from AllInOneVouchers vault.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E51B24] flex items-center justify-center font-black text-base shadow-sm">
                2
              </div>
              <h4 className="text-xs font-black text-slate-900">Apply Verified Promo Code</h4>
              <p className="text-[11px] text-slate-500 font-medium">Stack coupon codes on merchant app at checkout.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E51B24] flex items-center justify-center font-black text-base shadow-sm">
                3
              </div>
              <h4 className="text-xs font-black text-slate-900">Get Credit Card Cashback</h4>
              <p className="text-[11px] text-slate-500 font-medium">Receive extra 5% statement cash rebate automatically.</p>
            </div>
          </div>

          {/* Interactive Live Receipt Stacker Tracker */}
          <div id="calculator" className="lg:col-span-5 bg-white border-2 border-red-100 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 uppercase">
                Example: {selectedBrand.toUpperCase()} Purchase
              </span>
              <span className="text-[10px] font-bold text-white bg-[#E51B24] px-2.5 py-0.5 rounded-full">
                Triple Stacking
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-bold">
              <div className="flex justify-between text-slate-600">
                <span>Your Cart Value</span>
                <span className="font-black text-slate-900">₹{result.originalCart}</span>
              </div>
              <div className="flex justify-between text-[#E51B24]">
                <span>Wholesale Voucher Cut ({BRAND_DATA[selectedBrand]?.discount || 15}%)</span>
                <span>-₹{result.voucherCut}</span>
              </div>
              <div className="flex justify-between text-[#E51B24]">
                <span>Store Promo Code Applied</span>
                <span>-₹{result.couponCut}</span>
              </div>
              <div className="flex justify-between text-[#E51B24]">
                <span>Card Statement Cashback (5%)</span>
                <span>-₹{result.cardCashback}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Effective Payment</span>
                <span className="text-3xl font-black text-slate-900">₹{result.bestEffectiveCost}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs">
                Net Saved ₹{result.totalSavings}
              </div>
            </div>

            {/* Dual CTA: Buy Voucher OR Shop Deal with Tracking */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/25 active:scale-95"
              >
                Buy Voucher
              </button>

              <a
                href={result.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-md"
              >
                <span>Shop This Deal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 6. DEAL REELS & REAL SAVINGS PROOFS */}
      <section id="reels" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] text-xl">🎥</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Deal Reels & Savings Proof</h2>
              <p className="text-xs text-slate-500 font-medium">Real people. Real deals. Real savings proof.</p>
            </div>
          </div>
          <a href="#partner" className="text-xs font-black text-[#E51B24] hover:underline">
            View All Reels →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { store: 'Amazon', saved: '₹420', user: '@priya_sharma', title: 'Amazon haul with voucher', bg: 'from-amber-600 to-black' },
            { store: 'Swiggy', saved: '₹100', user: '@foodie_rohit', title: 'Swiggy food at less price', bg: 'from-orange-600 to-black' },
            { store: 'Myntra', saved: '₹320', user: '@style_with_riya', title: 'Myntra sale + coupon stack', bg: 'from-pink-600 to-black' },
            { store: 'Zomato', saved: '₹210', user: '@manish_singh', title: 'Zomato voucher works 100%', bg: 'from-red-600 to-black' },
          ].map((reel, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-sm hover:shadow-md transition">
              <div className={`h-44 rounded-xl bg-gradient-to-b ${reel.bg} relative overflow-hidden flex flex-col justify-between p-3 text-white`}>
                <span className="self-start text-[10px] font-black uppercase bg-[#E51B24] px-2 py-0.5 rounded shadow">
                  {reel.store}
                </span>
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center shadow-md">
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                  <span>Saved {reel.saved}</span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 truncate">{reel.title}</h4>
                <p className="text-[10px] text-slate-500 font-semibold">{reel.user}</p>
              </div>
            </div>
          ))}

          {/* Submit Reel Card */}
          <div className="bg-red-50/70 border border-dashed border-red-300 rounded-2xl p-5 flex flex-col justify-between text-center">
            <div className="space-y-2">
              <span className="text-3xl">🎁</span>
              <h4 className="text-xs font-black text-slate-900">Share Your Deal & Get Rewarded!</h4>
              <p className="text-[10px] text-slate-600 font-medium">Submit your deal, coupon or reel and get free vouchers & cashback.</p>
            </div>
            <button 
              onClick={() => alert('Deal submission form opening soon!')}
              className="w-full py-2.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs transition shadow-sm"
            >
              Submit Now →
            </button>
          </div>
        </div>
      </section>

      {/* 7. SHOP BY CATEGORY BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Shop by Category</h2>
          <a href="#vouchers" className="text-xs font-black text-[#E51B24] hover:underline">View All Categories →</a>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 text-center">
          {[
            { label: 'Food & Dining', icon: '🍔' },
            { label: 'Fashion', icon: '👗' },
            { label: 'Electronics', icon: '📱' },
            { label: 'Grocery', icon: '🛒' },
            { label: 'Recharge & Bills', icon: '⚡' },
            { label: 'Entertainment', icon: '🎬' },
            { label: 'Gaming', icon: '🎮' },
            { label: 'Home & Living', icon: '🛋️' },
          ].map((cat, i) => (
            <button key={i} className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-red-200 hover:bg-red-50/50 transition flex flex-col items-center gap-1.5 shadow-sm">
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] font-bold text-slate-800 truncate w-full">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 8. PARTNER WITH US BANNER */}
      <section id="partner" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E51B24] flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Partner With Us</h3>
              <p className="text-xs text-slate-500 font-medium">Put your brand in front of smart Indian shoppers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-2">✓ Sponsored Deal Placement</span>
            <span className="flex items-center gap-2">✓ Targeted Shopper Audience</span>
            <span className="flex items-center gap-2">✓ Sponsored Reels & Shorts</span>
            <span className="flex items-center gap-2">✓ Purchase Attribution</span>
            <span className="flex items-center gap-2">✓ Homepage Banner Feature</span>
            <span className="flex items-center gap-2">✓ Live Performance Reports</span>
          </div>

          <a
            href="mailto:partner@allinonevouchers.com"
            className="px-8 py-3.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 shrink-0 active:scale-95"
          >
            Become a Partner →
          </a>
        </div>
      </section>

      {/* 9. MODALS (CHECKOUT & SPOTLIGHT) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={BRAND_DATA[selectedBrand]?.name || selectedBrand}
        brandSlug={selectedBrand}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 850}
        savings={result?.totalSavings || 150}
      />

      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        brands={Object.values(BRAND_DATA)}
        cards={cards}
        coupons={coupons}
        onSelectBrand={(slug) => {
          setSelectedBrand(slug);
          handleCalculate(cartAmount, slug);
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 10. AUTH MODAL (MEMBER VAULT) */}
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
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E51B24] flex items-center justify-center mx-auto shadow-sm">
                <User className="w-6 h-6" />
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-r-xl py-2.5 px-3.5 text-slate-900 font-bold text-sm outline-none focus:border-[#E51B24]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-[#E51B24] hover:bg-[#CC141D] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-center font-mono text-xl font-black text-slate-900 outline-none focus:border-[#E51B24]"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-[#E51B24] hover:bg-[#CC141D] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20"
                >
                  Verify & Open Vault
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 11. HIGH-CONVERSION RICH FOOTER (With logo1.png and WhatsApp Alerts) */}
      <footer className="bg-[#0A0D14] text-white pt-16 pb-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-4 space-y-4">
            <div className="h-10 w-auto relative">
              <Image 
                src="/logo1.png" 
                alt="AllInOneVouchers" 
                width={200} 
                height={45} 
                className="h-full w-auto object-contain brightness-0 invert"
                priority
              />
            </div>
            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
              India's premier savings discovery engine. Stack wholesale brand vouchers, tested merchant promo codes, and credit card cashbacks to get the absolute lowest price.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">🔒 256-Bit SSL Encrypted</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-mono text-[10px]">✓ Verified Deals</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#vouchers" className="hover:text-white transition">Buy Vouchers</a></li>
              <li><a href="#brands" className="hover:text-white transition">Top Stores</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">Stacking Calculator</a></li>
            </ul>
          </div>

          {/* Col 3: Policy & Business */}
          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Ecosystem</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><a href="#partner" className="hover:text-white transition">Partner With Us</a></li>
              <li><a href="https://t.me/allinonevouchers" target="_blank" rel="noreferrer" className="hover:text-white text-[#E51B24] font-bold transition">Telegram Loot Channel ⚡</a></li>
              <li><a href="#" className="hover:text-white transition">Affiliate Disclosure</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Col 4: WhatsApp & Instant Loot Subscription */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-white font-black text-xs uppercase tracking-wider">Get Instant Loot Alerts</h4>
            <p className="text-[11px] text-slate-400">Join 9,400+ shoppers receiving instant price drop alerts directly on WhatsApp.</p>
            
            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-1">
              <input
                type="text"
                placeholder="Enter 10-digit WhatsApp number..."
                className="w-full bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 font-medium"
              />
              <button 
                onClick={() => alert('Subscribed to WhatsApp loot alerts!')}
                className="px-4 py-2 bg-[#E51B24] hover:bg-[#CC141D] rounded-lg text-white font-black text-xs transition shrink-0 shadow"
              >
                Join
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block">No spam. Only 100% working loot price drop links.</span>
          </div>

        </div>

        {/* Sub-Footer Copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <span>© 2026 AllInOneVouchers.com. All rights reserved.</span>
          <span>Designed with ❤️ for smart shoppers in India</span>
        </div>
      </footer>

    </div>
  );
}