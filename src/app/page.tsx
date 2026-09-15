'use client';

import React, { useState, useEffect } from 'react';
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
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
    q: "How does the savings stacking engine work?", 
    a: "Unlike typical coupon directories where promo codes fail at checkout, our engine stacks wholesale discounted brand vouchers, verified merchant promo codes, and credit card cashbacks to uncover the lowest true net price." 
  },
  { 
    q: "How do the direct affiliate deals work?", 
    a: "Every product deal listed under our Loot Deals directory points straight to the official verified merchant (Amazon, Flipkart, Myntra). You pay the discounted price directly on their platform with zero hidden fees." 
  },
  { 
    q: "How do I redeem purchased vouchers?", 
    a: "Upon purchasing any gift voucher from our Dedicated Vouchers page, your 16-digit voucher number and secret PIN are instantly synced to your Member Vault. Enter it in the merchant app's gift card balance section." 
  },
  { 
    q: "How can brands partner with AllInOneVouchers?", 
    a: "Brands can get their products featured in our curated loot feed or sponsor brand reels by submitting a business collaboration request to support@allinonevouchers.com." 
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

export default function Home() {
  const [brands, setBrands] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

      {/* 1. HERO SECTION WITH VIBRANT DESKTOP & MOBILE BACKGROUND */}
      <section className="relative min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] border-b border-slate-200 pt-8 sm:pt-14 pb-14 sm:pb-20 overflow-hidden flex items-center">
        
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          
          {/* Mobile Image: Only visible on screens smaller than md */}
          <div className="block md:hidden relative w-full h-full">
            <Image
              src="/hero-bg-mobile.png"
              alt="Festive Background Mobile"
              fill
              priority
              quality={100}
              className="object-cover object-center opacity-95"
            />
            {/* Minimal subtle wash for mobile text */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px]" />
          </div>

          {/* Desktop Image: Only visible on md screens and above */}
          <div className="hidden md:block relative w-full h-full">
            <Image
              src="/hero-bg.png"
              alt="Festive Background Desktop"
              fill
              priority
              quality={100}
              className="object-contain object-right opacity-100"
            />
            {/* Soft left-only fade: Text area remains readable while right festive art stays 100% vibrant */}
            <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-white/90 via-white/60 to-transparent" />
          </div>

          {/* Bottom ground blend */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#F4F6F9] to-transparent opacity-60" />
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 w-full">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E51B24] bg-red-50/95 border border-red-200/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-ping" />
              <span>India's 1st Curated Arbitrage & Loot Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] drop-shadow-sm">
              Save More.<br />
              <span className="text-[#E51B24]">Shop Smarter.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-800 max-w-lg font-semibold leading-relaxed drop-shadow-xs">
              Explore handpicked price drops, verified promo codes, and wholesale gift cards that give you maximum real cashback on your daily orders.
            </p>

            {/* Instant Search Bar */}
            <div className="max-w-xl flex items-center rounded-2xl bg-white/95 border-2 border-slate-200/90 focus-within:border-[#E51B24] shadow-xl backdrop-blur-md p-1.5 transition">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals on Earbuds, Shoes, Jackets, Amazon, Myntra..."
                className="w-full px-3 py-2 text-sm text-slate-800 font-medium outline-none placeholder:text-slate-400 bg-transparent"
              />
              <button
                onClick={() => document.getElementById('loot-deals')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/25 shrink-0 active:scale-95 cursor-pointer"
              >
                Find Deals
              </button>
            </div>
          </div>

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

      {/* 7. FAQS */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
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

      {/* AUTH MODAL & TICKERS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
      <WhatsAppAlerts />
      <LiveArbitrageTicker />

    </div>
  );
}