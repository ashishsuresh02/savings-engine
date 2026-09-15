'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform,
  AnimatePresence
} from 'framer-motion';
import { 
  ArrowUpRight, 
  Zap, 
  ArrowRight, 
  ChevronDown, 
  Search,
  Sparkles,
  Flame,
  ShieldCheck,
  TrendingUp,
  Percent,
  Layers,
  Award,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';
import WhatsAppAlerts from '@/components/WhatsAppAlerts';
import PromoSlider, { BannerSlide } from '@/components/PromoSlider';

const FAQS = [
  {
    category: "3X Stacking",
    theme: "red",
    icon: "Layers",
    q: "How does the 3X Savings Stacking Engine work?",
    a: "Unlike typical coupon directories where promo codes fail at checkout, our 3X Stacking formula combines three independent discount layers: (1) Buy a wholesale discounted brand voucher (save 5% to 15% upfront). (2) Apply an active store promo code in the merchant app (cut another 20% to 40%). (3) Pay for the voucher using a high-reward credit card (e.g., SBI Cashback or HDFC Millennia) to pocket an extra 5% statement credit. All three stack together to achieve the lowest true net cost."
  },
  {
    category: "Instant Delivery",
    theme: "emerald",
    icon: "Zap",
    q: "How fast are the digital voucher code and secret PIN delivered?",
    a: "Delivery is instantaneous (0-minute latency). The moment your payment is verified, your 16-digit alphanumeric voucher code and confidential PIN are unlocked directly on your screen and synced to your encrypted Member Vault. You will also receive an instant backup via WhatsApp and email."
  },
  {
    category: "Redemption",
    theme: "blue",
    icon: "CreditCard",
    q: "How do I redeem my vouchers on Amazon, Swiggy, or Zomato?",
    a: "It takes under 30 seconds. Open your merchant app (e.g., Swiggy, Zomato, or Amazon), navigate to 'Payment Methods' or 'Gift Card Balance', tap 'Add Gift Card', and paste your 16-digit code alongside the secret PIN. The entire balance credits to your wallet instantly and can be applied during checkout."
  },
  {
    category: "Flash Loot",
    theme: "amber",
    icon: "Flame",
    q: "Are the Loot Deals authentic and where do I make the payment?",
    a: "Every product deal listed in our Flash Loot feed is curated and tracked via live price monitoring across official platforms like Amazon, Flipkart, and Myntra. Clicking 'Grab Deal' routes you directly to the verified merchant page—you pay directly on their official platform with full warranty and zero hidden charges."
  },
  {
    category: "Security",
    theme: "purple",
    icon: "ShieldCheck",
    q: "Are purchased vouchers safe, and what if a code fails?",
    a: "Every single voucher is bulk-sourced through authorized enterprise corporate channels and carries standard validity ranging from 6 to 12 months. In the rare event of a merchant-side validation glitch upon delivery, our automated verification desk issues an immediate replacement or full wallet refund within 24 hours."
  },
  {
    category: "Partnerships",
    theme: "rose",
    icon: "Sparkles",
    q: "How can brands, merchants, or creators partner with us?",
    a: "D2C brands, retail merchants, and deal influencers looking to list high-conversion loot offers, sponsor Brand Deal Reels, or tap into our high-volume shopper base can reach out directly to our partnerships team at support@allinonevouchers.com."
  }
];

// TOP HERO CAROUSEL BANNERS (Auto-slide)
const HERO_BANNERS: BannerSlide[] = [
  {
    id: 'hero-1',
    title: 'Swiggy & Zomato Mega Feast: Flat ₹150 OFF + Instant Delivery',
    subtitle: 'Stack wholesale food vouchers with restaurant promo codes for up to 40% net discount',
    badge: 'Trending Loot',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    link_url: '/vouchers',
  },
  {
    id: 'hero-2',
    title: 'Amazon & Flipkart Tech Fest: Up to 65% Price Drop',
    subtitle: 'Extra 5% instant cashback unlocked when using select credit card vouchers',
    badge: 'Price Arbitrage',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    link_url: '#loot-deals',
  },
  {
    id: 'hero-3',
    title: 'Myntra Fashion Carnival: Extra 18% Off with Secret Vault PIN',
    subtitle: 'Unlock verified digital vouchers directly delivered to your Member Vault',
    badge: 'Limited Stock',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
    link_url: '/vouchers',
  },
];

// BOTTOM MINI CAROUSEL BANNERS (Auto-slide)
const MINI_BANK_BANNERS: BannerSlide[] = [
  {
    id: 'mini-1',
    title: 'HDFC, SBI & ICICI Cards: Extra 5% Statement Cashback',
    subtitle: 'Auto-stacked with all wholesale gift vouchers above ₹999 value',
    badge: 'Bank Perk',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    link_url: '/vouchers',
  },
  {
    id: 'mini-2',
    title: 'PhonePe & Paytm UPI Wallet Arbitrage',
    subtitle: 'Pay via UPI to unlock instant surprise vouchers & exclusive codes',
    badge: 'Wallet Exclusive',
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80',
    link_url: '#loot-deals',
  },
];

// 4-LAYER INTERACTIVE LIVE 3D HERO
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

  return (
    <div 
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative w-full max-w-[860px] h-[480px] sm:h-[580px] lg:h-[620px] flex items-center justify-center select-none py-2 overflow-visible"
    >
      <div className="absolute top-1 sm:top-3 right-8 sm:right-14 z-40 hidden sm:flex flex-col items-center pointer-events-none">
        <span className="font-serif italic font-black text-sm text-slate-900 tracking-tight">Get Best Deals!</span>
        <span className="text-[#E51B24] text-lg font-black -rotate-45 leading-none">⤵</span>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 w-[72%] h-20 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 1100 }}
        className="relative w-full h-full flex items-center justify-center will-change-transform"
      >
        <motion.div 
          style={{ x: layerStageX, y: layerStageY }}
          animate={{ y: [0, -7, 0] }}
          transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
          className="relative z-10 w-[480px] sm:w-[600px] lg:w-[660px] flex items-center justify-center shrink-0 will-change-transform"
        >
          <Image 
            src="/3d/phone-stage.png" 
            alt="AllInOneVouchers Stage"
            width={740}
            height={740}
            quality={100}
            className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_20px_45px_rgba(229,27,36,0.15)]"
            priority
          />
        </motion.div>

        <motion.div
          style={{ x: layerLeftX, y: layerLeftY }}
          animate={{ y: [0, -9, 0], rotate: [-1, 1.5, -1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute left-1 sm:left-6 lg:left-8 top-20 sm:top-24 lg:top-28 z-20 w-[180px] sm:w-[240px] lg:w-[270px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/brands-left.png" 
            alt="Brands Left"
            width={320}
            height={360}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.15)]"
          />
        </motion.div>

        <motion.div
          style={{ x: layerRightX, y: layerRightY }}
          animate={{ y: [0, 8, 0], rotate: [1, -1.5, 1] }}
          transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }}
          className="absolute right-1 sm:right-6 lg:right-8 top-12 sm:top-16 lg:top-20 z-20 w-[190px] sm:w-[250px] lg:w-[285px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/brands-right.png" 
            alt="Brands Right"
            width={330}
            height={380}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.15)]"
          />
        </motion.div>

        <motion.div
          style={{ x: layerVoucherX, y: layerVoucherY }}
          animate={{ scale: [1, 1.03, 1], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
          className="absolute bottom-20 sm:bottom-28 lg:bottom-32 right-12 sm:right-28 lg:right-32 z-30 w-[150px] sm:w-[210px] lg:w-[230px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/voucher-tag.png" 
            alt="Voucher Tag"
            width={250}
            height={150}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(229,27,36,0.3)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// DYNAMIC RED INFINITE BRAND LOGO MARQUEE (PURE LOGOS ONLY)
function InfiniteBrandMarquee({ brands = [] }: { brands: any[] }) {
  const defaultLogos = [
    { logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.svg' },
    { logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg' },
    { logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png' },
    { logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Dominos_pizza_logo.svg' },
    { logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg' }
  ];

  const brandList = brands.length > 0 ? brands : defaultLogos;
  const duplicated = [...brandList, ...brandList, ...brandList, ...brandList];

  return (
    <div className="w-full bg-[#E51B24] border-y border-red-600 py-4 overflow-hidden relative select-none shadow-lg">
      <div className="absolute left-0 inset-y-0 w-24 sm:w-36 bg-gradient-to-r from-[#E51B24] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 sm:w-36 bg-gradient-to-l from-[#E51B24] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee items-center gap-6 sm:gap-8 hover:[animation-play-state:paused]">
        {duplicated.map((b, idx) => (
          <div 
            key={idx}
            className="w-44 sm:w-56 h-20 sm:h-24 bg-white/95 rounded-2xl border border-white/30 shadow-md p-4 flex items-center justify-center shrink-0 hover:scale-105 transition-all duration-300"
          >
            <img 
              src={b.logoUrl || b.logo_url || '/logo.png'} 
              alt={b.name || "Brand Logo"} 
              className="max-h-full max-w-full object-contain filter drop-shadow-sm"
              onError={(e: any) => {
                e.currentTarget.src = "https://via.placeholder.com/180x80?text=Brand";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// 3D INTERACTIVE TILT FAQ CARD COMPONENT
interface TiltFaqProps {
  faq: typeof FAQS[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function InteractiveTiltFaqCard({ faq, index, isOpen, onToggle }: TiltFaqProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 160, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 160, damping: 18 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const themeColors: Record<string, { badge: string; border: string; glow: string }> = {
    red: { badge: 'bg-red-50 text-red-600 border-red-200', border: 'border-red-500', glow: 'from-red-500/10' },
    emerald: { badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', border: 'border-emerald-500', glow: 'from-emerald-500/10' },
    blue: { badge: 'bg-blue-50 text-blue-600 border-blue-200', border: 'border-blue-500', glow: 'from-blue-500/10' },
    amber: { badge: 'bg-amber-50 text-amber-600 border-amber-200', border: 'border-amber-500', glow: 'from-amber-500/10' },
    purple: { badge: 'bg-purple-50 text-purple-600 border-purple-200', border: 'border-purple-500', glow: 'from-purple-500/10' },
    rose: { badge: 'bg-rose-50 text-rose-600 border-rose-200', border: 'border-rose-500', glow: 'from-rose-500/10' }
  };

  const color = themeColors[faq.theme] || themeColors.red;

  return (
    <div style={{ perspective: 1000 }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.2 }}
        onClick={onToggle}
        className={`relative group rounded-3xl transition-all duration-300 overflow-hidden cursor-pointer ${
          isOpen
            ? `bg-white border-2 ${color.border} shadow-[0_20px_45px_rgba(229,27,36,0.12)]`
            : 'bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-xl'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${color.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500`} />

        <div className="p-6 sm:p-7 flex justify-between items-center gap-4 relative z-10 select-none">
          <div className="space-y-2 pr-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${color.badge}`}>
              0{index + 1} • {faq.category}
            </span>
            <h3 className={`text-base sm:text-lg font-black tracking-tight transition-colors duration-200 ${
              isOpen ? 'text-[#E51B24]' : 'text-slate-900 group-hover:text-[#E51B24]'
            }`}>
              {faq.q}
            </h3>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
              isOpen
                ? 'bg-[#E51B24] border-[#E51B24] text-white shadow-lg shadow-red-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-[#E51B24] group-hover:text-white group-hover:border-[#E51B24]'
            }`}
          >
            <span className="text-2xl font-bold leading-none select-none">+</span>
          </motion.div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="px-6 sm:px-7 pb-6 pt-0 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100">
                <p className="pt-4 text-slate-700 leading-relaxed">{faq.a}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [brands, setBrands] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    async function loadHomepageData() {
      try {
        setLoading(true);
        if (!supabase) return;

        // 1. Fetch Brands for Teaser & Marquee
        const { data: bData } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true })
          .limit(12);

        if (bData) {
          setBrands(bData.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            discount: 10,
            logoUrl: b.logo_url || '/logo.png',
            buy_url: b.website_url || 'https://google.com'
          })));
        }

        // 2. Fetch Curated E-commerce Deals
        const { data: dData } = await supabase
          .from('curated_deals')
          .select('*')
          .order('created_at', { ascending: false });

        if (dData) setDeals(dData);
      } catch (err) {
        console.error("Homepage load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomepageData();
  }, []);

  const filteredDeals = deals.filter((d) => {
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.brand_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white">

      {/* TOP FLOATING NAVBAR */}
      <DynamicFintechNavbar 
        onOpenAuth={() => setIsAuthOpen(true)}
        brandCount={brands.length}
      />

      {/* 1. HERO SECTION (POLISHED BRAND LOGO + MODERN SEARCH BAR) */}
      <section className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] border-b border-slate-200 pt-6 sm:pt-10 pb-14 sm:pb-18 overflow-hidden flex items-center">
        
        {/* Background Layer: 100% Flush, No Gaps */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden">
          {/* Mobile Background */}
          <div className="block md:hidden relative w-full h-full">
            <Image
              src="/hero-bg-mobile.png"
              alt="Festive Background Mobile"
              fill
              priority
              quality={100}
              className="w-full h-full object-cover object-top opacity-95"
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px]" />
          </div>

          {/* Desktop Background */}
          <div className="hidden md:block relative w-full h-full">
            <Image
              src="/hero-bg.png"
              alt="Festive Background Desktop"
              fill
              priority
              quality={100}
              className="w-full h-full object-cover object-top opacity-100"
            />
            <div className="absolute inset-y-0 left-0 w-[50%] bg-gradient-to-r from-white/95 via-white/50 to-transparent" />
          </div>

          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#F4F6F9] to-transparent opacity-40" />
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10 w-full">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            
            {/* BRAND LOGO + PILL BADGE COMBO */}
            <div className="space-y-4">
              <div className="relative h-12 sm:h-14 lg:h-16 w-60 sm:w-72 lg:w-80 drop-shadow-md">
                <Image
                  src="/logo1.png"
                  alt="AllInOneVouchers Logo"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>

              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#E51B24] bg-red-50/95 border border-red-200/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-ping shrink-0" />
                <span>India's 1st Curated Arbitrage & Loot Engine</span>
              </div>
            </div>

            {/* MAIN HEADLINE */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] drop-shadow-sm">
              Save More.<br />
              <span className="text-[#E51B24]">Shop Smarter.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-700 max-w-lg font-medium leading-relaxed">
              Explore handpicked price drops, verified promo codes, and wholesale gift cards that give you maximum real cashback on your daily orders.
            </p>

            {/* HIGH-CONVERTING MODERN SEARCH ENGINE BAR */}
            <div className="max-w-xl space-y-2.5">
              <div className="relative flex items-center rounded-2xl bg-white/95 border-2 border-slate-200 hover:border-slate-300 focus-within:border-[#E51B24] focus-within:shadow-[0_8px_30px_rgb(229,27,36,0.14)] shadow-lg backdrop-blur-md p-1.5 transition-all duration-200">
                <div className="pl-3.5 pr-2 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#E51B24] transition-colors" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  placeholder="Search Amazon, Swiggy, Myntra, Earbuds..."
                  className="w-full py-2.5 text-sm text-slate-800 font-semibold outline-none placeholder:text-slate-400 placeholder:font-normal bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-[#E51B24] to-[#C4121A] hover:from-[#C4121A] hover:to-[#E51B24] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span>Find Deals</span>
                </button>
              </div>

              {/* Quick Click Search Tags */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pl-1 overflow-x-auto scrollbar-none">
                <span className="shrink-0 text-slate-400">Popular:</span>
                {['Swiggy 50% OFF', 'Amazon Pay', 'Myntra BOGO', 'Zomato'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag.split(' ')[0]);
                      document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100/80 hover:bg-red-50 hover:text-[#E51B24] border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 3D INTERACTIVE HERO STAGE */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <TrulyLive3DHero />
          </div>
        </div>
      </section>

      {/* TOP DYNAMIC HERO PROMO SLIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <PromoSlider 
          slides={HERO_BANNERS} 
          variant="hero" 
          heightClass="h-56 sm:h-72 md:h-84 lg:h-96" 
          autoSlideInterval={4500} 
        />
      </section>

      {/* 2. INFINITE MARQUEE STRIP */}
      <InfiniteBrandMarquee brands={brands} />

      {/* 3. NATIVE DISPLAY BANNER AD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="w-full rounded-3xl bg-gradient-to-r from-[#0B2B5C] via-[#0E3572] to-[#14428B] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 -bottom-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 text-center sm:text-left relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              Sponsored Offer
            </span>
            <h3 className="text-xl sm:text-2xl font-black">Want to Buy Digital Vouchers at Wholesale Cut?</h3>
            <p className="text-xs text-slate-300 font-medium max-w-xl">
              Get instant gift vouchers for Swiggy, Zomato, Amazon, Myntra with 0-minute code & PIN unlocking in our dedicated member vault.
            </p>
          </div>

          <Link
            href="/vouchers"
            className="px-6 py-3.5 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/30 shrink-0 flex items-center gap-2 active:scale-95 z-10"
          >
            <span>Explore All Vouchers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. EARNKARO / CASHKARO STYLE FLASH LOOT DEALS */}
      <section id="loot-deals" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E51B24] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" />
                <span>Live Deals Feed</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Trending Price Drops & Online Loot
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Curated verified products directly linking to official merchant checkout stores.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'Electronics', 'Fashion', 'Footwear', 'Loot'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#E51B24] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'Loot' ? '🔥 Under ₹499' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-medium">
            No live deals in this category yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDeals.map((deal) => {
              const discountPct = Math.round(((deal.mrp_price - deal.deal_price) / deal.mrp_price) * 100);

              return (
                <div
                  key={deal.id}
                  className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-red-200 transition-all group relative"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-[#E51B24] text-white text-[10px] font-black tracking-wider flex items-center gap-1 shadow-sm">
                      <span>{discountPct}% OFF</span>
                    </span>
                  </div>

                  <div className="relative w-full h-44 rounded-2xl bg-slate-50 mb-3 overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={deal.image_url}
                      alt={deal.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                      onError={(e: any) => {
                        e.currentTarget.src = "https://placehold.co/300x300/png?text=Deal";
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                        {deal.brand_name}
                      </span>
                      {deal.coupon_code && (
                        <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded truncate">
                          {deal.coupon_code}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {deal.title}
                    </h3>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-black text-slate-900">₹{deal.deal_price.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-semibold text-slate-400 line-through">₹{deal.mrp_price.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Direct Affiliate Redirect */}
                    <a
                      href={deal.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#0B2B5C] hover:bg-[#E51B24] text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm mt-2 cursor-pointer"
                    >
                      <span>Grab Deal</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM MINI ARBITRAGE BANK PROMO SLIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <PromoSlider 
          slides={MINI_BANK_BANNERS} 
          variant="mini" 
          heightClass="h-36 sm:h-44 md:h-48" 
          autoSlideInterval={4000} 
        />
      </section>

      {/* 5. VOUCHERS SECTION TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#E51B24] text-xl">🏷️</span>
              <h2 className="text-xl font-black text-slate-900">Wholesale Gift Vouchers</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              100% verified codes with secret PIN delivery for instant cart payment.
            </p>
          </div>

          <Link
            href="/vouchers"
            className="text-xs font-black text-[#E51B24] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Vouchers & Calculate 3X Savings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {brands.slice(0, 4).map((b) => (
            <Link
              key={b.id}
              href="/vouchers"
              className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-red-300 hover:shadow-lg transition group flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-center mb-4">
                <img src={b.logoUrl} alt={b.name} className="max-h-8 max-w-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-[#E51B24] transition">{b.name}</h3>
                <span className="text-xs font-extrabold text-[#E51B24] block mt-0.5">Flat {b.discount}% Cut</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. ABOUT US & BRAND COLLABORATION TRUST SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-b border-slate-200">
        <div className="bg-white border border-slate-200 rounded-[36px] p-8 sm:p-12 shadow-sm space-y-10">
          <div className="max-w-2xl space-y-3 text-left">
            <span className="text-xs font-black text-[#E51B24] uppercase tracking-wider bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              What We Do
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Empowering India to Never Pay Full Retail Price Again.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              AllInOneVouchers is an automated financial savings platform designed to bridge the gap between wholesale voucher inventory, merchant promo codes, and consumer credit card rebates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#E51B24] flex items-center justify-center font-black">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Wholesale Arbitrage</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                We bulk-source brand gift cards directly from corporate channels, passing real upfront savings directly to end consumers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B2B5C] flex items-center justify-center font-black">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">3X Stacking Stack Engine</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Stacking wholesale vouchers + verified store coupons + credit card cashbacks in one calculation pipeline to find true lowest costs.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Brand Partnerships</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                We work directly with direct-to-consumer and enterprise brands to deliver high-converting user traffic and verified order volume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP ALERTS */}
      <WhatsAppAlerts />

      {/* 7. DRIBBBLE-STYLE 3D TILT FAQS (LAST SECTION BEFORE FOOTER) */}
      <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sticky Guide & Support Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#E51B24] text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Savings Desk</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Frequently Asked <br />
              <span className="text-[#E51B24]">Questions.</span>
            </h2>

            <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-md">
              Hover over any question to explore our automated 3X stacking architecture, instant PIN delivery, and verified loot sources.
            </p>

            {/* Support Callout Box */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white space-y-3.5 shadow-2xl relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">24/7 Verified Desk</span>
              <h4 className="text-base font-black">Still have doubts or need bulk codes?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with our concierge support team for instant order tracking and merchant queries.
              </p>
              <a
                href="mailto:support@allinonevouchers.com"
                className="inline-flex items-center gap-2 text-xs font-black text-[#E51B24] bg-white px-4 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-sm"
              >
                <span>Email Support Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: 3D Mouse Tracking Tilt Cards */}
          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((faq, i) => (
              <InteractiveTiltFaqCard
                key={i}
                faq={faq}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* AUTH MODAL & FLOATING TICKER */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
      <LiveArbitrageTicker />

    </div>
  );
}