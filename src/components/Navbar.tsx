'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ArrowRight, 
  Zap, 
  Menu, 
  X, 
  Send, 
  Bot, 
  Sparkles 
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  brandCount?: number;
}

export default function DynamicFintechNavbar({ onOpenAuth, brandCount = 6 }: NavbarProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll Detection for Dynamic Floating Island
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-3 pointer-events-none transition-all duration-500">
        <motion.nav
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className={`pointer-events-auto flex items-center justify-between border transition-all duration-300 ${
            isScrolled
              ? 'w-full max-w-4xl py-2.5 px-4 sm:px-6 rounded-full bg-[#09090B]/90 border-white/20 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
              : 'w-full max-w-7xl py-3 px-4 sm:px-8 rounded-3xl bg-[#09090B]/80 border-white/10 backdrop-blur-xl shadow-xl'
          }`}
        >
          {/* 1. Brand Logo (with smooth shared layoutId animation) & Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                {/* Hero section ka center logo scroll par yahan aakar morph hoga */}
                <motion.div 
                  layoutId="brand-logo-swap"
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className="w-10 h-10 rounded-2xl bg-white text-black p-[1.5px] shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                >
                  <div className="w-full h-full bg-[#09090B] rounded-2xl flex items-center justify-center overflow-hidden p-1">
                    <Image 
                      src="/logo.png" 
                      alt="AllInOneVouchers Logo" 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-contain rounded-xl"
                      priority
                    />
                  </div>
                </motion.div>

                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#09090B] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1 group-hover:text-zinc-300 transition">
                  AllInOne<span className="text-zinc-400">Vouchers</span>
                </span>
                <span className="flex items-center gap-1.5 text-[9.5px] text-zinc-400 font-bold uppercase tracking-widest -mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{brandCount} Merchants Live</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <a href="#calculator" className="hover:text-white transition-colors flex items-center gap-1">
              <span>Stack Engine</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-white font-bold">3X</span>
            </a>
            <a href="#vouchers" className="hover:text-white transition-colors">Vouchers</a>
            <a href="#coupons" className="hover:text-white transition-colors">Coupons</a>
            <a href="#cards" className="hover:text-white transition-colors">Cards</a>
          </div>

          {/* 3. Actions + Member Vault + Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <a
              href="#calculator"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition"
            >
              <Zap className="w-3.5 h-3.5 text-zinc-200" />
              <span>Instant Rate</span>
            </a>

            <button
              onClick={onOpenAuth}
              className="hidden sm:flex px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-all duration-200 items-center gap-2 shadow-sm active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-black" />
              <span>Open Vault</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* Mobile Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-zinc-200" /> : <Menu className="w-5 h-5 text-zinc-200" />}
            </motion.button>
          </div>
        </motion.nav>
      </div>

      {/* 4. Mobile Drawer Menu with Smooth Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-4 top-20 z-40 md:hidden bg-[#09090B]/95 border border-white/15 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-4 text-white"
          >
            <div className="flex flex-col gap-2">
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition"
              >
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Stack Engine
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 font-bold">3X SAVINGS</span>
              </a>

              <a
                href="#vouchers"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 font-semibold text-sm transition"
              >
                🎟️ Verified Vouchers
              </a>

              <a
                href="#coupons"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 font-semibold text-sm transition"
              >
                🏷️ Active Coupons
              </a>

              <a
                href="#cards"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 font-semibold text-sm transition"
              >
                💳 Credit Card Stacks
              </a>
            </div>

            {/* Telegram Channel & Bot Shortcuts */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <a
                href="https://t.me/allinonevouchers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Loot Channel</span>
              </a>

              <a
                href="https://t.me/AIOVouchersBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold active:scale-95 transition"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Deal Bot</span>
              </a>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
            >
              <User className="w-4 h-4 text-black" />
              <span>Open Member Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}