'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Send, Check, Tag, ShieldCheck, Gift } from 'lucide-react';

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
          code: code.trim().toUpperCase(),
          title: title.trim(),
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
        title: title.trim() || `Flat discount code (${code.trim().toUpperCase()})`,
        stackable: stackable,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while submitting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 max-w-md w-full space-y-5 relative shadow-[0_25px_60px_rgba(11,43,92,0.18)] text-slate-900"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E51B24] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Community Deal Sharing
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Share a Working Code</h3>
          <p className="text-xs text-slate-500 font-medium">
            GPay ya PhonePe ka unused code drop karein aur community ke saath live share karein.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-[#E51B24] text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Brand Selection Dropdown */}
          <div className="text-left">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
              Select Merchant / Brand
            </label>
            <div className="relative">
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-xs outline-none focus:border-[#E51B24] transition appearance-none cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.slug} className="text-slate-900">
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="text-left">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
              Coupon Code (e.g. SWIGGY150)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="FLAT100"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono font-black text-sm tracking-wider outline-none focus:border-[#E51B24] transition uppercase placeholder:text-slate-400"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Offer Title Input */}
          <div className="text-left">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
              Offer Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Flat ₹100 off on orders above ₹499"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-xs outline-none focus:border-[#E51B24] transition placeholder:text-slate-400"
            />
          </div>

          {/* Stacking Checkbox */}
          <div 
            onClick={() => setStackable(!stackable)}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-left ${
              stackable ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Gift className={`w-4 h-4 ${stackable ? 'text-[#E51B24]' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Stackable with Gift Vouchers</span>
                <span className="text-[10px] text-slate-500 font-medium">Allows triple stacking discount on cart</span>
              </div>
            </div>
            
            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
              stackable ? 'bg-[#E51B24] border-[#E51B24] text-white' : 'border-slate-300 bg-white'
            }`}>
              {stackable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E51B24] hover:bg-[#CC141D] disabled:opacity-50 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md shadow-red-500/25 active:scale-[0.99]"
          >
            {loading ? 'Submitting to Database...' : 'Publish to Live Registry'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </motion.div>
    </div>
  );
}