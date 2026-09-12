'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Check, 
  Clock, 
  RefreshCw, 
  Search, 
  Mail, 
  Phone, 
  ExternalLink,
  ShieldAlert,
  CreditCard
} from 'lucide-react';

export default function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      if (!supabase) return;
      const { error } = await supabase
        .from('customer_orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
      );
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Status update failed: ' + err.message);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      (o.user_email || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      (o.user_phone || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      (o.brand_name || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      (o.payment_method || '').toLowerCase().includes(filterQuery.toLowerCase());

    const currentStatus = (o.payment_status || 'PENDING').toUpperCase();
    const matchesStatus =
      statusFilter === 'ALL' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer Purchase Ledger</h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time orders, verified Google Gmail accounts, UTR verification, and voucher dispatch status.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search by Gmail, Phone, Brand, or UTR..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#E51B24] transition"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStatusFilter(mode)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                statusFilter === mode 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer Identity</th>
                <th className="py-3.5 px-4">Brand Voucher</th>
                <th className="py-3.5 px-4">Amount Paid</th>
                <th className="py-3.5 px-4">UTR Number</th>
                <th className="py-3.5 px-4">Delivered Code</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    {loading ? 'Fetching orders from database...' : 'No customer orders match the filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isCompleted = (order.payment_status || '').toUpperCase() === 'COMPLETED';
                  const dateText = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Recent';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      {/* Customer Email & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{order.user_email || 'Direct Checkout'}</span>
                        </div>
                        {order.user_phone && order.user_phone !== '9999999999' && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>+91 {order.user_phone}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">{dateText}</span>
                      </td>

                      {/* Brand Name */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block">{order.brand_name}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">Earned ₹{order.profit_earned || 0} cut</span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-[#E51B24] text-sm">
                        ₹{order.amount_paid}
                      </td>

                      {/* UTR / Txn Reference */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {order.payment_method || 'UTR Missing'}
                        </span>
                      </td>

                      {/* Allocated Voucher */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {order.voucher_code_delivered ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            {order.voucher_code_delivered}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not issued</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                          <span>{order.payment_status || 'PENDING'}</span>
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        {!isCompleted ? (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider transition shadow-sm cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PENDING')}
                            className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition cursor-pointer"
                          >
                            Revert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}