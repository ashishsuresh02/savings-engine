'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Ticket, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Wallet, 
  TrendingUp, 
  ArrowLeft 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserVaultDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserVault() {
      try {
        if (!supabase) return;
        
        // 1. Check logged in user session or local phone
        const { data: { session } } = await supabase.auth.getSession();
        const storedPhone = localStorage.getItem('user_phone') || session?.user?.phone;

        if (!storedPhone && !session?.user) {
          // Agar login nahi hai, homepage ya auth modal par bhejenge
          router.push('/?auth=open');
          return;
        }

        setUserPhone(storedPhone || 'Member');

        // 2. Fetch customer's purchased vouchers
        const { data, error } = await supabase
          .from('customer_orders')
          .select('*')
          .or(`user_phone.eq.${storedPhone}`)
          .order('created_at', { ascending: false });

        if (data) setOrders(data);
      } catch (err) {
        console.error('Vault error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserVault();
  }, [router]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalSaved = orders.reduce((sum, o) => sum + (Number(o.profit_earned) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Logged in:</span>
            <span className="font-mono text-slate-900 bg-slate-200/70 px-2 py-0.5 rounded-md">{userPhone}</span>
          </div>
        </div>

        {/* User Lifetime Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Savings Pocketed</span>
            <span className="text-3xl font-black text-emerald-600">₹{totalSaved.toLocaleString()}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Unlocked Vouchers</span>
            <span className="text-3xl font-black text-slate-900">{orders.length}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Security Status</span>
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Member Vault
            </span>
          </div>
        </div>

        {/* Voucher Cards Vault */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#E51B24]" /> My Unlocked Vouchers
            </h2>
            <span className="text-xs text-slate-400 font-bold">{orders.length} Items</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold">Opening Secure Vault...</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-slate-400 font-medium">You haven't bought any vouchers yet.</p>
              <button 
                onClick={() => router.push('/#vouchers')}
                className="px-5 py-2.5 rounded-xl bg-[#E51B24] text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#CC141D] transition"
              >
                Explore Deals
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50 space-y-3 relative hover:border-red-200 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{order.brand_name}</h4>
                      <span className="text-[10px] text-slate-400">Order #{order.id.slice(0, 8)}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.payment_status}
                    </span>
                  </div>

                  {/* Secret Unlocked Credentials */}
                  <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">16-Digit Voucher Code</span>
                    <div className="flex items-center justify-between font-mono font-black text-sm text-slate-900">
                      <span>{order.voucher_code_delivered || 'Processing Issuance'}</span>
                      {order.voucher_code_delivered && (
                        <button 
                          onClick={() => handleCopy(order.voucher_code_delivered)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition"
                        >
                          {copiedCode === order.voucher_code_delivered ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-1">
                    <span>Paid: ₹{order.amount_paid}</span>
                    <span className="text-emerald-600 font-black">Saved: ₹{order.profit_earned}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}