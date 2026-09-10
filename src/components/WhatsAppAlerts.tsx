'use client';

import React from 'react';
import { 
  BellRing, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Send, 
  Instagram, 
  MessageCircle,
  Flame,
  Clock
} from 'lucide-react';

interface CommunityAlertsProps {
  whatsappLink?: string;
  telegramLink?: string;
  instagramLink?: string;
}

export default function WhatsAppAlerts({ 
  whatsappLink = "https://chat.whatsapp.com/your-real-invite-link",
  telegramLink = "https://t.me/allinonevouchers",
  instagramLink = "https://instagram.com/allinonevouchers"
}: CommunityAlertsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-10 lg:p-12 bg-white border-2 border-red-100 shadow-[0_20px_50px_rgba(11,43,92,0.08)]">
        
        {/* Soft Ambient Red & Navy Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#0B2B5C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Content Area */}
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E51B24] text-[11px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#E51B24] animate-ping" />
              <span>Real-Time Loot & Price Drop Broadcasts</span>
            </div>

            {/* Main Headline */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Kabhi Bhi Koi Hidden Loot Miss Mat Karo!
            </h3>

            {/* Compelling Value Proposition */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Swiggy, Amazon, Myntra aur Blinkit ke wholesale vouchers aur 90% price drops sirf kuch minutes ke liye aate hain. Hamare official broadcast groups me judiye aur deal khatam hone se pehle verified links sidha paayein.
            </p>

            {/* Trust Badges (No Fake Member Counter) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Tested Working Links</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E51B24]" />
                <span>Instant Flash Alerts</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span>Zero Spam Policy</span>
              </span>
            </div>
          </div>

          {/* Right Action Channels (WhatsApp, Telegram, Instagram) */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 min-w-[280px] sm:min-w-[320px]">
            
            {/* 1. WhatsApp Channel (Primary Green/Emerald Accent) */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black normal-case">WhatsApp Channel</span>
                  <span className="text-[10px] text-emerald-100 font-semibold lowercase">Instant loot notifications</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* 2. Telegram Loot Community (Telegram Blue Accent) */}
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/25 flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Send className="w-4 h-4 fill-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black normal-case">Telegram Channel</span>
                  <span className="text-[10px] text-sky-100 font-semibold lowercase">Live promo codes & glitch deals</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* 3. Instagram Reels & Proofs (Instagram Gradient Accent) */}
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black normal-case">Instagram Page</span>
                  <span className="text-[10px] text-pink-100 font-semibold lowercase">Deal reels & savings proof</span>
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