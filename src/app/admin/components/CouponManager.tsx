'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Tag, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CouponManagerProps {
  brands: any[];
  coupons: any[];
  onRefresh: () => void;
  showStatus: (msg: string, type: 'success' | 'error') => void;
}

export default function CouponManager({ brands, coupons, onRefresh, showStatus }: CouponManagerProps) {
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || '');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountVal, setDiscountVal] = useState('100');
  const [stackable, setStackable] = useState(true);
  const [loading, setLoading] = useState(false);

  // 1. ADD COUPON
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('brand_coupons').insert([{
        brand_id: selectedBrandId || brands[0]?.id,
        coupon_code: code.trim().toUpperCase(),
        title: title.trim() || `Flat ₹${discountVal} off`,
        discount_value: Number(discountVal) || 100,
        stackable_with_voucher: stackable,
        is_verified: true,
      }]);

      if (error) throw error;

      showStatus(`Coupon ${code.toUpperCase()} added & verified!`, 'success');
      setCode('');
      setTitle('');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message || 'Failed to add coupon', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. TOGGLE VERIFIED STATUS
  const handleToggleVerify = async (id: string, currentVerified: boolean) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('brand_coupons')
        .update({ is_verified: !currentVerified })
        .eq('id', id);

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  // 3. DELETE COUPON
  const handleDeleteCoupon = async (id: string, couponCode: string) => {
    if (!confirm(`Delete coupon ${couponCode}?`)) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('brand_coupons').delete().eq('id', id);
      if (error) throw error;
      showStatus(`Deleted coupon ${couponCode}`, 'success');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Create Coupon */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#E51B24]" /> Add Store Promo Code
        </h3>

        <form onSubmit={handleAddCoupon} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Select Store</label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. FLAT150"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-black text-sm uppercase outline-none focus:border-[#E51B24]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Discount (₹)</label>
              <input
                type="number"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stackable}
                  onChange={(e) => setStackable(e.target.checked)}
                  className="w-4 h-4 accent-[#E51B24]"
                />
                <span>Stackable</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. ₹150 off on orders above ₹499"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E51B24] hover:bg-[#CC141D] text-white font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20 active:scale-95"
          >
            {loading ? 'Adding...' : 'Publish Verified Coupon'}
          </button>
        </form>
      </div>

      {/* Coupons List */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
          <span>Active Promo Registry</span>
          <span className="text-xs font-bold text-slate-400">{coupons.length} Total Codes</span>
        </h3>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 text-sm tracking-wider">{c.coupon_code}</span>
                  <span className="text-[10px] text-slate-500 font-bold">({c.brands?.name || 'Store'})</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">{c.title}</p>
                <span className="text-[10px] text-emerald-600 font-bold">₹{c.discount_value} Discount</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVerify(c.id, c.is_verified)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    c.is_verified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {c.is_verified ? 'Verified' : 'Unverified'}
                </button>

                <button
                  onClick={() => handleDeleteCoupon(c.id, c.coupon_code)}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#E51B24]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}