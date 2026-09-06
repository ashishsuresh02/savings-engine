'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BrandVoucher } from '@/types/voucher';

// Mock DB Dataset (mirroring Django backend models)
const INITIAL_VOUCHERS: BrandVoucher[] = [
  {
    id: '1',
    slug: 'dominos-pizza',
    brandName: "Domino's Pizza",
    category: 'Food & Dining',
    source: 'DIRECT',
    logoText: '🍕',
    bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
    accentColor: '#006491',
    description: 'Instant discount on pizzas, pastas, and combos for dine-in & takeaway.',
    minOrderValue: 299,
    isVerified: true,
    successRate: 98,
    upvotes: 420,
    downvotes: 8,
    expiryDate: '2026-12-31',
    denominations: [
      { id: 'd1', faceValue: 250, sellingPrice: 220, discountPercentage: 12, stockRemaining: 15 },
      { id: 'd2', faceValue: 500, sellingPrice: 425, discountPercentage: 15, stockRemaining: 8 },
    ],
  },
  {
    id: '2',
    slug: 'amazon-pay',
    brandName: 'Amazon Pay',
    category: 'Shopping',
    source: 'AFFILIATE',
    logoText: 'a',
    bannerImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
    accentColor: '#FF9900',
    description: 'Direct Amazon wallet credit. Valid across recharges, bills, and shopping.',
    minOrderValue: 500,
    isVerified: true,
    successRate: 100,
    upvotes: 1240,
    downvotes: 2,
    expiryDate: '2027-01-01',
    denominations: [
      { id: 'd3', faceValue: 1000, sellingPrice: 970, discountPercentage: 3, stockRemaining: 40 },
      { id: 'd4', faceValue: 2000, sellingPrice: 1940, discountPercentage: 3, stockRemaining: 12 },
    ],
  },
  {
    id: '3',
    slug: 'zomato-gold',
    brandName: 'Zomato',
    category: 'Food & Dining',
    source: 'DIRECT',
    logoText: 'Z',
    bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60',
    accentColor: '#E23744',
    description: 'Flat reduction on food delivery and top restaurant dining bills.',
    minOrderValue: 199,
    isVerified: true,
    successRate: 94,
    upvotes: 830,
    downvotes: 14,
    expiryDate: '2026-10-15',
    denominations: [
      { id: 'd5', faceValue: 200, sellingPrice: 160, discountPercentage: 20, stockRemaining: 25 },
      { id: 'd6', faceValue: 500, sellingPrice: 420, discountPercentage: 16, stockRemaining: 3 },
    ],
  },
  {
    id: '4',
    slug: 'myntra-fashion',
    brandName: 'Myntra',
    category: 'Shopping',
    source: 'COMMUNITY',
    logoText: 'M',
    bannerImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=60',
    accentColor: '#FF3F6C',
    description: 'Stackable voucher code for seasonal sales, shoes, and lifestyle brands.',
    minOrderValue: 999,
    isVerified: false,
    successRate: 88,
    upvotes: 215,
    downvotes: 22,
    expiryDate: '2026-09-30',
    denominations: [
      { id: 'd7', faceValue: 1000, sellingPrice: 850, discountPercentage: 15, stockRemaining: 5 },
    ],
  },
];

const CATEGORIES = ['All', 'Food & Dining', 'Shopping', 'Entertainment', 'Travel'];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'DISCOUNT' | 'SUCCESS'>('DISCOUNT');

  const filteredVouchers = useMemo(() => {
    return INITIAL_VOUCHERS.filter((item) => {
      const matchesSearch = item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesVerified = verifiedOnly ? item.isVerified : true;

      return matchesSearch && matchesCategory && matchesVerified;
    }).sort((a, b) => {
      if (sortBy === 'DISCOUNT') {
        const maxDiscA = Math.max(...a.denominations.map(d => d.discountPercentage));
        const maxDiscB = Math.max(...b.denominations.map(d => d.discountPercentage));
        return maxDiscB - maxDiscA;
      }
      return b.successRate - a.successRate;
    });
  }, [searchQuery, selectedCategory, verifiedOnly, sortBy]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-12">
      {/* Header & Controls */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
          Explore Instant Vouchers
        </h1>
        <p className="text-slate-400 text-sm md:text-base mb-8">
          Filtered inventory linked to direct merchant APIs and verified communities.
        </p>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search brands (e.g. Domino's, Amazon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="md:col-span-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Toggle */}
          <div className="md:col-span-3 flex items-center justify-end gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              Verified Only
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'DISCOUNT' | 'SUCCESS')}
              className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 text-slate-200"
            >
              <option value="DISCOUNT">Highest Discount</option>
              <option value="SUCCESS">Highest Success</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVouchers.map((voucher) => {
          const highestDiscount = Math.max(...voucher.denominations.map((d) => d.discountPercentage));
          const lowestPrice = Math.min(...voucher.denominations.map((d) => d.sellingPrice));

          return (
            <div
              key={voucher.id}
              className="group relative bg-[#0f172a] rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              {/* Background Thumbnail */}
              <div 
                className="h-32 w-full bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
                style={{ backgroundImage: `url(${voucher.bannerImage})` }}
              />

              <div className="p-6 relative -mt-12 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Brand Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-xl font-bold shadow-lg">
                      {voucher.logoText}
                    </div>
                    {/* Discount Badge */}
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      UP TO {highestDiscount}% OFF
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">{voucher.brandName}</h2>
                    {voucher.isVerified && (
                      <span className="text-sky-400 text-sm" title="Zero-Fake Verified">✓</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {voucher.description}
                  </p>
                </div>

                {/* Metrics & Action Footer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Starting At</span>
                    <span className="text-base font-extrabold text-white">₹{lowestPrice}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/30">
                      {voucher.successRate}% Success
                    </span>

                    <Link
                      href={`/brand/${voucher.slug}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors"
                    >
                      View Deals
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVouchers.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-sm">No vouchers match your current filters.</p>
        </div>
      )}
    </div>
  );
}