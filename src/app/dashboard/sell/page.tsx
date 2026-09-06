'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ListedVoucher {
  id: string;
  brandName: string;
  faceValue: number;
  sellingPrice: number;
  payoutAmount: number;
  status: 'VERIFYING' | 'LISTED' | 'SOLD';
  submittedDate: string;
}

const SUPPORTED_BRANDS = [
  "Domino's Pizza",
  "Amazon Pay",
  "Flipkart",
  "Myntra",
  "Zomato",
  "Swiggy",
  "BookMyShow",
  "Nykaa",
];

const INITIAL_LISTINGS: ListedVoucher[] = [
  {
    id: 'p2p-1',
    brandName: 'Flipkart',
    faceValue: 1000,
    sellingPrice: 900,
    payoutAmount: 855, // 5% platform commission cut
    status: 'LISTED',
    submittedDate: '2026-09-02',
  },
  {
    id: 'p2p-2',
    brandName: 'BookMyShow',
    faceValue: 500,
    sellingPrice: 420,
    payoutAmount: 399,
    status: 'SOLD',
    submittedDate: '2026-08-28',
  },
];

export default function SellVoucherPage() {
  const [listings, setListings] = useState<ListedVoucher[]>(INITIAL_LISTINGS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [selectedBrand, setSelectedBrand] = useState(SUPPORTED_BRANDS[0]);
  const [faceValue, setFaceValue] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherPin, setVoucherPin] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [upiPayoutId, setUpiPayoutId] = useState('');

  // Auto-calculated values (5% platform fee for escrow guarantee)
  const numFace = Number(faceValue) || 0;
  const numSell = Number(sellingPrice) || 0;
  const buyerDiscount = numFace > 0 && numSell > 0 ? Math.round(((numFace - numSell) / numFace) * 100) : 0;
  const escrowFee = Math.round(numSell * 0.05);
  const netPayout = numSell > 0 ? numSell - escrowFee : 0;

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (!numFace || !numSell || numSell >= numFace) {
      alert('Selling price face value se kam honi chahiye taaki buyer ko discount mile!');
      return;
    }

    if (!voucherCode || !voucherPin) {
      alert('Voucher Code aur PIN enter karna zaroori hai.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newListing: ListedVoucher = {
        id: `p2p-${Date.now()}`,
        brandName: selectedBrand,
        faceValue: numFace,
        sellingPrice: numSell,
        payoutAmount: netPayout,
        status: 'VERIFYING',
        submittedDate: new Date().toISOString().split('T')[0],
      };

      setListings((prev) => [newListing, ...prev]);
      setIsSubmitting(false);

      // Form reset
      setFaceValue('');
      setSellingPrice('');
      setVoucherCode('');
      setVoucherPin('');
      setExpiryDate('');
      alert('Voucher successfully submit ho gaya! Escrow validation ke baad marketplace par live ho jayega.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">← Back to Vault</Link>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">P2P Voucher Marketplace</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Sell Your Unused Gift Cards
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Convert unwanted reward cards into direct UPI bank cash. Protected by automated escrow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Sell Submission Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleCreateListing} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
              
              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {SUPPORTED_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Original Face Value (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1000"
                    value={faceValue}
                    onChange={(e) => setFaceValue(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Asking Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 850"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Live Fee & Payout Preview */}
              {numFace > 0 && numSell > 0 && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Buyer Discount Offered:</span>
                    <span className="text-emerald-400 font-bold">{buyerDiscount}% OFF</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Platform Escrow Fee (5%):</span>
                    <span>- ₹{escrowFee}</span>
                  </div>
                  <div className="flex justify-between text-white font-extrabold pt-2 border-t border-indigo-500/20 text-sm">
                    <span>Your Net Payout:</span>
                    <span className="text-emerald-400">₹{netPayout}</span>
                  </div>
                </div>
              )}

              {/* Credentials Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">16-Digit Voucher Code</label>
                  <input
                    type="text"
                    required
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Security PIN / CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    placeholder="••••"
                    value={voucherPin}
                    onChange={(e) => setVoucherPin(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Expiry & Payout UPI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your UPI ID for Payout</label>
                  <input
                    type="text"
                    required
                    placeholder="yourname@upi"
                    value={upiPayoutId}
                    onChange={(e) => setUpiPayoutId(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 transition-all font-extrabold text-sm text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Verifying Card with Aggregator...' : `List Card for ₹${netPayout} Payout`}
              </button>

            </form>
          </div>

          {/* Right Column: Active Listings & Escrow Rules */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Escrow Rule Banner */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                🛡️ How Seller Escrow Works
              </h3>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Card credentials are encrypted in backend storage until purchase.</li>
                <li>When a buyer orders, the card is delivered instantly.</li>
                <li>Funds remain in <strong>Escrow</strong> until the buyer redeems or 24 hours pass without dispute.</li>
                <li>Payout is credited automatically to your verified UPI ID.</li>
              </ul>
            </div>

            {/* Seller History List */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Your Card Listings</h3>

              <div className="space-y-3">
                {listings.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.brandName}</h4>
                      <span className="text-slate-400">Face: ₹{item.faceValue} • Payout: ₹{item.payoutAmount}</span>
                    </div>

                    <div>
                      {item.status === 'VERIFYING' && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                          VERIFYING
                        </span>
                      )}
                      {item.status === 'LISTED' && (
                        <span className="px-2.5 py-1 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold text-[10px]">
                          ACTIVE ON MARKET
                        </span>
                      )}
                      {item.status === 'SOLD' && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                          PAID OUT ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}