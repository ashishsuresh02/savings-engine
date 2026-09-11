'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InventoryManagerProps {
  brands: any[];
  inventory: any[];
  onRefresh: () => void;
  showStatus: (msg: string, type: 'success' | 'error') => void;
}

export default function InventoryManager({ brands, inventory, onRefresh, showStatus }: InventoryManagerProps) {
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || 'Swiggy');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('4821');
  const [loading, setLoading] = useState(false);

  // 1. ADD CODE TO INVENTORY
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

  // 2. DELETE VOUCHER CODE
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
      
      {/* Upload Form */}
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

      {/* Inventory Vault List */}
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