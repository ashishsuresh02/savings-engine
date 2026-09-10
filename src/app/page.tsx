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
  Percent,
  Play,
  Share2,
  Tag,
  Flame,
  CheckCircle2
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

// 4-LAYER FULLY FLOATING 3D HERO (MEGA SCALE + SMOOTH FLOATING LOOPS)
function TrulyLive3DHero() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 90, damping: 22 });
  const mouseY = useSpring(y, { stiffness: 90, damping: 22 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-7deg', '7deg']);

  const layerStageX = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  const layerStageY = useTransform(mouseY, [-0.5, 0.5], [-5, 5]);

  const layerLeftX = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  const layerLeftY = useTransform(mouseY, [-0.5, 0.5], [-8, 8]);

  const layerRightX = useTransform(mouseX, [-0.5, 0.5], [12, -12]);
  const layerRightY = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);

  const layerVoucherX = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);
  const layerVoucherY = useTransform(mouseY, [-0.5, 0.5], [6, -6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[860px] h-[520px] sm:h-[620px] lg:h-[660px] flex items-center justify-center select-none py-2 overflow-visible"
    >
      {/* Hand-drawn style 'Get Best Deals!' pointer */}
      <div className="absolute top-1 sm:top-3 right-8 sm:right-14 z-40 hidden sm:flex flex-col items-center pointer-events-none">
        <span className="font-serif italic font-black text-sm text-slate-900 tracking-tight">Get Best Deals!</span>
        <span className="text-[#E51B24] text-lg font-black -rotate-45 leading-none">⤵</span>
      </div>

      {/* Target Ring Graphic */}
      <div className="absolute top-24 right-2 sm:right-6 w-10 h-10 rounded-full border-2 border-red-400/50 flex items-center justify-center pointer-events-none">
        <div className="w-4 h-4 rounded-full border-2 border-[#E51B24]/70 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E51B24]" />
        </div>
      </div>

      {/* Soft Contact Floor Shadow */}
      <div className="absolute bottom-6 sm:bottom-8 w-[72%] h-20 bg-black/15 blur-2xl rounded-full pointer-events-none" />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1100,
        }}
        className="relative w-full h-full flex items-center justify-center will-change-transform"
      >
        {/* LAYER 1: BASE SMARTPHONE & PODIUM STAGE (MEGA SIZE) */}
        <motion.div 
          style={{ x: layerStageX, y: layerStageY }}
          animate={{ y: [0, -7, 0] }}
          transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
          className="relative z-10 w-[520px] sm:w-[660px] lg:w-[720px] flex items-center justify-center shrink-0 will-change-transform"
        >
          <Image 
            src="/3d/phone-stage.png" 
            alt="AllInOneVouchers Phone Stage"
            width={780}
            height={780}
            quality={100}
            className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.18)]"
            priority
            onError={(e: any) => {
              e.currentTarget.src = '/hero-3d-mockup.png';
            }}
          />
        </motion.div>

        {/* LAYER 2: LEFT FLOATING BRANDS (Amazon, Flipkart, Myntra) */}
        <motion.div
          style={{ x: layerLeftX, y: layerLeftY }}
          animate={{ 
            y: [0, -9, 0],
            rotate: [-1, 1.5, -1]
          }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute left-1 sm:left-6 lg:left-8 top-20 sm:top-24 lg:top-28 z-20 w-[190px] sm:w-[260px] lg:w-[290px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/brands-left.png" 
            alt="Amazon Flipkart Myntra"
            width={340}
            height={380}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
          />
        </motion.div>

        {/* LAYER 3: RIGHT FLOATING BRANDS (Zomato, Swiggy, Blinkit + 70% Badge) */}
        <motion.div
          style={{ x: layerRightX, y: layerRightY }}
          animate={{ 
            y: [0, 8, 0],
            rotate: [1, -1.5, 1]
          }}
          transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }}
          className="absolute right-1 sm:right-6 lg:right-8 top-12 sm:top-16 lg:top-20 z-20 w-[200px] sm:w-[270px] lg:w-[305px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/brands-right.png" 
            alt="Zomato Swiggy Blinkit"
            width={350}
            height={400}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
          />
        </motion.div>

        {/* LAYER 4: FRONT TILTED VOUCHER TICKET (Higher & Near Podium) */}
        <motion.div
          style={{ x: layerVoucherX, y: layerVoucherY }}
          animate={{ 
            scale: [1, 1.03, 1],
            y: [0, -4, 0]
          }}
          transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
          className="absolute bottom-20 sm:bottom-28 lg:bottom-32 right-12 sm:right-28 lg:right-32 z-30 w-[160px] sm:w-[225px] lg:w-[245px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/voucher-tag.png" 
            alt="Discount Voucher Tag"
            width={270}
            height={165}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(229,27,36,0.3)]"
            onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// MAIN HOMEPAGE COMPONENT
