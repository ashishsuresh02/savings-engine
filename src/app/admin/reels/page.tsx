'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Play, 
  Sparkles, 
  Flame, 
  Film, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReelRecord {
  id: string;
  brand_name: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  description: string;
  deal_tag: string;
  is_sponsored: boolean;
  target_brand_slug: string;
  cta_url?: string;
  display_order: number;
}

export default function AdminReelsManagement() {
  const [reels, setReels] = useState<ReelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form States
  const [brandName, setBrandName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dealTag, setDealTag] = useState('FLAT 15% OFF');
  const [isSponsored, setIsSponsored] = useState(true);
  const [targetBrandSlug, setTargetBrandSlug] = useState('dominos');
  const [ctaUrl, setCtaUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);

  // Fetch Current Reels
  const fetchReels = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('sponsored_reels')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setReels(data || []);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to fetch reels' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Handle Create Reel
  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      if (!supabase) throw new Error('Supabase client unavailable');

      const payload = {
        brand_name: brandName,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl || null,
        title,
        description,
        deal_tag: dealTag,
        is_sponsored: isSponsored,
        target_brand_slug: targetBrandSlug,
        cta_url: ctaUrl || null,
        display_order: Number(displayOrder)
      };

      const { error } = await supabase.from('sponsored_reels').insert([payload]);
      if (error) throw error;

      setMsg({ type: 'success', text: 'New Reel successfully deployed to live feed!' });
      
      // Reset Form
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnailUrl('');
      setCtaUrl('');
      fetchReels();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Insertion failed' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Reel
  const handleDeleteReel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    try {
      if (!supabase) return;
      const { error } = await supabase.from('sponsored_reels').delete().eq('id', id);
      if (error) throw error;
      setReels((prev) => prev.filter((r) => r.id !== id));
      setMsg({ type: 'success', text: 'Reel deleted from database.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Film className="w-6 h-6 text-rose-500" />
              Sponsored Reels & Video Ads Engine
            </h1>
            <p className="text-xs text-zinc-400">
              Publish vertical video arbitrage stories, set brand ad tags & direct deal routes.
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white transition flex items-center gap-2 self-start sm:self-auto"
          >
            <span>View Live Website Feed</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {msg && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            msg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Upload / Publish Form */}
          <div className="lg:col-span-5 bg-[#10121B] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="space-y-1 border-b border-white/[0.08] pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                Publish New Video Reel
              </h2>
              <p className="text-[11px] text-zinc-400">
                Direct MP4 URLs (Mixkit, Cloudinary, AWS S3, ya Google Drive links).
              </p>
            </div>

            <form onSubmit={handleAddReel} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Domino's Pizza, Swiggy, Nike"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Video URL (.mp4 direct link)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://assets.mixkit.co/.../video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px] outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Reel Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Domino's 13% Secret Pizza Arbitrage"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Offer / Deal Tag
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLAT 13% OFF, SAVE ₹200"
                  value={dealTag}
                  onChange={(e) => setDealTag(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Target Brand Slug
                  </label>
                  <select
                    value={targetBrandSlug}
                    onChange={(e) => setTargetBrandSlug(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-rose-500"
                  >
                    <option value="dominos" className="bg-[#10121B]">dominos</option>
                    <option value="swiggy" className="bg-[#10121B]">swiggy</option>
                    <option value="zomato" className="bg-[#10121B]">zomato</option>
                    <option value="myntra" className="bg-[#10121B]">myntra</option>
                    <option value="blinkit" className="bg-[#10121B]">blinkit</option>
                    <option value="amazon" className="bg-[#10121B]">amazon</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Display Priority
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Description / Stacking Method
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain how users stack coupons and wholesale cards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sponsored-check"
                  checked={isSponsored}
                  onChange={(e) => setIsSponsored(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="sponsored-check" className="text-zinc-300 font-semibold cursor-pointer">
                  Mark as Paid / Brand Sponsored Video
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? 'Publishing Reel...' : 'Publish to Live Feed'}
              </button>
            </form>
          </div>

          {/* RIGHT: Live Feed Inventory Table */}
          <div className="lg:col-span-7 bg-[#10121B] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Active Video Campaigns ({reels.length})
                </h2>
                <p className="text-[11px] text-zinc-400">Manage order or revoke campaigns from feed</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-zinc-500">Loading campaign inventory...</div>
            ) : reels.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">No reels found. Create your first campaign!</div>
            ) : (
              <div className="space-y-3">
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 hover:border-white/[0.12] transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-14 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                        <Play className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{reel.title}</span>
                          {reel.is_sponsored && (
                            <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Sponsored
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {reel.brand_name} • Slug: <span className="text-emerald-400">{reel.target_brand_slug}</span> • Order: #{reel.display_order}
                        </p>
                        <span className="text-[10px] text-emerald-400 font-bold">{reel.deal_tag}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteReel(reel.id)}
                      className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/[0.06] transition shrink-0"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}