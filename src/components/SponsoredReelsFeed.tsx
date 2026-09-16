'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
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

export interface ReelItem {
  id: string;
  brand_name: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  deal_tag: string;
  is_sponsored: boolean;
  target_brand_slug: string;
  cta_url?: string;
  display_order?: number;
}

export default function SponsoredReelsFeed({ 
  onSelectBrand 
}: { 
  onSelectBrand: (slug: string) => void 
}) {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 100% Dynamic Supabase Fetch from sponsored_reels table
  useEffect(() => {
    let isMounted = true;

    async function loadDynamicReels() {
      try {
        setLoading(true);
        if (!supabase) return;

        const { data, error } = await supabase
          .from('sponsored_reels')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (isMounted && data) {
          setReels(data);
        }
      } catch (err: any) {
        console.error('Reels fetch error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDynamicReels();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Agar admin se koi reel nahi daali gayi ho toh empty section render nahi hoga
  if (!loading && reels.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8 select-none">
      
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E51B24] text-xs font-black">
            <Flame className="w-3.5 h-3.5 fill-[#E51B24]" />
            <span>Live Savings Proof &amp; Shorts</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Watch &amp; Unlock Stacking Deals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Live short-form video proof on how to stack coupons and wholesale cards[cite: 7, 8].
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollCarousel('left')}
            className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center transition shadow-sm active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel('right')}
            className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-center transition shadow-sm active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dynamic Reel Feed Stream */}
      {loading ? (
        <div className="flex gap-6 overflow-hidden py-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="shrink-0 w-[270px] sm:w-[310px] h-[520px] rounded-[32px] bg-slate-200 animate-pulse" 
            />
          ))}
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          className="flex items-stretch gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory will-change-transform"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reels.map((item) => (
            <DynamicReelCard 
              key={item.id} 
              item={item} 
              onSelectBrand={onSelectBrand} 
            />
          ))}
        </div>
      )}

      {/* Partner Callout */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#0A0D14] border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 text-center sm:text-left relative z-10">
          <span className="text-sm font-extrabold text-white block">Want to sponsor your brand reel here?</span>
          <p className="text-xs text-slate-400 font-medium max-w-xl">
            Drive targeted buyers straight to your e-commerce store with high-conversion video placements[cite: 8].
          </p>
        </div>
        <a
          href="mailto:partners@allinonevouchers.com?subject=Brand%20Sponsorship"
          className="px-6 py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider shrink-0 transition shadow-md shadow-red-500/20 active:scale-95 relative z-10 cursor-pointer"
        >
          Partner With Us →
        </a>
      </div>

    </section>
  );
}

// DYNAMIC VIDEO CARD WITH AUTOPLAY ON INTERSECTION
function DynamicReelCard({ 
  item, 
  onSelectBrand 
}: { 
  item: ReelItem; 
  onSelectBrand: (slug: string) => void 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video || videoError) return;

        if (entry.isIntersecting) {
          video.muted = true;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
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
  }, [videoError]);

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
      {/* Video Stream Stage */}
      <div 
        className="absolute inset-0 w-full h-full cursor-pointer bg-slate-900 overflow-hidden"
        onClick={togglePlay}
      >
        {!videoError && item.video_url ? (
          <video
            ref={videoRef}
            src={item.video_url}
            poster={item.thumbnail_url || undefined}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            preload="auto"
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 will-change-transform"
          />
        ) : (
          <div className="w-full h-full relative">
            <img 
              src={item.thumbnail_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600'} 
              alt={item.title}
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <Film className="w-8 h-8 text-rose-500 mb-2 opacity-80" />
              <span className="text-xs font-bold text-slate-300">Preview Mode</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50 pointer-events-none" />
      </div>

      {/* Top Header Controls */}
      <div className="relative z-20 p-4 flex items-center justify-between pointer-events-none">
        {item.is_sponsored ? (
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-wider uppercase text-white flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{item.brand_name}</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-wider uppercase text-slate-200">
            {item.brand_name}
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

      {/* Center Play Icon when Paused */}
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

      {/* Bottom Content / Direct Action Buttons */}
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
            type="button"
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