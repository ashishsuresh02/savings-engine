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
  cardGradient: string;
}

const RESULTS_MAP: Record<string, QuizResult> = {
  food: {
    cardName: 'Swiggy HDFC Credit Card',
    bank: 'HDFC Bank',
    rewardRate: '10% Flat Cashback',
    estAnnualSaving: '₹9,600',
    perks: ['10% on Swiggy & Dineout', '5% on Amazon/Flipkart', 'Free 3-Month Swiggy One'],
    applyUrl: 'https://gromo.in',
    cardGradient: 'from-orange-500/20 via-[#0d121f] to-[#080b14]'
  },
  shopping: {
    cardName: 'SBI Cashback Credit Card',
    bank: 'SBI Card',
    rewardRate: '5% Flat Online Rebate',
    estAnnualSaving: '₹14,200',
    perks: ['5% on all online merchants', 'Zero merchant restrictions', 'Direct statement credit'],
    applyUrl: 'https://gromo.in',
    cardGradient: 'from-emerald-500/20 via-[#0a141c] to-[#070d14]'
  },
  travel: {
    cardName: 'Axis Bank Atlas Credit Card',
    bank: 'Axis Bank',
    rewardRate: 'Up to 10% Travel Miles',
    estAnnualSaving: '₹22,000',
    perks: ['Complimentary airport lounge access', 'Tier upgrades', 'Edge miles on flight spends'],
    applyUrl: 'https://gromo.in',
    cardGradient: 'from-indigo-500/20 via-[#100d1f] to-[#080612]'
  },
  bills: {
    cardName: 'Airtel Axis Bank Credit Card',
    bank: 'Axis Bank',
    rewardRate: '25% on Utilities & Recharges',
    estAnnualSaving: '₹7,800',
    perks: ['25% on Airtel bills', '10% on BigBasket & Zomato', 'Flat 10% on electricity/gas'],
    applyUrl: 'https://gromo.in',
    cardGradient: 'from-pink-500/20 via-[#1a0c18] to-[#0b050f]'
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
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Smart Financial Matching Engine
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Find the card that pays you back the most.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          2 simple questions. Our math engine checks 40+ Indian cards to find your maximum savings match.
        </p>
      </div>

      <div className="bg-[#11131D] border border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="quiz-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Question 1: Spend Category */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  1. Where do you spend most of your money online?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'food', label: 'Food & Groceries', icon: Utensils, desc: 'Swiggy, Zomato, Blinkit' },
                    { id: 'shopping', label: 'Online Shopping', icon: ShoppingBag, desc: 'Amazon, Myntra, Flipkart' },
                    { id: 'travel', label: 'Flights & Travel', icon: Plane, desc: 'MakeMyTrip, Uber, Hotels' },
                    { id: 'bills', label: 'Bills & Utilities', icon: Zap, desc: 'Electricity, Wi-Fi, Mobile' },
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
                            ? 'bg-indigo-500/15 border-indigo-400 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.15]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                        <h4 className="text-xs font-bold text-white block">{item.label}</h4>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: Monthly Budget Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    2. Estimated Monthly Online Spends
                  </label>
                  <span className="text-sm font-black text-emerald-400">
                    ₹{monthlySpend.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={80000}
                  step={2500}
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
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
                className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate My Best Card Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            /* Result Screen */
            <motion.div
              key="quiz-result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Optimal Match Found</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Different Options</span>
                </button>
              </div>

              <div className={`p-6 rounded-2xl bg-gradient-to-br ${result.cardGradient} border border-white/[0.1] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                    {result.bank}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{result.cardName}</h3>
                  <p className="text-xs text-zinc-300">{result.rewardRate}</p>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Estimated Return</span>
                  <span className="text-3xl font-black text-emerald-400">{result.estAnnualSaving}</span>
                  <span className="text-[10px] text-zinc-500 block">Annual cash in pocket</span>
                </div>
              </div>

              {/* Perks List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.perks.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              {/* Apply Affiliate CTA */}
              <a
                href={result.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
              >
                <span>Apply & Unlock Card Benefits</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}