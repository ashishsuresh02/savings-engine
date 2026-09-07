'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles, 
  Tag, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Gift, 
  ChevronRight, 
  Percent, 
  LogOut,
  SlidersHorizontal,
  Flame,
  Search
} from 'lucide-react';

interface ClaimedVoucher {
  id: string;
  brand: string;
  code: string;
  value: number;
  savedAmount: number;
  discountPct: number;
  expiresOn: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRING_SOON';
  gradient: string;
}

const mockVouchers: ClaimedVoucher[] = [
  {
    id: 'v-1',
    brand: 'Amazon Pay Gift Card',
    code: 'AMZN-9824-SAVE',
    value: 2000,
    savedAmount: 140,
    discountPct: 7.0,
    expiresOn: '30 Sep 2026',
    status: 'ACTIVE',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  {
    id: 'v-2',
    brand: 'Swiggy Money Voucher',
    code: 'SWIG-5501-EAT',
    value: 1000,
    savedAmount: 90,
    discountPct: 9.0,
    expiresOn: '18 Sep 2026',
    status: 'EXPIRING_SOON',
    gradient: 'from-orange-500/20 via-rose-500/10 to-transparent'
  },
  {
    id: 'v-3',
    brand: 'Myntra Shopping Pass',
    code: 'MYNT-4412-LUXE',
    value: 3500,
    savedAmount: 420,
    discountPct: 12.0,
    expiresOn: '14 Oct 2026',
    status: 'ACTIVE',
    gradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent'
  }
];

const mockTransactions = [
  { id: 't-1', brand: 'Flipkart Electronics', date: 'Today, 02:40 PM', original: 14999, saved: 1850, route: 'STACKED' },
  { id: 't-2', brand: 'Zomato Daily', date: 'Yesterday', original: 650, saved: 140, route: 'COUPON' },
  { id: 't-3', brand: 'Uber Ride Pass', date: '04 Sep 2026', original: 800, saved: 88, route: 'VOUCHER' },
  { id: 't-4', brand: 'Ajio Fashion Stack', date: '01 Sep 2026', original: 4200, saved: 920, route: 'STACKED' }
];

export default function DashboardVaultPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'used'>('all');
  const [userPhone, setUserPhone] = useState<string>('98765 43210');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const storedPhone = localStorage.getItem('bachat_user_phone');
      if (storedPhone) {
        setUserPhone(storedPhone.replace(/(\d{5})(\d{5})/, '$1 $2'));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('bachat_user_phone');
      localStorage.removeItem('bachat_auth_token');
    } catch (e) {}
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-zinc-100 selection:bg-emerald-500 selection:text-black font-sans pb-24">
      {/* Dynamic Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[25%] right-[5%] w-[500px] h-[450px] bg-indigo-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[550px] h-[400px] bg-sky-500/8 rounded-full blur-[150px]" />
      </div>

      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A10]/80 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#09090E] rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Bachat<span className="text-emerald-400">Vault</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-medium block uppercase tracking-widest -mt-1">
                  Engine v2.4 Live
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>+91 {userPhone}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-white/[0.06] hover:border-rose-500/20 transition-all text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Welcome & Analytics Hero Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Savings Stored */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] shadow-2xl backdrop-blur-md group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Lifetime Savings
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                +24.8% this month
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹3,418<span className="text-emerald-400 text-2xl font-bold">.00</span>
              </div>
              <p className="text-xs text-zinc-400">Total cash unlocked across 14 transactions</p>
            </div>
          </div>

          {/* Card 2: Active Stack Advantage */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] shadow-2xl backdrop-blur-md group hover:border-indigo-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Card Multiplier
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                SBI 5% Active
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹890<span className="text-indigo-400 text-2xl font-bold"> Cashback</span>
              </div>
              <p className="text-xs text-zinc-400">Direct credit card returns from stacked checkouts</p>
            </div>
          </div>

          {/* Card 3: Live Voucher Inventory */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] shadow-2xl backdrop-blur-md group hover:border-amber-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" /> Ready Vouchers
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                3 Usable Now
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹6,500<span className="text-amber-400 text-2xl font-bold"> Value</span>
              </div>
              <p className="text-xs text-zinc-400">Instant codes ready to paste on merchant checkout</p>
            </div>
          </div>
        </section>

        {/* Quick Action Engine Banner */}
        <section className="rounded-3xl p-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-transparent border border-emerald-500/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-black flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Find a New 3-Layer Discount Route</h3>
              <p className="text-xs text-zinc-400">Run the live calculator before paying on Amazon, Swiggy, or Myntra to save 12-25% extra.</p>
            </div>
          </div>
          <Link
            href="/"
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black tracking-wide uppercase transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
          >
            <span>Open Stacking Calculator</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Vouchers & Ledgers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left 7 Columns: Active Vault Codes */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  Your Claimed Gift Cards & Passes
                </h2>
                <p className="text-xs text-zinc-400">Tap copy to apply immediately on brand apps</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${activeTab === 'all' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  All (3)
                </button>
                <button 
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${activeTab === 'active' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  Active
                </button>
              </div>
            </div>

            {/* Voucher Cards Loop */}
            <div className="space-y-3.5">
              {mockVouchers.map((voucher) => (
                <div 
                  key={voucher.id}
                  className="relative overflow-hidden rounded-2xl p-5 bg-[#0D0D14] border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-lg group"
                >
                  <div className={`absolute top-0 right-0 w-64 h-32 bg-gradient-to-l ${voucher.gradient} pointer-events-none`} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                          {voucher.brand}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          voucher.status === 'EXPIRING_SOON' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {voucher.status === 'EXPIRING_SOON' ? 'Expires Soon' : `${voucher.discountPct}% OFF`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span>Balance: <strong className="text-white">₹{voucher.value}</strong></span>
                        <span>•</span>
                        <span>Saved: <strong className="text-emerald-400">₹{voucher.savedAmount}</strong></span>
                        <span>•</span>
                        <span>Exp: {voucher.expiresOn}</span>
                      </div>
                    </div>

                    {/* Code Copy Box */}
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] font-mono text-xs font-bold text-zinc-200 tracking-wider select-all">
                        {voucher.code}
                      </div>
                      <button
                        onClick={() => handleCopyCode(voucher.id, voucher.code)}
                        className="px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        {copiedId === voucher.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Columns: Live Savings Ledger */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Live Savings Ledger
              </h2>
              <p className="text-xs text-zinc-400">Recent checkouts analyzed by the engine</p>
            </div>

            <div className="rounded-2xl p-4 bg-[#0D0D14] border border-white/[0.08] space-y-3 shadow-xl">
              {mockTransactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{tx.brand}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400">
                        {tx.route}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">{tx.date}</span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="text-xs font-bold text-emerald-400">+₹{tx.saved} Saved</div>
                    <div className="text-[10px] text-zinc-500 line-through">₹{tx.original}</div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <button className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-semibold border border-white/[0.06] transition flex items-center justify-center gap-1">
                  <span>Download Complete Statement</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Smart Stacking Tip Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-transparent border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Pro Stacking Tip
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Paying for Swiggy with an SBI Cashback card gives 5% direct rebate on top of already discounted gift vouchers.
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}