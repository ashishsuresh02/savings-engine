'use client';

import { useState } from 'react';
import { 
  ArrowUpRight, 
  CreditCard, 
  Percent, 
  Shield, 
  Sparkles, 
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';

interface CalculationResult {
  brandName: string;
  originalCart: number;
  bestRoute: 'VOUCHER' | 'COUPON' | 'STACKED';
  bestEffectiveCost: number;
  totalSavings: number;
  breakdown: {
    couponCut: number;
    voucherCut: number;
    cardCashback: number;
    couponCode: string | null;
    buyUrl: string;
  };
}

const BRANDS = [
  { name: "Domino's", slug: "dominos", tag: "UP TO 18% OFF" },
  { name: "Swiggy", slug: "swiggy", tag: "INSTANT KICKBACK" },
  { name: "Myntra", slug: "myntra", tag: "DOUBLE STACK" },
  { name: "Amazon", slug: "amazon", tag: "FLAT SPREAD" },
];

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateSavings = async () => {
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
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] selection:bg-[#00E599] selection:text-black font-sans antialiased relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#18181b] to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <header className="border-b border-white/[0.06] backdrop-blur-md sticky top-0 z-50 bg-[#050505]/70">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-[#00E599] rounded-full shadow-[0_0_12px_#00E599]" />
            <span className="font-mono text-sm tracking-[0.25em] font-semibold uppercase text-white">
              ENGINE.AI
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-zinc-400 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE ARBITRAGE ACTIVE
          </div>
        </div>
      </header>

      {/* Main Terminal Container */}
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-300 flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-3 h-3 text-[#00E599]" />
            Algorithmic Value Extraction
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
            Pay Less Than <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
              The Checkout Screen.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-xl font-normal leading-relaxed">
            We scan hidden wholesale vouchers, calculate card kickbacks, and construct the single cheapest execution vector for your purchase.
          </p>
        </div>

        {/* The Execution Console (Card) */}
        <div className="bg-[#0C0C0D] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-8 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)] relative">
          {/* Subtle Ambient Corner Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E599]/[0.03] blur-3xl pointer-events-none rounded-tr-2xl" />

          {/* 1. Brand Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-300 block">
              01 // SELECT ASSET / BRAND
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BRANDS.map((b) => {
                const active = selectedBrand === b.slug;
                return (
                  <button
                    key={b.slug}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      active
                        ? 'bg-white/[0.08] border-[#00E599] text-white shadow-[0_0_20px_-8px_#00E599]'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-mono tracking-widest text-[9px] text-[#00E599] mb-1">
                      {b.tag}
                    </div>
                    <div className="font-semibold text-sm">{b.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Numerical Input & Toggle Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Amount Field */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-300 block">
                02 // ORDER NOTIONAL (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-zinc-300 text-lg">₹</span>
                <input
                  type="number"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#00E599] rounded-xl py-3.5 pl-9 pr-4 text-xl font-mono text-white tracking-wider outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Payment Instrument Toggle */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-300 block">
                03 // PAYMENT RAIL BENEFIT
              </label>
              <div 
                onClick={() => setHasSbiCard(!hasSbiCard)}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  hasSbiCard 
                    ? 'bg-white/[0.05] border-white/[0.2] text-white' 
                    : 'bg-white/[0.01] border-white/[0.06] text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-4 h-4 ${hasSbiCard ? 'text-[#00E599]' : 'text-zinc-600'}`} />
                  <div>
                    <p className="text-xs font-semibold">SBI Cashback Card</p>
                    <p className="text-[10px] font-mono text-zinc-400">Stack 5.0% flat online reward</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  hasSbiCard ? 'bg-[#00E599] border-[#00E599] text-black' : 'border-zinc-700 bg-transparent'
                }`}>
                  {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={calculateSavings}
            disabled={loading}
            className="w-full relative group overflow-hidden bg-white hover:bg-zinc-200 text-black py-4 px-6 rounded-xl font-semibold text-xs font-mono tracking-[0.2em] uppercase transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            {loading ? 'COMPUTING MATRICES...' : 'EXECUTE SAVINGS CALCULATION'}
          </button>
        </div>

        {/* 3. The Result Terminal (CRED Titanium Receipt Style) */}
        {result && (
          <div className="bg-[#09090A] border border-[#00E599]/30 rounded-2xl p-6 sm:p-8 space-y-6 relative shadow-[0_0_60px_-15px_rgba(0,229,153,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Top Badge Banner */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E599]" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#00E599] font-bold">
                  OPTIMAL VECTOR: {result.bestRoute}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                GROSS: <span className="line-through">₹{result.originalCart}</span>
              </span>
            </div>

            {/* Numerical Hero Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-baseline pt-2">
              <div>
                <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-300 uppercase">NET EFFECTIVE COST</p>
                <p className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight mt-1">
                  ₹{result.bestEffectiveCost}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-mono tracking-[0.2em] text-[#00E599] uppercase">TOTAL RETAINED YIELD</p>
                <p className="text-3xl sm:text-4xl font-mono font-bold text-[#00E599] tracking-tight mt-1">
                  +₹{result.totalSavings}
                </p>
              </div>
            </div>

            {/* The Precision Line Items (Breakdown Ledger) */}
            <div className="bg-black/60 border border-white/[0.06] rounded-xl p-4 space-y-2.5 font-mono text-xs text-zinc-300">
              {result.breakdown.voucherCut > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Wholesale Voucher Resale Spread:</span>
                  <span className="text-[#00E599]">-₹{result.breakdown.voucherCut}</span>
                </div>
              )}
              {result.breakdown.couponCut > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Direct Promo Code [{result.breakdown.couponCode}]:</span>
                  <span className="text-[#00E599]">-₹{result.breakdown.couponCut}</span>
                </div>
              )}
              {result.breakdown.cardCashback > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Banking Interchange Kickback (5%):</span>
                  <span className="text-[#00E599]">-₹{result.breakdown.cardCashback}</span>
                </div>
              )}
            </div>

            {/* Direct Routing Trigger (CTA) */}
            <a
              href={result.breakdown.buyUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center py-4 bg-[#00E599] hover:bg-[#00c985] text-black font-mono text-xs font-bold tracking-[0.2em] uppercase rounded-xl transition-all shadow-[0_0_30px_-5px_#00E599] flex items-center justify-center gap-2 group"
            >
              LOCK PRICE & PURCHASE VOUCHER
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        )}

        {/* CRED-Style Trust Stamp Footer */}
        <div className="pt-8 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left text-zinc-300 text-xs font-mono">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span>DETERMINISTIC ACCURACY</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Percent className="w-3.5 h-3.5 text-zinc-400" />
            <span>DIRECT RESELLER SPREADS</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>INSTANT CODE DELIVERY</span>
          </div>
        </div>
      </main>
    </div>
  );
}