'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  LogOut,
  ExternalLink,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VaultCard {
  id: string;
  brandName: string;
  faceValue: number;
  paidAmount: number;
  code: string;
  pin: string;
  expiryDate: string;
  purchaseDate: string;
  status: 'ACTIVE' | 'REDEEMED';
  isMasked: boolean;
  copiedField: 'code' | 'pin' | null;
}

const INITIAL_VAULT: VaultCard[] = [
  {
    id: 'vault-1',
    brandName: "Domino's Pizza",
    faceValue: 500,
    paidAmount: 415,
    code: 'DOM-9923-4412-8871',
    pin: '8392',
    expiryDate: '2027-01-01',
    purchaseDate: '2026-08-20',
    status: 'ACTIVE',
    isMasked: true,
    copiedField: null,
  },
  {
    id: 'vault-2',
    brandName: 'Zomato',
    faceValue: 250,
    paidAmount: 210,
    code: 'ZOM-4491-1102-3394',
    pin: '1044',
    expiryDate: '2026-09-30',
    purchaseDate: '2026-09-01',
    status: 'ACTIVE',
    isMasked: true,
    copiedField: null,
  },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<VaultCard[]>(INITIAL_VAULT);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'REDEEMED'>('ACTIVE');
  const [userSession, setUserSession] = useState<any>(null);

  // 1. Session Check from Supabase
  useEffect(() => {
    async function checkAuth() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserSession(session.user);
      }
    }
    checkAuth();
  }, []);

  // 2. Checkout redirect handling (Auto-append new purchase)
  useEffect(() => {
    const brand = searchParams.get('brand');
    const value = searchParams.get('value');
    const code = searchParams.get('code');
    const pin = searchParams.get('pin');

    if (brand && code && pin) {
      const newCard: VaultCard = {
        id: `vault-${Date.now()}`,
        brandName: brand,
        faceValue: Number(value) || 500,
        paidAmount: Math.round(Number(value) * 0.85) || 425,
        code: code,
        pin: pin,
        expiryDate: '2027-09-06',
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        isMasked: false, // Show code immediately on fresh checkout
        copiedField: null,
      };

      setCards((prev) => [newCard, ...prev]);
    }
  }, [searchParams]);

  const toggleMask = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMasked: !c.isMasked } : c))
    );
  };

  const handleCopy = (id: string, text: string, type: 'code' | 'pin') => {
    navigator.clipboard.writeText(text);
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, copiedField: type } : c))
    );

    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, copiedField: null } : c))
      );
    }, 2000);
  };

  const markAsRedeemed = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'REDEEMED' } : c))
    );
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  // Metrics
  const totalValue = cards.reduce((acc, c) => acc + c.faceValue, 0);
  const totalPaid = cards.reduce((acc, c) => acc + c.paidAmount, 0);
  const totalSavings = totalValue - totalPaid;

  const filteredCards = cards.filter((c) => c.status === activeTab);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans p-6 md:p-12 selection:bg-emerald-400 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Arbitrage Engine</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/sell"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 transition"
            >
              + Sell Unused Card
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Banner & Lifetime Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#0E0E14] border border-white/[0.08] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Digital Card Vault
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {userSession?.phone || userSession?.email || 'Active Member Vault'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                All 16-digit codes and CVV security PINs are protected with single-session reveal encryption.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-6 pt-4 border-t border-white/[0.06]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Instant Balance Redemption Guaranteed</span>
            </div>
          </div>

          {/* Savings Ledger Card */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#0E0E14] border border-emerald-500/20 flex flex-col justify-between shadow-xl shadow-emerald-500/5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Net Arbitrage Savings
              </span>
              <p className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                ₹{totalSavings}
              </p>
            </div>

            <div className="text-xs text-zinc-400 space-y-2 pt-6 border-t border-white/[0.06] mt-4">
              <div className="flex justify-between">
                <span>Total Face Value:</span>
                <span className="text-white font-bold">₹{totalValue}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount Paid:</span>
                <span className="text-white font-bold">₹{totalPaid}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Filters */}
        <div className="flex gap-6 border-b border-white/[0.08]">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-all relative ${
              activeTab === 'ACTIVE'
                ? 'text-emerald-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Vouchers ({cards.filter((c) => c.status === 'ACTIVE').length})
            {activeTab === 'ACTIVE' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('REDEEMED')}
            className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-all relative ${
              activeTab === 'REDEEMED'
                ? 'text-emerald-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Redeemed History ({cards.filter((c) => c.status === 'REDEEMED').length})
            {activeTab === 'REDEEMED' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Cards Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                card.status === 'ACTIVE'
                  ? 'bg-[#0E0E14] border-white/[0.08] hover:border-emerald-500/30 shadow-xl'
                  : 'bg-[#0A0A0F] border-white/[0.04] opacity-60'
              }`}
            >
              <div>
                {/* Brand Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white">{card.brandName}</h2>
                    <span className="text-[11px] text-zinc-500">Purchased on {card.purchaseDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">₹{card.faceValue}</span>
                    <span className="text-[10px] block uppercase font-bold text-emerald-400">Paid ₹{card.paidAmount}</span>
                  </div>
                </div>

                {/* Secure Voucher Credentials Box */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3 mb-6">
                  
                  {/* Voucher Code */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-0.5">
                        Card Number / Voucher Code
                      </span>
                      <span className="text-sm font-mono font-bold tracking-wider text-white">
                        {card.isMasked ? '•••• •••• •••• ••••' : card.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMask(card.id)}
                        className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition"
                        title={card.isMasked ? 'Reveal credentials' : 'Mask credentials'}
                      >
                        {card.isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleCopy(card.id, card.code, 'code')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        {card.copiedField === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{card.copiedField === 'code' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Security PIN */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-0.5">
                        Security PIN
                      </span>
                      <span className="text-xs font-mono font-bold tracking-widest text-zinc-300">
                        {card.isMasked ? '••••' : card.pin}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(card.id, card.pin, 'pin')}
                      className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-bold transition"
                    >
                      {card.copiedField === 'pin' ? 'Copied!' : 'Copy PIN'}
                    </button>
                  </div>

                </div>
              </div>

              {/* Status & Expiry Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Expires: <strong className="text-zinc-200">{card.expiryDate}</strong></span>
                </div>

                {card.status === 'ACTIVE' ? (
                  <button
                    onClick={() => markAsRedeemed(card.id)}
                    className="text-[11px] font-bold text-zinc-400 hover:text-emerald-400 transition"
                  >
                    Mark as Used ✓
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-zinc-500">Redeemed</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className="text-center py-20 bg-[#0E0E14] rounded-3xl border border-white/[0.08] space-y-4">
            <p className="text-zinc-500 text-sm">No {activeTab.toLowerCase()} vouchers found in your vault.</p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-xl text-xs font-black uppercase tracking-wider transition"
            >
              Explore Wholesale Deals
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070709] text-white p-10 font-mono text-xs">Loading Secure Vault...</div>}>
      <DashboardContent />
    </Suspense>
  );
}