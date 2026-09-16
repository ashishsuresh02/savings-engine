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
  RefreshCw
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
}

export default function SponsoredReelsFeed({ 
  onSelectBrand 
}: { 
  onSelectBrand: (slug: string) => void 
}) {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadReels = async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      const { data, error } = await supabase
        .from('sponsored_reels')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setReels(data || []);
    } catch (err: any) {
      console.error('Reels load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReels();
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && reels.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8 select-none">
      
      {/* Header */}
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
            Tap video to play with audio or grab direct store checkout links.
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

      {/* Video Reels Track */}
      {loading ? (
        <div className="flex gap-6 overflow-hidden py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-[270px] sm:w-[310px] h-[520px] rounded-[32px] bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          className="flex items-stretch gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reels.map((item) => (
            <ReelCard key={item.id} item={item} onSelectBrand={onSelectBrand} />
          ))}
        </div>
      )}

    </section>
  );
}

// ULTRA-SAFE VIDEO COMPONENT
function ReelCard({ item, onSelectBrand }: { item: ReelItem; onSelectBrand: (slug: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Auto-play safely with Muted policy
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Chrome/Safari strictly require explicit muted property before play call
    video.muted = true;
    video.defaultMuted = true;
    
    const playAttempt = video.play();
    if (playAttempt !== undefined) {
      playAttempt
        .then(() => {
          setIsPlaying(true);
          setVideoError(false);
        })
        .catch(() => {
          // If browser restricts autoplay, user can tap play button
          setIsPlaying(false);
        });
    }
  }, [item.video_url]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className="snap-start shrink-0 w-[270px] sm:w-[310px] h-[520px] rounded-[32px] overflow-hidden border border-slate-200 bg-slate-950 shadow-lg relative group flex flex-col justify-between select-none">
      
      {/* Video / Player Canvas */}
      <div 
        className="absolute inset-0 w-full h-full cursor-pointer bg-slate-900"
        onClick={togglePlay}
      >
        {!videoError ? (
          <video
            ref={videoRef}
            src={item.video_url}
            poster={item.thumbnail_url || undefined}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            crossOrigin="anonymous"
            preload="metadata"
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          /* Error Fallback with Link Notice */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-400 space-y-2">
            <span className="text-2xl">⚠️</span>
            <p className="text-xs font-bold text-white">Video Link Incompatible</p>
            <p className="text-[10px] text-slate-400">
              Browser cannot stream this link directly. Ensure URL ends in <code className="text-red-400">.mp4</code>.
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/40 pointer-events-none" />
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

        {!videoError && (
          <button
            type="button"
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition hover:bg-black pointer-events-auto cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
          </button>
        )}
      </div>

      {/* Center Play Icon when paused */}
      {!isPlaying && !videoError && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 fill-slate-900 translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Content Area */}
      <div className="relative z-20 p-5 space-y-3 pointer-events-auto">
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#E51B24] text-white">
            {item.deal_tag}
          </span>
          <h3 className="text-sm font-black text-white leading-snug line-clamp-2">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-[11px] text-slate-300 line-clamp-1 font-medium">
              {item.description}
            </p>
          )}
        </div>

        {item.cta_url ? (
          <a
            href={item.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E51B24]" />
            <span>Grab Store Deal</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </a>
        ) : (
          <button
            onClick={() => onSelectBrand(item.target_brand_slug)}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
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