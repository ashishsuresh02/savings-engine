'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight, Tag, CreditCard, Ticket } from 'lucide-react';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBrand: (slug: string) => void;
  brands?: any[];
  cards?: any[];
  coupons?: any[];
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

  // 1. Keyboard Shortcut (⌘K / Ctrl+K & ESC)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 2. Dynamic Merged Search List
  const items = [
    ...brands.map((b) => ({
      id: `b-${b.id || b.slug}`,
      name: b.name,
      cat: b.category_name || 'Voucher',
      badge: `${b.discount}% OFF`,
      type: 'voucher',
      slug: b.slug,
    })),
    ...cards.map((c) => ({
      id: `c-${c.id}`,
      name: c.name,
      cat: c.issuer_bank || 'Card',
      badge: `${c.base_cashback}% Return`,
      type: 'card',
      slug: 'cards',
    })),
    ...coupons.map((cp, idx) => ({
      id: `cp-${idx}`,
      name: `${cp.code} • ${cp.brandName}`,
      cat: 'Promo Code',
      badge: 'Verified',
      type: 'coupon',
      slug: 'coupons',
    })),
  ];

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#090A0F] border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-white"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-white/10">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores, vouchers, or cards... (e.g. Swiggy, SBI)"
            className="w-full bg-transparent py-3.5 px-3 text-white text-xs outline-none placeholder:text-zinc-500 font-medium"
          />
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 max-h-72 overflow-y-auto space-y-1 text-xs">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs">No matching deals found.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectBrand(item.slug);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white shrink-0">
                    {item.type === 'voucher' && <Tag className="w-3.5 h-3.5" />}
                    {item.type === 'card' && <CreditCard className="w-3.5 h-3.5" />}
                    {item.type === 'coupon' && <Ticket className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs group-hover:text-zinc-200">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">{item.cat}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/10">
                    {item.badge}
                  </span>
                  <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-white" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-white/[0.02] px-4 py-2 flex justify-between text-[10px] text-zinc-500">
          <span>{filtered.length} active deals indexed</span>
          <span className="font-mono bg-white/5 px-1.5 py-0.2 rounded">ESC to close</span>
        </div>
      </motion.div>
    </div>
  );
}