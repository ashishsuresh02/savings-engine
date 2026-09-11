'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ArrowRight, 
  Zap, 
  Menu, 
  X, 
  Send, 
  Bot, 
  Sparkles,
  Ticket,
  Percent,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  onOpenAuth: () => void;
  brandCount?: number;
}

export default function DynamicFintechNavbar({ onOpenAuth, brandCount = 7 }: NavbarProps) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [showNavbar, setShowNavbar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // 80px scroll hone par hi floating navbar screen par smoothly slide down hoga
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 80) {
      setShowNavbar(true);
    } else {
      setShowNavbar(false);
      setMobileMenuOpen(false);
    }
  });

  useEffect(() => {
    async function checkUserIdentity() {
      const localPhone = typeof window !== 'undefined' ? localStorage.getItem('user_phone') : null;
      if (localPhone) {
        setHasSession(true);
        return;
      }
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setHasSession(true);
      }
    }
    checkUserIdentity();
  }, []);

  const handleVaultNavigation = () => {
    const localPhone = typeof window !== 'undefined' ? localStorage.getItem('user_phone') : null;
    if (localPhone || hasSession) {
      router.push('/dashboard');
    } else {
      onOpenAuth();
    }
  };

  return (
    <>
      <AnimatePresence>
        {showNavbar && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pt-3 pointer-events-none"
          >
            <nav className="pointer-events-auto w-full max-w-5xl py-2 px-4 sm:px-6 rounded-full bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-[0_12px_35px_rgba(11,43,92,0.12),0_4px_12px_rgba(229,27,36,0.06)] flex items-center justify-between transition-all duration-300">
              
              {/* 1. Brand Horizontal Logo (Bada & Clear Size) */}
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <div className="relative h-10 sm:h-12 w-48 sm:w-56 flex items-center">
                    <Image 
                      src="/logo1.png" 
                      alt="AllInOneVouchers Logo" 
                      width={220} 
                      height={48} 
                      className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                      priority
                    />
                  </div>

                  <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24] animate-pulse" />
                    <span>{brandCount} Live Stores</span>
                  </span>
                </Link>
              </div>

              {/* 2. Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-extrabold text-[#0B2B5C]">
                <a 
                  href="#how-it-works" 
                  className="hover:text-[#E51B24] transition-colors flex items-center gap-1.5 group"
                >
                  <span>Stack Engine</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-50 text-[#E51B24] border border-red-200 font-black">
                    3X
                  </span>
                </a>
                <a href="#vouchers" className="hover:text-[#E51B24] transition-colors">Vouchers</a>
                <a href="#coupons" className="hover:text-[#E51B24] transition-colors">Coupons</a>
                <a href="#brands" className="hover:text-[#E51B24] transition-colors">Brands</a>
                <a href="#cards" className="hover:text-[#E51B24] transition-colors">Cards</a>
              </div>

              {/* 3. Action Buttons & Mobile Toggle */}
              <div className="flex items-center gap-2">
                <a
                  href="#calculator"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-black text-[#0B2B5C] hover:text-[#E51B24] transition"
                >
                  <Zap className="w-3.5 h-3.5 text-[#E51B24] fill-[#E51B24]" />
                  <span>Instant Rate</span>
                </a>

                <button
                  onClick={handleVaultNavigation}
                  className="px-4 sm:px-5 py-2 rounded-full bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs transition-all shadow-[0_4px_14px_rgba(229,27,36,0.3)] flex items-center gap-2 active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{hasSession ? 'My Vault' : 'Vault'}</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </button>

                {/* Mobile Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0B2B5C]"
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
                </motion.button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Mobile Drawer Menu */}
      <AnimatePresence>
        {showNavbar && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-4 top-20 z-40 md:hidden bg-white/98 border border-slate-200 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(11,43,92,0.18)] flex flex-col gap-3 text-[#0B2B5C]"
          >
            <div className="flex flex-col gap-2">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-red-50/70 border border-red-100 font-extrabold text-sm text-[#0B2B5C]"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E51B24]" /> Stack Engine
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E51B24] text-white font-black">
                  3X SAVINGS
                </span>
              </a>

              <a
                href="#vouchers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-bold text-sm"
              >
                <Ticket className="w-4 h-4 text-[#E51B24]" />
                <span>Verified Vouchers</span>
              </a>

              <a
                href="#coupons"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-bold text-sm"
              >
                <Percent className="w-4 h-4 text-[#E51B24]" />
                <span>Active Coupons</span>
              </a>

              <a
                href="#cards"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-bold text-sm"
              >
                <CreditCard className="w-4 h-4 text-[#0B2B5C]" />
                <span>Credit Cards</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <a
                href="https://t.me/allinonevouchers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 text-xs font-black"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Loot Channel</span>
              </a>

              <a
                href="https://t.me/AIOVouchersBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-red-50 border border-red-200 text-[#E51B24] text-xs font-black"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Deal Bot</span>
              </a>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleVaultNavigation();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(229,27,36,0.3)]"
            >
              <User className="w-4 h-4" />
              <span>{hasSession ? 'Open My Vault' : 'Open Member Vault'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}