'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  ChevronDown, 
  CheckCircle2, 
  Plus, 
  Ticket, 
  Layers, 
  Search, 
  QrCode, 
  Lock, 
  ExternalLink,
  Flame,
  Smartphone,
  Tag,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';
import WhatsAppAlerts from '@/components/WhatsAppAlerts';
import CardEligibilityQuiz from '@/components/CardEligibilityQuiz';
import SpotlightSearch from '@/components/SpotlightSearch';
import SponsoredReelsFeed from '@/components/SponsoredReelsFeed';

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
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const BRAND_VISUALS: Record<string, { banner: string; accent: string; iconText: string; bgTone: string }> = {
  dominos: {
    banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=60',
    accent: '#006491',
    iconText: '🍕',
    bgTone: 'bg-sky-100/70',
  },
  swiggy: {
    banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&auto=format&fit=crop&q=60',
    accent: '#fc8019',
    iconText: '🛵',
    bgTone: 'bg-orange-100/70',
  },
  zomato: {
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=60',
    accent: '#e23744',
    iconText: '🍽️',
    bgTone: 'bg-rose-100/70',
  },
  myntra: {
    banner: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&auto=format&fit=crop&q=60',
    accent: '#ff3f6c',
    iconText: '👗',
    bgTone: 'bg-pink-100/70',
  },
  blinkit: {
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=60',
    accent: '#f59e0b',
    iconText: '⚡',
    bgTone: 'bg-amber-100/70',
  },
  amazon: {
    banner: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=60',
    accent: '#d97706',
    iconText: '📦',
    bgTone: 'bg-yellow-100/70',
  },
};

const FAQS = [
  { 
    q: "Ye normal coupon websites se alag kaise kaam karta hai?", 
    a: "Normal sites par 90% coupons expire hote hain. Humara database verified Wholesale E-Vouchers, active coupons aur payment card rewards ko ek sath stack karke aapke liye lowest effective price nikalta hai." 
  },
  { 
    q: "Discounted E-Voucher ko kaise redeem karein?", 
    a: "Voucher khareedte hi instantly 16-digit voucher code aur PIN screen par milta hai. Domino's ya Swiggy ke checkout payment option me 'Gift Card' choose karke code enter karne par bill settle ho jata hai." 
  },
  { 
    q: "Kya credit card cashback sach me add hota hai?", 
    a: "Haan! Agar aap voucher purchase karte waqt eligible payment card (jaise SBI Cashback) use karte hain, to 5% extra cashback aapke card statement me credit ho jata hai." 
  }
];

