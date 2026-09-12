'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Menu, 
  X, 
  Sparkles, 
  Ticket, 
  Flame, 
  Video, 
  Wallet,
  ShieldCheck
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

  // Thoda scroll karne par floating navbar seamlessly appear hoga
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 25) {
      setShowNavbar(true);
    } else {
      setShowNavbar(false);
      setMobileMenuOpen(false);
    }
  });

  useEffect(() => {
    async function checkUserIdentity() {
      if (typeof window !== 'undefined') {
        const localEmail = localStorage.getItem('user_email');
        const localPhone = localStorage.getItem('user_phone');
        if (localEmail || localPhone) {
          setHasSession(true);
          return;
        }
      }
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setHasSession(true);
      }
    }
    checkUserIdentity();
  }, []);

  const handleVaultNavigation = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push('/dashboard');
        return;
      }
    }

    const localEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
    const localPhone = typeof window !== 'undefined' ? localStorage.getItem('user_phone') : null;

    if (localEmail || localPhone || hasSession) {
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
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 25 }}
            className="fixed top-0 left-0 right-0 z-[60] flex justify-center px-4 sm:px-8 pt-4 pointer-events-auto"
          >
            <nav className="w-full max-w-7xl py-3 px-5 sm:px-8 rounded-full bg-white/95 border border-slate-200/90 backdrop-blur-2xl shadow-[0_16px_45px_rgba(11,43,92,0.12),0_4px_16px_rgba(229,27,36,0.06)] flex items-center justify-between transition-all duration-300">
              
              {/* Brand Logo (Larger & Crisp) */}
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="relative h-10 sm:h-12 w-52 sm:w-64 flex items-center">
                    <Image 
                      src="/logo1.png" 
                      alt="AllInOneVouchers Logo" 
                      width={260} 
                      height={52} 
                      className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Desktop Nav Links (Expanded, Larger & Interactive) */}
              <div className="hidden lg:flex items-center gap-2 xl:gap-3 text-sm font-black text-[#0B2B5C]">
                
                {/* 3X Stack Engine */}
                <Link 
                  href="/vouchers#calculator" 
                  className="px-3.5 py-2 rounded-full hover:bg-red-50 hover:text-[#E51B24] transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#E51B24]" />
                  <span>Stack Engine</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100/80 text-[#E51B24] font-black border border-red-200">
                    3X
                  </span>
                </Link>

                {/* Vouchers Hub */}
                <Link 
                  href="/vouchers" 
                  className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-[#E51B24] transition-all flex items-center gap-1.5"
                >
                  <Ticket className="w-4 h-4 text-[#0B2B5C]" />
                  <span>Wholesale Vouchers</span>
                </Link>

                {/* Live Loot Deals */}
                <Link 
                  href="/#loot-deals" 
                  className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-[#E51B24] transition-all flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4 text-[#E51B24]" />
                  <span>Loot Deals</span>
                </Link>

                {/* Video Reels */}
                <Link 
                  href="/reels" 
                  className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-[#E51B24] transition-all flex items-center gap-1.5"
                >
                  <Video className="w-4 h-4 text-slate-500" />
                  <span>Reels</span>
                </Link>

                {/* About Section */}
                <Link 
                  href="/#about" 
                  className="px-3.5 py-2 rounded-full hover:bg-slate-100 hover:text-[#E51B24] transition-all"
                >
                  <span>About Engine</span>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleVaultNavigation}
                  className="px-5 sm:px-7 py-3 rounded-full bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_6px_20px_rgba(229,27,36,0.32)] flex items-center gap-2.5 active:scale-95 cursor-pointer z-10"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{hasSession ? 'My Vault' : 'Member Vault'}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0B2B5C] hover:bg-slate-200 transition cursor-pointer"
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {showNavbar && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-4 top-24 z-[70] lg:hidden bg-white/98 border border-slate-200 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(11,43,92,0.18)] flex flex-col gap-2.5 text-[#0B2B5C]"
          >
            <div className="flex flex-col gap-2">
              <Link
                href="/vouchers#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50/70 border border-red-100 font-black text-sm text-[#0B2B5C]"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E51B24]" /> 3X Stack Engine
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E51B24] text-white font-black">
                  MAX SAVINGS
                </span>
              </Link>

              <Link
                href="/vouchers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-extrabold text-sm"
              >
                <Ticket className="w-4 h-4 text-[#E51B24]" />
                <span>Wholesale Gift Vouchers</span>
              </Link>

              <Link
                href="/#loot-deals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-extrabold text-sm"
              >
                <Flame className="w-4 h-4 text-[#E51B24]" />
                <span>Live Loot Deals</span>
              </Link>

              <Link
                href="/reels"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-extrabold text-sm"
              >
                <Video className="w-4 h-4 text-[#0B2B5C]" />
                <span>Sponsored Video Reels</span>
              </Link>

              <Link
                href="/#about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 font-extrabold text-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>About & Brand Trust</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleVaultNavigation(e);
              }}
              className="w-full py-4 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(229,27,36,0.3)] active:scale-95 cursor-pointer mt-1"
            >
              <Wallet className="w-4 h-4 text-white" />
              <span>{hasSession ? 'Open My Vault' : 'Open Member Vault'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}