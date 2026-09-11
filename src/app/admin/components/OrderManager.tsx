'use client';

import React, { useState } from 'react';
import { Clock, Search, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface OrderManagerProps {
  orders: any[];
  onRefresh: () => void;
  showStatus: (msg: string, type: 'success' | 'error') => void;
}

export default function OrderManager({ orders, onRefresh, showStatus }: OrderManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. UPDATE ORDER STATUS (e.g. COMPLETED -> FAILED or REVERSED)
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

  // 2. DELETE ORDER RECORD
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
            <Clock className="w-4 h-4 text-[#E51B24]" /> Orders & UTR Transaction Ledger
          </h3>
          <p className="text-xs text-slate-500 font-medium">Verify incoming 12-digit UPI UTR reference codes against your bank account.</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by phone, UTR, store..."
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
              <th className="pb-3">Amount Paid</th>
              <th className="pb-3">Savings</th>
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
                  No orders matching criteria.
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