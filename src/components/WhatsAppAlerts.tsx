'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  ArrowUpRight, 
  Send, 
  MessageCircle, 
  Zap, 
  Timer 
} from 'lucide-react';

interface CommunityAlertsProps {
  whatsappLink?: string;
  telegramLink?: string;
  instagramLink?: string;
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function WhatsAppAlerts({ 
  whatsappLink = "https://chat.whatsapp.com/your-real-invite-link",
  telegramLink = "https://t.me/allinonevouchers",
  instagramLink = "https://instagram.com/allinonevouchers"
}: CommunityAlertsProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 44, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 15, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => String(num).padStart(2, '0');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative overflow-hidden rounded-[36px] p-6 sm:p-10 lg:p-12 bg-white border-2 border-red-200 shadow-[0_22px_60px_rgba(229,27,36,0.1)]">
        
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#0B2B5C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Left: Copy + Countdown */}
          <div className="space-y-5 text-center lg:text-left max-w-2xl">
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E51B24] text-[11px] font-black uppercase tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-[#E51B24]" />
                <span>Lightning Price Drops Active</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-mono font-black tracking-wider shadow-sm">
                <Timer className="w-3.5 h-3.5 text-[#E51B24] animate-pulse" />
                <span>Round Ends:</span>
                <span className="text-[#E51B24]">
                  {formatDigit(timeLeft.hours)}:{formatDigit(timeLeft.minutes)}:{formatDigit(timeLeft.seconds)}
                </span>
              </div>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Loot Prices & Vouchers Drop Hote Hi <span className="text-[#E51B24]">Sabse Pehle Link Pao!</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Amazon, Swiggy, Flipkart aur Myntra ke glitch rates aur wholesale brand vouchers sirf <strong>5 se 10 minute</strong> ke liye aate hain. Group me judoge toh offer expire hone se pehle direct link aapke haath me hoga!
            </p>

            {/* Teaser Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E51B24]" />
                <span>Swiggy 60% Code Drop</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Amazon Wholesale Glitch</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Myntra Flat ₹400 Off</span>
              </div>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Tested Working Links</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#E51B24]" />
                <span>Fastest Push Notifications</span>
              </span>
              <span className="text-slate-300">•</span>
              <span>No Promotional Spam</span>
            </div>
          </div>

          {/* Right: Join Channels */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 min-w-[290px] sm:min-w-[340px]">
            
            {/* WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_8px_25px_rgba(37,211,102,0.3)] flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black normal-case leading-tight">Join WhatsApp Loot Alerts</span>
                  <span className="text-[10px] text-emerald-100 font-bold lowercase tracking-normal">Direct flash deals & coupon drops</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Telegram */}
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_8px_25px_rgba(0,136,204,0.28)] flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <Send className="w-5 h-5 fill-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black normal-case leading-tight">Telegram Deal Channel</span>
                  <span className="text-[10px] text-sky-100 font-bold lowercase tracking-normal">0-second glitch & coupon codes</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Instagram */}
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_8px_25px_rgba(253,29,29,0.2)] flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <InstagramIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black normal-case leading-tight">Instagram Reels</span>
                  <span className="text-[10px] text-pink-100 font-bold lowercase tracking-normal">Watch live savings order proofs</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}