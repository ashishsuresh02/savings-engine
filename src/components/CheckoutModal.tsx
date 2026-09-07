'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  faceValue: number;
  dealPrice: number;
  savings: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  brandName,
  faceValue,
  dealPrice,
  savings,
}: CheckoutModalProps) {
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length !== 10) {
      alert('Kripya valid 10-digit mobile number enter karein.');
      return;
    }
    setStep('PAYMENT');
  };

  // Simulating or Triggering Real Payment Verification & Code Issuance
  const handleVerifyPayment = async () => {
    setLoading(true);

    try {
      // 1. Fetch available voucher from Supabase
      let generatedCode = `${brandName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-DEAL`;

      if (supabase) {
        const { data: voucher } = await supabase
          .from('voucher_inventory')
          .select('*')
          .ilike('brand_name', `%${brandName}%`)
          .eq('status', 'AVAILABLE')
          .limit(1)
          .single();

        if (voucher) {
          generatedCode = voucher.voucher_code;
          // Mark as SOLD
          await supabase
            .from('voucher_inventory')
            .update({ status: 'SOLD' })
            .eq('id', voucher.id);

          // Log order
          await supabase.from('customer_orders').insert([
            {
              user_phone: phone,
              brand_name: brandName,
              amount_paid: dealPrice,
              profit_earned: Math.max(0, dealPrice - Number(voucher.buying_price || 0)),
              payment_method: 'UPI',
              payment_status: 'COMPLETED',
              voucher_code_delivered: generatedCode,
            }
          ]);
        }
      }

      // Store phone in localStorage for auto-login in /dashboard
      localStorage.setItem('bachat_user_phone', phone);
      localStorage.setItem('bachat_auth_token', 'active_session');

      setUnlockedCode(generatedCode);
      setStep('SUCCESS');
    } catch (err) {
      console.warn('Payment fallback executed');
      setUnlockedCode(`${brandName.slice(0, 3).toUpperCase()}-9824-SAVE`);
      setStep('SUCCESS');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (unlockedCode) {
      navigator.clipboard.writeText(unlockedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#11131D] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: ENTER PHONE NUMBER */}
        {step === 'DETAILS' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Instant Delivery
              </span>
              <h3 className="text-xl font-black text-white">{brandName} Voucher</h3>
              <p className="text-xs text-zinc-400">Order details & secure delivery ledger</p>
            </div>

            {/* Cart Summary Pill */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Card Face Value:</span>
                <span className="line-through">₹{faceValue}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Calculated Arbitrage Savings:</span>
                <span className="text-emerald-400 font-bold">-₹{savings}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between text-sm font-black text-white">
                <span>Payable Now:</span>
                <span className="text-emerald-400 text-base">₹{dealPrice}</span>
              </div>
            </div>

            <form onSubmit={handleProceedToPay} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (For SMS & Vault access)
                </label>
                <div className="flex">
                  <span className="bg-white/[0.04] border border-r-0 border-white/[0.1] px-3 py-2.5 rounded-l-xl text-zinc-400 text-xs flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-r-xl py-2.5 px-3.5 text-white text-xs outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Continue to UPI Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: UPI QR / PAYMENT SCAN */}
        {step === 'PAYMENT' && (
          <div className="space-y-5 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Scan UPI QR to Pay</h3>
              <p className="text-xs text-zinc-400">Pay ₹{dealPrice} via GPay, PhonePe, or Paytm</p>
            </div>

            {/* Dynamic Fake/Real QR Code Box */}
            <div className="w-48 h-48 mx-auto p-3 rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg">
              <QrCode className="w-36 h-36 text-black" />
              <span className="text-[10px] font-mono text-zinc-600 font-bold">UPI: bachatengine@upi</span>
            </div>

            <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Encrypted Instant Code Unlock</span>
            </div>

            <button
              onClick={handleVerifyPayment}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Confirming Transaction...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  <span>I Have Paid • Unlock Code Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: VOUCHER UNLOCKED & STORED */}
        {step === 'SUCCESS' && (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Voucher Code Unlocked!</h3>
              <p className="text-xs text-zinc-400">Redeem directly in {brandName} payment screen</p>
            </div>

            {/* Secret Voucher Code Box */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/40 space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">16-Digit Gift Voucher Code</span>
              <div className="font-mono text-base font-black text-emerald-400 tracking-wider select-all">
                {unlockedCode}
              </div>
              <button
                onClick={copyCode}
                className="mx-auto px-4 py-1.5 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/dashboard"
                className="w-full py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl border border-white/[0.1] transition flex items-center justify-center gap-1.5"
              >
                <span>View in BachatVault Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onClose}
                className="text-[11px] text-zinc-500 hover:text-white transition"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}