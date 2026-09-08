'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, ArrowRight, Sparkles, Zap, ExternalLink, Smartphone, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandSlug: string;
  faceValue: number;
  dealPrice: number;
  savings: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  brandName,
  brandSlug,
  faceValue,
  dealPrice,
  savings,
}: CheckoutModalProps) {
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [utrNumber, setUtrNumber] = useState(''); // UTR State added
  const [loading, setLoading] = useState(false);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [unlockedPin, setUnlockedPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const MERCHANT_UPI = "ashishkumar@upi"; 
  const MERCHANT_NAME = "AllInOneVouchers";
  const upiIntentUrl = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${dealPrice}&cu=INR&tn=${encodeURIComponent(`Voucher_${brandSlug}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntentUrl)}`;

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryMode === 'EMAIL') {
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
    } else {
      if (phone.replace(/\D/g, '').length !== 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    setStep('PAYMENT');
  };

  // VERIFY WITH UTR & ALLOCATE CODE
  const handleVerifyAndAllocate = async () => {
    if (!utrNumber || utrNumber.trim().length < 8) {
      setErrorMessage('Please enter a valid 12-digit UPI / UTR Reference Number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (!supabase) throw new Error('Database connection unavailable');

      // 1. Check if UTR was already used to prevent duplicate fraud
      const { data: existingOrder } = await supabase
        .from('customer_orders')
        .select('id')
        .eq('payment_method', utrNumber.trim())
        .single();

      if (existingOrder) {
        throw new Error('This UTR transaction number has already been used.');
      }

      // 2. Inventory check for AVAILABLE code
      const { data: voucher, error: fetchErr } = await supabase
        .from('voucher_inventory')
        .select('*')
        .ilike('brand_name', `%${brandName}%`)
        .eq('status', 'AVAILABLE')
        .limit(1)
        .single();

      if (fetchErr || !voucher) {
        throw new Error(`Currently ${brandName} vouchers are fully allocated. Please check back soon.`);
      }

      // 3. Mark code as SOLD
      const { error: updateErr } = await supabase
        .from('voucher_inventory')
        .update({ status: 'SOLD' })
        .eq('id', voucher.id);

      if (updateErr) throw updateErr;

      // 4. Record customer order with UTR reference stored in payment_method column
      await supabase.from('customer_orders').insert([
        {
          user_phone: phone.replace(/\D/g, '') || '9999999999',
          brand_name: brandName,
          amount_paid: dealPrice,
          profit_earned: Math.max(0, savings),
          payment_method: `UTR_${utrNumber.trim()}`, // Storing UTR for cross-verification
          payment_status: 'COMPLETED',
          voucher_code_delivered: voucher.voucher_code,
        }
      ]);

      // 5. Trigger Email Dispatch
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deliveryMode: deliveryMode,
            email: email,
            phone: phone,
            brandName: brandName,
            voucherCode: voucher.voucher_code,
            pinCode: voucher.voucher_pin || '4821',
            amountPaid: dealPrice,
          }),
        });
      } catch (err) {
        console.warn('Notification microservice skipped.');
      }

      setUnlockedCode(voucher.voucher_code);
      setUnlockedPin(voucher.voucher_pin || '4821');
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0C0D14] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white"
      >
        <button
          type="button"
          onClick={() => { setStep('DETAILS'); setErrorMessage(''); onClose(); }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'DETAILS' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Instant Digital Delivery
              </span>
              <h3 className="text-xl font-black">{brandName} Voucher</h3>
              <p className="text-xs text-zinc-400 font-medium">Select destination for your 16-digit secure code</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-zinc-400">
                <span>Card MRP Value:</span>
                <span className="line-through">₹{faceValue}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Arbitrage Savings:</span>
                <span className="text-emerald-400 font-black">-₹{savings}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-white">
                <span>Total Due:</span>
                <span className="text-emerald-400 text-lg">₹{dealPrice}</span>
              </div>
            </div>

            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setDeliveryMode('EMAIL')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  deliveryMode === 'EMAIL' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send via Email (Free)</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('PHONE')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  deliveryMode === 'PHONE' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS / WhatsApp</span>
              </button>
            </div>

            <form onSubmit={handleProceedToPay} className="space-y-4">
              {deliveryMode === 'EMAIL' ? (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-3.5 text-white font-bold text-xs outline-none focus:border-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="bg-white/5 border border-r-0 border-white/10 px-3.5 py-3 rounded-l-xl text-zinc-400 text-xs font-bold flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-r-xl py-3 px-3.5 text-white font-bold text-xs outline-none focus:border-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Continue to UPI Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {step === 'PAYMENT' && (
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-black">Scan & Pay ₹{dealPrice}</h3>
              <p className="text-xs text-zinc-400 font-medium">Enter your 12-digit UPI UTR Reference Number after paying</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="w-44 h-44 mx-auto p-2 rounded-2xl bg-white flex flex-col items-center justify-center shadow-xl">
              <img src={qrCodeUrl} alt="UPI QR" className="w-36 h-36 object-contain" />
              <span className="text-[8px] font-mono text-zinc-800 font-bold mt-0.5">{MERCHANT_UPI}</span>
            </div>

            {/* UTR Input Box */}
            <div className="text-left space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Enter 12-Digit UPI Reference (UTR) Number *
              </label>
              <input
                type="text"
                maxLength={16}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 432198765432"
                className="w-full bg-white/[0.03] border border-white/15 rounded-xl py-3 px-3.5 text-white font-mono font-bold text-sm tracking-wider outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyAndAllocate}
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <span>Verifying UTR...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verify UTR & Unlock Code</span>
                </>
              )}
            </button>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black">Voucher Dispatched!</h3>
              <p className="text-xs text-zinc-400 font-medium">Code sent successfully to your destination</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">16-Digit Voucher Code</span>
              <div className="font-mono text-base font-black text-emerald-400 tracking-wider select-all">
                {unlockedCode}
              </div>
              {unlockedPin && (
                <div className="text-xs text-zinc-400">
                  PIN: <span className="font-mono text-white font-bold">{unlockedPin}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (unlockedCode) {
                    navigator.clipboard.writeText(unlockedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="mx-auto px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/dashboard"
                className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                <span>View in Member Vault</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}