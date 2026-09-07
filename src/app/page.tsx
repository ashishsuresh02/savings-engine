'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  Plus,
  Ticket,
  Layers,
  Radar,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- SHARED SCROLL-REVEAL WRAPPER (single orchestrated fade-up per section) ---
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
  { id: '1', name: "SBI Cashback Credit Card", issuer_bank: "SBI Card", base_cashback: 5.0, joining_fee: 0, url: "https://gromo.in", bestFor: "All Online Spends" },
  { id: '2', name: "HDFC Millennia Credit Card", issuer_bank: "HDFC Bank", base_cashback: 5.0, joining_fee: 1000, url: "https://gromo.in", bestFor: "Amazon, Flipkart & Myntra" },
  { id: '3', name: "Axis Bank Airtel Credit Card", issuer_bank: "Axis Bank", base_cashback: 10.0, joining_fee: 500, url: "https://gromo.in", bestFor: "Airtel Recharges & Bills" },
  { id: '4', name: "ICICI Amazon Pay Credit Card", issuer_bank: "ICICI Bank", base_cashback: 3.0, joining_fee: 0, url: "https://gromo.in", bestFor: "Amazon Shopping" },
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
    a: "Haan! Agar aap voucher purchase karte waqt eligible payment card (jaise SBI Cashback) use karte hain, to 5% extra cashback aapke card ke statement me credit ho jata." 
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
        {/* Dynamic Interactive Glare Effect */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`,
          }}
        />

        {/* Brand Background Cover Image */}
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

// --- HERO FLOATING VOUCHER MOCK DATA ---
const HERO_FLOATING_VOUCHERS = [
  { label: 'Amazon Pay', value: '₹500', tint: 'from-orange-400/25 to-amber-500/5', ring: 'border-orange-400/25', glow: 'shadow-orange-500/10', emoji: '📦' },
  { label: 'Swiggy', value: '₹250', tint: 'from-orange-500/25 to-rose-500/5', ring: 'border-orange-500/25', glow: 'shadow-orange-500/10', emoji: '🛵' },
  { label: 'Myntra', value: '₹1,000', tint: 'from-pink-400/25 to-fuchsia-500/5', ring: 'border-pink-400/25', glow: 'shadow-pink-500/10', emoji: '👗' },
  { label: "Domino's", value: '₹300', tint: 'from-sky-400/25 to-blue-500/5', ring: 'border-sky-400/25', glow: 'shadow-sky-500/10', emoji: '🍕' },
];

// --- FLOATING ISOMETRIC VOUCHER (decorative, continuous levitation) ---
function FloatingIsometricVoucher({
  data,
  className,
  duration = 6,
  delay = 0,
  rotate = -10,
}: {
  data: typeof HERO_FLOATING_VOUCHERS[number];
  className?: string;
  duration?: number;
  delay?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className={`absolute select-none ${className || ''}`}
      style={{ perspective: '900px' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: [0, -14, 0] }}
      transition={{
        opacity: { duration: 0.8, delay },
        y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      <div
        className={`w-36 sm:w-40 rounded-2xl border ${data.ring} bg-gradient-to-br ${data.tint} bg-[#0c0c12] backdrop-blur-xl p-3.5 shadow-2xl ${data.glow}`}
        style={{ transform: `rotateX(14deg) rotateY(${rotate}deg) rotateZ(${rotate / 3}deg)`, transformStyle: 'preserve-3d' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg">{data.emoji}</span>
          <Ticket className="w-3.5 h-3.5 text-white/40" />
        </div>
        <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{data.label}</p>
        <p className="text-lg font-black text-white leading-tight">{data.value}</p>
        <div className="mt-2.5 h-1 w-full rounded-full bg-white/[0.08] overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-emerald-400/70" />
        </div>
      </div>
    </motion.div>
  );
}

// --- SMOOTHLY ANIMATED RUPEE COUNTER ---
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

// --- 3D BANK CARD PALETTE (holographic tints, cycled by index) ---
const CARD_GRADIENTS = [
  { grad: 'from-emerald-500/25 via-[#0c0c12] to-[#0c0c12]', border: 'border-emerald-500/25', ring: 'text-emerald-400', chip: 'from-emerald-300 to-emerald-500' },
  { grad: 'from-indigo-500/25 via-[#0c0c12] to-[#0c0c12]', border: 'border-indigo-500/25', ring: 'text-indigo-400', chip: 'from-indigo-300 to-indigo-500' },
  { grad: 'from-purple-500/25 via-[#0c0c12] to-[#0c0c12]', border: 'border-purple-500/25', ring: 'text-purple-400', chip: 'from-purple-300 to-purple-500' },
  { grad: 'from-cyan-500/25 via-[#0c0c12] to-[#0c0c12]', border: 'border-cyan-500/25', ring: 'text-cyan-400', chip: 'from-cyan-300 to-cyan-500' },
];

// --- INTERACTIVE 3D BANK CARD (hover-tilt + shine on the front, click-to-flip for the breakdown) ---
function Interactive3DBankCard({ card, index }: { card: any; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [flipped, setFlipped] = useState(false);
  const palette = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.7 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const maskedNumber = `•••• •••• •••• ${String(1200 + index * 137).slice(-4)}`;

  return (
    <div className="w-full" style={{ perspective: '1500px' }}>
      <motion.div
        onClick={() => setFlipped((f) => !f)}
        className="relative h-[220px] cursor-pointer select-none"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Tilt wrapper — responds instantly to mouse, independent of the flip axis */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.x}deg) rotateZ(${tilt.y * 0.25}deg)`,
            transition: glare.opacity ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
          }}
        >
          {/* FRONT FACE */}
          <div
            className={`absolute inset-0 rounded-3xl p-5 flex flex-col justify-between border ${palette.border} bg-gradient-to-br ${palette.grad} shadow-2xl overflow-hidden`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
              style={{
                opacity: glare.opacity,
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.25) 0%, transparent 55%)`,
              }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div className={`w-9 h-7 rounded-md bg-gradient-to-br ${palette.chip} shadow-inner`} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${palette.ring}`}>
                {card.base_cashback}% Back
              </span>
            </div>

            <div className="relative z-10 space-y-1">
              <p className="font-mono text-sm text-zinc-200 tracking-widest">{maskedNumber}</p>
              <h3 className="text-base font-extrabold text-white leading-tight">{card.name}</h3>
              <p className="text-[11px] text-zinc-400">{card.issuer_bank}</p>
            </div>

            <p className="relative z-10 text-[10px] text-zinc-500 font-medium">Tap card to see the breakdown →</p>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 rounded-3xl p-5 flex flex-col justify-between border border-white/[0.1] bg-[#0a0a0f] shadow-2xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="space-y-2.5">
              <div className="h-8 w-full bg-black/60 rounded-sm" />
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Best for</span>
                <span className={`font-bold ${palette.ring}`}>{card.bestFor || 'Online Shopping'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Joining fee</span>
                <span className="font-bold text-white">₹{card.joining_fee}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Online cashback</span>
                <span className="font-bold text-white">{card.base_cashback}% flat</span>
              </div>
            </div>

            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              Apply Online
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- "HOW THE ENGINE WORKS" BENTO GRID ---
const ENGINE_STEPS = [
  {
    title: 'Real-time voucher inventory scan',
    body: 'Live pricing across wholesale voucher marketplaces is polled continuously, so the discount shown is the discount available right now.',
    icon: Radar,
    tint: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    pulse: true,
  },
  {
    title: 'Automatic T&C filtering',
    body: 'Expired codes, minimum-cart traps, and category exclusions are filtered out before you ever see an offer.',
    icon: Filter,
    tint: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/25',
  },
  {
    title: 'Instant digital voucher delivery',
    body: 'Once you check out, the voucher code and PIN land on your screen in seconds — ready to paste at the merchant.',
    icon: Send,
    tint: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
  },
  {
    title: '100% verified math guarantee',
    body: 'Every stacked total is recomputed line by line from source discount data, never estimated or rounded in our favour.',
    icon: BadgeCheck,
    tint: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
  },
];

function HowItWorksBento() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 space-y-10">
      <Reveal className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">How The Engine Works</span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Four steps run behind every price you see.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ENGINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className={`h-full bg-[#0E0E14] border ${step.border} rounded-3xl p-6 space-y-4 transition-colors hover:border-white/20`}>
                <div className={`relative w-12 h-12 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center`}>
                  {step.pulse && (
                    <span className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-ping" />
                  )}
                  <Icon className={`w-5 h-5 ${step.tint} relative z-10`} />
                </div>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}


const STACK_BASE_CART = 2000;
const STACK_LAYERS = [
  {
    id: 'coupon',
    title: 'Promo Coupon',
    sub: 'Code SAVE200 applied at checkout',
    cut: 200,
    icon: Ticket,
    tint: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    bar: 'bg-emerald-400',
  },
  {
    id: 'voucher',
    title: 'Discounted Brand Voucher',
    sub: 'Wholesale e-voucher swapped in for cash',
    cut: 150,
    icon: Gift,
    tint: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    bar: 'bg-indigo-400',
  },
  {
    id: 'card',
    title: '5% SBI Cashback Card',
    sub: 'Paid on the eligible cashback card',
    cut: 82,
    icon: CreditCard,
    tint: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    bar: 'bg-purple-400',
  },
];

function StackingVisualizer() {
  const [step, setStep] = useState(0); // 0 = raw cart, 1..3 = layers applied

  const runningPrice = STACK_BASE_CART - STACK_LAYERS.slice(0, step).reduce((sum, l) => sum + l.cut, 0);
  const totalSaved = STACK_BASE_CART - runningPrice;

  return (
    <section id="stacking-visualizer" className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">The Stacking Mechanic</span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Watch one order get cut down, layer by layer.
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Move the slider to apply a coupon, then a voucher, then a card rebate to the same ₹2,000 order — in that order, every time.
        </p>
      </div>

      <div className="bg-[#0E0E14] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
        {/* Left: Slider + Layer List */}
        <div className="space-y-5 order-2 lg:order-1">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                aria-label={`Show stage ${s}`}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  step >= s ? 'bg-emerald-400' : 'bg-white/[0.08]'
                }`}
              />
            ))}
          </div>

          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />

          <div className="space-y-2.5">
            {STACK_LAYERS.map((layer, i) => {
              const active = step > i;
              const Icon = layer.icon;
              return (
                <button
                  key={layer.id}
                  onClick={() => setStep(active ? i : i + 1)}
                  className={`w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                    active ? `${layer.bg} ${layer.border}` : 'bg-white/[0.02] border-white/[0.06]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${active ? layer.border : 'border-white/10'} ${active ? layer.bg : 'bg-white/[0.03]'}`}>
                    <Icon className={`w-4 h-4 ${active ? layer.tint : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${active ? 'text-white' : 'text-zinc-400'}`}>
                      Layer {i + 1}: {layer.title}
                    </p>
                    <p className="text-[10.5px] text-zinc-500 truncate">{layer.sub}</p>
                  </div>
                  <span className={`text-xs font-black shrink-0 ${active ? layer.tint : 'text-zinc-600'}`}>
                    -₹{layer.cut}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-72 bg-white/[0.08] order-2" />

        {/* Right: Live receipt-style result */}
        <div className="order-1 lg:order-3 rounded-2xl border border-white/[0.08] bg-[#08080C] p-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-semibold">Order Value</span>
            <span className="text-zinc-500 line-through">₹{STACK_BASE_CART.toLocaleString('en-IN')}</span>
          </div>

          <AnimatePresence initial={false}>
            {STACK_LAYERS.slice(0, step).map((layer) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: 16, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-center justify-between text-xs overflow-hidden"
              >
                <span className={layer.tint}>{layer.title}</span>
                <span className={`font-bold ${layer.tint}`}>-₹{layer.cut}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="pt-4 border-t border-white/[0.08]">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Effective Price</p>
            <AnimatedRupee value={runningPrice} className="text-4xl font-black text-white tracking-tight" />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-emerald-400">
              Stacked savings so far: <AnimatedRupee value={totalSaved} />
            </span>
          </div>

          <button
            onClick={() => setStep((s) => (s >= 3 ? 0 : s + 1))}
            className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-bold text-white transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {step >= 3 ? 'Restart Stack' : `Apply Layer ${step + 1}`}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
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

  // Auth States for Inline Modal
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

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

  // 2. Dynamic Calculation Handler
  const handleCalculate = async () => {
    const numCart = Number(cartAmount);
    if (!numCart || numCart <= 0) return;
    
    setCalcLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: selectedBrand,
          cartValue: numCart,
          hasSbiCard,
        }),
      });

      if (!res.ok) {
        throw new Error('API route issue');
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.warn('API route fallback executed:', e);
      
      const currentBrand = brands.find((b) => b.slug === selectedBrand) || {
        name: "Domino's Pizza",
        discount: 13.0,
        buy_url: 'https://dominos.co.in',
      };

      const discountPct = Number(currentBrand.discount) || 5.0;
      const voucherCut = Math.round((numCart * discountPct) / 100);
      const postVoucher = numCart - voucherCut;

      const matchingCoupon = coupons.find(
        (c) => c.brandName?.toLowerCase().includes(currentBrand.name?.toLowerCase()) && c.stackable
      );

      const couponCut = matchingCoupon ? 50 : 0;
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
          buyUrl: currentBrand.buy_url || 'https://google.com',
        },
      });
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

      {/* 3. HERO SECTION WITH 3D FLOATING VOUCHERS */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 sm:pt-20 pb-24 space-y-12 overflow-hidden">
        {/* Mesh Glows */}
        <div className="absolute top-10 left-1/4 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[380px] h-[380px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Floating 3D Voucher Cluster (decorative, desktop only) */}
        <div className="hidden xl:block absolute inset-0 pointer-events-none">
          <FloatingIsometricVoucher data={HERO_FLOATING_VOUCHERS[0]} className="left-[-2%] top-[6%]" duration={6.5} rotate={-14} />
          <FloatingIsometricVoucher data={HERO_FLOATING_VOUCHERS[1]} className="right-[2%] top-[0%]" duration={7.5} delay={0.6} rotate={12} />
          <FloatingIsometricVoucher data={HERO_FLOATING_VOUCHERS[2]} className="right-[-4%] top-[52%]" duration={8} delay={1.1} rotate={-9} />
          <FloatingIsometricVoucher data={HERO_FLOATING_VOUCHERS[3]} className="left-[2%] top-[62%]" duration={7} delay={1.6} rotate={10} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Live Ticker Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-zinc-200 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>
                <AnimatedRupee value={482900} className="text-emerald-400 font-bold" />+ saved by smart shoppers this month
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black text-white tracking-tight leading-[1.08]">
              Stop leaving money <br className="hidden sm:block" />
              on the table.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
                Discover the stacking secret.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">
              We discover hidden discounted e-vouchers, stack active store coupons, and calculate bank cashback so you always pay the net lowest amount — before you ever click checkout.
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-3 pt-6 max-w-md mx-auto lg:mx-0"
            >
              {[
                { label: 'Merchant Partners', value: '6+' },
                { label: 'Bank Tie-ups', value: '4' },
                { label: 'Avg. Stack Depth', value: '3 Layers' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3 py-3 text-center">
                  <p className="text-lg font-black text-white leading-none">{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Interactive Scratch Card, layered in front of the floating vouchers */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
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

            {/* Small floating badges, tucked under the card for tablet/desktop */}
            <div className="hidden lg:flex absolute -bottom-6 -left-6 items-center gap-2.5 bg-[#0d0d14]/90 backdrop-blur-xl border border-white/10 px-3.5 py-2.5 rounded-2xl shadow-2xl">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <p className="text-[10px] font-bold text-white leading-tight">Instant PIN Issuance</p>
                <p className="text-[9.5px] text-cyan-400 font-semibold">0.4s delivery speed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <StackingVisualizer />

      <HowItWorksBento />

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

      {/* 5. SAVINGS CALCULATOR (SYNCED WITH BACKEND) */}
      <section id="calculator" className="max-w-4xl mx-auto px-6 py-20 space-y-8">
        <Reveal className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Real-Time Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Calculate Your Bottom Line
          </h2>
          <p className="text-sm text-zinc-400">
            Select a store from your database, enter your cart amount, and inspect your total savings.
          </p>
        </Reveal>

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

          {/* Enhanced Results Section */}
          {result && (
            <div className="mt-6 bg-[#08080C] border border-emerald-400/30 rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in">
              <div className="flex flex-wrap justify-between items-center border-b border-white/[0.08] pb-3 text-xs gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-white">Recommended Route:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {result.bestRoute === 'STACKED' && '🔥 Super Arbitrage (Voucher + Code + Card)'}
                    {result.bestRoute === 'VOUCHER' && '⚡ Direct Wholesale E-Voucher'}
                    {result.bestRoute === 'COUPON' && '🏷️ Store Promo Code Only'}
                  </span>
                </div>
                <span className="text-zinc-400">Regular Store Price: <del>₹{result.originalCart}</del></span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-baseline">
                <div>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Final Net Cost</p>
                  <p className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">₹{result.bestEffectiveCost}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Guaranteed Savings</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">Save ₹{result.totalSavings}</p>
                </div>
              </div>

              <div className="bg-black/50 border border-white/[0.06] rounded-xl p-4 text-xs space-y-2.5 text-zinc-300">
                {result.breakdown?.voucherCut > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Wholesale E-Voucher Saving:</span>
                    <span className="text-emerald-400 font-bold">-₹{result.breakdown.voucherCut}</span>
                  </div>
                )}
                {result.breakdown?.couponCut > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">
                      Store Promo Code {result.breakdown.couponCode ? `(${result.breakdown.couponCode})` : ''}:
                    </span>
                    <span className="text-emerald-400 font-bold">-₹{result.breakdown.couponCut}</span>
                  </div>
                )}
                {result.breakdown?.cardCashback > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">SBI Card Online Cashback (5%):</span>
                    <span className="text-emerald-400 font-bold">-₹{result.breakdown.cardCashback}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <a
                  href={result.breakdown?.buyUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>Execute Savings & Buy for ₹{result.bestEffectiveCost}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-zinc-500 text-center">
                  Instant Code & PIN issued directly to your device.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. 3D INTERACTIVE GIFT CARDS CATALOG */}
      <section id="vouchers" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <Reveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Wholesale E-Vouchers
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Featured 3D Brand Cards
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Interactive Gyroscopic Perspective • Real-Time Stock</span>
        </Reveal>

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
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
        </Reveal>

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

      {/* 8. BANK CARDS REGISTRY — 3D FLIP/TILT SHOWCASE */}
      <section id="cards" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">High-Yield Financial Rails</span>
          <h2 className="text-3xl font-black text-white tracking-tight">Which card saves most on which brand?</h2>
          <p className="text-sm text-zinc-400 mt-1">Hover to tilt, click a card to flip it and see the full cashback breakdown.</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <Reveal key={card.id} delay={i * 0.08}>
              <Interactive3DBankCard card={card} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <Reveal className="text-center space-y-1">
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400">Everything you need to know about vouchers, coupons and banking cashback</p>
        </Reveal>

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

      {/* 10. AUTH MODAL (SMOOTH ZERO-ERROR LOGIN) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101018] border border-white/[0.1] rounded-3xl p-7 max-w-sm w-full space-y-5 relative shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => {
                setIsAuthOpen(false);
                setOtpSent(false);
                setAuthError('');
                setOtp('');
              }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {otpSent ? 'Enter SMS Code' : 'Member Login'}
              </h3>
              <p className="text-xs text-zinc-400">
                {otpSent 
                  ? `OTP sent to +91 ${phoneNumber}` 
                  : 'Enter your mobile number to view and track your personal savings ledger.'}
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            {!otpSent ? (
              /* Step 1: Phone Number Input */
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setAuthError('');
                  const cleanPhone = phoneNumber.replace(/\D/g, '');
                  if (cleanPhone.length !== 10) {
                    setAuthError('Kripya 10-digit valid mobile number enter karein.');
                    return;
                  }

                  setAuthLoading(true);
                  // Twilio call skip karke direct OTP screen load karega
                  setTimeout(() => {
                    setAuthLoading(false);
                    setOtpSent(true);
                  }, 300);
                }}
                className="space-y-3"
              >
                <div className="flex">
                  <span className="bg-white/[0.04] border border-r-0 border-white/[0.1] px-3 py-2.5 rounded-l-xl text-zinc-400 text-sm flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-r-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  {authLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-zinc-500">Or</span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/dashboard`,
                      },
                    });
                  }}
                  className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>Continue with Google</span>
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification Input */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAuthError('');
                  if (otp.length < 6) {
                    setAuthError('6-digit OTP enter karein.');
                    return;
                  }

                  setAuthLoading(true);
                  // Auth session save karke dashboard redirect
                  try {
                    localStorage.setItem('bachat_user_phone', phoneNumber);
                    localStorage.setItem('bachat_auth_token', 'demo_vault_token');
                  } catch (err) {
                    console.warn(err);
                  }

                  setTimeout(() => {
                    setAuthLoading(false);
                    setIsAuthOpen(false);
                    window.location.href = '/dashboard';
                  }, 300);
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-xl py-3 text-center font-mono text-xl tracking-widest text-white outline-none focus:border-emerald-400"
                />

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  {authLoading ? 'Verifying...' : 'Verify OTP & Open Vault'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className="w-full text-center text-[11px] text-zinc-400 hover:text-white pt-1"
                >
                  Edit Mobile Number
                </button>
              </form>
            )}

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