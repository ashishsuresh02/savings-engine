'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Flame, 
  ArrowRight, 
  Search, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Percent
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  brandCount?: number;
}

export default function DynamicFintechNavbar({ onOpenAuth, brandCount = 6 }: NavbarProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSavingsTicker, setActiveSavingsTicker] = useState(0);

  const liveFeeds = [
    { text: 'Someone saved ₹320 on Swiggy', icon: '🛵', time: '12s ago' },
    { text: 'Domino’s 13% voucher unlocked', icon: '🍕', time: '34s ago' },
    { text: '₹450 cashback via SBI Card', icon: '💳', time: '1m ago' },
    { text: 'Myntra ₹2,000 cart stacked', icon: '👗', time: '2m ago' },
  ];

  // Scroll Detection for Dynamic Island Morphing
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  // Ticker Auto-Cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSavingsTicker((prev) => (prev + 1) % liveFeeds.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [liveFeeds.length]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-3 pointer-events-none transition-all duration-500">
      <motion.nav
        layout
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className={`pointer-events-auto flex items-center justify-between border transition-all duration-300 ${
          isScrolled
            ? 'w-full max-w-4xl py-2.5 px-4 sm:px-6 rounded-full bg-[#0b0c14]/85 border-emerald-500/30 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.12)]'
            : 'w-full max-w-7xl py-3.5 px-5 sm:px-8 rounded-3xl bg-[#0c0d16]/70 border-white/[0.08] backdrop-blur-xl shadow-2xl'
        }`}
      >
        {/* 1. Brand Logo & Live Status Ping */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-indigo-500 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#0a0b12] rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c0d16] flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1 group-hover:text-emerald-300 transition">
                AllInOne<span className="text-emerald-400">Vouchers</span>
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-[9.5px] text-zinc-400 font-bold uppercase tracking-widest -mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{brandCount} Merchants Live</span>
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Dynamic Island Live Arbitrage Ticker (Visible on Desktop) */}
        <div className="hidden lg:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-3.5 py-1.5 rounded-full transition cursor-pointer overflow-hidden max-w-xs">
          <span className="text-sm">{liveFeeds[activeSavingsTicker].icon}</span>
          <div className="h-5 flex items-center overflow-hidden relative w-48">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeSavingsTicker}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] font-medium text-zinc-300 truncate absolute"
              >
                {liveFeeds[activeSavingsTicker].text}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold tracking-tight">
            LIVE
          </span>
        </div>

        {/* 3. Navigation Links (Collapses gracefully on scroll) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
          <a href="#calculator" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
            <span>Stack Engine</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-400/10 text-emerald-400 font-bold">3X</span>
          </a>
          <a href="#vouchers" className="hover:text-emerald-400 transition-colors">Vouchers</a>
          <a href="#cards" className="hover:text-emerald-400 transition-colors">Cards</a>
        </div>

        {/* 4. Action Command + Member Vault Login */}
        <div className="flex items-center gap-2.5">
          <a
            href="#calculator"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-bold text-zinc-300 hover:text-white transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Rate</span>
          </a>

          <button
            onClick={onOpenAuth}
            className="relative group overflow-hidden rounded-full p-[1px] transition active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-500 rounded-full animate-pulse" />
            <div className="relative px-4 py-2 rounded-full bg-[#0c0d16] group-hover:bg-transparent text-white group-hover:text-black font-extrabold text-xs transition-all duration-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
              <span>Open Vault</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </motion.nav>
    </div>
  );
}