'use client';

import React, { useState } from 'react';
import { MessageSquare, ArrowUpRight, Zap, ShieldCheck, BellRing, Check } from 'lucide-react';

interface WhatsAppAlertsProps {
  inviteLink?: string;
}

export default function WhatsAppAlerts({ 
  inviteLink = "https://chat.whatsapp.com/your-real-invite-link" 
}: WhatsAppAlertsProps) {
  const [joined, setJoined] = useState(false);

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10 bg-gradient-to-br from-[#0c1f17] via-[#0b1418] to-[#0a0c14] border border-emerald-500/30 shadow-2xl">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Text */}
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>Zero-Minute Price Drops & Glitch Fares</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Join the VIP Loot & Error Fare Broadcast
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              When a brand accidentally releases a 90% coupon or Amazon drops gift card rates, we broadcast it in 10 seconds flat. Never miss an arbitrage window.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Spam</span>
              </span>
              <span>•</span>
              <span>Direct Affiliate Links</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">9,400+ Active Members</span>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setJoined(true)}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 group"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>{joined ? 'Opening WhatsApp...' : 'Join WhatsApp Channel'}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}