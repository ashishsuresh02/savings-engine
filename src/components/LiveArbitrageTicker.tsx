'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, TrendingUp, X } from 'lucide-react';

interface ToastEvent {
  id: number;
  name: string;
  city: string;
  brand: string;
  saved: number;
  route: string;
  timeAgo: string;
}

const MOCK_EVENTS: ToastEvent[] = [
  { id: 1, name: 'Rahul S.', city: 'Raipur', brand: 'Swiggy Gourmet', saved: 140, route: 'Voucher + SBI Card', timeAgo: '8s ago' },
  { id: 2, name: 'Priya K.', city: 'Delhi', brand: 'Myntra Fashion', saved: 420, route: 'Coupon + Voucher', timeAgo: '24s ago' },
  { id: 3, name: 'Aman V.', city: 'Bangalore', brand: "Domino's Pizza", saved: 95, route: '13% Arbitrage', timeAgo: '42s ago' },
  { id: 4, name: 'Siddharth M.', city: 'Mumbai', brand: 'Amazon Pay', saved: 250, route: 'Wholesale Pass', timeAgo: '1m ago' },
  { id: 5, name: 'Neha G.', city: 'Pune', brand: 'Blinkit Quick', saved: 80, route: 'Stacked Route', timeAgo: '2m ago' },
];

export default function LiveArbitrageTicker() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MOCK_EVENTS.length);
        setIsVisible(true);
      }, 400);
    }, 7000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = MOCK_EVENTS[index];

  return (
    <aside aria-label="Live Savings Activity" className="fixed bottom-5 left-5 z-40 hidden sm:block">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center gap-3 bg-[#0E1018]/95 border border-emerald-500/25 backdrop-blur-xl p-3 pr-4 rounded-2xl shadow-2xl shadow-black/80 max-w-sm group"
          >
            {/* Pulsing Avatar Graphic */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            {/* Content Details */}
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-white truncate">{current.name}</span>
                <span className="text-[10px] text-zinc-400">({current.city})</span>
                <span className="text-[10px] text-zinc-400">• {current.timeAgo}</span>
              </div>
              <div className="text-[11px] text-zinc-300 truncate">
                Saved <strong className="text-emerald-400 font-extrabold">₹{current.saved}</strong> on {current.brand}
              </div>
              <div className="text-[9.5px] text-zinc-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{current.route}</span>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss notification"
              className="text-zinc-400 hover:text-white p-1 transition self-start"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}