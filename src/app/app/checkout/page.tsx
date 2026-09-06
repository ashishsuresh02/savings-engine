'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandName = searchParams.get('brandName') || "Domino's Pizza";
  const faceValue = Number(searchParams.get('faceValue')) || 500;
  const sellingPrice = Number(searchParams.get('sellingPrice')) || 425;
  const quantity = Number(searchParams.get('quantity')) || 1;

  const totalValue = faceValue * quantity;
  const netPayable = sellingPrice * quantity;
  const totalSavings = totalValue - netPayable;

  // Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSendOtp = () => {
    if (phoneNumber.length !== 10) {
      alert('Kripya 10-digit valid phone number enter karein.');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp === '1234' || otp.length === 4) {
      setIsVerified(true);
    } else {
      alert('Galat OTP! Demo ke liye "1234" enter karein.');
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      alert('Pehle phone number OTP verify karein (Fraud Prevention).');
      return;
    }

    setIsProcessing(true);

    // Django Payment Gateway & Aggregator API simulation
    setTimeout(() => {
      setIsProcessing(false);
      // Dummy voucher code generation for Dashboard/Vault
      const dummyCode = 'DOM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const dummyPin = Math.floor(1000 + Math.random() * 9000).toString();

      const successParams = new URLSearchParams({
        brand: brandName,
        value: totalValue.toString(),
        code: dummyCode,
        pin: dummyPin,
      }).toString();

      router.push(`/dashboard?${successParams}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">Secure Checkout</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-8">
          Complete Your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Details & Payment Gateway Selection */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: User Verification */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                Delivery & Verification (Zero-Fraud)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address (Code delivery)</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number (10-Digit)</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      maxLength={10}
                      disabled={isVerified}
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white disabled:opacity-50"
                    />
                    {!isVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-xs font-bold text-indigo-400 transition-colors whitespace-nowrap"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && !isVerified && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2">
                    <label className="block text-[11px] font-bold text-indigo-300">Enter 4-Digit OTP (Demo: 1234)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="1234"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-center tracking-widest text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}

                {isVerified && (
                  <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded-xl flex items-center gap-2">
                    ✓ Verified Mobile Device (Ready for Instant Delivery)
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Payment Selection */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                Payment Options
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: '📱' },
                  { id: 'CARD', label: 'Debit / Card', icon: '💳' },
                  { id: 'NETBANKING', label: 'Net Banking', icon: '🏦' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMethod(item.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === item.id
                        ? 'bg-indigo-600/15 border-indigo-500 text-white'
                        : 'bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">UPI ID (VPA)</label>
                  <input
                    type="text"
                    placeholder="username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">A collect request will be sent to your UPI application.</p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="text-xs text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  Card processing powered by Razorpay / Cashfree PCI-DSS compliant engine.
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="text-xs text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  Direct net-banking support for HDFC, SBI, ICICI, Axis and 50+ other banks.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary & Checkout Trigger */}
          <div className="lg:col-span-5">
            <div className="sticky top-12 bg-slate-900/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Order Review
              </h3>

              <div className="space-y-4 pb-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-white text-base">{brandName}</h4>
                    <span className="text-xs text-slate-400">₹{faceValue} Card × {quantity} Qty</span>
                  </div>
                  <span className="text-sm font-bold text-white">₹{totalValue}</span>
                </div>

                <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                  <span>Guaranteed Voucher Savings</span>
                  <span>- ₹{totalSavings}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>Convenience / Escrow Fee</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
              </div>

              <div className="py-4 flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-slate-400">Net Amount</span>
                <span className="text-3xl font-black text-white tracking-tight">₹{netPayable}</span>
              </div>

              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all font-extrabold text-sm text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Generating Safe Voucher...
                  </span>
                ) : (
                  `Pay ₹${netPayable} & Receive Code`
                )}
              </button>

              <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1">
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  🔒 <span>256-bit Encrypted Aggregator Relay</span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  ⚡ <span>Immediate code unmasking after transaction</span>
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b14] text-white p-10">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}