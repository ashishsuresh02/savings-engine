'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BrandManagerProps {
  brands: any[];
  onRefresh: () => void;
  showStatus: (msg: string, type: 'success' | 'error') => void;
}

export default function BrandManager({ brands, onRefresh, showStatus }: BrandManagerProps) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [discount, setDiscount] = useState('10');
  const [faceValue, setFaceValue] = useState('1000');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // 1. CREATE BRAND & VOUCHER RULE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    try {
      const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');

      const { data: newBrand, error: bErr } = await supabase
        .from('brands')
        .insert([{
          name: name.trim(),
          slug: cleanSlug,
          logo_url: logoUrl.trim() || '/logo.png',
          website_url: websiteUrl.trim() || 'https://google.com',
          is_active: true,
        }])
        .select()
        .single();

      if (bErr) throw bErr;

      const { error: vErr } = await supabase
        .from('brand_vouchers')
        .insert([{
          brand_id: newBrand.id,
          resale_discount_pct: Number(discount) || 10,
          face_value: Number(faceValue) || 1000,
        }]);

      if (vErr) throw vErr;

      showStatus(`Brand "${name}" published live!`, 'success');
      setName('');
      setSlug('');
      setLogoUrl('');
      setWebsiteUrl('');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message || 'Failed to create brand', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE BRAND & DISCOUNT
  const handleUpdate = async (b: any) => {
    if (!supabase) return;
    setLoading(true);

    try {
      const { error: bErr } = await supabase
        .from('brands')
        .update({ name: b.name, slug: b.slug, logo_url: b.logo_url })
        .eq('id', b.id);

      if (bErr) throw bErr;

      const voucherId = b.brand_vouchers?.[0]?.id;
      if (voucherId) {
        const { error: vErr } = await supabase
          .from('brand_vouchers')
          .update({
            resale_discount_pct: Number(b.editDiscount) || 10,
            face_value: Number(b.editFaceValue) || 1000,
          })
          .eq('id', voucherId);

        if (vErr) throw vErr;
      }

      showStatus(`Updated ${b.name} successfully`, 'success');
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      showStatus(err.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. DELETE BRAND
  const handleDelete = async (id: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete ${brandName}? This will remove its vouchers too.`)) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
      showStatus(`Deleted ${brandName}`, 'success');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  // 4. TOGGLE VISIBILITY
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Create Form */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#E51B24]" /> Add New Brand & Deal
        </h3>

        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Instamart"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24] font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Brand Slug *</label>
            <input
              type="text"
              required
              placeholder="swiggy-instamart"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Discount % *</label>
              <input
                type="number"
                required
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24] font-black text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Face Value (₹) *</label>
              <input
                type="number"
                required
                value={faceValue}
                onChange={(e) => setFaceValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24] font-black text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Logo URL</label>
            <input
              type="url"
              placeholder="https://.../logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Store / Affiliate Link</label>
            <input
              type="url"
              placeholder="https://brand.com/?ref=..."
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E51B24] hover:bg-[#CC141D] text-white font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20 active:scale-95"
          >
            {loading ? 'Publishing...' : 'Publish Brand to Engine'}
          </button>
        </form>
      </div>

      {/* Brand List & Management */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
          <span>Active Stores Directory</span>
          <span className="text-xs font-bold text-slate-400">{brands.length} Total Stores</span>
        </h3>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {brands.map((b) => {
            const isEditing = editingId === b.id;
            const curDiscount = b.brand_vouchers?.[0]?.resale_discount_pct || 10;
            const curFace = b.brand_vouchers?.[0]?.face_value || 1000;

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                    <img src={b.logo_url} alt={b.name} className="max-h-7 max-w-7 object-contain" />
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={b.name}
                        onChange={(e) => (b.name = e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2 py-1 font-bold mb-1"
                      />
                    ) : (
                      <h4 className="font-black text-slate-900 text-sm">{b.name}</h4>
                    )}
                    <span className="font-mono text-[11px] text-slate-500 block">/{b.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Discount %"
                        defaultValue={curDiscount}
                        onChange={(e) => (b.editDiscount = e.target.value)}
                        className="w-16 bg-white border border-slate-300 rounded px-2 py-1 font-bold text-center"
                      />
                      <input
                        type="number"
                        placeholder="Face Val"
                        defaultValue={curFace}
                        onChange={(e) => (b.editFaceValue = e.target.value)}
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1 font-bold text-center"
                      />
                      <button
                        onClick={() => handleUpdate(b)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-slate-300 text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="font-black text-[#E51B24] block">{curDiscount}% OFF</span>
                        <span className="text-[10px] text-slate-400 font-bold">₹{curFace} MRP</span>
                      </div>

                      <button
                        onClick={() => handleToggleActive(b.id, b.is_active)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                          b.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {b.is_active ? 'Active' : 'Hidden'}
                      </button>

                      <button
                        onClick={() => {
                          b.editDiscount = curDiscount;
                          b.editFaceValue = curFace;
                          setEditingId(b.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#E51B24]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}