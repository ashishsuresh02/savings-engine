'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  Store,
  Ticket,
  Clock,
  Tag,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Lock,
  Mail,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ==========================================
// 1. BRAND & DEAL MANAGER (FULL CRUD)
// ==========================================
function BrandManager({ 
  brands, 
  onRefresh, 
  showStatus 
}: { 
  brands: any[]; 
  onRefresh: () => void; 
  showStatus: (msg: string, type: 'success' | 'error') => void; 
}) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [discount, setDiscount] = useState('10');
  const [faceValue, setFaceValue] = useState('1000');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

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
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Logo Image URL</label>
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

// ==========================================
// 2. INVENTORY VAULT MANAGER (FULL CRUD)
// ==========================================
function InventoryManager({ 
  brands, 
  inventory, 
  onRefresh, 
  showStatus 
}: { 
  brands: any[]; 
  inventory: any[]; 
  onRefresh: () => void; 
  showStatus: (msg: string, type: 'success' | 'error') => void; 
}) {
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || 'Swiggy');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('4821');
  const [loading, setLoading] = useState(false);

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('voucher_inventory')
        .insert([{
          brand_name: selectedBrand,
          voucher_code: code.trim().toUpperCase(),
          voucher_pin: pin.trim(),
          status: 'AVAILABLE',
        }]);

      if (error) throw error;

      showStatus(`Voucher code added for ${selectedBrand}`, 'success');
      setCode('');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCode = async (id: number) => {
    if (!confirm('Remove this code from the inventory?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('voucher_inventory').delete().eq('id', id);
      if (error) throw error;
      showStatus('Code removed from database', 'success');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#E51B24]" /> Load Digital Voucher Code
        </h3>

        <form onSubmit={handleAddCode} className="space-y-3.5 text-xs">
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
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">16-Digit Voucher Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SWIG482910482918"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-black text-sm tracking-wider uppercase outline-none focus:border-[#E51B24]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Secret PIN *</label>
            <input
              type="text"
              required
              placeholder="4821"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm outline-none focus:border-[#E51B24]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E51B24] hover:bg-[#CC141D] text-white font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/20 active:scale-95"
          >
            {loading ? 'Adding to Vault...' : 'Add To Vault Inventory'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
          <span>Digital Code Inventory</span>
          <span className="text-xs font-bold text-emerald-600">
            {inventory.filter(i => i.status === 'AVAILABLE').length} Available
          </span>
        </h3>

        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-black text-slate-900 block">{item.brand_name}</span>
                <span className="font-mono text-slate-700 font-black tracking-wider text-sm">{item.voucher_code}</span>
                <span className="text-[11px] text-slate-500 font-semibold block">PIN: {item.voucher_pin}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.status === 'AVAILABLE' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.status}
                </span>

                <button
                  onClick={() => handleDeleteCode(item.id)}
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

// ==========================================
// 3. ORDERS & UTR AUDIT MANAGER
// ==========================================
function OrderManager({ 
  orders, 
  onRefresh, 
  showStatus 
}: { 
  orders: any[]; 
  onRefresh: () => void; 
  showStatus: (msg: string, type: 'success' | 'error') => void; 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    if (!supabase) return;
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ payment_status: nextStatus })
        .eq('id', orderId);

      if (error) throw error;
      showStatus(`Order #${orderId} marked as ${nextStatus}`, 'success');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(`Delete order #${orderId}?`)) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('customer_orders').delete().eq('id', orderId);
      if (error) throw error;
      showStatus(`Order #${orderId} deleted`, 'success');
      onRefresh();
    } catch (err: any) {
      showStatus(err.message, 'error');
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.user_phone?.includes(searchTerm) ||
      o.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E51B24]" /> Orders & 12-Digit UTR Transaction Ledger
          </h3>
          <p className="text-xs text-slate-500 font-medium">Verify incoming 12-digit UPI UTR reference codes against your bank statement.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search phone, UTR, store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full font-medium"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Store</th>
              <th className="pb-3">Customer Phone</th>
              <th className="pb-3">Paid (₹)</th>
              <th className="pb-3">Savings (₹)</th>
              <th className="pb-3">12-Digit UTR Ref</th>
              <th className="pb-3">Code Delivered</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No orders recorded yet.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 font-mono font-bold text-slate-500">#{ord.id}</td>
                  <td className="py-3 font-black text-slate-900">{ord.brand_name}</td>
                  <td className="py-3 font-mono text-slate-700 font-bold">{ord.user_phone}</td>
                  <td className="py-3 font-black text-slate-900">₹{ord.amount_paid}</td>
                  <td className="py-3 font-black text-emerald-600">+₹{ord.profit_earned}</td>
                  <td className="py-3 font-mono font-black text-[#0B2B5C] bg-slate-100 px-2 py-1 rounded">
                    {ord.payment_method}
                  </td>
                  <td className="py-3 font-mono text-slate-600 font-medium truncate max-w-[140px]">
                    {ord.voucher_code_delivered || 'N/A'}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleUpdateStatus(ord.id, ord.payment_status)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        ord.payment_status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.payment_status}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteOrder(ord.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#E51B24] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 4. COUPONS & PROMO MANAGER (FULL CRUD)
// ==========================================
function CouponManager({ 
  brands, 
  coupons, 
  onRefresh, 
  showStatus 
}: { 
  brands: any[]; 
  coupons: any[]; 
  onRefresh: () => void; 
  showStatus: (msg: string, type: 'success' | 'error') => void; 
}) {
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || '');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountVal, setDiscountVal] = useState('100');
  const [stackable, setStackable] = useState(true);
  const [loading, setLoading] = useState(false);

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

// ==========================================
// 5. MASTER ADMIN CONTROLLER PAGE WITH AUTH
// ==========================================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'BRANDS' | 'INVENTORY' | 'ORDERS' | 'COUPONS'>('BRANDS');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Security Auth Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Master Data
  const [brands, setBrands] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Verify Session on Load
  useEffect(() => {
    async function checkSession() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        fetchData();
      }
    }
    checkSession();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (!supabase) throw new Error('Database connection unavailable');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword.trim(),
      });

      if (error) throw error;

      setIsAuthenticated(true);
      fetchData();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const { data: bData } = await supabase
        .from('brands')
        .select('id, name, slug, logo_url, website_url, is_active, brand_vouchers(id, resale_discount_pct, face_value)')
        .order('name', { ascending: true });
      if (bData) setBrands(bData);

      const { data: invData } = await supabase
        .from('voucher_inventory')
        .select('*')
        .order('id', { ascending: false });
      if (invData) setInventory(invData);

      const { data: ordData } = await supabase
        .from('customer_orders')
        .select('*')
        .order('id', { ascending: false });
      if (ordData) setOrders(ordData);

      const { data: cData } = await supabase
        .from('brand_coupons')
        .select('id, coupon_code, title, discount_value, stackable_with_voucher, is_verified, brands(name)')
        .order('id', { ascending: false });
      if (cData) setCoupons(cData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
  };

  // IF NOT LOGGED IN -> RENDER SECURE AUTH GATE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E51B24] border border-red-100 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-xs text-slate-500 font-medium">Restricted master control for AllInOneVouchers</p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[#E51B24] text-xs font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@allinonevouchers.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-900 font-bold outline-none focus:border-[#E51B24] transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                Master Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-900 font-mono font-bold outline-none focus:border-[#E51B24] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E51B24] hover:bg-[#CC141D] text-white font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED -> RENDER FULL ADMIN PLATFORM
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#E51B24] text-[11px] font-black uppercase tracking-wider mb-1.5 border border-red-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full CRUD Master Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              AllInOneVouchers Administration
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create, read, update and delete brands, vouchers, promo codes, and UTR ledger entries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync All</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[#0B2B5C] hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-[#E51B24] text-slate-600 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Alert */}
        {statusMessage.text && (
          <div className={`p-4 rounded-2xl text-xs font-bold transition ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('BRANDS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'BRANDS' ? 'bg-[#E51B24] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Stores & Deals ({brands.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'INVENTORY' ? 'bg-[#E51B24] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Vault Codes ({inventory.filter(i => i.status === 'AVAILABLE').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'ORDERS' ? 'bg-[#E51B24] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Orders & UTRs ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('COUPONS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'COUPONS' ? 'bg-[#E51B24] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Store Coupons ({coupons.length})</span>
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'BRANDS' && (
          <BrandManager brands={brands} onRefresh={fetchData} showStatus={showStatus} />
        )}
        {activeTab === 'INVENTORY' && (
          <InventoryManager brands={brands} inventory={inventory} onRefresh={fetchData} showStatus={showStatus} />
        )}
        {activeTab === 'ORDERS' && (
          <OrderManager orders={orders} onRefresh={fetchData} showStatus={showStatus} />
        )}
        {activeTab === 'COUPONS' && (
          <CouponManager brands={brands} coupons={coupons} onRefresh={fetchData} showStatus={showStatus} />
        )}

      </div>
    </div>
  );
}