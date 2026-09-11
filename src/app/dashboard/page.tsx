'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Ticket, 
  Copy, 
  Check, 
  Wallet, 
  ArrowLeft,
  ExternalLink,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserVaultPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [userPhone, setUserPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadVault() {
      try {
        if (!supabase) return;

        // 1. Read customer identity
        const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('user_phone') : null;
        
        if (!storedPhone) {
          // Agar phone number nahi mila, toh user se maangenge ya homepage redirect
          const entered = prompt("Enter your 10-digit registered mobile number to open your Vault:");
          if (entered && entered.replace(/\D/g, '').length === 10) {
            localStorage.setItem('user_phone', entered.replace(/\D/g, ''));
            setUserPhone(entered.replace(/\D/g, ''));
            fetchUserOrders(entered.replace(/\D/g, ''));
          } else {
            router.push('/');
          }
          return;
        }

        setUserPhone(storedPhone);
        fetchUserOrders(storedPhone);
      } catch (err) {
        console.error("Vault load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadVault();
  }, [router]);

  const fetchUserOrders = async (phone: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('user_phone', phone)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.amount_paid) || 0), 0);
  const totalSaved = orders.reduce((sum, o) => sum + (Number(o.profit_earned) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Member Vault</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Digital Voucher Wallet
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Registered mobile: <span className="font-mono font-bold text-slate-900">+91 {userPhone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('user_phone');
              router.push('/');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-[#E51B24] text-slate-600 text-xs font-bold transition"
          >
            Switch Account
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Savings Pocketed</span>
            <span className="text-3xl font-black text-emerald-600">₹{totalSaved.toLocaleString()}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Vouchers Owned</span>
            <span className="text-3xl font-black text-slate-900">{orders.length}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Spent Value</span>
            <span className="text-3xl font-black text-[#0B2B5C]">₹{totalSpent.toLocaleString()}</span>
          </div>
        </div>

        {/* Unlocked Vouchers List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#E51B24]" /> My Purchased Vouchers
            </h2>
            <Link 
              href="/#vouchers"
              className="text-xs font-black text-[#E51B24] hover:underline flex items-center gap-1"
            >
              <span>+ Buy More Vouchers</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-bold text-slate-400">Loading your secure codes...</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-medium">No vouchers found under this mobile number.</p>
              <Link 
                href="/#vouchers"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#E51B24] text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#CC141D] transition"
              >
                Explore Active Deals
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((ord) => (
                <div 
                  key={ord.id}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50 space-y-3 hover:border-red-200 transition relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{ord.brand_name}</h3>
                      <span className="text-[10px] text-slate-400">
                        Purchased on {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ord.payment_status}
                    </span>
                  </div>

                  {/* Secret Unlocked Credentials */}
                  <div className="p-3.5 bg-white rounded-xl border border-dashed border-slate-300 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">16-Digit Voucher Code</span>
                    <div className="flex items-center justify-between font-mono font-black text-sm text-slate-900">
                      <span>{ord.voucher_code_delivered}</span>
                      <button 
                        onClick={() => handleCopy(ord.voucher_code_delivered)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                      >
                        {copiedCode === ord.voucher_code_delivered ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 pt-1">
                    <span>Paid: ₹{ord.amount_paid}</span>
                    <span className="text-emerald-600 font-black">Saved: +₹{ord.profit_earned}</span>
                    <span className="font-mono text-slate-400 text-[10px]">UTR: {ord.payment_method}</span>
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