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
  Sparkles
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
import SubmitCouponModal from '@/components/SubmitCouponModal';

const FAQS = [
  { 
    q: "How does the savings stacking engine work?", 
    a: "Unlike typical coupon directories where promo codes fail at checkout, our engine stacks wholesale discounted brand vouchers, verified merchant promo codes, and credit card cashbacks to uncover the lowest true net price." 
  },
  { 
    q: "What is the maximum purchase limit on vouchers?", 
    a: "Our instant checkout and automated UTR issuance pipeline supports up to ₹10,000 per order to guarantee instant fraud-checked fulfillment and 0-minute voucher vault issuance." 
  },
  { 
    q: "How do I redeem an unlocked voucher code?", 
    a: "Upon checkout confirmation, your 16-digit voucher number and secret PIN are displayed on-screen and synced to your vault. In the merchant application, enter it in the Gift Card section to deduct 100% of the balance." 
  },
  { 
    q: "When is the credit card cashback credited?", 
    a: "If you pay via eligible cashback credit cards (like SBI Cashback), your 5% rebate reflects automatically in your credit card billing cycle statement as an official statement credit." 
  }
];

// 4-LAYER INTERACTIVE LIVE 3D HERO WITH PREMIUM FINTECH BG
function TrulyLive3DHero({ brands }: { brands: any[] }) {
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
      className="relative w-full max-w-[860px] h-[500px] sm:h-[600px] lg:h-[650px] flex items-center justify-center select-none py-2 overflow-visible"
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
          className="relative z-10 w-[500px] sm:w-[640px] lg:w-[700px] flex items-center justify-center shrink-0 will-change-transform"
        >
          <Image 
            src="/3d/phone-stage.png" 
            alt="AllInOneVouchers Stage"
            width={780}
            height={780}
            quality={100}
            className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_20px_45px_rgba(229,27,36,0.15)]"
            priority
          />
        </motion.div>

        <motion.div
          style={{ x: layerLeftX, y: layerLeftY }}
          animate={{ y: [0, -9, 0], rotate: [-1, 1.5, -1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute left-1 sm:left-6 lg:left-8 top-20 sm:top-24 lg:top-28 z-20 w-[190px] sm:w-[260px] lg:w-[290px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/brands-left.png" 
            alt="Brands Left"
            width={340}
            height={380}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.15)]"
          />
        </motion.div>

        <motion.div
          style={{ x: layerRightX, y: layerRightY }}
          animate={{ y: [0, 8, 0], rotate: [1, -1.5, 1] }}
          transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }}
          className="absolute right-1 sm:right-6 lg:right-8 top-12 sm:top-16 lg:top-20 z-20 w-[200px] sm:w-[270px] lg:w-[305px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/brands-right.png" 
            alt="Brands Right"
            width={350}
            height={400}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.15)]"
          />
        </motion.div>

        <motion.div
          style={{ x: layerVoucherX, y: layerVoucherY }}
          animate={{ scale: [1, 1.03, 1], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
          className="absolute bottom-20 sm:bottom-28 lg:bottom-32 right-12 sm:right-28 lg:right-32 z-30 w-[160px] sm:w-[225px] lg:w-[245px] pointer-events-none will-change-transform"
        >
          <Image 
            src="/3d/voucher-tag.png" 
            alt="Voucher Tag"
            width={270}
            height={165}
            quality={100}
            className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(229,27,36,0.3)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// INFINITE LOOPING BRAND MARQUEE (Award Website Style Reel Strip)
function InfiniteBrandMarquee({ brands }: { brands: any[] }) {
  if (!brands || brands.length === 0) return null;

  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-[#0A0D14] border-y border-slate-800 py-4 overflow-hidden relative select-none shadow-inner">
      <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#0A0D14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#0A0D14] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee items-center gap-10">
        {duplicatedBrands.map((b, idx) => (
          <div 
            key={`${b.id}-${idx}`}
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-sm shrink-0 hover:border-red-500/50 transition"
          >
            <div className="w-6 h-6 relative flex items-center justify-center shrink-0">
              <img 
                src={b.logoUrl} 
                alt={b.name} 
                className="w-full h-full object-contain filter brightness-125"
                onError={(e: any) => {
                  e.currentTarget.src = "https://placehold.co/30x30/png?text=" + b.name[0];
                }}
              />
            </div>
            <div className="text-left">
              <span className="text-xs font-black text-white block tracking-wide">{b.name}</span>
              <span className="text-[10px] font-bold text-[#E51B24]">{b.discount}% Wholesale Cut</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [brands, setBrands] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('');
  const [cartAmount, setCartAmount] = useState('2000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitCouponOpen, setIsSubmitCouponOpen] = useState(false);

  useEffect(() => {
    async function loadRealDatabaseData() {
      try {
        setLoading(true);
        if (!supabase) return;

        const { data: bData } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        const { data: vData } = await supabase
          .from('brand_vouchers')
          .select('*');

        if (bData && bData.length > 0) {
          const liveMerged = bData.map((b: any) => {
            const voucherRule = vData?.find((v: any) => v.brand_id === b.id);
            const discountPct = Number(voucherRule?.resale_discount_pct) || 10;
            const maxVal = Number(voucherRule?.max_denomination) || 10000;
            const baseFace = Number(voucherRule?.min_denomination) === 500 ? 500 : 1000;
            const dealPay = Math.round(baseFace - (baseFace * discountPct) / 100);

            return {
              id: b.id,
              name: b.name,
              slug: b.slug,
              discount: discountPct,
              faceValue: baseFace,
              maxCap: maxVal,
              dealPrice: dealPay,
              buy_url: b.website_url || 'https://google.com',
              logoUrl: b.logo_url || '/logo.png',
            };
          });

          setBrands(liveMerged);
          if (liveMerged.length > 0) {
            setSelectedBrand(liveMerged[0].slug);
            calculateArbitrage(cartAmount, liveMerged[0].slug, liveMerged, coupons, hasSbiCard);
          }
        }

        const { data: cData } = await supabase
          .from('brand_coupons')
          .select('*, brands(name, slug)')
          .eq('is_verified', true);

        if (cData && cData.length > 0) {
          setCoupons(cData.map((c: any) => ({
            id: c.id,
            brandName: c.brands?.name || 'Partner Store',
            brandSlug: c.brands?.slug || 'store',
            code: c.coupon_code,
            title: c.title,
            stackable: c.stackable_with_voucher,
            discountValue: Number(c.discount_value) || 100,
          })));
        }
      } catch (err) {
        console.error("Supabase live load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRealDatabaseData();
  }, []);

  const calculateArbitrage = (
    amt: string, 
    brandSlug: string, 
    brandList = brands, 
    couponList = coupons, 
    cardActive = hasSbiCard
  ) => {
    let numCart = Number(amt) || 2000;
    if (numCart > 10000) numCart = 10000;

    const curr = brandList.find((b) => b.slug === brandSlug) || brandList[0];
    const discountPct = Number(curr?.discount) || 10;
    const voucherCut = Math.round((numCart * discountPct) / 100);
    const postVoucher = numCart - voucherCut;

    const matchCoupon = couponList.find(
      (c) => c.brandSlug === brandSlug && c.stackable
    );

    const couponCut = matchCoupon ? matchCoupon.discountValue : 150;
    const afterCoupon = Math.max(0, postVoucher - couponCut);
    const cardCashback = cardActive ? Math.round((afterCoupon * 5) / 100) : 0;
    const finalCost = Math.max(0, afterCoupon - cardCashback);
    const totalSaved = numCart - finalCost;

    setResult({
      bestRoute: matchCoupon && cardActive ? 'STACKED' : 'VOUCHER',
      originalCart: numCart,
      bestEffectiveCost: finalCost,
      totalSavings: totalSaved,
      voucherCut,
      couponCut,
      couponCode: matchCoupon ? matchCoupon.code : 'SAVE150',
      cardCashback,
      buyUrl: curr?.buy_url || 'https://google.com',
    });
  };

  const handleCalculateClick = (overrideAmount?: string, overrideBrand?: string) => {
    const activeAmount = overrideAmount || cartAmount;
    const activeSlug = overrideBrand || selectedBrand;

    setCalcLoading(true);
    setTimeout(() => {
      calculateArbitrage(activeAmount, activeSlug);
      setCalcLoading(false);
    }, 120);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased selection:bg-[#E51B24] selection:text-white">

      {/* 1. TOP NAVBAR */}
      <DynamicFintechNavbar 
        onOpenAuth={() => setIsAuthOpen(true)}
        brandCount={brands.length}
      />

      {/* 2. 3D HERO SECTION WITH RICH FINTECH BG */}
      <section className="relative bg-gradient-to-b from-white via-slate-50 to-[#F4F6F9] border-b border-slate-200 pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#E51B24_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E51B24] bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-ping" />
              <span>{brands.length} Real Live Stores Connected</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Save More.<br />
              <span className="text-[#E51B24]">Shop Smarter.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg font-medium leading-relaxed">
              Buy wholesale discounted brand vouchers, stack verified merchant promo codes, and pocket direct cashback on top brands — all in one engine.
            </p>

            <div className="max-w-xl flex items-center rounded-2xl bg-white border-2 border-slate-200 focus-within:border-[#E51B24] shadow-md p-1.5 transition">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for brands, vouchers, or stores..."
                className="w-full px-3 py-2 text-sm text-slate-800 font-medium outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => document.getElementById('vouchers')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/25 shrink-0 active:scale-95"
              >
                Find Deals
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <TrulyLive3DHero brands={brands} />
          </div>

        </div>
      </section>

      {/* 3. INFINITE AWARD-STYLE BRAND REEL STRIP */}
      <InfiniteBrandMarquee brands={brands} />

      {/* 4. DYNAMIC BRANDS CAROUSEL */}
      <section id="brands" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] font-black text-lg">🔥</span>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Live Active Stores ({brands.length})
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Click any brand below to calculate its net stacked checkout cost.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 w-44 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3.5 overflow-x-auto pb-3 scrollbar-none snap-x">
            {filteredBrands.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBrand(b.slug);
                  handleCalculateClick(cartAmount, b.slug);
                  document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`snap-start shrink-0 px-5 py-3 rounded-2xl border transition flex items-center gap-3 shadow-sm ${
                  selectedBrand === b.slug 
                    ? 'bg-red-50 border-[#E51B24] ring-1 ring-[#E51B24]' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
                  <img 
                    src={b.logoUrl} 
                    alt={b.name} 
                    className="w-full h-full object-contain"
                    onError={(e: any) => {
                      e.currentTarget.src = "https://placehold.co/40x40/png?text=" + b.name[0];
                    }}
                  />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-900 block truncate max-w-[120px]">{b.name}</span>
                  <span className="text-[10px] font-bold text-[#E51B24]">{b.discount}% Cut</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 5. TODAY'S BEST SAVINGS (VOUCHERS GRID/CAROUSEL) */}
      <section id="vouchers" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[#E51B24] text-xl">🏷️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Today's Best Savings ({brands.length} Vouchers Listed)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Wholesale cards with instant digital delivery & PIN unlocking.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">Swipe right for more →</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex items-stretch gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
            {filteredBrands.map((b) => {
              const faceVal = b.faceValue || 1000;
              const discount = b.discount || 10;
              const netPay = Math.round(faceVal - (faceVal * discount) / 100);
              const savingsAmt = faceVal - netPay;

              return (
                <div 
                  key={b.id}
                  className="snap-start shrink-0 w-64 sm:w-72 bg-white border border-slate-200 rounded-[28px] p-5 flex flex-col justify-between hover:shadow-xl hover:border-red-300 transition group relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow border border-slate-100 flex items-center justify-center">
                      <img 
                        src={b.logoUrl} 
                        alt={b.name} 
                        className="max-h-8 max-w-[85px] object-contain group-hover:scale-105 transition"
                        onError={(e: any) => {
                          e.currentTarget.src = "https://placehold.co/60x30/png?text=" + b.name[0];
                        }}
                      />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E51B24] font-black text-xs">
                      {discount}% OFF
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 truncate">{b.name} Voucher</h3>
                      <p className="text-xs text-[#E51B24] font-bold">Instant ₹{savingsAmt} off on ₹{faceVal}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Deal Price</span>
                        <span className="text-2xl font-black text-slate-900">₹{netPay}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Face Value</span>
                        <span className="text-sm font-semibold text-slate-400 line-through">₹{faceVal}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedBrand(b.slug);
                          setCartAmount(String(faceVal));
                          handleCalculateClick(String(faceVal), b.slug);
                          setIsCheckoutOpen(true);
                        }}
                        className="py-2.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-red-500/20 active:scale-95"
                      >
                        Buy Voucher
                      </button>

                      <a
                        href={b.buy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 group-hover:text-[#E51B24]"
                      >
                        <span>Shop Now</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. CALCULATOR SECTION */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="bg-white border-2 border-red-100 rounded-[36px] p-6 sm:p-10 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black text-[#E51B24] uppercase tracking-wider">Arbitrage Savings Engine</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Calculate Lowest Checkout Price</h2>
            </div>
            <div className="text-xs text-slate-500 font-medium bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
              Target Store: <strong className="text-[#E51B24] capitalize">{selectedBrand || 'Select Store'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Order Cart Value (₹) — Max Limit ₹10,000
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">Allowed: ₹100 - ₹10,000</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={cartAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > 10000) {
                        setCartAmount('10000');
                      } else {
                        setCartAmount(e.target.value);
                      }
                    }}
                    placeholder="2000"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#E51B24] rounded-2xl px-4 py-3.5 text-xl font-black text-slate-900 outline-none transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                    {['1000', '2000', '5000', '10000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setCartAmount(preset);
                          handleCalculateClick(preset, selectedBrand);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-black text-slate-700 hover:border-[#E51B24] transition"
                      >
                        ₹{preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cashback Instrument
                </label>
                <div
                  onClick={() => {
                    setHasSbiCard(!hasSbiCard);
                    calculateArbitrage(cartAmount, selectedBrand, brands, coupons, !hasSbiCard);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition ${
                    hasSbiCard ? 'bg-red-50/70 border-[#E51B24]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-5 h-5 ${hasSbiCard ? 'text-[#E51B24]' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <h4 className="text-xs font-black text-slate-900">SBI Cashback Credit Card</h4>
                      <p className="text-[11px] text-slate-500">Auto-applies 5% statement cash rebate at confirmation</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${hasSbiCard ? 'bg-[#E51B24] border-[#E51B24] text-white' : 'border-slate-300 bg-white'}`}>
                    {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCalculateClick()}
                disabled={calcLoading}
                className="w-full py-4 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                {calcLoading ? 'Calculating...' : 'Recalculate Savings'}
              </button>
            </div>

            {/* Receipt Result */}
            <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between shadow space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-900 uppercase">
                    Breakdown: {selectedBrand.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Arbitrage Route
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-bold pt-3">
                  <div className="flex justify-between text-slate-500">
                    <span>Retail Cart Value</span>
                    <span className="text-slate-900 font-black">₹{result ? result.originalCart : cartAmount}</span>
                  </div>
                  <div className="flex justify-between text-[#E51B24]">
                    <span>Wholesale Voucher Cut</span>
                    <span>-₹{result ? result.voucherCut : 0}</span>
                  </div>
                  <div className="flex justify-between text-[#E51B24]">
                    <span>Verified Store Promo ({result?.couponCode || 'SAVE150'})</span>
                    <span>-₹{result ? result.couponCut : 0}</span>
                  </div>
                  <div className="flex justify-between text-[#E51B24]">
                    <span>SBI Cashback Rebate (5%)</span>
                    <span>-₹{result ? result.cardCashback : 0}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Effective Net Cost
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-0.5">
                      ₹{result ? result.bestEffectiveCost : cartAmount}
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs text-right">
                    Net Saved ₹{result ? result.totalSavings : 0}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>Buy Voucher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={result?.buyUrl || 'https://google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Visit Store</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. VERIFIED COUPONS DIRECTORY */}
      <section id="coupons" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Verified Coupons & Promo Codes</h2>
              <button
                onClick={() => setIsSubmitCouponOpen(true)}
                className="px-3 py-1 rounded-full bg-red-50 text-[#E51B24] text-[10px] font-black border border-red-200 hover:bg-red-100 transition flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>+ Submit Code</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">Showing {coupons.length} active promo codes from DB</p>
          </div>
        </div>

        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 font-black text-sm text-[#E51B24]">
                  {c.brandName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{c.brandName}</span>
                    {c.stackable && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        Stackable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{c.title}</p>
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
          ))}
        </div>
      </section>

      {/* 8. REELS FEED & CREDIT CARD ELIGIBILITY WIZARD */}
      <SponsoredReelsFeed
        onSelectBrand={(slug) => {
          setSelectedBrand(slug);
          handleCalculateClick(cartAmount, slug);
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <div id="cards">
        <CardEligibilityQuiz />
      </div>
      <WhatsAppAlerts />

      {/* 9. FAQS */}
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

      {/* MODALS */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={brands.find((b) => b.slug === selectedBrand)?.name || selectedBrand}
        brandSlug={selectedBrand}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 850}
        savings={result?.totalSavings || 150}
      />

      <SubmitCouponModal
        isOpen={isSubmitCouponOpen}
        onClose={() => setIsSubmitCouponOpen(false)}
        brands={brands}
        onSuccess={(newCoupon) => {
          setCoupons((prev) => [newCoupon, ...prev]);
        }}
      />

      <LiveArbitrageTicker />

      {/* PROFESSIONAL FINTECH FOOTER */}
      <footer className="bg-[#0A0D14] text-slate-400 pt-16 pb-12 border-t border-slate-800 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          {/* Top Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E51B24] flex items-center justify-center text-white font-black">
                  A
                </div>
                <span className="text-base font-black text-white tracking-tight">
                  AllInOneVouchers
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
                India's premier financial arbitrage engine. We stack wholesale discounted brand gift cards, verified promo codes, and credit card cashbacks to uncover the lowest true net price.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Secure UTR & Vault Pipeline Active</span>
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Platform Hub</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#vouchers" className="hover:text-white transition">Active Vouchers</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Arbitrage Calculator</a></li>
                <li><a href="#coupons" className="hover:text-white transition">Verified Coupons</a></li>
                <li><a href="#cards" className="hover:text-white transition">Card Finder Wizard</a></li>
                <li><a href="/dashboard" className="hover:text-white transition">User Vault</a></li>
              </ul>
            </div>

            {/* Col 3: Popular Stores */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Partner Stores</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#calculator" className="hover:text-white transition">Amazon Shopping</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Swiggy Gourmet</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Zomato Dining</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Myntra Fashion</a></li>
                <li><a href="#calculator" className="hover:text-white transition">Domino's Pizza</a></li>
              </ul>
            </div>

            {/* Col 4: Community & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Connect & Help</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="https://t.me/allinonevouchers" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">Telegram Loot Channel</a></li>
                <li><a href="https://t.me/AIOVouchersBot" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">Automated Deal Bot</a></li>
                <li><a href="#faq" className="hover:text-white transition">Frequently Asked Questions</a></li>
                <li><a href="mailto:support@allinonevouchers.com" className="hover:text-white transition">Customer Support Desk</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider & Copyright */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-medium">
            <p>© 2026 AllInOneVouchers.com. All rights reserved. Made By AKSBit Systems.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-300 transition cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 transition cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-300 transition cursor-pointer">Security Audits</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}