'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';

interface SubmitCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: { id: string; name: string; slug: string }[];
  onSuccess: (newCoupon: any) => void;
}

export default function SubmitCouponModal({
  isOpen,
  onClose,
  brands,
  onSuccess,
}: SubmitCouponModalProps) {
  const [selectedSlug, setSelectedSlug] = useState(brands[0]?.slug || 'dominos');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [stackable, setStackable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/coupons/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: selectedSlug,
          code,
          title,
          stackable,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit coupon');
      }

      const brandObj = brands.find((b) => b.slug === selectedSlug);
      onSuccess({
        brandName: brandObj?.name || 'Store',
        code: code.trim().toUpperCase(),
        title: title || `Flat discount code (${code.trim().toUpperCase()})`,
        stackable: stackable,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0E0E14] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 relative shadow-2xl animate-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Community Deal Sharing
          </div>
          <h3 className="text-xl font-black text-white">Share a Working Code</h3>
          <p className="text-xs text-zinc-400">
            GPay ya PhonePe ka unused code drop karein aur platform par live share karein.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Select Merchant / Brand
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.slug} className="bg-[#0E0E14] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Coupon Code (e.g. PIZZA50)
            </label>
            <input
              type="text"
              required
              placeholder="FLAT100"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-wider outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Offer Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Flat ₹100 off on bills above ₹499"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <label className="flex items-center gap-2 text-zinc-300 font-medium cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={stackable}
              onChange={(e) => setStackable(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-emerald-400 focus:ring-0 cursor-pointer"
            />
            Stackable with Gift Vouchers
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Submitting to Database...' : 'Publish to Live Registry'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}