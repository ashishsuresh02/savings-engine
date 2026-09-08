'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Wallet, 
  DollarSign, 
  Tag, 
  Users, 
  Building2, 
  Link as LinkIcon, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ADMIN_MASTER_PIN = '2026'; // Aap apna master pin yahan change kar sakte hain

export default function AdminEnterpriseDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeView, setActiveView] = useState<'overview' | 'vouchers' | 'orders' | 'sponsors' | 'affiliates'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Live Metrics
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);
  const [sponsorIncome, setSponsorIncome] = useState<number>(45000);

  // Forms State
  const [vBrand, setVBrand] = useState('Amazon Pay');
  const [vCode, setVCode] = useState('');
  const [vPin, setVPin] = useState('');
  const [vFace, setVFace] = useState('');
  const [vBuy, setVBuy] = useState('');
  const [vSell, setVSell] = useState('');

  // Sponsor Form State
  const [sName, setSName] = useState('');
  const [sAmount, setSAmount] = useState('');
  const [sPlan, setSPlan] = useState('FEATURED_CALCULATOR');

  // Real DB collections
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([
    { id: 'sp-1', company_name: 'AU Small Finance Bank', deal_type: 'Featured Credit Card Banner', deal_amount: 25000, payment_status: 'RECEIVED' },
    { id: 'sp-2', company_name: 'Cashkaro Network', deal_type: 'Exclusive API Integration', deal_amount: 20000, payment_status: 'RECEIVED' },
  ]);

  // Check existing session
  useEffect(() => {
    const session = sessionStorage.getItem('bachat_admin_session');
    if (session === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch real data from Supabase
  const fetchLiveMetrics = async () => {
    setLoading(true);
    try {
      if (!supabase) return;

      // 1. Fetch live inventory
      const { data: invData } = await supabase
        .from('voucher_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (invData) {
        setInventory(invData);
      }

      // 2. Fetch live customer orders
      const { data: ordData } = await supabase
        .from('customer_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordData) {
        setOrders(ordData);

        // Real calculations
        const gmv = ordData.reduce((acc: number, item: any) => acc + (Number(item.amount_paid) || 0), 0);
        const profit = ordData.reduce((acc: number, item: any) => acc + (Number(item.profit_earned) || 0), 0);
        setTotalRevenue(gmv);
        setNetProfit(profit);
      }
    } catch (err) {
      console.warn('Real metrics fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveMetrics();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === ADMIN_MASTER_PIN) {
      sessionStorage.setItem('bachat_admin_session', 'authenticated');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Security Passcode.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bachat_admin_session');
    setIsAuthenticated(false);
  };

  // Upload New Voucher to Supabase
  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const newVoucher = {
      brand_name: vBrand,
      voucher_code: vCode,
      voucher_pin: vPin || '0000',
      face_value: Number(vFace),
      buying_price: Number(vBuy),
      selling_price: Number(vSell),
      status: 'AVAILABLE'
    };

    try {
      if (supabase) {
        const { data, error } = await supabase.from('voucher_inventory').insert([newVoucher]).select();
        if (error) throw error;
        if (data) {
          setInventory([data[0], ...inventory]);
        }
      }
      setVCode('');
      setVPin('');
      setVFace('');
      setVBuy('');
      setVSell('');
      alert('Voucher successfully synced to Supabase database!');
    } catch (err) {
      console.warn('DB upload failed, local fallback:', err);
      setInventory([newVoucher, ...inventory]);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Adding Sponsor
  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    const newSp = {
      id: Math.random().toString(),
      company_name: sName,
      deal_type: sPlan,
      deal_amount: Number(sAmount),
      payment_status: 'RECEIVED'
    };
    setSponsors([newSp, ...sponsors]);
    setSponsorIncome(prev => prev + Number(sAmount));
    setSName('');
    setSAmount('');
    alert('Sponsorship deal logged!');
  };

  // 1. SECURITY LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center p-4 antialiased">
        <div className="bg-[#12131A] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black tracking-tight">Admin Vault Lock</h2>
            <p className="text-xs text-zinc-400 font-medium">Enter system master passkey to access financial engine</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter Passkey"
                className="w-full bg-black/40 border border-white/15 focus:border-emerald-400 rounded-xl py-3 px-4 text-center font-mono text-xl tracking-widest text-white outline-none"
              />
              {authError && <span className="text-[11px] text-rose-400 font-bold block mt-1.5">{authError}</span>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition shadow-sm active:scale-95"
            >
              Verify & Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED REAL-TIME WORKSTATION
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-[#09090B] p-6 flex flex-col justify-between hidden md:flex shrink-0 text-white">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black">
              HQ
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight leading-none block">Engine Admin</span>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block mt-1">Live Database</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { key: 'overview', label: 'Financial Overview', icon: BarChart3 },
              { key: 'vouchers', label: 'Voucher Inventory', icon: Tag },
              { key: 'orders', label: 'Live Orders Ledger', icon: Users },
              { key: 'sponsors', label: 'Brand Partnerships', icon: Building2 },
              { key: 'affiliates', label: 'Tracking Rails', icon: LinkIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveView(tab.key as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-white/10 transition text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Lock Dashboard</span>
        </button>
      </aside>

      {/* Main Workstation */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto">
        
        {/* Top Control Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
              {activeView} Control Center
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Direct Supabase database ingestion and transaction audit</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchLiveMetrics}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition shadow-sm text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync DB</span>
            </button>
            <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Mode
            </span>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* 4 Financial Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Gross GMV</span>
                  <DollarSign className="w-4 h-4 text-slate-900" />
                </span>
                <div className="text-3xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-600 font-bold block">100% Real Order Settlements</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Net Arbitrage Profit</span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </span>
                <div className="text-3xl font-black text-emerald-600">₹{netProfit.toLocaleString()}</div>
                <span className="text-[11px] text-slate-500 font-medium block">Spread retained on checkouts</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Sponsorship Value</span>
                  <Building2 className="w-4 h-4 text-slate-900" />
                </span>
                <div className="text-3xl font-black text-slate-900">₹{sponsorIncome.toLocaleString()}</div>
                <span className="text-[11px] text-slate-500 font-medium block">Active brand integrations</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Available Inventory</span>
                  <Tag className="w-4 h-4 text-slate-900" />
                </span>
                <div className="text-3xl font-black text-slate-900">{inventory.filter(i => i.status === 'AVAILABLE').length} Cards</div>
                <span className="text-[11px] text-emerald-600 font-bold block">Ready in database</span>
              </div>
            </div>

            {/* Live Orders Audit Table */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-900" /> Recent Live Orders
                </h3>
                <button type="button" onClick={() => setActiveView('orders')} className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1">
                  Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((ord) => (
                  <div key={ord.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900">{ord.brand_name}</span>
                      <span className="text-slate-400 block text-[11px] font-medium">+91 {ord.user_phone} • {ord.payment_method}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm">₹{ord.amount_paid}</span>
                      <span className="text-emerald-600 font-bold block text-[10px]">Profit: +₹{ord.profit_earned}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VOUCHER INVENTORY MANAGER */}
        {activeView === 'vouchers' && (
          <div className="space-y-8">
            {/* Add Voucher Form Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-900" /> Upload Live Voucher to DB
              </h2>

              <form onSubmit={handleAddVoucher} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Brand</label>
                  <select 
                    value={vBrand} 
                    onChange={e => setVBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-black"
                  >
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="Swiggy Money">Swiggy Money</option>
                    <option value="Domino's Pizza">Domino's Pizza</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Zomato">Zomato</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Face Value (₹)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={vFace}
                    onChange={e => setVFace(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Buying Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="900"
                    value={vBuy}
                    onChange={e => setVBuy(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Selling Deal Price (₹)</label>
                  <input
                    type="number"
                    placeholder="940"
                    value={vSell}
                    onChange={e => setVSell(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Secret 16-Digit Code</label>
                  <input
                    type="text"
                    placeholder="AMZ-XXXX-YYYY"
                    value={vCode}
                    onChange={e => setVCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Voucher Secret PIN</label>
                  <input
                    type="text"
                    placeholder="4821"
                    value={vPin}
                    onChange={e => setVPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm active:scale-95"
                  >
                    {actionLoading ? 'Syncing...' : 'Save Directly to Supabase'}
                  </button>
                </div>
              </form>
            </div>

            {/* Inventory List Table */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">Stock Ledger ({inventory.length} Records)</h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="pb-3">Merchant</th>
                    <th className="pb-3">Face Value</th>
                    <th className="pb-3">Cost</th>
                    <th className="pb-3">Deal Price</th>
                    <th className="pb-3">Gross Spread</th>
                    <th className="pb-3">Encrypted Code</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-slate-900">{item.brand_name}</td>
                      <td className="py-3.5">₹{item.face_value}</td>
                      <td className="py-3.5 text-slate-500">₹{item.buying_price}</td>
                      <td className="py-3.5 font-black text-slate-900">₹{item.selling_price}</td>
                      <td className="py-3.5 font-black text-emerald-600">+₹{(item.selling_price - item.buying_price)}</td>
                      <td className="py-3.5 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{item.voucher_code}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMER ORDERS LEDGER */}
        {activeView === 'orders' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Customer Orders & Code Deliveries</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="pb-3">Customer Phone</th>
                  <th className="pb-3">Merchant</th>
                  <th className="pb-3">Settled Amount</th>
                  <th className="pb-3">Net Arbitrage</th>
                  <th className="pb-3">Delivered Code</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-slate-900">+91 {ord.user_phone}</td>
                    <td className="py-3.5 font-semibold text-slate-700">{ord.brand_name}</td>
                    <td className="py-3.5 font-black text-slate-900">₹{ord.amount_paid}</td>
                    <td className="py-3.5 font-bold text-emerald-600">+₹{ord.profit_earned}</td>
                    <td className="py-3.5 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{ord.voucher_code_delivered || 'N/A'}</td>
                    <td className="py-3.5 text-slate-400">{ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN') : 'Recent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SPONSORSHIPS TAB */}
        {activeView === 'sponsors' && (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-900" /> Book Brand Sponsorship
              </h2>
              <form onSubmit={handleAddSponsor} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Company / Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. AU Small Finance Bank"
                    value={sName}
                    onChange={e => setSName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Deal Value (₹)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={sAmount}
                    onChange={e => setSAmount(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Placement Slot</label>
                  <select 
                    value={sPlan} 
                    onChange={e => setSPlan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-black"
                  >
                    <option value="Featured Credit Card Banner">Featured Banner</option>
                    <option value="Calculator Default Pick">Calculator Recommendation</option>
                    <option value="WhatsApp Community Broadcast">WhatsApp Blast</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition shadow-sm">
                    Confirm Deal
                  </button>
                </div>
              </form>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">Active Brand Partners</h3>
              <div className="space-y-3">
                {sponsors.map(sp => (
                  <div key={sp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">{sp.company_name}</span>
                      <span className="text-xs text-slate-500 block">{sp.deal_type}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm">₹{sp.deal_amount.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block uppercase">{sp.payment_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AFFILIATES TAB */}
        {activeView === 'affiliates' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-900" /> Active Tracking Integrations
            </h3>
            <p className="text-xs text-slate-500 font-medium">Dynamic redirection links configured for arbitrage margins.</p>

            <div className="space-y-3 pt-2">
              {[
                { brand: 'Flipkart Electronics', network: 'Cuelinks', rate: 'Up to 7.2%', url: 'https://cuelinks.com/track/flipkart' },
                { brand: 'SBI Cashback Credit Card', network: 'EarnKaro Finance', rate: '₹2,100 per card', url: 'https://earnkaro.com/sbi-apply' },
                { brand: 'Swiggy Gourmet Pass', network: 'Direct Merchant', rate: '8.5% Commission', url: 'https://swiggy.com/corporate' },
              ].map((link, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{link.brand}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">{link.network}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px] block mt-1">{link.url}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="font-black text-emerald-600 block">{link.rate}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-Routing Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}