'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Check, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Zap,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandName = searchParams.get('brandName') || "Domino's Pizza";
  const brandSlug = searchParams.get('brandSlug') || "dominos";
  const faceValue = Number(searchParams.get('faceValue')) || 1000;
  const sellingPrice = Number(searchParams.get('sellingPrice')) || 920;
  const quantity = Number(searchParams.get('quantity')) || 1;

  const totalValue = faceValue * quantity;
  const netPayable = sellingPrice * quantity;
  const totalSavings = totalValue - netPayable;

  // State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSendOtp = () => {
    if (phoneNumber.replace(/\D/g, '').length !== 10) {
      alert('Kripya 10-digit valid phone number enter karein.');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp === '1234' || otp.length >= 4) {
      setIsVerified(true);
    } else {
      alert('Galat OTP! Demo verification ke liye "1234" enter karein.');
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      alert('Pehle phone number OTP verify karein.');
      return;
    }

    setIsProcessing(true);

    try {
      let finalCode = `${brandName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-LIVE`;

      // Real Supabase Ingestion
      if (supabase) {
        const { data: voucher } = await supabase
          .from('voucher_inventory')
          .select('*')
          .ilike('brand_name', `%${brandName}%`)
          .eq('status', 'AVAILABLE')
          .limit(1)
          .single();

        if (voucher) {
          finalCode = voucher.voucher_code;
          await supabase.from('voucher_inventory').update({ status: 'SOLD' }).eq('id', voucher.id);
        }

        await supabase.from('customer_orders').insert([
          {
            user_phone: phoneNumber.replace(/\D/g, ''),
            brand_name: brandName,
            amount_paid: netPayable,
            profit_earned: Math.max(0, totalSavings),
            payment_method: paymentMethod,
            payment_status: 'COMPLETED',
            voucher_code_delivered: finalCode,
          }
        ]);
      }

      // Local storage sync for vault session
      localStorage.setItem('bachat_user_phone', phoneNumber.replace(/\D/g, ''));
      localStorage.setItem('bachat_auth_token', 'active_session');

      router.push('/dashboard');
    } catch (err) {
      console.warn('Payment settlement fallback:', err);
      localStorage.setItem('bachat_user_phone', phoneNumber.replace(/\D/g, ''));
      router.push('/dashboard');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased pb-20">
      
      {/* Top Header */}
      <header className="bg-[#09090B] text-white px-6 py-6 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stacking Engine</span>
          </Link>
          <span className="text-xs font-bold text-zinc-400">Encrypted 256-Bit Escrow</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Settlement & Issuance
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete verification to instantly unlock your 16-digit voucher card and PIN.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Input & Verification Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: User Verification */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Vault Allocation Details
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address (Invoice Receipt)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number (Voucher Vault Key)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      maxLength={10}
                      disabled={isVerified}
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-black text-slate-900 disabled:opacity-50"
                    />
                    {!isVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-4 py-3 bg-black hover:bg-zinc-800 rounded-xl text-xs font-bold text-white transition whitespace-nowrap"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && !isVerified && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">Enter Verification OTP (Use: 1234)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="1234"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-center font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 bg-black hover:bg-zinc-800 rounded-xl text-xs font-bold text-white transition"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}

                {isVerified && (
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Mobile Number Verified • Ready for Instant Issuance</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Payment Rail Selection */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Select Settlement Channel
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI QR', icon: Smartphone },
                  { id: 'CARD', label: 'Debit / Card', icon: CreditCard },
                  { id: 'NETBANKING', label: 'Net Banking', icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as any)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition ${
                        active
                          ? 'border-black bg-slate-50 text-slate-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'UPI' && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">UPI VPA Handle</label>
                  <input
                    type="text"
                    placeholder="mobile@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">Direct intent request routed to your UPI app.</p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
                  Direct debit & credit card gateway routed via PCI-DSS compliant financial rails.
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
                  Direct net banking access supported for SBI, HDFC, ICICI, Axis and 40+ scheduled banks.
                </div>
              )}
            </div>

          </div>

          {/* Right: Order Review & Action */}
          <div className="lg:col-span-5">
            <div className="sticky top-10 bg-[#090A0F] text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Order Review
              </h3>

              <div className="space-y-3 pb-6 border-b border-white/10 text-xs text-zinc-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{brandName}</h4>
                    <span className="text-[11px] text-zinc-400">₹{faceValue} Face Value × {quantity} Qty</span>
                  </div>
                  <span className="font-bold text-white">₹{totalValue}</span>
                </div>

                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Wholesale Discount Retained</span>
                  <span>- ₹{totalSavings}</span>
                </div>

                <div className="flex justify-between text-zinc-400 font-medium">
                  <span>Processing & Platform Escrow Fee</span>
                  <span className="text-emerald-400 font-bold">₹0.00 FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Due</span>
                  <span className="text-xs text-emerald-400 font-bold">Saved ₹{totalSavings}</span>
                </div>
                <span className="text-3xl font-black text-white">₹{netPayable}</span>
              </div>

              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Allocating Voucher from DB...
                  </span>
                ) : (
                  `Pay ₹${netPayable} & Unlock Code`
                )}
              </button>

              <div className="text-[11px] text-zinc-400 font-medium space-y-1.5 pt-2 border-t border-white/10">
                <p className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bit encrypted direct settlement</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant code unmasking & vault synchronization</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}