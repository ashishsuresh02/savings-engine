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
  Tag
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';
import WhatsAppAlerts from '@/components/WhatsAppAlerts';
import CardEligibilityQuiz from '@/components/CardEligibilityQuiz';
import SpotlightSearch from '@/components/SpotlightSearch';
import CheckoutModal from '@/components/CheckoutModal';

// BRAND VISUALS
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
  flipkart: {
    banner: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=70',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Flipkart_logo.svg/330px-Flipkart_logo.svg.png',
    fallbackText: 'Flipkart',
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
  const [brands, setBrands] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('amazon');
  const [cartAmount, setCartAmount] = useState('2000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>({
    originalCart: 2000,
    voucherCut: 300,
    couponCut: 150,
    cardCashback: 80,
    bestEffectiveCost: 1470,
    totalSavings: 530
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // SUPABASE INGESTION[cite: 3]
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
          const formatted = bData.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            category_name: b.categories?.name || 'Shopping',
            discount: b.brand_vouchers?.[0]?.resale_discount_pct || 15.0,
            buy_url: b.website_url,
            logo_url: b.logo_url
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
        console.warn('Real DB sync fallback', e);
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

  // Live Stacker Calculation[cite: 3]
  const handleCalculate = (overrideAmount?: string, overrideBrand?: string) => {
    const activeAmount = overrideAmount || cartAmount;
    const activeBrandSlug = overrideBrand || selectedBrand;
    const numCart = Number(activeAmount) || 2000;
    
    setCalcLoading(true);
    setTimeout(() => {
      const currentBrand = brands.find((b) => b.slug === activeBrandSlug) || { discount: 15 };
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
      });
      setCalcLoading(false);
    }, 120);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Mock fallbacks if DB takes a second
  const displayBrands = brands.length > 0 ? brands : [
    { id: 1, name: 'Amazon', slug: 'amazon', discount: 70, starting: '₹500' },
    { id: 2, name: 'Flipkart', slug: 'flipkart', discount: 60, starting: '₹500' },
    { id: 3, name: 'Swiggy', slug: 'swiggy', discount: 50, starting: '₹250' },
    { id: 4, name: 'Zomato', slug: 'zomato', discount: 60, starting: '₹250' },
    { id: 5, name: 'Myntra', slug: 'myntra', discount: 60, starting: '₹500' },
    { id: 6, name: 'Blinkit', slug: 'blinkit', discount: 40, starting: '₹200' },
    { id: 7, name: 'MakeMyTrip', slug: 'makemytrip', discount: 40, starting: '₹1,000' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      {/* 1. TOP STICKY NAVBAR[cite: 3] */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* 2. EXACT HERO SPLIT (WHITE BACKGROUND WITH RED DETAILS)[cite: 3] */}
      <section className="bg-white border-b border-slate-200 pt-8 sm:pt-14 pb-14 sm:pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT COLUMN: Main Typography & Controls */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E51B24]">
              <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-ping" />
              <span>Verified Vouchers | 100% Secure | Real Savings</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Save More.<br />
              <span className="text-[#E51B24]">Shop Smarter.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg font-medium leading-relaxed">
              Get exclusive vouchers, promo codes and cashback offers from top brands. Buy vouchers, save more and shop hassle-free — all in one place.
            </p>

            {/* Red Search Input Box */}
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
                className="px-6 sm:px-8 py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-red-500/25 shrink-0"
              >
                Search
              </button>
            </div>

            {/* 4 Trust Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24]" />
                <div>
                  <strong className="block text-slate-900 text-sm">12,000+</strong>
                  <span className="text-slate-500 text-[11px]">Verified Offers</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24]" />
                <div>
                  <strong className="block text-slate-900 text-sm">9,400+</strong>
                  <span className="text-slate-500 text-[11px]">Happy Members</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24]" />
                <div>
                  <strong className="block text-slate-900 text-sm">100%</strong>
                  <span className="text-slate-500 text-[11px]">Secure Checkout</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24]" />
                <div>
                  <strong className="block text-slate-900 text-sm">Transparent</strong>
                  <span className="text-slate-500 text-[11px]">Pricing</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D Phone Showcase + Floating Brands (Exact Replica) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[420px]">
            
            {/* Top Right "UP TO 70% OFF" Badge */}
            <motion.div 
              animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-4 right-4 sm:right-10 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E51B24] text-white flex flex-col items-center justify-center font-black shadow-xl shadow-red-500/30 border-4 border-white"
            >
              <span className="text-[10px] tracking-tight uppercase">UP TO</span>
              <span className="text-xl sm:text-2xl leading-none">70%</span>
              <span className="text-[10px] tracking-tight uppercase">OFF</span>
            </motion.div>

            {/* Central Realistic 3D Mobile Device */}
            <div className="relative z-10 w-64 sm:w-72 rounded-[44px] bg-slate-900 p-3 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-4 border-slate-800">
              <div className="w-full bg-[#0A0D14] rounded-[36px] overflow-hidden p-5 flex flex-col items-center text-center text-white border border-slate-700/50">
                
                {/* Speaker Notch */}
                <div className="w-16 h-4 bg-slate-900 rounded-full mb-3" />

                {/* Stacked Square Logo (logo (2).png) */}
                <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg mb-3">
                  <Image 
                    src="/logo (2).png" 
                    alt="AllInOneVouchers" 
                    width={80} 
                    height={80} 
                    className="object-contain"
                    priority
                  />
                </div>

                <h3 className="text-lg font-black tracking-tight leading-tight">
                  Big Brands<br />Bigger Savings
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Vouchers • Deals • Cashback</p>

                <button 
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full mt-4 py-2.5 rounded-full bg-[#E51B24] hover:bg-[#CC141D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-red-500/30"
                >
                  Shop Now →
                </button>
              </div>
            </div>

            {/* Floating Brand Badges Around Phone */}
            <motion.div 
              animate={{ y: [0, -6, 0] }} 
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute top-8 left-2 sm:-left-4 z-20 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-black text-xs text-slate-900"
            >
              <span className="w-6 h-6 rounded-lg bg-black text-amber-400 flex items-center justify-center font-bold">a</span>
              <span>amazon</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
              className="absolute top-28 left-0 sm:-left-8 z-20 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-black text-xs text-blue-600"
            >
              <span>Flipkart ⚡</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
              className="absolute top-16 right-0 sm:-right-4 z-20 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-black text-xs text-red-600"
            >
              <span>zomato</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 6, 0] }} 
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute bottom-28 -right-2 sm:-right-6 z-20 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-black text-xs text-orange-500"
            >
              <span>SWIGGY</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -6, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute bottom-10 -right-2 sm:-right-4 z-20 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-black text-xs text-emerald-600"
            >
              <span>blinkit</span>
            </motion.div>

            <motion.div 
              animate={{ scale: [1, 1.06, 1] }} 
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -bottom-6 left-12 sm:left-16 z-20 bg-white border-2 border-red-100 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 font-black text-xs text-[#E51B24]"
            >
              <span className="text-base">🏷️</span>
              <span>% VOUCHER</span>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 3. TOP BRANDS, EXCLUSIVE OFFERS BAR */}
      <section id="brands" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] font-black">🔥</span>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Brands, Exclusive Offers</h2>
              <p className="text-[11px] text-slate-500 font-medium">Shop from your favourite brands and enjoy amazing discounts.</p>
            </div>
          </div>
          <a href="#vouchers" className="text-xs font-black text-[#E51B24] hover:underline">
            View All Brands →
          </a>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {displayBrands.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBrand(b.slug);
                handleCalculate(cartAmount, b.slug);
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`shrink-0 px-6 py-3 rounded-2xl border text-xs font-black transition flex items-center gap-2 ${
                selectedBrand === b.slug 
                  ? 'bg-red-50 border-[#E51B24] text-[#E51B24] shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. TODAY'S BEST SAVINGS (VOUCHER PRODUCT CARDS)[cite: 3] */}
      <section id="vouchers" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] text-lg">🏷️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Today's Best Savings</h2>
              <p className="text-xs text-slate-500 font-medium">Biggest discounts, limited time offers. Don't miss out!</p>
            </div>
          </div>
          <a href="#calculator" className="text-xs font-black text-[#E51B24] hover:underline">
            View All Deals →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {displayBrands.map((b) => (
            <div 
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between text-center hover:shadow-lg hover:border-red-200 transition group"
            >
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate mb-2">{b.name}</h3>
                
                <span className="inline-block w-full py-1 px-1.5 rounded bg-[#E51B24] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-tight mb-2 shadow-sm">
                  UP TO {b.discount}% OFF
                </span>

                <p className="text-[11px] text-slate-600 font-bold mb-1 truncate">{b.name} Vouchers</p>
                <p className="text-[10px] text-slate-400 font-medium mb-3">Starting {b.starting || '₹250'}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedBrand(b.slug);
                    setCartAmount('1000');
                    handleCalculate('1000', b.slug);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white text-[11px] font-black transition active:scale-95 shadow-sm"
                >
                  Buy Voucher
                </button>

                <a
                  href={`https://ekaro.in/quick-deal?store=${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[10px] font-bold text-slate-600 hover:text-[#E51B24] py-1 transition"
                >
                  Shop Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW WE SAVE YOU MONEY (3-STEP FORMULA + LIVE CALC RECEIPT)[cite: 3] */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="mb-6">
          <span className="text-xs font-black text-[#E51B24] uppercase tracking-wider block">Simple steps. Bigger savings.</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">How We Save You Money</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* 3 Step Icons */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E51B24] flex items-center justify-center font-black">
                1
              </div>
              <h4 className="text-xs font-black text-slate-900">Buy Discounted Voucher</h4>
              <p className="text-[11px] text-slate-500 font-medium">Get brand vouchers at wholesale lower prices.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E51B24] flex items-center justify-center font-black">
                2
              </div>
              <h4 className="text-xs font-black text-slate-900">Apply Verified Promo Code</h4>
              <p className="text-[11px] text-slate-500 font-medium">Use tested & working promo discount codes.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E51B24] flex items-center justify-center font-black">
                3
              </div>
              <h4 className="text-xs font-black text-slate-900">Get Cashback</h4>
              <p className="text-[11px] text-slate-500 font-medium">Pocket statement rebates from credit cards.</p>
            </div>
          </div>

          {/* Live Receipt Calculation Box */}
          <div id="calculator" className="lg:col-span-5 bg-white border-2 border-red-100 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 uppercase">Example: {selectedBrand.toUpperCase()} Purchase</span>
              <span className="text-[10px] font-bold text-white bg-[#E51B24] px-2 py-0.5 rounded-full">Triple Stacking</span>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-600">
                <span>Your Cart Value</span>
                <span className="font-black text-slate-900">₹{result.originalCart}</span>
              </div>
              <div className="flex justify-between text-[#E51B24]">
                <span>Voucher Discount ({displayBrands.find(b => b.slug === selectedBrand)?.discount || 15}%)</span>
                <span>-₹{result.voucherCut}</span>
              </div>
              <div className="flex justify-between text-[#E51B24]">
                <span>Promo Code Applied</span>
                <span>-₹{result.couponCut}</span>
              </div>
              <div className="flex justify-between text-[#E51B24]">
                <span>Card Cashback (5% SBI)</span>
                <span>-₹{result.cardCashback}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Effective Cost</span>
                <span className="text-2xl font-black text-slate-900">₹{result.bestEffectiveCost}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs">
                You Save ₹{result.totalSavings}
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/25 active:scale-95"
            >
              Get This Deal Now →
            </button>
          </div>

        </div>
      </section>

      {/* 6. DEAL REELS & SAVINGS PROOF[cite: 3] */}
      <section id="reels" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] text-lg">🎥</span>
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
            { store: 'Amazon', saved: '₹420', user: '@priya_sharma', title: 'Amazon haul with voucher' },
            { store: 'Swiggy', saved: '₹100', user: '@foodie_rohit', title: 'Swiggy food at less price' },
            { store: 'Myntra', saved: '₹320', user: '@style_with_riya', title: 'Myntra sale + coupon stack' },
            { store: 'Zomato', saved: '₹210', user: '@manish_singh', title: 'Zomato voucher works 100%' },
          ].map((reel, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="h-44 rounded-xl bg-slate-900 relative overflow-hidden flex flex-col justify-between p-3 text-white">
                <span className="self-start text-[10px] font-black uppercase bg-[#E51B24] px-2 py-0.5 rounded">
                  {reel.store}
                </span>
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold">
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
          <div className="bg-red-50/70 border border-dashed border-red-200 rounded-2xl p-5 flex flex-col justify-between text-center">
            <div className="space-y-2">
              <span className="text-2xl">🎁</span>
              <h4 className="text-xs font-black text-slate-900">Share Your Deal & Get Rewarded!</h4>
              <p className="text-[10px] text-slate-600 font-medium">Submit your deal, coupon or reel and get free vouchers & cashback.</p>
            </div>
            <button 
              onClick={() => alert('Deal submission form opening soon!')}
              className="w-full py-2.5 rounded-xl bg-[#E51B24] text-white font-black text-xs transition shadow-sm"
            >
              Submit Now →
            </button>
          </div>
        </div>
      </section>

      {/* 7. SHOP BY CATEGORY ROW[cite: 3] */}
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
            <button key={i} className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-red-200 hover:bg-red-50/50 transition flex flex-col items-center gap-1.5 shadow-sm">
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[11px] font-bold text-slate-800 truncate w-full">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 8. PARTNER WITH US BANNER (Exact Image Section)[cite: 3] */}
      <section id="partner" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E51B24] flex items-center justify-center shrink-0">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Partner With Us</h3>
              <p className="text-xs text-slate-500 font-medium">Put your brand in front of smart shoppers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-2">✓ Sponsored Deal Placement</span>
            <span className="flex items-center gap-2">✓ Targeted Audience</span>
            <span className="flex items-center gap-2">✓ Sponsored Reels & Videos</span>
            <span className="flex items-center gap-2">✓ Purchase Attribution</span>
            <span className="flex items-center gap-2">✓ Homepage Banner</span>
            <span className="flex items-center gap-2">✓ Performance Reports</span>
          </div>

          <a
            href="mailto:partner@allinonevouchers.com"
            className="px-8 py-3.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 shrink-0"
          >
            Become a Partner →
          </a>
        </div>
      </section>

      {/* 9. CHECKOUT MODAL & SPOTLIGHT SEARCH[cite: 3] */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={displayBrands.find((b) => b.slug === selectedBrand)?.name || selectedBrand}
        brandSlug={selectedBrand}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 850}
        savings={result?.totalSavings || 150}
      />

      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        brands={displayBrands}
        cards={cards}
        coupons={coupons}
        onSelectBrand={(slug) => {
          setSelectedBrand(slug);
          handleCalculate(cartAmount, slug);
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 10. AUTH MODAL (MEMBER VAULT)[cite: 3] */}
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
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E51B24] flex items-center justify-center mx-auto">
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

      {/* TICKER[cite: 3] */}
      <LiveArbitrageTicker />

      {/* 11. DARK FOOTER WITH LOGO1.PNG[cite: 3] */}
      <footer className="bg-[#0A0D14] text-white pt-14 pb-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          <div className="space-y-4">
            <div className="h-9 w-auto relative">
              <Image 
                src="/logo1.png" 
                alt="AllInOneVouchers" 
                width={190} 
                height={40} 
                className="h-full w-auto object-contain brightness-0 invert"
                priority
              />
            </div>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Your one-stop destination for verified vouchers, promo codes, cashback and exclusive deals from top brands. Shop smarter. Save more.
            </p>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#vouchers" className="hover:text-white transition">About Us</a></li>
              <li><a href="#partner" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">More</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Affiliate Disclosure</a></li>
              <li><a href="#partner" className="hover:text-white transition">Partner With Us</a></li>
              <li><a href="#" className="hover:text-white transition">Advertise With Us</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-black text-xs uppercase tracking-wider">Get Exclusive Deals & Alerts</h4>
            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-1">
              <input
                type="email"
                placeholder="Enter email or WhatsApp..."
                className="w-full bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500"
              />
              <button className="px-4 py-2 bg-[#E51B24] hover:bg-[#CC141D] rounded-lg text-white font-black text-xs transition">
                →
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Get latest deals, coupons and offers directly on WhatsApp.</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <span>© 2026 AllInOneVouchers.com. All rights reserved.</span>
          <span>Made by AKSBITSYSTEMS for smart shoppers in India</span>
        </div>
      </footer>

    </div>
  );
}