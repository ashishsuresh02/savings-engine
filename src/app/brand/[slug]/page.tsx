'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandVoucher, Denomination } from '@/types/voucher';

// Complete Mock Database mirroring Django Backend models
const BRAND_DATABASE: Record<string, BrandVoucher> = {
  'dominos-pizza': {
    id: '1',
    slug: 'dominos-pizza',
    brandName: "Domino's Pizza",
    category: 'Food & Dining',
    source: 'DIRECT',
    logoText: '🍕',
    bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#006491',
    description: 'Valid across all company-owned stores across India and online app checkout orders.',
    minOrderValue: 299,
    isVerified: true,
    successRate: 98,
    upvotes: 420,
    downvotes: 8,
    expiryDate: '2026-12-31',
    denominations: [
      { id: 'd1', faceValue: 250, sellingPrice: 220, discountPercentage: 12, stockRemaining: 15 },
      { id: 'd2', faceValue: 500, sellingPrice: 425, discountPercentage: 15, stockRemaining: 8 },
      { id: 'd3', faceValue: 1000, sellingPrice: 830, discountPercentage: 17, stockRemaining: 5 },
      { id: 'd4', faceValue: 2000, sellingPrice: 1600, discountPercentage: 20, stockRemaining: 2 },
    ],
  },
  'amazon-pay': {
    id: '2',
    slug: 'amazon-pay',
    brandName: 'Amazon Pay',
    category: 'Shopping',
    source: 'AFFILIATE',
    logoText: 'a',
    bannerImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#FF9900',
    description: 'Direct Amazon balance credit. Can be used for recharges, bill payments, and e-commerce shopping.',
    minOrderValue: 500,
    isVerified: true,
    successRate: 100,
    upvotes: 1240,
    downvotes: 2,
    expiryDate: '2027-01-01',
    denominations: [
      { id: 'd5', faceValue: 500, sellingPrice: 485, discountPercentage: 3, stockRemaining: 50 },
      { id: 'd6', faceValue: 1000, sellingPrice: 970, discountPercentage: 3, stockRemaining: 40 },
      { id: 'd7', faceValue: 2000, sellingPrice: 1940, discountPercentage: 3, stockRemaining: 12 },
    ],
  },
};

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const brand = BRAND_DATABASE[slug];

  // Default selected denomination: Pehla item
  const [selectedDenom, setSelectedDenom] = useState<Denomination | null>(
    brand?.denominations?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [votes, setVotes] = useState({
    up: brand?.upvotes || 0,
    down: brand?.downvotes || 0,
    userVoted: null as 'up' | 'down' | null,
  });

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Brand Voucher Not Found</h2>
        <Link href="/explore" className="text-indigo-400 hover:underline">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  const handleVote = (type: 'up' | 'down') => {
    if (votes.userVoted) return; // Allow only 1 vote per session
    if (type === 'up') {
      setVotes((prev) => ({ ...prev, up: prev.up + 1, userVoted: 'up' }));
    } else {
      setVotes((prev) => ({ ...prev, down: prev.down + 1, userVoted: 'down' }));
    }
  };

  const handleProceedToCheckout = () => {
    if (!selectedDenom) return;
    
    // Query params / state ke sath checkout page redirect
    const query = new URLSearchParams({
      brandId: brand.id,
      denomId: selectedDenom.id,
      brandName: brand.brandName,
      faceValue: selectedDenom.faceValue.toString(),
      sellingPrice: selectedDenom.sellingPrice.toString(),
      quantity: quantity.toString(),
    }).toString();

    router.push(`/checkout?${query}`);
  };

  const savingsPerCard = selectedDenom ? selectedDenom.faceValue - selectedDenom.sellingPrice : 0;
  const totalPayable = selectedDenom ? selectedDenom.sellingPrice * quantity : 0;
  const totalSavings = savingsPerCard * quantity;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-20">
      {/* Brand Hero Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${brand.bannerImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/70 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
            {/* Logo Badge */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-900/90 border border-white/15 flex items-center justify-center text-4xl shadow-2xl backdrop-blur-xl">
              {brand.logoText}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs uppercase tracking-widest font-bold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
                  {brand.category}
                </span>
                {brand.isVerified && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40 flex items-center gap-1">
                    ✓ Verified Guarantee
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                {brand.brandName}
              </h1>
            </div>

            {/* Live Reliability Metrics */}
            <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Community Trust</span>
                <span className="text-emerald-400 font-black text-sm">{brand.successRate}% Success</span>
              </div>
              <div className="h-7 w-[1px] bg-white/10" />
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleVote('up')}
                  disabled={votes.userVoted !== null}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    votes.userVoted === 'up' ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  👍 {votes.up}
                </button>
                <button
                  onClick={() => handleVote('down')}
                  disabled={votes.userVoted !== null}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    votes.userVoted === 'down' ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  👎 {votes.down}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Selection vs Order Summary */}
      <div className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Denomination & Details */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Select Gift Card Value</h2>
            <p className="text-slate-400 text-xs mb-4">Choose a denomination to instantly receive a 16-digit voucher code and PIN.</p>

            <div className="grid grid-cols-2 gap-4">
              {brand.denominations.map((denom) => {
                const isSelected = selectedDenom?.id === denom.id;
                return (
                  <div
                    key={denom.id}
                    onClick={() => setSelectedDenom(denom)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl font-black text-white">₹{denom.faceValue}</span>
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {denom.discountPercentage}% OFF
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Pay: ₹{denom.sellingPrice}</span>
                      <span className="text-[11px] text-slate-500">{denom.stockRemaining} left</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-bl" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <div>
              <span className="text-sm font-bold text-white block">Select Quantity</span>
              <span className="text-xs text-slate-400">Maximum 5 vouchers allowed per transaction</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
              >
                -
              </button>
              <span className="text-base font-bold text-white px-2">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Redemption Rules</h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 leading-relaxed">
              <li>Valid for 12 months from purchase date. Can be used online and in official retail outlets.</li>
              <li>Single voucher cannot be split into multiple cash withdrawals.</li>
              <li>Stackable with in-store promotional discounts unless explicitly restricted by the brand.</li>
              <li>Instant delivery directly delivered to your dashboard and registered email.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Checkout Summary Box */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-slate-900/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
            <h3 className="text-base font-bold text-white mb-6">Payment Summary</h3>

            {selectedDenom ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Card Denomination</span>
                  <span className="font-semibold text-white">₹{selectedDenom.faceValue} × {quantity}</span>
                </div>

                <div className="flex justify-between text-sm text-slate-300">
                  <span>Total Value</span>
                  <span className="line-through text-slate-500">₹{selectedDenom.faceValue * quantity}</span>
                </div>

                <div className="flex justify-between text-sm text-emerald-400 font-semibold">
                  <span>Direct Instant Discount</span>
                  <span>- ₹{totalSavings}</span>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold block">Net Payable</span>
                    <span className="text-xs text-emerald-400 font-semibold">Total Savings: ₹{totalSavings}</span>
                  </div>
                  <span className="text-3xl font-black text-white">₹{totalPayable}</span>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4"
                >
                  Proceed to Instant Checkout →
                </button>

                <p className="text-[11px] text-center text-slate-500 mt-2">
                  🔒 Encrypted Payment • Zero Platform Fees
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Please select a denomination above to continue.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}