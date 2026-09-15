'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  Tv, 
  Zap, 
  Tag, 
  ShoppingBag, 
  Eye, 
  PlayCircle
} from 'lucide-react';
import DynamicFintechNavbar from '@/components/Navbar';
import SponsoredReelsFeed from '@/components/SponsoredReelsFeed';
import AuthModal from '@/components/AuthModal';

const CATEGORIES = [
  { id: 'ALL', label: '🔥 All Loot Drops', icon: Flame },
  { id: 'GADGETS', label: '🎧 Tech & Audio', icon: Zap },
  { id: 'FASHION', label: '👗 Fashion & Shoes', icon: ShoppingBag },
  { id: 'FOOD', label: '🍔 Food & Dining', icon: Tag },
];

export default function ReelsPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans antialiased selection:bg-[#E51B24] selection:text-white pb-24 overflow-x-hidden relative">
      
      {/* 1. TOP AMBIENT NEON GLOWS */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#E51B24]/15 via-rose-600/10 to-[#0B2B5C]/30 blur-[130px] pointer-events-none" />

      {/* 2. FLOATING NAVBAR */}
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 relative z-10 space-y-6">
        
        {/* 3. HERO BANNER HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-rose-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>Visual Commerce & Unboxing Feeds</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Sponsored Deal <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Reels</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
              Watch 15-second product testings, verified merchant unboxings, and instant flash coupons before shopping on Amazon, Myntra, or Swiggy.
            </p>
          </div>

          {/* Real-Time Live Watch Badge */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl shrink-0 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-[#E51B24] flex items-center justify-center font-black">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white">1,420+ Watching</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Codes redeemable live</p>
            </div>
          </div>
        </div>

        {/* 4. QUICK CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E51B24] to-red-600 text-white border-red-500 shadow-lg shadow-red-500/20 scale-105'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. REELS VIDEO FEED COMPONENT */}
        <div className="pt-2">
          <SponsoredReelsFeed onSelectBrand={() => {}} />
        </div>
      </main>

      {/* 6. AUTH MODAL INTEGRATION */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}