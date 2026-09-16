'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ExternalLink,
  Clock,
  ChevronLeft,
  ChevronRight,
  Timer,
  Tag,
  CreditCard,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';
import WhatsAppAlerts from '@/components/WhatsAppAlerts';
import PromoSlider, { BannerSlide } from '@/components/PromoSlider';

// Dynamic FAQ Items
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

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

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

// 3D INTERACTIVE TILT FAQ CARD COMPONENT (TYPE-SAFE)
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

  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);

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
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Live Flash Countdown Timer (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 19 });

  const dealsScrollRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close live search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadHomepageData() {
      try {
        setLoading(true);
        if (!supabase) return;

        // 1. Fetch Brands
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

        if (dData) {
          setDeals(dData);
          // Extract unique categories dynamically from DB
          const uniqueCats = Array.from(new Set(dData.map((d: any) => d.category).filter(Boolean))) as string[];
          setCategories(['ALL', ...uniqueCats]);
        }
      } catch (err) {
        console.error("Homepage load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomepageData();
  }, []);

  // SMART SEARCH ENGINE RESULTS MATCHING (Deals + Related Vouchers)
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return { matchingDeals: [], matchingBrand: null, hasSearch: false };

    const matchedDeals = deals.filter((d) => 
      d.title.toLowerCase().includes(query) || 
      d.brand_name.toLowerCase().includes(query) ||
      (d.category && d.category.toLowerCase().includes(query))
    ).slice(0, 3);

    const matchedBrand = brands.find((b) => 
      b.name.toLowerCase().includes(query) || 
      b.slug.toLowerCase().includes(query) ||
      matchedDeals.some(d => d.brand_name.toLowerCase().includes(b.name.toLowerCase()))
    ) || brands[0];

    return {
      matchingDeals: matchedDeals,
      matchingBrand: matchedBrand,
      hasSearch: true
    };
  }, [searchQuery, deals, brands]);

  const filteredDeals = deals.filter((d) => {
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.brand_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const scrollDeals = (direction: 'left' | 'right') => {
    if (dealsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      dealsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white">

      {/* TOP FLOATING NAVBAR */}
      <DynamicFintechNavbar 
        onOpenAuth={() => setIsAuthOpen(true)}
        brandCount={brands.length}
      />

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[600px] sm:min-h-[680px] lg:min-h-[740px] border-b border-slate-200 pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden flex flex-col justify-center">
        
        {/* Background Layer: 100% Flush, No Gaps */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden">
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
            
            {/* BRAND LOGO + PILL BADGE & LIVE TIMER */}
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

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#E51B24] bg-red-50/95 border border-red-200/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-ping shrink-0" />
                  <span>India's 1st Curated Arbitrage & Loot Engine</span>
                </div>

                {/* Live Flash Timer Badge */}
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-md border border-slate-800">
                  <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-amber-400">Flash Loot Ends:</span>
                  <span className="font-mono tracking-widest text-white">
                    {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
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

            {/* HIGH-CONVERTING SMART LOOT AI SEARCH BAR WITH REAL-TIME MATRIX */}
            <div ref={searchContainerRef} className="max-w-xl space-y-2.5 relative">
              <div className="relative flex items-center rounded-2xl bg-white/95 border-2 border-slate-200 hover:border-slate-300 focus-within:border-[#E51B24] focus-within:shadow-[0_8px_30px_rgb(229,27,36,0.14)] shadow-lg backdrop-blur-md p-1.5 transition-all duration-200">
                <div className="pl-3.5 pr-2 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#E51B24] transition-colors" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsSearchFocused(false);
                      document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  placeholder="Search item, e.g. Pizza, Earbuds, Shoes, Amazon..."
                  className="w-full py-2.5 text-sm text-slate-800 font-semibold outline-none placeholder:text-slate-400 placeholder:font-normal bg-transparent"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsSearchFocused(false);
                    document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-[#E51B24] to-[#C4121A] hover:from-[#C4121A] hover:to-[#E51B24] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span>Find Deals</span>
                </button>
              </div>

              {/* LIVE DROPDOWN MATRIX (EMBEDDED PRODUCT + VOUCHER STACK) */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/98 rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 backdrop-blur-xl space-y-3.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-[#E51B24]" />
                        <span>Instant Arbitrage Stacks for "{searchQuery}"</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Double Savings Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                      {/* Left: Matching Curated Loot Item */}
                      <div className="md:col-span-7 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block pl-1">
                          1. Verified Store Deal:
                        </span>

                        {searchResults.matchingDeals.length > 0 ? (
                          <div className="space-y-2">
                            {searchResults.matchingDeals.map((deal: any) => (
                              <div
                                key={deal.id}
                                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-red-200 hover:bg-red-50/30 transition flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-11 h-11 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                                    <img
                                      src={deal.image_url}
                                      alt={deal.title}
                                      className="max-h-full max-w-full object-contain"
                                      onError={(e: any) => { e.currentTarget.src = "https://placehold.co/80x80/png?text=Deal"; }}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#E51B24] transition-colors">
                                      {deal.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-black text-slate-900">₹{deal.deal_price}</span>
                                      <span className="text-[10px] text-slate-400 line-through">₹{deal.mrp_price}</span>
                                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                        {deal.brand_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <a
                                  href={deal.affiliate_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 rounded-xl bg-[#0B2B5C] hover:bg-[#E51B24] text-white text-[11px] font-black shrink-0 flex items-center gap-1 transition"
                                >
                                  <span>Grab</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1">
                            <span className="text-xs font-bold text-slate-800">
                              Looking for "{searchQuery}" on major stores?
                            </span>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              Get the wholesale voucher first, then open merchant checkout with our direct code.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Wholesale Voucher Stacker Pitch */}
                      <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-3.5 flex flex-col justify-between space-y-3 relative overflow-hidden border border-slate-800">
                        <div className="space-y-1.5 relative z-10">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                            2. Stack Wholesale Voucher
                          </span>
                          <h4 className="text-xs font-black text-white leading-snug">
                            Pay with {searchResults.matchingBrand?.name || 'Store'} Voucher
                          </h4>
                          <p className="text-[10px] text-slate-300">
                            Save up to <span className="text-emerald-400 font-bold">{searchResults.matchingBrand?.discount || 10}% extra</span> on this order with 0-minute PIN unlock.
                          </p>
                        </div>

                        <Link
                          href="/vouchers"
                          className="w-full py-2.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white text-[11px] font-black uppercase tracking-wider text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-red-500/30 relative z-10"
                        >
                          <span>Buy Voucher &amp; Stack</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

            {/* QUICK HIGHLIGHT STRIP: Today's Top Deals | Ending Soon | Best Cashback */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 hover:border-red-300 shadow-sm text-xs font-black text-slate-800 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>🔥 Today's Top Deals</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('Loot');
                  document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 shadow-sm text-xs font-black text-amber-900 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>⚡ Ending Soon</span>
              </button>

              <button
                onClick={() => {
                  document.getElementById('vouchers')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 shadow-sm text-xs font-black text-emerald-900 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>🏆 Best Cashback</span>
              </button>
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

      {/* 4. EARNKARO / CASHKARO STYLE FLASH LOOT DEALS WITH DYNAMIC CAROUSEL */}
      <section id="loot-deals" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-[#E51B24] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Live Deals Feed</span>
              </span>
              
              {/* Urgency Counter Badge inside Deals header */}
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Next Price Reset in: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Trending Price Drops &amp; Online Loot
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Live price drops sourced across Amazon, Flipkart, Myntra &amp; D2C stores with verified discounts.
            </p>
          </div>

          {/* Desktop Carousel Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollDeals('left')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-red-300 flex items-center justify-center text-slate-700 hover:text-[#E51B24] shadow-sm transition active:scale-95 cursor-pointer"
              title="Previous Deals"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollDeals('right')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-red-300 flex items-center justify-center text-slate-700 hover:text-[#E51B24] shadow-sm transition active:scale-95 cursor-pointer"
              title="Next Deals"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter Carousel (EarnKaro Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#E51B24] text-white shadow-md shadow-red-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat === 'Loot' ? '🔥 Under ₹499' : cat}
            </button>
          ))}
        </div>

        {/* Product Deals Horizontal Carousel (Mobile Snap + Desktop Smooth Track) */}
        {loading ? (
          <div className="flex gap-4 sm:gap-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[270px] sm:min-w-[290px] h-84 rounded-3xl bg-slate-200 animate-pulse shrink-0" />
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-medium">
            No live deals in this category right now. Check back soon!
          </div>
        ) : (
          <div 
            ref={dealsScrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-2 pb-4 scrollbar-none"
          >
            {filteredDeals.map((deal) => {
              const discountPct = Math.round(((deal.mrp_price - deal.deal_price) / deal.mrp_price) * 100);

              return (
                <div
                  key={deal.id}
                  className="snap-start min-w-[260px] sm:min-w-[290px] max-w-[290px] bg-white border border-slate-200 rounded-3xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-red-200 transition-all duration-300 group shrink-0 relative"
                >
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-[#E51B24] text-white text-[10px] font-black tracking-wider flex items-center gap-1 shadow-sm">
                      <span>{discountPct}% OFF</span>
                    </span>
                  </div>

                  {deal.category && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase">
                        {deal.category}
                      </span>
                    </div>
                  )}

                  {/* Product Image Stage */}
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

                  {/* Details */}
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

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug h-8">
                      {deal.title}
                    </h3>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-black text-slate-900">₹{deal.deal_price.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-semibold text-slate-400 line-through">₹{deal.mrp_price.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Direct Store Redirect Button */}
                    <a
                      href={deal.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#0B2B5C] hover:bg-[#E51B24] text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm mt-2 active:scale-95 cursor-pointer"
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
      <section id="vouchers" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
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
            <span>View All Vouchers &amp; Calculate 3X Savings</span>
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

      {/* 6. KINETIC SCROLL-REVEAL & 3D VOUCHER POP-OUT ABOUT SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 relative overflow-hidden select-none">
        
        {/* Ambient Warm Atmosphere Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-amber-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* 1. KINETIC SPLIT HEADLINE ENTRANCE (LEFT & RIGHT SLIDE) */}
        <div className="text-center space-y-4 mb-16 overflow-hidden">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E51B24] text-xs font-black uppercase tracking-widest shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Inside The Arbitrage Engine</span>
          </motion.div>

          {/* Big Kinetic Split Words */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-black tracking-tighter text-4xl sm:text-6xl lg:text-7xl leading-none">
            <motion.span
              initial={{ opacity: 0, x: -90 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-900"
            >
              WHO WE ARE.
            </motion.span>

            <motion.span
              initial={{ opacity: 0, x: 90 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="bg-gradient-to-r from-[#E51B24] via-rose-600 to-amber-600 bg-clip-text text-transparent"
            >
              HOW YOU WIN.
            </motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-600 font-semibold max-w-xl mx-auto leading-relaxed pt-2"
          >
            We are not another generic coupon blog or fake code directory. We bridge enterprise wholesale vouchers with live merchant deals so you never pay full retail price again.
          </motion.p>
        </div>

        {/* 2. THE VAULT UNBOXING & VOUCHER POP-OUT STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: 3D Vault Box with Voucher Pop-Out Animation */}
          <div className="lg:col-span-5 flex justify-center items-center relative min-h-[380px] sm:min-h-[440px]">
            
            {/* Glow Behind Box */}
            <div className="absolute w-64 h-64 bg-red-500/15 blur-3xl rounded-full pointer-events-none" />

            {/* The Digital Vault Box Base */}
            <div className="relative w-72 sm:w-80 h-80 rounded-[36px] bg-gradient-to-b from-white via-slate-50 to-slate-100 border-2 border-slate-200/90 shadow-2xl p-6 flex flex-col justify-end items-center overflow-visible">
              
              {/* Box Top Slot Trim */}
              <div className="absolute top-8 inset-x-8 h-4 rounded-full bg-slate-200/80 border border-slate-300 shadow-inner" />

              {/* PHYSICAL VOUCHER POPPING OUT UPWARDS ON SCROLL */}
              <motion.div
                initial={{ y: 90, opacity: 0, scale: 0.85, rotate: -6 }}
                whileInView={{ y: -50, opacity: 1, scale: 1, rotate: -2 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  type: "spring", 
                  stiffness: 120, 
                  damping: 14, 
                  delay: 0.25 
                }}
                whileHover={{ y: -65, scale: 1.04, rotate: 0 }}
                className="absolute top-2 w-[270px] sm:w-[290px] bg-gradient-to-br from-[#E51B24] to-[#B50E16] text-white rounded-2xl p-4 shadow-[0_20px_45px_rgba(229,27,36,0.35)] border border-red-400/40 cursor-pointer z-30 select-none"
              >
                {/* Voucher Perforations */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-100 border-r border-red-300" />
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-100 border-l border-red-300" />

                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between items-center pb-2 border-b border-white/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                      Wholesale Pass
                    </span>
                    <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      Instant PIN
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <span className="text-[9px] text-white/80 uppercase font-semibold block">Flat Arbitrage Cut</span>
                      <span className="text-2xl font-black font-mono tracking-tight">FLAT 15% OFF</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white text-[#E51B24] flex items-center justify-center font-black shadow-sm">
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-white/30 flex justify-between items-center text-[10px] font-mono text-white/90">
                    <span>CODE: <strong className="text-white tracking-widest">VAULT-LOCKED</strong></span>
                    <span className="text-amber-200 font-bold">100% Genuine</span>
                  </div>
                </div>
              </motion.div>

              {/* Box Front Face Branding */}
              <div className="w-full text-center space-y-1 pt-6 z-20">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Direct Vault Sourcing
                </span>
                <h4 className="text-base font-black text-slate-900">
                  AllInOneVouchers Hub
                </h4>
                <span className="inline-block px-3 py-1 rounded-xl bg-red-50 text-[#E51B24] font-bold text-[10px] border border-red-100">
                  Enterprise Wholesale Clearance
                </span>
              </div>

            </div>
          </div>

          {/* Right Side: What We Do & How It Works Cards */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Feature Card 1: What We Do */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ scale: 1.015 }}
              className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200/80 hover:border-red-300 shadow-sm hover:shadow-xl transition-all duration-300 flex items-start gap-4 sm:gap-5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-[#E51B24] flex items-center justify-center shrink-0 group-hover:bg-[#E51B24] group-hover:text-white transition-colors duration-300 shadow-xs">
                <Percent className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-[#E51B24] tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    01 • Direct Sourcing
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Bulk Wholesale Gift Cards
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Leading brands (Swiggy, Amazon, Zomato, Myntra) release wholesale allocations through corporate registries[cite: 3]. We pass these bulk enterprise savings directly to your screen with zero markup[cite: 3].
                </p>
              </div>
            </motion.div>

            {/* Feature Card 2: 3X Stacking Formula */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.015 }}
              className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex items-start gap-4 sm:gap-5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0B2B5C] flex items-center justify-center shrink-0 group-hover:bg-[#0B2B5C] group-hover:text-white transition-colors duration-300 shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    02 • The Multiplier
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    3X Savings Stacking Formula
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Never depend on a single promo code. Buy discounted vouchers + apply active in-app merchant codes + earn credit card cashbacks simultaneously to slash up to 40% off your bill[cite: 3].
                </p>
              </div>
            </motion.div>

            {/* Feature Card 3: Instant 0-Minute Delivery */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.45 }}
              whileHover={{ scale: 1.015 }}
              className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex items-start gap-4 sm:gap-5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    03 • The Guarantee
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Instant Secret PIN & Zero Latency
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  The moment payment confirms, your 16-digit voucher code and private PIN unlock on-screen with zero lag, syncing automatically to your encrypted Member Vault and WhatsApp[cite: 3].
                </p>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Quick Interactive Callout Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-12 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-red-50 via-white to-amber-50 border border-red-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#E51B24] text-white flex items-center justify-center font-black shrink-0 shadow-md shadow-red-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                Still paying full retail price at checkout?
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold">
                Explore our live voucher inventory and calculate your net stacked savings right now[cite: 3].
              </p>
            </div>
          </div>

          <Link
            href="/vouchers"
            className="px-5 py-2.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <span>Explore Vouchers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </section>

      {/* WHATSAPP VIP ALERTS */}
      <WhatsAppAlerts />

      {/* 7. DRIBBBLE-STYLE 3D TILT FAQS (PLACED RIGHT BEFORE FOOTER) */}
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