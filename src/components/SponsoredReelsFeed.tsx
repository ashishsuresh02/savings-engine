'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Film
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
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
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
    thumbnail_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
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
    thumbnail_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    title: 'Cart Stacking on Footwear & Apparel',
    description: 'Stack seasonal promo codes with instant brand voucher balance for the lowest checkout rate.',
    deal_tag: 'Save ₹420',
    is_sponsored: true,
    target_brand_slug: 'myntra'
  }
];

export default function SponsoredReelsFeed({ onSelectBrand }: { onSelectBrand: (slug: string) => void }) {
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        console.warn('Using default video feeds');
      }
    }
    loadReels();
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8 select-none">
      
      {/* Section Header with Carousel Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E51B24] text-xs font-black">
            <Flame className="w-3.5 h-3.5 fill-[#E51B24]" />
            <span>Verified Savings Proof &amp; Reels</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Watch &amp; Unlock Stacking Deals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Short proof reels on how to double-dip vouchers and promo codes live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollCarousel('left')}
            className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center transition shadow-sm active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollCarousel('right')}
            className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center transition shadow-sm active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL REELS CONTAINER */}
      <div 
        ref={scrollContainerRef}
        className="flex items-stretch gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory will-change-transform"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((item) => (
          <ReelCard 
            key={item.id} 
            item={item} 
            onSelectBrand={onSelectBrand} 
          />
        ))}
      </div>

      {/* Merchant Partnership Callout */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#0A0D14] border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 text-center sm:text-left relative z-10">
          <span className="text-sm font-extrabold text-white block">Want to feature your brand or video here?</span>
          <p className="text-xs text-slate-400 font-medium max-w-xl">
            Drive high-intent transactional traffic directly via verified video placements linked to your store front.
          </p>
        </div>
        <a
          href="mailto:partners@allinonevouchers.com?subject=Brand%20Sponsorship%20Inquiry"
          className="px-6 py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider shrink-0 transition shadow-md shadow-red-500/20 active:scale-95 relative z-10 cursor-pointer"
        >
          Partner With Us →
        </a>
      </div>

    </section>
  );
}

// INDIVIDUAL CAROUSEL REEL CARD (SMOOTH PLAYBACK + VIEWPORT AUTOPLAY)
function ReelCard({ item, onSelectBrand }: { item: ReelItem; onSelectBrand: (slug: string) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Auto play when visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video || hasError) return;

        if (entry.isIntersecting) {
          video.muted = true; // Browser policy strictly requires muted for autoplay[cite: 8]
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(() => {
                setIsPlaying(false);
              });
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [hasError]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = isMuted;
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser blocks unmuted play
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true));
        });
    }
  }, [isPlaying, isMuted]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  return (
    <div 
      ref={cardRef}
      className="snap-start shrink-0 w-[270px] sm:w-[310px] h-[520px] rounded-[32px] overflow-hidden border border-slate-200/90 bg-slate-950 shadow-lg hover:shadow-2xl transition-all duration-300 relative group flex flex-col justify-between select-none"
    >
      {/* Video / Player Container */}
      <div 
        className="absolute inset-0 w-full h-full cursor-pointer bg-slate-900 overflow-hidden"
        onClick={togglePlay}
      >
        {!hasError ? (
          <video
            ref={videoRef}
            src={item.video_url}
            poster={item.thumbnail_url || undefined}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            preload="auto"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 will-change-transform"
          />
        ) : (
          /* Fallback Poster if Video Link is Dead/Blocked */
          <div className="w-full h-full relative">
            <img 
              src={item.thumbnail_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600'} 
              alt={item.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <Film className="w-8 h-8 text-rose-500 mb-2 opacity-80" />
              <span className="text-xs font-bold text-slate-300">Preview Mode</span>
            </div>
          </div>
        )}

        {/* Ambient Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50 pointer-events-none" />
      </div>

      {/* Top Badges & Sound Controller */}
      <div className="relative z-20 p-4 flex items-center justify-between pointer-events-none">
        {item.is_sponsored ? (
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-wider uppercase text-white flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{item.brand_name}</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-wider uppercase text-slate-200">
            Verified Stack
          </span>
        )}

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition hover:bg-black pointer-events-auto shadow-sm cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
        </button>
      </div>

      {/* Center Big Play Button overlay if paused */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl transition transform group-hover:scale-110">
            <Play className="w-6 h-6 fill-slate-900 translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Content / CTA Overlay */}
      <div className="relative z-20 p-5 space-y-3 pointer-events-auto">
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#E51B24] text-white shadow-xs">
            {item.deal_tag}
          </span>
          <h3 className="text-sm sm:text-base font-black text-white leading-snug drop-shadow-sm line-clamp-2">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-medium">
              {item.description}
            </p>
          )}
        </div>

        {/* Action Button: routes to brand or direct deal link */}
        {item.cta_url ? (
          <a
            href={item.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E51B24]" />
            <span>Grab Store Deal</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </a>
        ) : (
          <button
            onClick={() => onSelectBrand(item.target_brand_slug)}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E51B24]" />
            <span>Stack {item.brand_name} Deal</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>

    </div>
  );
}