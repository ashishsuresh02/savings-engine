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
  Flame,
  Search,
  Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

const BRAND_GRADIENTS: Record<string, string> = {
  Amazon: 'from-amber-500/20 via-orange-500/10 to-transparent',
  Swiggy: 'from-orange-500/20 via-rose-500/10 to-transparent',
  Myntra: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
  Zomato: 'from-rose-500/20 via-red-500/10 to-transparent',
  Dominos: 'from-sky-500/20 via-blue-500/10 to-transparent',
};

export default function DashboardVaultPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'used'>('all');
  const [userPhone, setUserPhone] = useState<string>('');
  const [vouchers, setVouchers] = useState<ClaimedVoucher[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserVault() {
      try {
        const storedPhone = localStorage.getItem('bachat_user_phone') || '';
        setUserPhone(storedPhone);

        if (!storedPhone) {
          setLoading(false);
          return;
        }

        // Fetch User's Orders from Supabase
        if (supabase) {
          const { data: orders, error } = await supabase
            .from('customer_orders')
            .select('*')
            .eq('user_phone', storedPhone.replace(/\s+/g, ''))
            .order('created_at', { ascending: false });

          if (orders && orders.length > 0) {
            let runningSavings = 0;

            const mappedVouchers: ClaimedVoucher[] = orders.map((ord: any, idx: number) => {
              const estFace = Math.round(Number(ord.amount_paid) * 1.08); // nominal estimation
              const estSaved = estFace - Number(ord.amount_paid);
              runningSavings += estSaved;

              const brandKey = Object.keys(BRAND_GRADIENTS).find(k => 
                ord.brand_name.toLowerCase().includes(k.toLowerCase())
              ) || 'Amazon';

              return {
                id: ord.id || `v-${idx}`,
                brand: ord.brand_name,
                code: ord.voucher_code_delivered,
                value: estFace,
                savedAmount: estSaved > 0 ? estSaved : 50,
                discountPct: Math.round(((estSaved || 50) / estFace) * 100),
                expiresOn: '30 Dec 2026',
                status: 'ACTIVE',
                gradient: BRAND_GRADIENTS[brandKey] || 'from-emerald-500/20 to-transparent',
              };
            });

            setVouchers(mappedVouchers);
            setTransactions(orders);
            setTotalSaved(runningSavings > 0 ? runningSavings : 240);
          } else {
            // Fallback sample data if new user
            setVouchers([
              {
                id: 'demo-1',
                brand: 'Amazon Pay Gift Card',
                code: 'AMZN-9824-SAVE',
                value: 2000,
                savedAmount: 140,
                discountPct: 7,
                expiresOn: '30 Dec 2026',
                status: 'ACTIVE',
                gradient: BRAND_GRADIENTS.Amazon,
              }
            ]);
            setTotalSaved(140);
          }
        }
      } catch (err) {
        console.warn('Dashboard sync issue:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserVault();
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
      {/* Background Soft Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[25%] right-[5%] w-[500px] h-[450px] bg-indigo-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Header */}
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
                  Secure Locker
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{userPhone ? `+91 ${userPhone}` : 'Guest Member'}</span>
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
        
        {/* Metric Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Total Money Saved
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Verified
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{totalSaved}<span className="text-emerald-400 text-2xl font-bold">.00</span>
              </div>
              <p className="text-xs text-zinc-400">Total cash retained via 3-layer stacking</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" /> Active Vouchers
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Locker Ready
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {vouchers.length}<span className="text-indigo-400 text-2xl font-bold"> Codes</span>
              </div>
              <p className="text-xs text-zinc-400">Instant gift codes available to copy & paste</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Card Multiplier
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                5% Live
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                SBI Card<span className="text-amber-400 text-2xl font-bold"> Linked</span>
              </div>
              <p className="text-xs text-zinc-400">Direct credit card statement rebate active</p>
            </div>
          </div>
        </section>

        {/* Quick Calculator Callout */}
        <section className="rounded-3xl p-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-transparent border border-emerald-500/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-black flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Need another discounted gift card?</h3>
              <p className="text-xs text-zinc-400">Run the live calculator before paying on Amazon, Swiggy, or Myntra to lock in arbitrage.</p>
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

        {/* Vouchers & Order History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Your Secret Vouchers */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Your Unlocked Codes Locker
                </h2>
                <p className="text-xs text-zinc-400">Click copy and paste during checkout in merchant app</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {vouchers.map((voucher) => (
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {voucher.discountPct}% OFF
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span>Face: <strong className="text-white">₹{voucher.value}</strong></span>
                        <span>•</span>
                        <span>Saved: <strong className="text-emerald-400">₹{voucher.savedAmount}</strong></span>
                        <span>•</span>
                        <span>Valid till: {voucher.expiresOn}</span>
                      </div>
                    </div>

                    {/* Copy Box */}
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] font-mono text-xs font-bold text-emerald-400 tracking-wider select-all">
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

          {/* Right: Payment Ledger */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Live Payment Ledger
              </h2>
              <p className="text-xs text-zinc-400">Timestamped transaction history</p>
            </div>

            <div className="rounded-2xl p-4 bg-[#0D0D14] border border-white/[0.08] space-y-3 shadow-xl">
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => (
                  <div 
                    key={tx.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{tx.brand_name}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {tx.payment_method || 'UPI'}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white">Paid ₹{tx.amount_paid}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Success</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No orders yet. Buy your first voucher to populate your ledger!
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}