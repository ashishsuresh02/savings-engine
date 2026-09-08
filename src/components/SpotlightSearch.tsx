'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight, Tag, CreditCard, Ticket } from 'lucide-react';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBrand: (slug: string) => void;
  brands: any[];
  cards: any[];
  coupons: any[];
}

export default function SpotlightSearch({
  isOpen,
  onClose,
  onSelectBrand,
  brands = [],
  cards = [],
  coupons = [],
}: SpotlightSearchProps) {
  const [query, setQuery] = useState('');

  // 1. Dynamic combined search items array
  const searchItems = [
    // Dynamic Brands / Vouchers
    ...brands.map((b) => ({
      id: `brand-${b.id || b.slug}`,
      name: b.name,
      category: b.category_name || 'Wholesale Voucher',
      discount: `${b.discount}% OFF`,
      type: 'voucher' as const,
      slug: b.slug,
    })),
    // Dynamic Cards
    ...cards.map((c) => ({
      id: `card-${c.id}`,
      name: c.name,
      category: c.issuer_bank || 'Cashback Card',
      discount: `${c.base_cashback}% Return`,
      type: 'card' as const,
      slug: 'cards',
    })),
    // Dynamic Coupons
    ...coupons.map((cp, idx) => ({
      id: `coupon-${idx}`,
      name: `${cp.code} • ${cp.brandName}`,
      category: 'Verified Store Code',
      discount: cp.title || 'Verified Code',
      type: 'coupon' as const,
      slug: 'coupons',
    })),
  ];

  // 2. Keyboard shortcut listener (Ctrl + K / Cmd + K / ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = searchItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-20 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        className="bg-[#090A0F] border border-white/10 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-white"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 border-b border-white/10">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merchants, vouchers, or cards... (e.g. Domino's, SBI)"
            className="w-full bg-transparent py-4 px-3.5 text-white text-sm outline-none placeholder:text-zinc-500 font-medium"
          />
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1 text-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-medium">
              No matching merchants, vouchers, or financial cards found for "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectBrand(item.slug);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white shrink-0">
                    {item.type === 'voucher' && <Tag className="w-4 h-4" />}
                    {item.type === 'card' && <CreditCard className="w-4 h-4" />}
                    {item.type === 'coupon' && <Ticket className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-white text-xs block group-hover:text-zinc-200 transition truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">{item.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
                    {item.discount}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Meta */}
        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-2.5 flex justify-between items-center text-[10px] text-zinc-400 font-medium">
          <span>Real-Time Index: {searchItems.length} active deals</span>
          <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">ESC to exit</span>
        </div>
      </motion.div>
    </div>
  );
}