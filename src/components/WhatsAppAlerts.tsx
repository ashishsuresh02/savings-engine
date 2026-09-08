'use client';

import React, { useState } from 'react';
import { MessageSquare, ArrowUpRight, ShieldCheck, BellRing, Users } from 'lucide-react';

interface WhatsAppAlertsProps {
  inviteLink?: string;
}

export default function WhatsAppAlerts({ 
  inviteLink = "https://chat.whatsapp.com/your-real-invite-link" 
}: WhatsAppAlertsProps) {
  const [joined, setJoined] = useState(false);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 bg-[#090A0F] border border-white/10 shadow-2xl">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Content Description */}
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white text-xs font-bold tracking-wide">
              <BellRing className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Arbitrage & Rate Drop Alerts</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Get Instant Notifications on High-Yield Deals
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Whenever a merchant drops wholesale gift voucher pricing or launches limited-time stackable promo codes, our engine broadcasts an instant alert directly to WhatsApp.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Direct Deals</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300">Zero Promotional Spam</span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>9,400+ Active Members</span>
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setJoined(true)}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2.5 active:scale-95 group"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>{joined ? 'Connecting...' : 'Join WhatsApp Channel'}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}