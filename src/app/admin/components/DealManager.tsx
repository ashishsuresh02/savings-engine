'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit3, Check, X, ExternalLink, Flame, Image as ImageIcon } from 'lucide-react';

interface DealManagerProps {
  brands: any[];
  showStatus: (msg: string, type: 'success' | 'error') => void;
}

export default function DealManager({ brands, showStatus }: DealManagerProps) {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || 'Amazon');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [imageUrl, setImageUrl] = useState('');
  const [mrpPrice, setMrpPrice] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      const { data, error } = await supabase
        .from('curated_deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (err: any) {
      console.error('Fetch deals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('curated_deals').insert([
        {
          brand_name: selectedBrand,
          title: title.trim(),
          category: category.trim(),
          image_url: imageUrl.trim(),
          mrp_price: Number(mrpPrice),
          deal_price: Number(dealPrice),
          affiliate_url: affiliateUrl.trim(),
          coupon_code: couponCode.trim() || null,
          is_featured: isFeatured,
        },
      ]);

      if (error) throw error;

      showStatus(`Product deal "${title.slice(0, 20)}..." published!`, 'success');
      setTitle('');
      setImageUrl('');
      setMrpPrice('');
      setDealPrice('');
      setAffiliateUrl('');
      setCouponCode('');
      fetchDeals();
    } catch (err: any) {
      showStatus(err.message || 'Failed to add deal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeal = async (id: string, dealTitle: string) => {
    if (!confirm(`Delete "${dealTitle}"?`)) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('curated_deals').delete().eq('id', id);
      if (error) throw error;
      showStatus('Deal deleted successfully', 'success');
      fetchDeals();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Upload Form */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#E51B24]" /> Post Curated Affiliate Deal
        </h3>

        <form onSubmit={handleCreateDeal} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Store</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Myntra">Myntra</option>
              <option value="Ajio">Ajio</option>
              <option value="Nykaa">Nykaa</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. boAt Airdopes 141 Wireless Earbuds (42H Playtime)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24] font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Original MRP (₹) *</label>
              <input
                type="number"
                required
                placeholder="4490"
                value={mrpPrice}
                onChange={(e) => setMrpPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Loot Deal Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="1299"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-black text-sm text-[#E51B24]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold outline-none cursor-pointer"
            >
              <option value="Electronics">Electronics & Audio</option>
              <option value="Fashion">Fashion & Clothing</option>
              <option value="Footwear">Footwear & Shoes</option>
              <option value="Beauty">Beauty & Personal Care</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Loot">Under ₹499 Loot Deals</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Affiliate Destination URL *</label>
            <input
              type="url"
              required
              placeholder="https://amzn.to/... or EarnKaro link"
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#E51B24] font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Extra Store Coupon (Optional)</label>
            <input
              type="text"
              placeholder="e.g. FLAT150 or EXTRA50"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none uppercase font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featuredCheck"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#E51B24] cursor-pointer"
            />
            <label htmlFor="featuredCheck" className="font-bold text-slate-700 cursor-pointer">
              Pin as Featured / Hot Deal on Homepage
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E51B24] hover:bg-[#CC141D] text-white font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
          >
            {loading ? 'Publishing Deal...' : 'Publish Affiliate Deal'}
          </button>
        </form>
      </div>

      {/* Live Deals Grid / List */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
          <span>Live Curated Deals ({deals.length})</span>
          <span className="text-xs font-bold text-slate-400">EarnKaro / Affiliate Feed</span>
        </h3>

        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {deals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              No curated deals added yet. Add your first deal from the left.
            </div>
          ) : (
            deals.map((deal) => {
              const discountPct = Math.round(((deal.mrp_price - deal.deal_price) / deal.mrp_price) * 100);

              return (
                <div
                  key={deal.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={deal.image_url} alt={deal.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {deal.brand_name}
                        </span>
                        <span className="text-emerald-700 font-black text-[10px]">
                          {discountPct}% OFF
                        </span>
                        {deal.coupon_code && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[9px] px-1.5 py-0.5 rounded">
                            {deal.coupon_code}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 truncate max-w-xs">{deal.title}</h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-black text-[#E51B24] text-sm">₹{deal.deal_price}</span>
                        <span className="text-slate-400 line-through text-[11px]">₹{deal.mrp_price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={deal.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                      title="Open Affiliate Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteDeal(deal.id, deal.title)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-[#E51B24] transition cursor-pointer"
                      title="Delete Deal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}