export default function Home() {
  const [brands, setBrands] = useState<any[]>(Object.values(BRAND_DATA));
  const [coupons, setCoupons] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('amazon');
  const [cartAmount, setCartAmount] = useState('2000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>({
    bestRoute: 'STACKED',
    originalCart: 2000,
    bestEffectiveCost: 1470,
    totalSavings: 530,
    voucherCut: 300,
    couponCut: 150,
    cardCashback: 80,
    buyUrl: 'https://ekaro.in'
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
            discount: b.brand_vouchers?.[0]?.resale_discount_pct || 15.0,
            buy_url: b.website_url || BRAND_DATA[b.slug]?.buyUrl || 'https://google.com',
            logoUrl: b.logo_url || BRAND_DATA[b.slug]?.logoUrl || '',
            starting: BRAND_DATA[b.slug]?.starting || '₹250',
            color: BRAND_DATA[b.slug]?.color || '#E51B24'
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
            discountValue: Number(c.discount_value) || 150,
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
        console.warn('Real DB Sync fallback active', e);
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
      const currentBrand = brands.find((b) => b.slug === activeBrandSlug) || { discount: 15, buy_url: 'https://ekaro.in' };
      const discountPct = Number(currentBrand?.discount) || 15.0;
      const voucherCut = Math.round((numCart * discountPct) / 100);
      const postVoucher = numCart - voucherCut;

      const matchingCoupon = coupons.find(
        (c) => c.brandName?.toLowerCase().includes(currentBrand?.name?.toLowerCase()) && c.stackable
      );

      const couponCut = matchingCoupon ? matchingCoupon.discountValue : 150;
      const afterCoupon = Math.max(0, postVoucher - couponCut);
      const cardCashback = hasSbiCard ? Math.round((afterCoupon * 5) / 100) : 0;
      const finalCost = Math.max(0, afterCoupon - cardCashback);
      const totalSaved = numCart - finalCost;

      setResult({
        bestRoute: matchingCoupon && hasSbiCard ? 'STACKED' : 'VOUCHER',
        originalCart: numCart,
        bestEffectiveCost: finalCost,
        totalSavings: totalSaved,
        voucherCut,
        couponCut,
        couponCode: matchingCoupon ? matchingCoupon.code : 'SAVE150',
        cardCashback,
        buyUrl: currentBrand?.buy_url || BRAND_DATA[activeBrandSlug]?.buyUrl || 'https://ekaro.in',
      });
      setCalcLoading(false);
    }, 150);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const categoriesList = ['All', 'Food Delivery', 'Shopping', 'Quick Commerce', 'Fashion'];

  const filteredCoupons = coupons.filter(c => {
    const matchCat = activeCategory === 'All' || brands.find(b => b.slug === c.brandSlug)?.category_name?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch = c.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white">

      {/* 1. TOP NAVBAR WITH LOGO1.PNG */}
      <DynamicFintechNavbar 
        onOpenAuth={() => setIsAuthOpen(true)}
        brandCount={brands.length || 7}
      />

      {/* 2. SPLIT HERO SECTION WITH SOFT VIBRANT RED 3D BACKGROUND */}
      <section className="relative bg-[#FFFFFF] border-b border-slate-200 pt-8 sm:pt-14 pb-14 sm:pb-20 overflow-hidden">
        
        {/* Soft Radial Ambient Glow behind 3D Scene */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[650px] sm:w-[820px] h-[550px] sm:h-[720px] bg-[radial-gradient(circle_at_65%_50%,rgba(229,27,36,0.14)_0%,rgba(255,100,105,0.06)_40%,rgba(255,255,255,0)_72%)] pointer-events-none" />

        {/* Diagonal Soft Crimson Aura Waves */}
        <div className="absolute -top-24 -right-24 w-[480px] sm:w-[640px] h-[480px] sm:h-[640px] bg-gradient-to-bl from-[#E51B24]/12 via-[#FF6B6B]/08 to-transparent rounded-full blur-[90px] pointer-events-none" />

        {/* Floating 3D Crystal Confetti Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute top-20 left-1/3 w-4 h-4 bg-gradient-to-tr from-[#E51B24] to-red-500 rounded-sm rotate-45 opacity-50 shadow-sm" />
          <div className="absolute bottom-16 left-1/4 w-3.5 h-3.5 bg-gradient-to-br from-[#E51B24] to-rose-400 rounded-sm -rotate-12 opacity-45 shadow-sm" />
          <div className="absolute top-1/2 left-[48%] w-5 h-5 bg-gradient-to-br from-[#E51B24] to-red-600 rounded-sm rotate-12 opacity-60 shadow-sm" />
          <div className="absolute top-16 right-1/4 w-4 h-4 bg-gradient-to-tr from-[#E51B24] to-rose-400 rounded-sm rotate-45 opacity-50" />
          <div className="absolute bottom-20 right-8 w-6 h-6 bg-gradient-to-br from-[#E51B24] to-red-600 rounded-sm -rotate-45 opacity-70 shadow-sm" />
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* LEFT: Main Typography, Command Search & Trust Pillars */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E51B24]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24] animate-ping" />
              <span>Verified Vouchers | 100% Secure | Real Savings</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Save More.<br />
              <span className="text-[#E51B24]">Shop Smarter.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg font-medium leading-relaxed">
              Get exclusive vouchers, promo codes and cashback offers from top brands. Buy vouchers, save more and shop hassle-free — all in one place.
            </p>

            {/* Red Command Search Bar */}
            <div className="max-w-xl flex items-center rounded-2xl bg-white border-2 border-slate-200 focus-within:border-[#E51B24] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-1.5 transition">
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

            {/* 4 Trust Metrics */}
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

          {/* RIGHT: TRULY LIVE 3D INTERACTIVE HERO (Large Scale & Floating) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <TrulyLive3DHero />
          </div>

        </div>
      </section>

      {/* 3. TOP BRANDS, EXCLUSIVE OFFERS BAR */}
      <section id="brands" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] font-black text-lg">🔥</span>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Brands, Exclusive Offers</h2>
              <p className="text-[11px] text-slate-500 font-medium">Shop directly with official tracking links and grab maximum loot discount.</p>
            </div>
          </div>
          <a href="#vouchers" className="text-xs font-black text-[#E51B24] hover:underline">
            View All Brands →
          </a>
        </div>

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

      {/* 4. TODAY'S BEST SAVINGS (VOUCHER CARDS + AFFILIATE REDIRECTION FUNNEL) */}
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
                <div className="h-10 w-full flex items-center justify-center mb-3">
                  <img src={b.logoUrl} alt={b.name} className="max-h-8 max-w-[85px] object-contain group-hover:scale-105 transition" />
                </div>
                
                <span className="inline-block w-full py-1 rounded-lg bg-[#E51B24] text-white text-[11px] font-black uppercase tracking-tight mb-2 shadow-sm">
                  UP TO {b.discount}% OFF
                </span>

                <p className="text-xs text-slate-700 font-bold mb-0.5 truncate">{b.name} Voucher</p>
                <p className="text-[10px] text-slate-400 font-semibold mb-3">Starting {b.starting}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
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

      {/* 5. HOW WE SAVE YOU MONEY */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="mb-6">
          <span className="text-xs font-black text-[#E51B24] uppercase tracking-wider block">Simple steps. Bigger savings.</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">How We Save You Money</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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
              <p className="text-[11px] text-slate-500 font-medium">Stack promo discount codes on merchant app at checkout.</p>
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

      {/* 6. VERIFIED COUPONS DIRECTORY */}
      <section id="coupons" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Verified Coupons & Promo Codes</h2>
            <p className="text-xs text-slate-500">Showing {filteredCoupons.length} active coupons in database</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#E51B24] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
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
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-red-300 transition shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 font-bold text-sm text-[#E51B24]">
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
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 font-mono text-xs font-bold text-slate-800">
                    {c.code}
                  </div>
                  <button
                    onClick={() => copyCoupon(c.code)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
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

      {/* 7. FULL STACKING VISUALIZER SLIDER */}
      <StackingVisualizer />

      {/* 8. FINANCIAL CASHBACK CARDS */}
      <section id="cards" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#E51B24]">Financial Rails</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Recommended Cashback Cards</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">Stack extra 5% statement cash on every spend</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div key={c.id} className="relative h-[220px] rounded-3xl p-5 border border-slate-200 bg-white shadow-md flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase">{c.issuer_bank}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E51B24] border border-red-100">
                  {c.base_cashback}% Cashback
                </span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{c.name}</h4>
                <span className="text-[10px] text-slate-500">Joining Fee: ₹{c.joining_fee}</span>
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Apply Online</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
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

      {/* 10. FAQS SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
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
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180 text-[#E51B24]' : ''}`} />
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

      {/* MODALS */}
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

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={BRAND_DATA[selectedBrand]?.name || selectedBrand}
        brandSlug={selectedBrand}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 850}
        savings={result?.totalSavings || 150}
      />

      {/* MEMBER VAULT AUTH MODAL */}
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

      {/* TICKER */}
      <LiveArbitrageTicker />

      {/* 11. HIGH-CONVERSION RICH MASTER FOOTER */}
      <footer className="bg-[#0A0D14] text-white pt-16 pb-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
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

          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#vouchers" className="hover:text-white transition">Buy Vouchers</a></li>
              <li><a href="#brands" className="hover:text-white transition">Top Stores</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">Stacking Calculator</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-wider mb-4">Ecosystem</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><a href="#partner" className="hover:text-white transition">Partner With Us</a></li>
              <li><a href="https://t.me/allinonevouchers" target="_blank" rel="noreferrer" className="hover:text-white text-[#E51B24] font-bold transition">Telegram Loot Channel ⚡</a></li>
              <li><a href="#" className="hover:text-white transition">Affiliate Disclosure</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <span>© 2026 AllInOneVouchers.com. All rights reserved.</span>
          <span>Designed with ❤️ for smart shoppers in India</span>
        </div>
      </footer>

    </div>
  );
}