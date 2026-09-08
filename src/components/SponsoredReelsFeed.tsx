'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShoppingBag, 
  ArrowUpRight, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  BadgePercent
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReelItem {
  id: string;
  brand_name: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  description: string;
  deal_tag: string;
  is_sponsored: boolean;
  target_brand_slug: string;
  cta_url?: string;
}

// 100% Reliable, Fast CDN MP4 Streams (No hotlink blocking)
const DEFAULT_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    brand_name: "Domino's Pizza",
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Flat 13% Domino’s Arbitrage Stack',
    description: 'Combine wholesale gift vouchers with code DOM50 to unlock instant savings on family meals.',
    deal_tag: '13% Instant OFF',
    is_sponsored: true,
    target_brand_slug: 'dominos'
  },
  {
    id: 'reel-2',
    brand_name: 'Swiggy Gourmet',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Cut Dining Bills with Dual Layer Stacking',
    description: 'Swiggy Money discounted vouchers plus 5% monthly credit card billing rebate verified live.',
    deal_tag: 'Save ₹180',
    is_sponsored: false,
    target_brand_slug: 'swiggy'
  },
  {
    id: 'reel-3',
    brand_name: 'Myntra Fashion',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'Cart Stacking on Footwear & Apparel',
    description: 'Stack seasonal promo codes with instant brand voucher balance for the lowest checkout rate.',
    deal_tag: 'Save ₹420',
    is_sponsored: true,
    target_brand_slug: 'myntra'
  }
];

export default function SponsoredReelsFeed({ onSelectBrand }: { onSelectBrand: (slug: string) => void }) {
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic Supabase load
  useEffect(() => {
    async function loadReels() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('sponsored_reels')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          setReels(data);
        }
      } catch (err) {
        console.warn('Using standard video feeds');
      }
    }
    loadReels();
  }, []);

  // Safe Video Play Trigger on Index Change
  useEffect(() => {
    setVideoLoaded(false);
    const video = videoRef.current;
    if (!video) return;

    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setVideoLoaded(true);
        })
        .catch(() => {
          // Fallback if browser requires user gesture
          setIsPlaying(false);
        });
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const nextReel = () => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const prevReel = () => {
    setCurrentIndex((prev) => (prev === 0 ? reels.length - 1 : prev - 1));
  };

  const currentReel = reels[currentIndex];

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-black" />
            <span>Verified Savings Proof</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Watch & Unlock Instant Stacking Deals
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-sm font-medium">
          Real-time video demonstrations of voucher and promo code stacking. Click any deal to load instantly in the engine.
        </p>
      </div>

      {/* Main Workstation Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: 9:16 Vertical Reel Player */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[340px] h-[580px] rounded-[36px] overflow-hidden border border-zinc-800 bg-[#0C0D14] shadow-2xl group">
            
            {/* Native Video Element with Safe Autoplay */}
            <video
              ref={videoRef}
              src={currentReel.video_url}
              playsInline
              muted={isMuted}
              loop
              autoPlay
              preload="auto"
              onCanPlay={() => setVideoLoaded(true)}
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer bg-zinc-950"
            />

            {/* Top Bar: Sponsored / Verified Status & Volume Control */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              {currentReel.is_sponsored ? (
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-wider uppercase text-white flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>Partner: {currentReel.brand_name}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-wider uppercase text-zinc-200">
                  Verified Stacking
                </span>
              )}

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition hover:bg-black pointer-events-auto shadow-md"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Pause Overlay Indicator */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                  <Play className="w-7 h-7 fill-black translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Bottom Floating Details Box */}
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black via-black/85 to-transparent z-20 space-y-3">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-white/10 border border-white/20 text-white">
                  {currentReel.deal_tag}
                </span>
                <h3 className="text-base font-black text-white leading-snug drop-shadow-md">
                  {currentReel.title}
                </h3>
                <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                  {currentReel.description}
                </p>
              </div>

              {/* Direct Stacker Action */}
              <button
                onClick={() => onSelectBrand(currentReel.target_brand_slug)}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Stack {currentReel.brand_name} Deal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Campaign Playlist Selector */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-black" />
                Active Campaigns ({reels.length})
              </h4>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevReel}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextReel}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center justify-center transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reel Selection Cards */}
            <div className="space-y-2.5">
              {reels.map((item, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-slate-50 border-black shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isActive ? <Play className="w-4 h-4 fill-white translate-x-0.5" /> : <FilmIcon />}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 block truncate">{item.title}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{item.brand_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.is_sponsored && (
                        <span className="text-[9px] font-black uppercase text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          Sponsored
                        </span>
                      )}
                      <span className="text-xs font-black text-emerald-600">{item.deal_tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merchant Partnership Callout */}
          <div className="p-6 rounded-[28px] bg-[#090A0F] border border-white/10 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-xs font-bold text-white block">Promote your brand on AllInOneVouchers</span>
              <p className="text-[11px] text-zinc-400 font-medium">Drive verifiable transactions via sponsored video placement.</p>
            </div>
            <a
              href="mailto:partners@allinonevouchers.com?subject=Brand%20Sponsorship%20Inquiry"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shrink-0 transition"
            >
              Partner With Us →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

function FilmIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}