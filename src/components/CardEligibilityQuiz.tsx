'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ArrowUpRight, 
  RotateCcw, 
  ShoppingBag, 
  Utensils, 
  Plane, 
  Zap 
} from 'lucide-react';

interface QuizResult {
  cardName: string;
  bank: string;
  rewardRate: string;
  estAnnualSaving: string;
  perks: string[];
  applyUrl: string;
}

const RESULTS_MAP: Record<string, QuizResult> = {
  food: {
    cardName: 'Swiggy HDFC Credit Card',
    bank: 'HDFC Bank',
    rewardRate: '10% Cashback on Swiggy Dining & Orders',
    estAnnualSaving: '₹9,600',
    perks: ['10% on Swiggy & Dineout', '5% on Amazon & Flipkart', 'Direct Statement Credit'],
    applyUrl: 'https://gromo.in',
  },
  shopping: {
    cardName: 'SBI Cashback Credit Card',
    bank: 'SBI Card',
    rewardRate: '5% Flat Cashback on Online Spends',
    estAnnualSaving: '₹14,200',
    perks: ['5% on all online merchants', 'Zero merchant restrictions', 'Automated monthly rebate'],
    applyUrl: 'https://gromo.in',
  },
  travel: {
    cardName: 'Axis Bank Atlas Credit Card',
    bank: 'Axis Bank',
    rewardRate: 'Up to 10% Value in Travel Miles',
    estAnnualSaving: '₹22,000',
    perks: ['Complimentary airport lounge access', 'Tier upgrades', 'Edge miles on flight spends'],
    applyUrl: 'https://gromo.in',
  },
  bills: {
    cardName: 'Airtel Axis Bank Credit Card',
    bank: 'Axis Bank',
    rewardRate: '25% on Utilities & Bill Payments',
    estAnnualSaving: '₹7,800',
    perks: ['25% on Airtel mobile & Wi-Fi', '10% on BigBasket & Zomato', 'Flat 10% on power/gas'],
    applyUrl: 'https://gromo.in',
  }
};

export default function CardEligibilityQuiz() {
  const [selectedSpend, setSelectedSpend] = useState<string | null>(null);
  const [monthlySpend, setMonthlySpend] = useState<number>(15000);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleEvaluate = () => {
    if (!selectedSpend) return;
    const base = RESULTS_MAP[selectedSpend] || RESULTS_MAP.shopping;
    setResult(base);
  };

  const handleReset = () => {
    setSelectedSpend(null);
    setResult(null);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="bg-[#090A0F] border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Card Recommendation Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Find the card that yields the highest cashback for your spending.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-medium">
            Select your primary spend category and monthly volume to evaluate the highest-return financial rail.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="quiz-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              {/* Question 1: Spend Category */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  1. Primary Online Spend Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'food', label: 'Food & Dining', icon: Utensils, desc: 'Swiggy, Zomato, Blinkit' },
                    { id: 'shopping', label: 'Online Retail', icon: ShoppingBag, desc: 'Amazon, Myntra, Flipkart' },
                    { id: 'travel', label: 'Travel & Mobility', icon: Plane, desc: 'MakeMyTrip, Uber, Flights' },
                    { id: 'bills', label: 'Utility Bills', icon: Zap, desc: 'Electricity, Wi-Fi, Mobile' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedSpend === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedSpend(item.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-white/10 border-white text-white shadow-lg'
                            : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2.5 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
                        <h4 className="text-xs font-bold text-white block">{item.label}</h4>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Monthly Volume Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    2. Estimated Monthly Online Spend
                  </label>
                  <span className="text-sm font-black text-emerald-400">
                    ₹{monthlySpend.toLocaleString('en-IN')}/month
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={80000}
                  step={2500}
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                  <span>₹5,000/mo</span>
                  <span>₹40,000/mo</span>
                  <span>₹80,000+/mo</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={!selectedSpend}
                onClick={handleEvaluate}
                className="w-full py-4 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Evaluate Optimal Card Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            /* Result Screen */
            <motion.div
              key="quiz-result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recommended Financial Instrument</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-calculate Spend</span>
                </button>
              </div>

              {/* High-Contrast Match Summary */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full">
                    {result.bank}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{result.cardName}</h3>
                  <p className="text-xs text-zinc-300 font-medium">{result.rewardRate}</p>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Annual Net Statement Return</span>
                  <span className="text-3xl font-black text-emerald-400">{result.estAnnualSaving}</span>
                  <span className="text-[10px] text-zinc-500 block font-medium">Estimated cashback per year</span>
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.perks.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-300 flex items-center gap-2.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              {/* Apply Action */}
              <a
                href={result.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
              >
                <span>Apply Online for Pre-Approved Card</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}