'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface VaultCard {
  id: string;
  brandName: string;
  faceValue: number;
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
    brandName: 'Amazon Pay',
    faceValue: 1000,
    code: 'AMZN-9923-4412-8871',
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
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<VaultCard[]>(INITIAL_VAULT);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'REDEEMED'>('ACTIVE');

  // Checkout se redirect hokar aaya naya card add karo
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
        code: code,
        pin: pin,
        expiryDate: '2027-09-06',
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        isMasked: false, // New purchase reveals instantly
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

  const filteredCards = cards.filter((c) => c.status === activeTab);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              Your Digital Voucher Vault
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Access 16-digit voucher codes, card security PINs, and real-time validity status.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/sell"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors"
            >
              + Sell Unused Card
            </Link>
            <Link
              href="/explore"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Browse More Deals
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-4 border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'ACTIVE'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Vouchers ({cards.filter((c) => c.status === 'ACTIVE').length})
            {activeTab === 'ACTIVE' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('REDEEMED')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'REDEEMED'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Redeemed History ({cards.filter((c) => c.status === 'REDEEMED').length})
            {activeTab === 'REDEEMED' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />
            )}
          </button>
        </div>

        {/* Card Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all ${
                card.status === 'ACTIVE'
                  ? 'bg-slate-900/70 border-white/10 hover:border-indigo-500/30 shadow-xl'
                  : 'bg-slate-900/30 border-white/5 opacity-60'
              }`}
            >
              <div>
                {/* Brand & Value Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{card.brandName}</h2>
                    <span className="text-[11px] text-slate-400">Purchased on {card.purchaseDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">₹{card.faceValue}</span>
                    <span className="text-[10px] block uppercase font-bold text-slate-400">Card Value</span>
                  </div>
                </div>

                {/* Secure Voucher Credentials Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3 mb-6">
                  
                  {/* Voucher Code */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                        Card Number / Voucher Code
                      </span>
                      <span className="text-sm font-mono font-bold tracking-wider text-slate-100">
                        {card.isMasked ? '•••• •••• •••• ••••' : card.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMask(card.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                        title={card.isMasked ? 'Reveal credentials' : 'Mask credentials'}
                      >
                        {card.isMasked ? '👁️' : '🙈'}
                      </button>

                      <button
                        onClick={() => handleCopy(card.id, card.code, 'code')}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                      >
                        {card.copiedField === 'code' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Security PIN */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                        Security PIN
                      </span>
                      <span className="text-xs font-mono font-bold tracking-widest text-slate-300">
                        {card.isMasked ? '••••' : card.pin}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(card.id, card.pin, 'pin')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      {card.copiedField === 'pin' ? 'Copied!' : 'Copy PIN'}
                    </button>
                  </div>

                </div>
              </div>

              {/* Status & Expiry Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>⏳</span>
                  <span>Expires: <strong className="text-slate-200">{card.expiryDate}</strong></span>
                </div>

                {card.status === 'ACTIVE' ? (
                  <button
                    onClick={() => markAsRedeemed(card.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Mark as Used ✓
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-slate-500">Redeemed</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5">
            <p className="text-slate-500 text-sm mb-4">No {activeTab.toLowerCase()} vouchers found in your vault.</p>
            <Link
              href="/explore"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Discover Vouchers
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b14] text-white p-10">Loading Vault...</div>}>
      <DashboardContent />
    </Suspense>
  );
}