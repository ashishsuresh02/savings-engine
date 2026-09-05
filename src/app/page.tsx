'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingDown, Wallet } from 'lucide-react';

const POPULAR_BRANDS = [
  { name: "Domino's Pizza", slug: "dominos", category: "Food" },
  { name: "Swiggy", slug: "swiggy", category: "Food Delivery" },
  { name: "Myntra", slug: "myntra", category: "Fashion" },
  { name: "Amazon", slug: "amazon", category: "Shopping" },
];

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    if (!cartAmount || Number(cartAmount) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: selectedBrand,
          cartValue: Number(cartAmount),
          hasSbiCard,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="max-w-2xl text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Smart Savings Engine
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
          Never Pay Retail Price Again.
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Discover hidden discounted e-vouchers, stack bank cashback, and calculate your lowest effective checkout cost.
        </p>
      </div>

      {/* Main Engine Card */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Brand Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">SELECT BRAND</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POPULAR_BRANDS.map((b) => (
              <button
                key={b.slug}
                onClick={() => setSelectedBrand(b.slug)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                  selectedBrand === b.slug
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Value Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">EXPECTED ORDER AMOUNT (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-400 font-semibold">₹</span>
            <input
              type="number"
              value={cartAmount}
              onChange={(e) => setCartAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-white text-lg font-bold focus:outline-none focus:border-indigo-500"
              placeholder="e.g. 500"
            />
          </div>
        </div>

        {/* Payment Card Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-xs font-semibold text-white">SBI Cashback Credit Card</p>
              <p className="text-[10px] text-slate-400">Gives 5% extra cashback on online transactions</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={hasSbiCard}
            onChange={(e) => setHasSbiCard(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        {/* Calculate Action Button */}
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          {loading ? 'Calculating Best Deal...' : 'Calculate Lowest Effective Price'}
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Output Result Card */}
        {result && (
          <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-indigo-500/30 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> BEST DEAL FOUND
              </span>
              <span className="text-xs text-slate-400 font-mono">Original: ₹{result.originalCart}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] text-slate-400">Effective Final Cost</p>
                <p className="text-3xl font-black text-white">₹{result.bestEffectiveCost}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-emerald-400 font-semibold">Total Rupee Savings</p>
                <p className="text-2xl font-bold text-emerald-400">₹{result.totalSavings}</p>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-slate-900/90 rounded-lg p-3 text-xs space-y-1.5 text-slate-300">
              {result.breakdown.voucherCut > 0 && (
                <div className="flex justify-between">
                  <span>E-Voucher Instant Discount:</span>
                  <span className="text-emerald-400 font-medium">-₹{result.breakdown.voucherCut}</span>
                </div>
              )}
              {result.breakdown.couponCut > 0 && (
                <div className="flex justify-between">
                  <span>Merchant Coupon ({result.breakdown.couponCode}):</span>
                  <span className="text-emerald-400 font-medium">-₹{result.breakdown.couponCut}</span>
                </div>
              )}
              {result.breakdown.cardCashback > 0 && (
                <div className="flex justify-between">
                  <span>Card Cashback (5%):</span>
                  <span className="text-indigo-400 font-medium">-₹{result.breakdown.cardCashback}</span>
                </div>
              )}
            </div>

            <a
              href={result.breakdown.buyUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition"
            >
              Claim Deal & Buy Voucher
            </a>
          </div>
        )}
      </div>

      {/* Trust Footer */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-slate-400" />
        Real-time calculation engine backed by live merchant terms.
      </div>
    </main>
  );
}