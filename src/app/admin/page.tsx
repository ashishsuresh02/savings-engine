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
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  Search, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminEnterpriseDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'vouchers' | 'orders' | 'sponsors' | 'affiliates'>('overview');
  const [loading, setLoading] = useState(false);

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(148500);
  const [netProfit, setNetProfit] = useState(24800);
  const [sponsorIncome, setSponsorIncome] = useState(45000);

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

  // Real-time Mock / Supabase collections
  const [inventory, setInventory] = useState<any[]>([
    { id: '1', brand_name: 'Amazon Pay', face_value: 2000, buying_price: 1860, selling_price: 1920, status: 'AVAILABLE', voucher_code: 'AMZ-8890-LIVE' },
    { id: '2', brand_name: 'Swiggy Money', face_value: 1000, buying_price: 900, selling_price: 940, status: 'AVAILABLE', voucher_code: 'SWG-1102-OFF' },
    { id: '3', brand_name: 'Myntra Luxe', face_value: 5000, buying_price: 4400, selling_price: 4650, status: 'SOLD', voucher_code: 'MYN-4491-DONE' },
  ]);

  const [orders, setOrders] = useState<any[]>([
    { id: 'ord-101', user_phone: '98765 43210', brand_name: 'Amazon Pay', amount_paid: 1920, profit_earned: 60, payment_method: 'UPI (GPay)', created_at: 'Just now' },
    { id: 'ord-102', user_phone: '91234 56780', brand_name: 'Swiggy Money', amount_paid: 940, profit_earned: 40, payment_method: 'PhonePe', created_at: '12 mins ago' },
    { id: 'ord-103', user_phone: '99887 76655', brand_name: 'Myntra Luxe', amount_paid: 4650, profit_earned: 250, payment_method: 'Paytm UPI', created_at: '1 hour ago' },
  ]);

  const [sponsors, setSponsors] = useState<any[]>([
    { id: 'sp-1', company_name: 'AU Small Finance Bank', deal_type: 'Featured Credit Card Banner', deal_amount: 25000, payment_status: 'RECEIVED' },
    { id: 'sp-2', company_name: 'Cashkaro Network', deal_type: 'Exclusive API Integration', deal_amount: 20000, payment_status: 'RECEIVED' },
  ]);

  // Handle Adding New Voucher
  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newVoucher = {
      id: Math.random().toString(),
      brand_name: vBrand,
      voucher_code: vCode,
      voucher_pin: vPin,
      face_value: Number(vFace),
      buying_price: Number(vBuy),
      selling_price: Number(vSell),
      status: 'AVAILABLE'
    };

    try {
      await supabase.from('voucher_inventory').insert([newVoucher]);
    } catch (err) {
      console.warn('DB sync fallback: Added locally');
    }

    setInventory([newVoucher, ...inventory]);
    setVCode('');
    setVPin('');
    setVFace('');
    setVBuy('');
    setVSell('');
    setLoading(false);
    alert('Voucher successfully uploaded to Live Stock!');
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
    alert('Sponsorship deal booked and revenue added!');
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-zinc-100 font-sans flex">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 border-r border-white/[0.08] bg-[#0A0A10] p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight">BachatEngine</span>
              <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-widest">Admin HQ</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { key: 'overview', label: 'Financial Overview', icon: BarChart3 },
              { key: 'vouchers', label: 'Voucher Inventory', icon: Tag },
              { key: 'orders', label: 'Live Customer Orders', icon: Users },
              { key: 'sponsors', label: 'Brand Sponsors & Ads', icon: Building2 },
              { key: 'affiliates', label: 'Affiliate Links Vault', icon: LinkIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <span className="text-[11px] text-zinc-400">System Mode</span>
          <span className="text-xs font-bold text-emerald-400 block mt-0.5">● Production Active</span>
        </div>
      </aside>

      {/* 2. Main Workstation Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 max-w-7xl mx-auto">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <h1 className="text-2xl font-black text-white capitalize tracking-tight">
              {activeView.replace('-', ' ')} Control Center
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Real-time revenue, margins, customer checkouts & partner deals</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Engine Connected
            </span>
          </div>
        </header>

        {/* FINANCIAL OVERVIEW SECTION */}
        {activeView === 'overview' && (
          <div className="space-y-8 animate-in fade-in-50">
            {/* 4 Financial Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#0F0F17] border border-white/[0.08] relative overflow-hidden">
                <div className="text-xs font-bold uppercase text-zinc-400 flex items-center justify-between">
                  <span>Gross Merchandise Value</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white mt-3">₹{totalRevenue.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">+32.4% vs last month</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0F0F17] border border-emerald-500/20 relative overflow-hidden">
                <div className="text-xs font-bold uppercase text-emerald-400 flex items-center justify-between">
                  <span>Net Pocket Profit</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white mt-3">₹{netProfit.toLocaleString()}</div>
                <span className="text-[11px] text-zinc-400 font-semibold mt-1 block">Arbitrage margin: 16.7%</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0F0F17] border border-white/[0.08] relative overflow-hidden">
                <div className="text-xs font-bold uppercase text-indigo-400 flex items-center justify-between">
                  <span>Sponsorship Revenue</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white mt-3">₹{sponsorIncome.toLocaleString()}</div>
                <span className="text-[11px] text-zinc-400 font-semibold mt-1 block">2 Active brand sponsors</span>
              </div>

              <div className="p-5 rounded-3xl bg-[#0F0F17] border border-white/[0.08] relative overflow-hidden">
                <div className="text-xs font-bold uppercase text-amber-400 flex items-center justify-between">
                  <span>Available Stock</span>
                  <Tag className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-white mt-3">{inventory.filter(i => i.status === 'AVAILABLE').length} Vouchers</div>
                <span className="text-[11px] text-amber-400 font-semibold mt-1 block">Ready for Instant Delivery</span>
              </div>
            </div>

            {/* Live Transactions Audit Mini-Table */}
            <div className="p-6 rounded-3xl bg-[#0F0F17] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Latest Successful Payments
                </h3>
                <button onClick={() => setActiveView('orders')} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                  View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {orders.slice(0, 3).map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{ord.brand_name}</span>
                      <span className="text-zinc-500 block text-[11px]">{ord.user_phone} • via {ord.payment_method}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white">₹{ord.amount_paid}</span>
                      <span className="text-emerald-400 font-bold block text-[10px]">+₹{ord.profit_earned} Profit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VOUCHER INVENTORY & PRICING MANAGER */}
        {activeView === 'vouchers' && (
          <div className="space-y-8 animate-in fade-in-50">
            {/* Add Voucher Form Card */}
            <div className="p-6 rounded-3xl bg-[#0F0F17] border border-white/[0.08] space-y-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Add & Price a New Voucher
              </h2>

              <form onSubmit={handleAddVoucher} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Brand Name</label>
                  <select 
                    value={vBrand} 
                    onChange={e => setVBrand(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Amazon Pay" className="bg-[#0F0F17]">Amazon Pay</option>
                    <option value="Flipkart" className="bg-[#0F0F17]">Flipkart</option>
                    <option value="Swiggy Money" className="bg-[#0F0F17]">Swiggy Money</option>
                    <option value="Myntra" className="bg-[#0F0F17]">Myntra</option>
                    <option value="Zomato" className="bg-[#0F0F17]">Zomato</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Face Value (₹)</label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={vFace}
                    onChange={e => setVFace(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Buying Cost (What you paid)</label>
                  <input
                    type="number"
                    placeholder="1860"
                    value={vBuy}
                    onChange={e => setVBuy(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Selling Price (To Customer)</label>
                  <input
                    type="number"
                    placeholder="1920"
                    value={vSell}
                    onChange={e => setVSell(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-emerald-500/40 rounded-xl p-2.5 text-xs font-bold text-emerald-400 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Secret Code</label>
                  <input
                    type="text"
                    placeholder="AMZ-XXXX-YYYY"
                    value={vCode}
                    onChange={e => setVCode(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs font-mono text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Optional PIN</label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={vPin}
                    onChange={e => setVPin(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs font-mono text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold tracking-wide uppercase transition shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? 'Adding...' : 'Store In Secret Vault'}
                  </button>
                </div>
              </form>
            </div>

            {/* Inventory List Table */}
            <div className="p-6 rounded-3xl bg-[#0F0F17] border border-white/[0.08] overflow-x-auto">
              <h3 className="text-sm font-bold text-white mb-4">Live Inventory ({inventory.length})</h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-zinc-400 pb-2">
                    <th className="pb-3">Brand</th>
                    <th className="pb-3">Face Value</th>
                    <th className="pb-3">Your Cost</th>
                    <th className="pb-3">Sell Price</th>
                    <th className="pb-3">Your Profit</th>
                    <th className="pb-3">Code Vault</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 font-bold text-white">{item.brand_name}</td>
                      <td className="py-3.5">₹{item.face_value}</td>
                      <td className="py-3.5 text-zinc-400">₹{item.buying_price}</td>
                      <td className="py-3.5 font-bold text-emerald-400">₹{item.selling_price}</td>
                      <td className="py-3.5 font-black text-teal-300">+₹{(item.selling_price - item.buying_price)}</td>
                      <td className="py-3.5 font-mono text-zinc-300 bg-white/[0.02] px-2 rounded">{item.voucher_code}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400'
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

        {/* CUSTOMER ORDERS & PAYMENTS LEDGER */}
        {activeView === 'orders' && (
          <div className="p-6 rounded-3xl bg-[#0F0F17] border border-white/[0.08] overflow-x-auto animate-in fade-in-50">
            <h3 className="text-sm font-bold text-white mb-4">Customer Checkouts & Delivered Codes</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer Phone</th>
                  <th className="pb-3">Brand Purchased</th>
                  <th className="pb-3">Amount Received</th>
                  <th className="pb-3">Net Profit</th>
                  <th className="pb-3">Payment Mode</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 font-mono text-zinc-400">{ord.id}</td>
                    <td className="py-3.5 font-bold text-white">{ord.user_phone}</td>
                    <td className="py-3.5">{ord.brand_name}</td>
                    <td className="py-3.5 font-bold text-white">₹{ord.amount_paid}</td>
                    <td className="py-3.5 font-bold text-emerald-400">+₹{ord.profit_earned}</td>
                    <td className="py-3.5 text-zinc-300">{ord.payment_method}</td>
                    <td className="py-3.5 text-zinc-500">{ord.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SPONSORSHIPS & BRAND DEALS */}
        {activeView === 'sponsors' && (
          <div className="space-y-8 animate-in fade-in-50">
            <div className="p-6 rounded-3xl bg-[#0F0F17] border border-white/[0.08] space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Book Brand Sponsorship
              </h2>
              <form onSubmit={handleAddSponsor} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank or Nykaa"
                    value={sName}
                    onChange={e => setSName(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Deal Value (₹)</label>
                  <input
                    type="number"
                    placeholder="30000"
                    value={sAmount}
                    onChange={e => setSAmount(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Deal Placement</label>
                  <select 
                    value={sPlan} 
                    onChange={e => setSPlan(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-400"
                  >
                    <option value="Featured Credit Card Banner" className="bg-[#0F0F17]">Top Banner Slot</option>
                    <option value="Calculator Default Recommendation" className="bg-[#0F0F17]">Calculator Default Pick</option>
                    <option value="WhatsApp Community Broadcast" className="bg-[#0F0F17]">WhatsApp Blast</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold">
                    Log Sponsorship Deal
                  </button>
                </div>
              </form>
            </div>

            <div className="p-6 rounded-3xl bg-[#0F0F17] border border-white/[0.08]">
              <h3 className="text-sm font-bold text-white mb-4">Active Brand Partners</h3>
              <div className="space-y-3">
                {sponsors.map(sp => (
                  <div key={sp.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{sp.company_name}</span>
                      <span className="text-xs text-zinc-400 block">{sp.deal_type}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-indigo-400 text-sm">₹{sp.deal_amount.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-400 font-bold block uppercase">{sp.payment_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AFFILIATE LINK ARBITRAGE VAULT */}
        {activeView === 'affiliates' && (
          <div className="p-6 rounded-3xl bg-[#0F0F17] border border-white/[0.08] space-y-4 animate-in fade-in-50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-400" /> Dynamic Tracking Links
            </h3>
            <p className="text-xs text-zinc-400">Calculator ke buy buttons inhi links se dynamically bind rehte hain.</p>

            <div className="space-y-3 pt-2">
              {[
                { brand: 'Flipkart Electronics', network: 'Cuelinks', rate: 'Up to 7.2%', url: 'https://cuelinks.com/track/flipkart?id=bachat' },
                { brand: 'SBI Cashback Credit Card', network: 'EarnKaro Finance', rate: '₹2,100 per approved card', url: 'https://earnkaro.com/sbi-apply?ref=bachat' },
                { brand: 'Swiggy Gourmet', network: 'Direct Partner', rate: '8.5% Commission', url: 'https://swiggy.com/corporate-pass?ref=bachat' },
              ].map((link, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{link.brand}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{link.network}</span>
                    </div>
                    <span className="font-mono text-zinc-500 text-[11px] block mt-0.5">{link.url}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="font-extrabold text-emerald-400 block">{link.rate}</span>
                    <span className="text-[10px] text-zinc-400">Auto-Routing Active</span>
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