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

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);
  });

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pt-3 pointer-events-none transition-all duration-500">
        <motion.nav
          layout
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className={`pointer-events-auto flex items-center justify-between border transition-all duration-300 ${
            isScrolled
              ? 'w-full max-w-4xl py-2 px-4 sm:px-6 rounded-full bg-[#09090B]/90 border-white/20 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.1)]'
              : 'w-full max-w-7xl py-3 px-4 sm:px-8 rounded-3xl bg-[#09090B]/75 border-white/10 backdrop-blur-xl shadow-xl'
          }`}
        >
          {/* 1. Brand 3D Crystal Icon & Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                {/* 3D Crystal Beveled Navbar Token */}
                <motion.div 
                  layoutId="brand-3d-crystal-logo"
                  transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.8 }}
                  className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white/25 via-white/5 to-white/0 p-[1.5px] shadow-[0_4px_15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-xl overflow-hidden group-hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full rounded-[14px] bg-[#0c0d12]/90 flex items-center justify-center p-1.5 relative overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                    <Image 
                      src="/logo.png" 
                      alt="AllInOneVouchers" 
                      width={36} 
                      height={36} 
                      className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
                      priority
                    />
                    {/* Subtle micro shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                </motion.div>

                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#09090B] flex items-center justify-center shadow-[0_0_8px_#10b981]">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1 group-hover:text-zinc-200 transition">
                  AllInOne<span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">Vouchers</span>
                </span>
                <span className="flex items-center gap-1 text-[9px] text-zinc-400 font-bold uppercase tracking-widest -mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{brandCount} Live Deals</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <a href="#calculator" className="hover:text-white transition-colors flex items-center gap-1">
              <span>Stack Engine</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">3X</span>
            </a>
            <a href="#vouchers" className="hover:text-white transition-colors">Vouchers</a>
            <a href="#coupons" className="hover:text-white transition-colors">Coupons</a>
            <a href="#cards" className="hover:text-white transition-colors">Cards</a>
          </div>

          {/* 3. Action Buttons & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <a
              href="#calculator"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-bold text-zinc-200 hover:text-white transition backdrop-blur-md"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Calc</span>
            </a>

            <button
              onClick={onOpenAuth}
              className="hidden sm:flex px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] items-center gap-2 active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Vault</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-zinc-300" /> : <Menu className="w-5 h-5 text-zinc-300" />}
            </motion.button>
          </div>
        </motion.nav>
      </div>

      {/* 4. Mobile Glass Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-x-4 top-20 z-40 md:hidden bg-[#0a0b10]/95 border border-white/15 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col gap-3.5 text-white"
          >
            <div className="flex flex-col gap-2">
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/5 font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Stack Engine
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">3X SAVINGS</span>
              </a>

              <a
                href="#vouchers"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 font-semibold text-sm"
              >
                🎟️ Verified Vouchers
              </a>

              <a
                href="#coupons"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 font-semibold text-sm"
              >
                🏷️ Active Coupons
              </a>

              <a
                href="#cards"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 font-semibold text-sm"
              >
                💳 Credit Cards
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <a
                href="https://t.me/allinonevouchers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Loot Channel</span>
              </a>

              <a
                href="https://t.me/AIOVouchersBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
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
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <User className="w-4 h-4" />
              <span>Open Member Vault</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}