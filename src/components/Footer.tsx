'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Send, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  Flame,
  CreditCard,
  Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="relative bg-[#070A10] text-slate-400 border-t border-slate-800/80 overflow-hidden text-xs">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E51B24]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#0B2B5C]/30 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. TOP HIGHLIGHT STRIP: TRUST BADGES */}
      <div className="border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white">100% Verified Deals</p>
              <p className="text-[10px] text-slate-400">Zero dead promo codes</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-[#E51B24] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white">Instant PIN Delivery</p>
              <p className="text-[10px] text-slate-400">Real-time Member Vault sync</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white">3X Savings Stack</p>
              <p className="text-[10px] text-slate-400">Cards + Vouchers + Coupons</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white">Bank-Grade Security</p>
              <p className="text-[10px] text-slate-400">Encrypted tokenization</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10 relative z-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block relative h-10 w-48">
              <Image 
                src="/logo1.png" 
                alt="AllInOneVouchers Logo" 
                width={190} 
                height={42} 
                className="w-full h-full object-contain filter brightness-125"
              />
            </Link>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
              India's premier financial savings and retail arbitrage engine. We stack wholesale brand gift cards, verified merchant coupons, and credit card cashbacks to deliver true rock-bottom prices.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                Live Inventory Engine Active
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E51B24]" />
              Platform
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/vouchers" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Buy Gift Vouchers
                </Link>
              </li>
              <li>
                <Link href="/#loot-deals" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Trending Loot Deals
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Brand Directory
                </Link>
              </li>
              <li>
                <Link href="/reels" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Deal Reels
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  How 3X Stack Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Compliance & Legal
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Affiliate Disclosure & Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Voucher Refund & Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white hover:translate-x-1 inline-block transition duration-200">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Loot Alerts & Community (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#E51B24]" />
              Get Instant Price Drops
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Join 10,000+ smart savers receiving flash loot alerts before products go out of stock.
            </p>

            <div className="space-y-2">
              <a
                href="https://t.me/allinonevouchers"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0B2B5C] to-[#14428B] hover:from-[#14428B] hover:to-[#0B2B5C] text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 shadow-sm transition hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Join Telegram Alerts</span>
              </a>

              <p className="text-[10px] text-slate-400 text-center">
                Official Helpdesk:{' '}
                <a href="mailto:support@allinonevouchers.com" className="text-slate-300 hover:text-white underline">
                  support@allinonevouchers.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM COMPLIANCE DISCLAIMER */}
        <div className="pt-8 border-t border-slate-800/80 space-y-4">
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-5xl">
            <strong>Disclaimer:</strong> AllInOneVouchers.com is a discovery aggregator and promotional arbitrage service. Brand names, logos, trademarks (including Amazon, Swiggy, Zomato, Myntra, Flipkart, PhonePe, and Paytm) are the sole registered property of their respective owners and are displayed strictly for nominative reference. We earn affiliate compensation from qualified merchant purchases.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px] font-medium pt-2">
            <p>© {currentYear} AllInOneVouchers.com. Built for high-volume retail savings.</p>
            <div className="flex items-center gap-1 text-[10px]">
              <span>Engineered with precision for India</span>
              <Heart className="w-3 h-3 text-[#E51B24] fill-[#E51B24] inline" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}