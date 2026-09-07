'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const DEFAULT_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    brand_name: "Domino's Pizza",
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-taking-a-slice-of-pizza-42861-large.mp4',
    title: 'Flat 13% Secret Pizza Arbitrage',
    description: 'Wholesale Domino voucher buy karke cart par DOM50 stack karo aur ₹415 me pay karo!',
    deal_tag: '13% Instant OFF',
    is_sponsored: true,
    target_brand_slug: 'dominos'
  },
  {
    id: 'reel-2',
    brand_name: 'Swiggy Gourmet',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-serving-fresh-food-in-a-plate-42858-large.mp4',
    title: 'Dinner Bill Half Kaise Karein?',
    description: 'Swiggy Money voucher discount + 5% SBI card online rebate method.',
    deal_tag: 'Save ₹180',
    is_sponsored: false,
    target_brand_slug: 'swiggy'
  },
  {
    id: 'reel-3',
    brand_name: 'Myntra Luxe',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-looking-at-clothes-in-a-store-42863-large.mp4',
    title: 'Sneaker Haul Stacking Hack',
    description: 'Coupon code MYNTRA200 + wholesale gift card stacking live proof.',
    deal_tag: 'Flat ₹420 Saved',
    is_sponsored: true,
    target_brand_slug: 'myntra'
  }
];

export default function SponsoredReelsFeed({ onSelectBrand }: { onSelectBrand: (slug: string) => void }) {
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Supabase se dynamic sponsored videos load karo
  useEffect(() => {
    async function loadReels() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('sponsored_reels')
          .select('*')
          .order('display_order', { ascending: true });

        if (data && data.length > 0) {
          setReels(data);
        }
      } catch (err) {
        console.warn('Fallback mock reels active');
      }
    }
    loadReels();
  }, []);

  const currentReel = reels[currentIndex];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
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
    setIsPlaying(true);
  };

  const prevReel = () => {
    setCurrentIndex((prev) => (prev === 0 ? reels.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-rose-400" />
            <span>Shorts & Sponsored Deals</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Watch & Unlock Instant Savings
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-sm">
          Brand sponsored video promos & live stacking proof. Click any deal to auto-load in calculator.
        </p>
      </div>

      {/* Main Reels Workstation Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: 9:16 Vertical Reel Player */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[340px] h-[580px] rounded-[36px] overflow-hidden border-2 border-white/[0.12] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.9)] group">
            
            {/* Background Video */}
            <video
              ref={videoRef}
              key={currentReel.video_url}
              src={currentReel.video_url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Top Bar: Sponsored Tag & Sound Toggle */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              {currentReel.is_sponsored ? (
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-[10px] font-black tracking-wider uppercase text-amber-300 flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Sponsored by {currentReel.brand_name}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-wider uppercase text-white">
                  Staff Verified Hack
                </span>
              )}

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition hover:bg-black pointer-events-auto"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Play/Pause Center Indicator (shows on pause) */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-2xl animate-in zoom-in-75">
                  <Play className="w-8 h-8 fill-black translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Bottom Floating Overlay: Title, Description & Action CTA */}
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-20 space-y-3">
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  {currentReel.deal_tag}
                </span>
                <h3 className="text-base font-black text-white leading-snug drop-shadow-md">
                  {currentReel.title}
                </h3>
                <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                  {currentReel.description}
                </p>
              </div>

              {/* Direct Stacking Trigger Button */}
              <button
                onClick={() => onSelectBrand(currentReel.target_brand_slug)}
                className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Claim Offer on {currentReel.brand_name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Reel Navigation & Playlist Queue */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl bg-[#11131D] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-emerald-400" />
                Trending Brand Campaigns ({reels.length})
              </h4>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevReel}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextReel}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white flex items-center justify-center transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of Other Reels to Switch */}
            <div className="space-y-2.5">
              {reels.map((item, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-emerald-400 text-black' : 'bg-white/[0.05] text-zinc-400'
                      }`}>
                        {isActive ? <Play className="w-4 h-4 fill-black translate-x-0.5" /> : <FilmIcon />}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[10px] text-zinc-400">{item.brand_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.is_sponsored && (
                        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          Ad Deal
                        </span>
                      )}
                      <span className="text-xs font-black text-emerald-400">{item.deal_tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Brand Monetization Callout */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white block">Are you a merchant or brand?</span>
              <p className="text-[11px] text-zinc-400">Promote your e-vouchers & products with targeted high-conversion short reels.</p>
            </div>
            <a
              href="mailto:partners@allinonevouchers.com?subject=Brand%20Sponsorship%20Inquiry"
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-bold text-xs shrink-0 transition"
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