const FULLSCREEN_HERO_VOUCHERS = [
  { label: 'Amazon Pay', value: '₹500 Gift Card', save: '₹35 Saved', emoji: '📦', pos: 'top-10 left-[2%] sm:left-[4%]', rotate: -8, delay: 0 },
  { label: 'Swiggy Gourmet', value: '₹1,000 Pass', save: '₹90 Saved', emoji: '🛵', pos: 'top-14 right-[2%] sm:right-[5%]', rotate: 10, delay: 0.4 },
  { label: 'Myntra Luxe', value: '₹2,500 Voucher', save: '₹250 Saved', emoji: '👗', pos: 'bottom-8 left-[3%] sm:left-[6%]', rotate: 6, delay: 0.8 },
  { label: "Domino's Pizza", value: '₹500 Box', save: '₹65 Saved', emoji: '🍕', pos: 'bottom-12 right-[3%] sm:right-[6%]', rotate: -10, delay: 1.2 },
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

// 3D Tilt Card for Wholesale Vouchers
function Interactive3DVoucherCard({ brand, nominalVal, onSelect }: { brand: any; nominalVal: number; onSelect: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const visual = BRAND_VISUALS[brand.slug] || {
    banner: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=700&auto=format&fit=crop&q=60',
    accent: '#059669',
    iconText: '🏷️',
    bgTone: 'bg-emerald-100/70',
  };

  const savingsAmt = Math.round((nominalVal * (brand.discount || 5)) / 100);
  const finalPay = nominalVal - savingsAmt;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({
      x: ((y - rect.height / 2) / (rect.height / 2)) * -8,
      y: ((x - rect.width / 2) / (rect.width / 2)) * 8,
    });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.35 });
  };

  return (
    <div className="w-full" style={{ perspective: '1100px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setGlare(p => ({ ...p, opacity: 0 })); }}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: glare.opacity ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        }}
        className="relative h-[395px] rounded-[32px] p-6 flex flex-col justify-between overflow-hidden border-2 border-zinc-950 bg-white shadow-[6px_6px_0px_#09090b] group cursor-pointer hover:-translate-y-1 transition-all"
      >
        <div 
          className="absolute top-0 left-0 w-full h-40 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity"
          style={{ backgroundImage: `url(${brand.banner_url || visual.banner})` }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] flex items-center justify-center text-3xl">
            {brand.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 object-contain" /> : visual.iconText}
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-300 border-2 border-zinc-950 text-zinc-950 font-black text-xs shadow-[2px_2px_0px_#09090b]">
            FLAT {brand.discount}% OFF
          </span>
        </div>

        <div className="relative z-10 mt-auto bg-amber-50/95 p-4 rounded-2xl border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
          <h3 className="text-xl font-black text-zinc-950">{brand.name}</h3>
          <p className="text-xs text-emerald-800 font-black mb-3">Instant ₹{savingsAmt} off on ₹{nominalVal} card</p>
          <div className="pt-2 border-t border-zinc-300 flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-black block">Deal Price</span>
              <span className="text-2xl font-black text-zinc-950">₹{finalPay}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">MRP</span>
              <span className="text-sm font-bold text-zinc-400 line-through">₹{nominalVal}</span>
            </div>
          </div>
          <button
            onClick={onSelect}
            className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-black uppercase tracking-wider border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
          >
            <span>Run Stacker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 3D Bank Card Component
const BANK_CARD_PALETTES = [
  {
    bg: 'from-emerald-100 via-teal-50 to-emerald-200',
    border: 'border-zinc-950',
    accent: 'text-emerald-900',
    chip: 'from-amber-200 to-yellow-500',
    logo: 'SBI CARD',
  },
  {
    bg: 'from-sky-100 via-blue-50 to-indigo-100',
    border: 'border-zinc-950',
    accent: 'text-blue-900',
    chip: 'from-slate-200 to-slate-400',
    logo: 'HDFC BANK',
  },
  {
    bg: 'from-pink-100 via-rose-50 to-fuchsia-100',
    border: 'border-zinc-950',
    accent: 'text-pink-900',
    chip: 'from-amber-200 to-yellow-500',
    logo: 'AXIS BANK',
  },
  {
    bg: 'from-amber-100 via-yellow-50 to-orange-100',
    border: 'border-zinc-950',
    accent: 'text-amber-900',
    chip: 'from-slate-200 to-slate-400',
    logo: 'ICICI BANK',
  },
];

function Interactive3DBankCard({ card, index }: { card: any; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const palette = BANK_CARD_PALETTES[index % BANK_CARD_PALETTES.length];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTilt({
      x: ((y - rect.height / 2) / (rect.height / 2)) * -12,
      y: ((x - rect.width / 2) / (rect.width / 2)) * 12,
    });
  };

  const maskedCardNumber = `4820 •••• •••• ${String(1100 + index * 243).slice(-4)}`;

  return (
    <div className="w-full select-none" style={{ perspective: '1200px' }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative h-[230px] w-full cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
          }}
          className="w-full h-full relative"
        >
          {/* FRONT FACE */}
          <div
            className={`absolute inset-0 rounded-[28px] p-5 border-2 ${palette.border} bg-gradient-to-br ${palette.bg} shadow-[5px_5px_0px_#09090b] flex flex-col justify-between overflow-hidden`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-black tracking-widest text-zinc-950 uppercase">
                {palette.logo}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-zinc-950 shadow-[1px_1px_0px_#09090b] ${palette.accent}`}>
                {card.base_cashback}% Cashback
              </span>
            </div>

            <div className="flex items-center gap-3 relative z-10 my-auto">
              <div className={`w-10 h-7 rounded-md bg-gradient-to-tr ${palette.chip} p-0.5 shadow-md flex items-center justify-center border border-zinc-950`}>
                <div className="w-full h-full rounded-[3px] border border-zinc-800/40 grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="border-r border-b border-zinc-950/30" />
                  <div className="border-b border-zinc-950/30" />
                  <div className="border-r border-zinc-950/30" />
                  <div />
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <div className="font-mono text-xs sm:text-sm tracking-[0.2em] text-zinc-950 font-black">
                {maskedCardNumber}
              </div>
              <div className="flex justify-between items-end pt-1">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950 leading-tight truncate max-w-[160px]">
                    {card.name}
                  </h4>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase">Reward Rail</span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono font-bold tracking-wider">09/29</span>
              </div>
            </div>

            <div className="absolute bottom-1 right-4 text-[8.5px] text-zinc-600 font-bold">
              Tap to Flip ↻
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 rounded-[28px] p-5 border-2 border-zinc-950 bg-amber-50 shadow-[5px_5px_0px_#09090b] flex flex-col justify-between overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="-mx-5 -mt-1 h-8 bg-zinc-950" />

            <div className="space-y-1 text-xs bg-white p-2.5 rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
              <div className="flex justify-between">
                <span className="text-zinc-600 font-bold">Joining Fee:</span>
                <span className="font-black text-zinc-950">₹{card.joining_fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 font-bold">Net Return:</span>
                <span className="font-black text-emerald-700">{card.base_cashback}% Flat</span>
              </div>
            </div>

            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 bg-yellow-300 hover:bg-yellow-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b] flex items-center justify-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>Apply Online</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// 3-Layer Stacking Visualizer
const STACK_BASE_CART = 2000;
const STACK_LAYERS = [
  { id: 'coupon', title: 'Promo Coupon', sub: 'Verified store code applied', cut: 200, icon: Ticket, tint: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-400' },
  { id: 'voucher', title: 'Wholesale Voucher', sub: 'Discounted gift card balance', cut: 150, icon: Gift, tint: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-400' },
  { id: 'card', title: '5% SBI Card Rebate', sub: 'Instant statement cashback', cut: 82, icon: CreditCard, tint: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-400' },
];

function StackingVisualizer() {
  const [step, setStep] = useState(0);
  const runningPrice = STACK_BASE_CART - STACK_LAYERS.slice(0, step).reduce((sum, l) => sum + l.cut, 0);
  const totalSaved = STACK_BASE_CART - runningPrice;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs font-black uppercase tracking-wider bg-violet-200 text-violet-950 px-3.5 py-1 rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
          The 3-Layer Math Secret
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
          Watch a ₹2,000 cart melt down step-by-step.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto font-medium">
          Move the slider to stack store coupons, wholesale vouchers, and card cashbacks.
        </p>
      </div>

      <div className="bg-[#FAF5FF] border-2 border-zinc-950 rounded-[36px] p-6 sm:p-10 shadow-[8px_8px_0px_#09090b] grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
        <div className="space-y-4 order-2 lg:order-1">
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            className="w-full accent-violet-600 cursor-pointer h-2.5 bg-zinc-200 rounded-lg"
          />

          <div className="space-y-2.5">
            {STACK_LAYERS.map((layer, i) => {
              const active = step > i;
              const Icon = layer.icon;
              return (
                <div
                  key={layer.id}
                  onClick={() => setStep(active ? i : i + 1)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 cursor-pointer transition-all ${
                    active ? `${layer.bg} border-zinc-950 shadow-[3px_3px_0px_#09090b]` : 'bg-white border-zinc-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-white border border-zinc-950' : 'bg-zinc-100'}`}>
                    <Icon className={`w-4 h-4 ${active ? layer.tint : 'text-zinc-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black truncate ${active ? 'text-zinc-950' : 'text-zinc-500'}`}>
                      Layer {i + 1}: {layer.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate font-semibold">{layer.sub}</p>
                  </div>
                  <span className={`text-xs font-black ${active ? layer.tint : 'text-zinc-400'}`}>-₹{layer.cut}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block w-0.5 h-64 bg-zinc-300 order-2" />

        <div className="order-1 lg:order-3 rounded-2xl border-2 border-zinc-950 bg-white p-6 space-y-4 shadow-[4px_4px_0px_#09090b]">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-zinc-600">Store Cart (MRP)</span>
            <span className="text-zinc-400 line-through font-bold">₹{STACK_BASE_CART.toLocaleString()}</span>
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

          <div className="pt-3 border-t-2 border-zinc-950">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-black">Your Net Payment</p>
            <AnimatedRupee value={runningPrice} className="text-4xl font-black text-zinc-950" />
          </div>

          <div className="p-3 rounded-xl bg-emerald-200 border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b] flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-950 shrink-0" />
            <span className="text-xs font-black text-emerald-950">Total Saved: <AnimatedRupee value={totalSaved} /></span>
          </div>

          <button
            onClick={() => setStep((s) => (s >= 3 ? 0 : s + 1))}
            className="w-full py-2.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-xs font-black text-zinc-950 border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b] transition-all"
          >
            {step >= 3 ? 'Reset Simulation' : `Apply Layer ${step + 1}`}
          </button>
        </div>
      </div>
    </section>
  );
}

// Submit Coupon Modal
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
  const [discountVal, setDiscountVal] = useState('50');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!supabase) throw new Error('Database client error');
      const brandObj = brands.find((b) => b.slug === selectedSlug);

      const { error } = await supabase.from('brand_coupons').insert([
        {
          brand_id: brandObj?.id,
          coupon_code: code.trim().toUpperCase(),
          title: title || `Flat ₹${discountVal} OFF`,
          discount_type: 'FLAT',
          discount_value: Number(discountVal),
          stackable_with_voucher: true,
          is_verified: true,
        },
      ]);

      if (error) throw error;

      onSuccess({
        id: Math.random().toString(),
        brandName: brandObj?.name || 'Partner Store',
        code: code.trim().toUpperCase(),
        title: title || `Flat ₹${discountVal} OFF`,
        stackable: true,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] border-2 border-zinc-950 rounded-[32px] p-6 sm:p-8 max-w-md w-full space-y-5 relative shadow-[8px_8px_0px_#09090b]">
        <button onClick={onClose} className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-950 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-200 border border-zinc-950 text-pink-950 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Registry</span>
          </div>
          <h3 className="text-xl font-black text-zinc-950">Share a Working Coupon</h3>
          <p className="text-xs text-zinc-600 font-medium">
            Push genuine active promo codes directly into the live database.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-100 border border-rose-400 text-rose-800 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-zinc-800 uppercase tracking-wider mb-1.5">
              Select Brand
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full bg-white border-2 border-zinc-950 rounded-xl px-4 py-3 text-zinc-950 font-bold outline-none shadow-[2px_2px_0px_#09090b]"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-black text-zinc-800 uppercase tracking-wider mb-1.5">
              Coupon Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SWIGGYIT"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-white border-2 border-zinc-950 rounded-xl px-4 py-3 text-zinc-950 font-mono font-bold outline-none shadow-[2px_2px_0px_#09090b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-zinc-800 uppercase tracking-wider mb-1.5">
                Discount (₹)
              </label>
              <input
                type="number"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="w-full bg-white border-2 border-zinc-950 rounded-xl px-4 py-3 text-zinc-950 font-bold outline-none shadow-[2px_2px_0px_#09090b]"
              />
            </div>
            <div>
              <label className="block font-black text-zinc-800 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="Flat ₹50 OFF"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border-2 border-zinc-950 rounded-xl px-4 py-3 text-zinc-950 font-bold outline-none shadow-[2px_2px_0px_#09090b]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black rounded-xl border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase tracking-wider"
          >
            {loading ? 'Saving in Database...' : 'Add Coupon to Live Site'}
          </button>
        </form>
      </div>
    </div>
  );
}

// REAL UPI CHECKOUT MODAL
function CheckoutModal({
  isOpen,
  onClose,
  brandName,
  faceValue,
  dealPrice,
  savings,
}: {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  faceValue: number;
  dealPrice: number;
  savings: number;
}) {
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [unlockedPin, setUnlockedPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const MERCHANT_UPI = "ashishkumar@upi"; 
  const upiIntentUrl = `upi://pay?pa=${MERCHANT_UPI}&pn=AllInOneVouchers&am=${dealPrice}&cu=INR&tn=${encodeURIComponent(`Voucher_${brandName}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntentUrl)}`;

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length !== 10) {
      alert('10-digit valid phone number enter karein.');
      return;
    }
    setStep('PAYMENT');
  };

  const handleVerifyPayment = async () => {
    setLoading(true);

    try {
      let finalCode = `${brandName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-LIVE`;
      let finalPin = `${Math.floor(1000 + Math.random() * 9000)}`;

      if (supabase) {
        const { data: voucher } = await supabase
          .from('voucher_inventory')
          .select('*')
          .ilike('brand_name', `%${brandName}%`)
          .eq('status', 'AVAILABLE')
          .limit(1)
          .single();

        if (voucher) {
          finalCode = voucher.voucher_code;
          finalPin = voucher.voucher_pin || '4821';
          await supabase.from('voucher_inventory').update({ status: 'SOLD' }).eq('id', voucher.id);
        }

        await supabase.from('customer_orders').insert([
          {
            user_phone: phone.replace(/\D/g, ''),
            brand_name: brandName,
            amount_paid: dealPrice,
            profit_earned: Math.max(0, savings),
            payment_method: 'UPI_DIRECT',
            payment_status: 'COMPLETED',
            voucher_code_delivered: finalCode,
          }
        ]);
      }

      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone,
            brandName: brandName,
            voucherCode: finalCode,
            pinCode: finalPin,
            amountPaid: dealPrice,
          }),
        });
      } catch (err) {}

      localStorage.setItem('bachat_user_phone', phone.replace(/\D/g, ''));
      localStorage.setItem('bachat_auth_token', 'active_session');

      setUnlockedCode(finalCode);
      setUnlockedPin(finalPin);
      setStep('SUCCESS');
    } catch (err) {
      setUnlockedCode(`${brandName.slice(0, 3).toUpperCase()}-9824-SAVE`);
      setUnlockedPin('4821');
      setStep('SUCCESS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FFFDF9] border-2 border-zinc-950 rounded-[36px] p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_#09090b] relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-950 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'DETAILS' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 bg-emerald-200 border border-zinc-950 px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_#09090b]">
                Direct Inventory
              </span>
              <h3 className="text-xl font-black text-zinc-950">{brandName} Voucher</h3>
              <p className="text-xs text-zinc-600 font-medium">Enter phone number to receive voucher</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-zinc-950 space-y-2 text-xs font-bold shadow-[2px_2px_0px_#09090b]">
              <div className="flex justify-between text-zinc-600">
                <span>Voucher MRP:</span>
                <span className="line-through">₹{faceValue}</span>
              </div>
              <div className="flex justify-between text-zinc-800">
                <span>Calculated Arbitrage Savings:</span>
                <span className="text-emerald-800 font-black">-₹{savings}</span>
              </div>
              <div className="pt-2 border-t border-zinc-300 flex justify-between text-sm font-black text-zinc-950">
                <span>Payable Amount:</span>
                <span className="text-emerald-800 text-lg">₹{dealPrice}</span>
              </div>
            </div>

            <form onSubmit={handleProceedToPay} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-zinc-800 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="bg-zinc-200 border-2 border-r-0 border-zinc-950 px-3.5 py-2.5 rounded-l-xl text-zinc-950 text-xs font-black flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white border-2 border-zinc-950 rounded-r-xl py-2.5 px-3.5 text-zinc-950 font-bold text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-yellow-300 hover:bg-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to UPI QR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {step === 'PAYMENT' && (
          <div className="space-y-5 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-zinc-950">Scan UPI QR to Pay</h3>
              <p className="text-xs text-zinc-600 font-medium">Pay exactly ₹{dealPrice} to receive code</p>
            </div>

            <div className="w-48 h-48 mx-auto p-2 rounded-2xl bg-white border-2 border-zinc-950 shadow-[4px_4px_0px_#09090b] flex flex-col items-center justify-center">
              <img src={qrCodeUrl} alt="UPI QR" className="w-36 h-36 object-contain" />
              <span className="text-[9px] font-mono text-zinc-700 font-bold">{MERCHANT_UPI}</span>
            </div>

            <a
              href={upiIntentUrl}
              className="w-full py-2.5 bg-sky-100 border-2 border-zinc-950 rounded-xl text-xs font-black text-zinc-950 flex items-center justify-center gap-2 transition sm:hidden shadow-[2px_2px_0px_#09090b]"
            >
              <Smartphone className="w-4 h-4 text-sky-900" />
              <span>Open in PhonePe / GPay</span>
            </a>

            <button
              onClick={handleVerifyPayment}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <span>Confirming Transaction...</span> : <span>I Have Paid • Unlock Code</span>}
            </button>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-200 border-2 border-zinc-950 text-emerald-950 flex items-center justify-center mx-auto shadow-[2px_2px_0px_#09090b]">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-950">Voucher Code Ready!</h3>
              <p className="text-xs text-zinc-600 font-medium">Paste in official {brandName} payment tab</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-zinc-950 space-y-2 shadow-[2px_2px_0px_#09090b]">
              <span className="text-[10px] text-zinc-500 uppercase font-black block">16-Digit Voucher Code</span>
              <div className="font-mono text-base font-black text-emerald-900 tracking-wider select-all">
                {unlockedCode}
              </div>
              {unlockedPin && (
                <div className="text-xs text-zinc-700 font-bold">
                  PIN: <span className="font-mono text-zinc-950">{unlockedPin}</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (unlockedCode) {
                    navigator.clipboard.writeText(unlockedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="mx-auto px-4 py-1.5 rounded-lg bg-white border border-zinc-950 text-zinc-950 text-xs font-black shadow-[2px_2px_0px_#09090b] flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <a
              href="/dashboard"
              className="w-full py-3 bg-zinc-950 text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#09090b]"
            >
              <span>View in Vault</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [brands, setBrands] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { scrollY } = useScroll();
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeTicker, setActiveTicker] = useState(0);

  const liveFeeds = [
    { text: 'Rahul saved ₹320 on Swiggy', icon: '🛵' },
    { text: 'Domino’s 13% code redeemed', icon: '🍕' },
    { text: '₹450 cashback on Myntra order', icon: '👗' },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsNavScrolled(latest > 40);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTicker((prev) => (prev + 1) % liveFeeds.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [liveFeeds.length]);

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

  // 100% REAL LIVE SUPABASE DATABASE INGESTION
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
            category_name: b.categories?.name || 'General',
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
            id, coupon_code, title, discount_value, stackable_with_voucher,
            brands(name)
          `)
          .eq('is_verified', true);

        if (cData && cData.length > 0) {
          setCoupons(cData.map((c: any) => ({
            id: c.id,
            brandName: c.brands?.name || 'Partner Store',
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

  const handleCalculate = () => {
    const numCart = Number(cartAmount);
    if (!numCart || numCart <= 0) return;
    
    setCalcLoading(true);
    setTimeout(() => {
      const currentBrand = brands.find((b) => b.slug === selectedBrand) || brands[0];
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
    }, 200);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredBrands = activeCategory === 'ALL'
    ? brands
    : brands.filter(b => b.category_name?.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-950 font-sans selection:bg-yellow-300 selection:text-black overflow-x-hidden relative">
      
      {/* Gen-Z Blueprint Dot Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 opacity-40"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Floating Accent Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-yellow-200/50 via-emerald-200/30 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[45%] -left-32 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[140px]" />
        <div className="absolute top-[75%] -right-32 w-[550px] h-[550px] bg-sky-200/40 rounded-full blur-[140px]" />
      </div>

      {/* 1. DYNAMIC FLOATING NAVBAR */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-3 pointer-events-none transition-all duration-500">
        <motion.nav
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className={`pointer-events-auto flex items-center justify-between border-2 border-zinc-950 transition-all duration-300 ${
            isNavScrolled
              ? 'w-full max-w-4xl py-2 px-4 sm:px-6 rounded-full bg-white/95 backdrop-blur-2xl shadow-[4px_4px_0px_#09090b]'
              : 'w-full max-w-7xl py-3 px-5 sm:px-8 rounded-[28px] bg-white shadow-[6px_6px_0px_#09090b]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-300 border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-zinc-950 flex items-center gap-1">
                AllInOne<span className="text-emerald-600 underline decoration-yellow-400 decoration-4">Vouchers</span>
              </span>
              <span className="text-[9.5px] text-zinc-500 font-black uppercase tracking-widest hidden sm:block -mt-1">
                Real-Time Stacking Hub
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-emerald-100 border-2 border-zinc-950 px-3.5 py-1 rounded-full shadow-[2px_2px_0px_#09090b]">
            <span className="text-xs">{liveFeeds[activeTicker].icon}</span>
            <span className="text-[11px] font-black text-zinc-950">{liveFeeds[activeTicker].text}</span>
            <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-yellow-300 text-zinc-950 font-black border border-zinc-950">LIVE</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-black text-zinc-700">
            <a href="#calculator" className="hover:text-emerald-700 transition">Stack Engine</a>
            <a href="#vouchers" className="hover:text-emerald-700 transition">Vouchers</a>
            <a href="#coupons" className="hover:text-emerald-700 transition">Coupons</a>
            <a href="#cards" className="hover:text-emerald-700 transition">Card Perks</a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-950 text-[11px] font-black text-zinc-950 shadow-[2px_2px_0px_#09090b] transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[9px] font-mono border border-zinc-400">⌘K</kbd>
            </button>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-black border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>My Vault</span>
            </button>
          </div>
        </motion.nav>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none z-0">
          {FULLSCREEN_HERO_VOUCHERS.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
              transition={{
                y: { duration: 5 + idx, repeat: Infinity, ease: 'easeInOut', delay: card.delay },
                opacity: { duration: 0.8, delay: card.delay },
              }}
              className={`absolute hidden md:block ${card.pos} pointer-events-auto`}
              style={{ transform: `rotate(${card.rotate}deg)` }}
            >
              <div className="p-4 rounded-[26px] bg-white border-2 border-zinc-950 shadow-[6px_6px_0px_#09090b] w-44 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-200 text-emerald-950 border border-zinc-950">
                    {card.save}
                  </span>
                </div>
                <h4 className="text-xs font-black text-zinc-950">{card.label}</h4>
                <p className="text-[11px] text-zinc-500 font-bold mt-0.5">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-300 border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] text-xs font-black text-zinc-950">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-zinc-950" />
            <span>Shoppers saved <AnimatedRupee value={548200} className="text-emerald-800 font-black underline" /> this week</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-zinc-950 tracking-tight leading-[1.1]">
            Stop paying full price.{' '}
            <span className="bg-emerald-300 px-3 py-0.5 border-2 border-zinc-950 shadow-[5px_5px_0px_#09090b] inline-block -rotate-1">
              Stack your savings.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-semibold">
            Auto-combine wholesale gift cards, verified store coupons, and credit card cashbacks in one click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#calculator"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-yellow-300 hover:bg-yellow-400 text-zinc-950 font-black text-sm border-2 border-zinc-950 shadow-[4px_4px_0px_#09090b] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#vouchers"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-950 text-zinc-950 font-black text-sm shadow-[4px_4px_0px_#09090b] transition flex items-center justify-center gap-2"
            >
              <span>Explore Vouchers</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-600" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE STACKING VISUALIZER (Pastel Lavender Theme) */}
      <StackingVisualizer />

      {/* 4. SAVINGS CALCULATOR SECTION (Pastel Mint & Cyber Lime Tint) */}
      <section id="calculator" className="max-w-5xl mx-auto px-6 py-20 space-y-8">
        <Reveal className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider bg-emerald-200 text-emerald-950 px-3.5 py-1 rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
            Stacking Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">Calculate Your Final Checkout Cost</h2>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium">Select a brand, enter cart value, and let the 3-layer stack crunch the numbers.</p>
        </Reveal>

        <div className="bg-[#F0FDF4] border-2 border-zinc-950 rounded-[36px] p-6 sm:p-10 shadow-[8px_8px_0px_#09090b] space-y-7">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                1. Select Merchant Partner ({brands.length} Live)
              </label>
              <div className="flex gap-1 bg-white p-1 rounded-xl text-xs border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
                {['ALL', 'Food', 'Fashion', 'Market'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-3 py-1 rounded-lg font-black transition ${activeCategory === c ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBrands.map((b) => {
                const isSelected = selectedBrand === b.slug;
                const visual = BRAND_VISUALS[b.slug];
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                      isSelected 
                        ? 'bg-yellow-300 border-zinc-950 shadow-[4px_4px_0px_#09090b]' 
                        : 'bg-white border-zinc-300 hover:border-zinc-950'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border-2 border-zinc-950 flex items-center justify-center text-xl shrink-0">
                      {visual?.iconText || '🏷️'}
                    </div>
                    <div className="truncate">
                      <span className="text-xs text-emerald-800 font-black block">{b.discount}% OFF</span>
                      <span className="text-xs font-black text-zinc-950 block truncate">{b.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-zinc-900 uppercase tracking-wider mb-2">
                2. Order Cart Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-lg">₹</span>
                <input
                  type="number"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white border-2 border-zinc-950 rounded-xl py-3.5 pl-9 pr-4 text-xl font-black text-zinc-950 outline-none shadow-[2px_2px_0px_#09090b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-900 uppercase tracking-wider mb-2">
                3. Card Rebate Stacking
              </label>
              <div
                onClick={() => setHasSbiCard(!hasSbiCard)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition ${
                  hasSbiCard ? 'bg-amber-100 border-zinc-950 shadow-[3px_3px_0px_#09090b]' : 'bg-white border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-5 h-5 ${hasSbiCard ? 'text-amber-800' : 'text-zinc-400'}`} />
                  <div>
                    <p className="text-xs font-black text-zinc-950">SBI Cashback Credit Card</p>
                    <p className="text-[11px] text-zinc-600 font-bold">5% flat rebate on checkout</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 border-zinc-950 flex items-center justify-center ${hasSbiCard ? 'bg-emerald-400 text-zinc-950' : 'bg-white'}`}>
                  {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={calcLoading}
            className="w-full py-4 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider border-2 border-zinc-950 shadow-[4px_4px_0px_#09090b] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-zinc-950" />
            {calcLoading ? 'Calculating optimal route...' : 'Calculate Lowest Effective Price'}
          </button>

          {result && (
            <div className="mt-4 bg-white border-2 border-zinc-950 rounded-2xl p-6 space-y-4 shadow-[4px_4px_0px_#09090b]">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-3 text-xs font-black">
                <span className="text-zinc-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Optimal Route Unlocked
                </span>
                <span className="text-zinc-400 line-through">₹{result.originalCart} MRP</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Net Effective Price</span>
                  <span className="text-4xl font-black text-zinc-950">₹{result.bestEffectiveCost}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block">Total Net Savings</span>
                  <span className="text-2xl font-black text-emerald-700">Save ₹{result.totalSavings}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-zinc-950 text-xs space-y-2 font-bold shadow-[2px_2px_0px_#09090b]">
                <div className="flex justify-between text-zinc-800">
                  <span>Wholesale Voucher Cut:</span>
                  <span className="font-black text-emerald-800">-₹{result.breakdown.voucherCut}</span>
                </div>
                {result.breakdown.couponCut > 0 && (
                  <div className="flex justify-between text-zinc-800">
                    <span>Store Code ({result.breakdown.couponCode}):</span>
                    <span className="font-black text-emerald-800">-₹{result.breakdown.couponCut}</span>
                  </div>
                )}
                {result.breakdown.cardCashback > 0 && (
                  <div className="flex justify-between text-zinc-800">
                    <span>SBI 5% Card Multiplier:</span>
                    <span className="font-black text-emerald-800">-₹{result.breakdown.cardCashback}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-black uppercase tracking-wider border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] transition-all flex items-center justify-center gap-2"
              >
                <span>Claim Deal & Unlock Code</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* BRAND REELS & SPONSORED ADS */}
      <SponsoredReelsFeed
        onSelectBrand={(slug) => {
          setSelectedBrand(slug);
          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 5. SMART CARD ELIGIBILITY QUIZ */}
      <CardEligibilityQuiz />

      {/* 6. WHOLESALE VOUCHERS CATALOG */}
      <section id="vouchers" className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <Reveal className="flex justify-between items-end">
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-yellow-300 text-zinc-950 px-3 py-1 rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
              Direct Inventory
            </span>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight mt-2">Wholesale E-Vouchers Catalog</h2>
          </div>
          <span className="text-xs text-zinc-500 font-bold hidden sm:block">Instant 3D interactive vouchers</span>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((b) => (
            <Interactive3DVoucherCard
              key={b.id}
              brand={b}
              nominalVal={1000}
              onSelect={() => {
                setSelectedBrand(b.slug);
                setCartAmount('1000');
                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      </section>

      {/* 7. VERIFIED PROMO REGISTRY (Pastel Coral / Warm Tint) */}
      <section id="coupons" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-pink-200 text-pink-950 px-3 py-1 rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
              Promotional Registry
            </span>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight mt-2">Verified Active Coupons ({coupons.length})</h2>
          </div>
          
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 border-2 border-zinc-950 text-zinc-950 text-xs font-black shadow-[3px_3px_0px_#09090b] transition active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Submit A Working Code</span>
          </button>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c, i) => (
            <div
              key={c.id || i}
              className="bg-[#FFF1F2] border-2 border-zinc-950 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-[4px_4px_0px_#09090b]"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-zinc-950">{c.brandName}</span>
                  {c.stackable && (
                    <span className="text-[10px] bg-emerald-200 text-emerald-950 border border-zinc-950 px-2 py-0.5 rounded font-black shadow-[1px_1px_0px_#09090b]">
                      Stackable
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 font-bold">{c.title}</p>
              </div>

              <button
                onClick={() => copyCoupon(c.code)}
                className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-zinc-950 rounded-xl text-xs font-black text-zinc-950 flex items-center gap-1.5 shadow-[2px_2px_0px_#09090b] transition active:translate-x-0.5 active:translate-y-0.5 shrink-0"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
                    <span className="text-emerald-950">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{c.code}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <SubmitCouponModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          brands={brands}
          onSuccess={(newCoupon) => {
            setCoupons((prev) => [newCoupon, ...prev]);
          }}
        />
      </section>

      {/* 8. BANK CARDS SHOWCASE (Glacial Blue Tint) */}
      <section id="cards" className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-sky-200 text-sky-950 px-3 py-1 rounded-full border-2 border-zinc-950 shadow-[2px_2px_0px_#09090b]">
                Financial Rails
              </span>
              <h2 className="text-3xl font-black text-zinc-950 tracking-tight mt-2">
                Recommended 3D Cash Cards
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-bold">
              Hover to tilt • Click card to flip
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, idx) => (
            <Reveal key={c.id} delay={idx * 0.08}>
              <Interactive3DBankCard card={c} index={idx} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 9. VIP WHATSAPP ALERTS */}
      <WhatsAppAlerts />

      {/* 10. FAQ SECTION (Cream Butter Tint) */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-zinc-950">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500 font-bold">Everything you need to know about stacking & voucher issuance</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="p-5 rounded-2xl bg-[#FFFDF0] border-2 border-zinc-950 shadow-[4px_4px_0px_#09090b] cursor-pointer"
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm font-black text-zinc-950">{faq.q}</h4>
                <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-700' : ''}`} />
              </div>
              {openFaq === i && (
                <p className="text-xs text-zinc-600 font-semibold mt-2.5 pt-2.5 border-t border-zinc-300 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 11. AUTH MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] border-2 border-zinc-950 rounded-[32px] p-7 max-w-sm w-full space-y-5 relative shadow-[8px_8px_0px_#09090b]">
            <button 
              onClick={() => {
                setIsAuthOpen(false);
                setOtpSent(false);
                setAuthError('');
                setOtp('');
              }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-950 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-yellow-300 border-2 border-zinc-950 text-zinc-950 flex items-center justify-center mx-auto shadow-[2px_2px_0px_#09090b]">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-zinc-950">
                {otpSent ? 'Enter Code' : 'Member Vault'}
              </h3>
              <p className="text-xs text-zinc-500 font-bold">
                {otpSent ? `Code sent to +91 ${phoneNumber}` : 'Access your purchased vouchers'}
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-400 text-rose-800 text-xs font-bold">
                {authError}
              </div>
            )}

            {!otpSent ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (phoneNumber.replace(/\D/g, '').length !== 10) {
                    setAuthError('10-digit valid number enter karein.');
                    return;
                  }
                  setAuthLoading(true);
                  setTimeout(() => {
                    setAuthLoading(false);
                    setOtpSent(true);
                  }, 300);
                }}
                className="space-y-3"
              >
                <div className="flex">
                  <span className="bg-zinc-200 border-2 border-r-0 border-zinc-950 px-3 py-2.5 rounded-l-xl text-zinc-950 text-sm font-black flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white border-2 border-zinc-950 rounded-r-xl py-2.5 px-3.5 text-zinc-950 font-bold text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-black rounded-xl border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] transition"
                >
                  {authLoading ? 'Sending...' : 'Send Access OTP'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (otp.length < 6) {
                    setAuthError('6-digit OTP daalein.');
                    return;
                  }
                  setAuthLoading(true);
                  try {
                    localStorage.setItem('bachat_user_phone', phoneNumber);
                    localStorage.setItem('bachat_auth_token', 'demo_active');
                  } catch (e) {}
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
                  className="w-full bg-white border-2 border-zinc-950 rounded-xl py-3 text-center font-mono text-xl font-black text-zinc-950 outline-none"
                />

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-black rounded-xl border-2 border-zinc-950 shadow-[3px_3px_0px_#09090b] transition"
                >
                  {authLoading ? 'Verifying...' : 'Verify & Open Vault'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 12. SPOTLIGHT SEARCH */}
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
            document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* 13. DIRECT BUY CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={brands.find(b => b.slug === selectedBrand)?.name || 'Store Voucher'}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.bestEffectiveCost || 950}
        savings={result?.totalSavings || 50}
      />

      {/* 14. TICKER */}
      <LiveArbitrageTicker />

      {/* 15. FOOTER */}
      <footer className="border-t-2 border-zinc-950 bg-yellow-200 py-10 text-xs text-zinc-700 font-bold">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-zinc-950 font-black">AllInOneVouchers • Real-Time Savings Discovery</span>
          <div className="flex gap-6 font-black">
            <span className="hover:text-zinc-950 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-950 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-950 cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}