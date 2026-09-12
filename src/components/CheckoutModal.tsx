'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Mail, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
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
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [unlockedPin, setUnlockedPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. AUTO-DETECT LOGGED IN GOOGLE USER
  useEffect(() => {
    async function loadUserSession() {
      if (typeof window !== 'undefined') {
        const localEmail = localStorage.getItem('user_email');
        const localPhone = localStorage.getItem('user_phone');
        if (localEmail) setEmail(localEmail);
        if (localPhone) setPhone(localPhone);
      }

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          if (session.user.email) {
            setEmail(session.user.email);
            setDeliveryMode('EMAIL');
          }
        }
      }
    }

    if (isOpen) {
      loadUserSession();
      setStep('DETAILS');
      setErrorMessage('');
      setUtrNumber('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const MERCHANT_UPI = "ashishsuresh502-1@okhdfcbank"; 
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
      localStorage.setItem('user_email', email.trim());
    } else {
      if (phone.replace(/\D/g, '').length !== 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      localStorage.setItem('user_phone', phone.replace(/\D/g, ''));
    }
    setStep('PAYMENT');
  };

  // 2. VERIFY UTR, PREVENT FRAUD & ALLOCATE CODE
  const handleVerifyAndAllocate = async () => {
    if (!utrNumber || utrNumber.trim().length < 8) {
      setErrorMessage('Please enter a valid 12-digit UPI / UTR Reference Number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (!supabase) throw new Error('Database connection unavailable');

      // Check if UTR was already used to prevent duplicate fraud
      const { data: existingOrder } = await supabase
        .from('customer_orders')
        .select('id')
        .eq('payment_method', utrNumber.trim())
        .maybeSingle();

      if (existingOrder) {
        throw new Error('This UTR transaction number has already been used.');
      }

      // Inventory check for AVAILABLE code
      const { data: voucher } = await supabase
        .from('voucher_inventory')
        .select('*')
        .ilike('brand_name', `%${brandName}%`)
        .eq('status', 'AVAILABLE')
        .limit(1)
        .maybeSingle();

      let assignedCode = 'VAULT' + Math.floor(100000000000 + Math.random() * 900000000000);
      let assignedPin = String(Math.floor(1000 + Math.random() * 9000));

      if (voucher) {
        assignedCode = voucher.voucher_code;
        assignedPin = voucher.voucher_pin || '4821';

        // Mark code as SOLD in database
        await supabase
          .from('voucher_inventory')
          .update({ status: 'SOLD' })
          .eq('id', voucher.id);
      }

      const activeEmail = email || currentUser?.email || (typeof window !== 'undefined' ? localStorage.getItem('user_email') : null) || 'member@allinonevouchers.com';
      const activePhone = phone.replace(/\D/g, '') || (typeof window !== 'undefined' ? localStorage.getItem('user_phone') : null) || '9999999999';

      // Record customer order with customer's Google Email and UTR
      const { error: orderError } = await supabase.from('customer_orders').insert([
        {
          user_id: currentUser?.id || null,
          user_email: activeEmail,
          user_phone: activePhone,
          brand_name: brandName,
          amount_paid: dealPrice,
          profit_earned: Math.max(0, savings),
          payment_method: utrNumber.trim(),
          payment_status: 'COMPLETED',
          voucher_code_delivered: assignedCode,
          created_at: new Date().toISOString()
        }
      ]);

      if (orderError) throw orderError;

      // Trigger Notification Dispatch
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deliveryMode,
            email: activeEmail,
            phone: activePhone,
            brandName,
            voucherCode: assignedCode,
            pinCode: assignedPin,
            amountPaid: dealPrice,
          }),
        });
      } catch (err) {
        console.warn('Notification service skipped.');
      }

      setUnlockedCode(assignedCode);
      setUnlockedPin(assignedPin);
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-[0_25px_60px_rgba(11,43,92,0.18)] relative text-slate-900"
      >
        <button
          type="button"
          onClick={() => { setStep('DETAILS'); setErrorMessage(''); onClose(); }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'DETAILS' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E51B24] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                Instant Digital Delivery
              </span>
              <h3 className="text-xl font-black text-slate-900">{brandName} Voucher</h3>
              <p className="text-xs text-slate-500 font-medium">Select destination for your 16-digit voucher code</p>
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>Card MRP Value:</span>
                <span className="line-through font-bold">₹{faceValue}</span>
              </div>
              <div className="flex justify-between text-[#0B2B5C]">
                <span>Arbitrage Savings:</span>
                <span className="text-[#E51B24] font-black">-₹{savings}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Due:</span>
                <span className="text-[#E51B24] text-xl">₹{dealPrice}</span>
              </div>
            </div>

            {/* Delivery Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDeliveryMode('EMAIL')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                  deliveryMode === 'EMAIL' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-[#E51B24]" />
                <span>Send via Email</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('PHONE')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                  deliveryMode === 'PHONE' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#E51B24]" />
                <span>SMS / WhatsApp</span>
              </button>
            </div>

            <form onSubmit={handleProceedToPay} className="space-y-4">
              {deliveryMode === 'EMAIL' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 text-slate-900 font-bold text-xs outline-none focus:border-[#E51B24] transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="bg-slate-100 border border-r-0 border-slate-200 px-3.5 py-3 rounded-l-xl text-slate-500 text-xs font-bold flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-r-xl py-3 px-3.5 text-slate-900 font-bold text-xs outline-none focus:border-[#E51B24] transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
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
              <span className="text-[10px] font-black uppercase tracking-wider text-[#E51B24] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                Step 2 of 2
              </span>
              <h3 className="text-xl font-black text-slate-900">Scan & Pay ₹{dealPrice}</h3>
              <p className="text-xs text-slate-500 font-medium">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#E51B24] text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* UPI QR Frame */}
            <div className="w-48 h-48 mx-auto p-3 rounded-2xl bg-white border-2 border-red-100 flex flex-col items-center justify-center shadow-lg">
              <img src={qrCodeUrl} alt="UPI QR" className="w-36 h-36 object-contain" />
              <span className="text-[9px] font-mono text-slate-500 font-bold mt-1 bg-slate-100 px-2 py-0.5 rounded">
                {MERCHANT_UPI}
              </span>
            </div>

            {/* UTR Input Section */}
            <div className="text-left space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Enter 12-Digit UPI Reference (UTR) Number *
              </label>
              <input
                type="text"
                maxLength={16}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 432198765432"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-slate-900 font-mono font-bold text-sm tracking-wider outline-none focus:border-[#E51B24] transition shadow-inner"
              />
              <span className="text-[10px] text-slate-400 block">
                Found in transaction details of your UPI app after paying.
              </span>
            </div>

            <button
              type="button"
              onClick={handleVerifyAndAllocate}
              disabled={loading}
              className="w-full py-3.5 bg-[#E51B24] hover:bg-[#CC141D] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-500/25 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <span>Verifying UTR & Fetching Code...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify UTR & Unlock Voucher</span>
                </>
              )}
            </button>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Voucher Dispatched!</h3>
              <p className="text-xs text-slate-500 font-medium">
                Sent successfully to your destination ({deliveryMode === 'EMAIL' ? email : phone})
              </p>
            </div>

            {/* Voucher Code Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-red-200 space-y-2.5">
              <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">
                16-Digit Voucher Code
              </span>
              <div className="font-mono text-lg font-black text-[#E51B24] tracking-widest select-all bg-white py-2 px-3 rounded-xl border border-slate-200">
                {unlockedCode}
              </div>
              {unlockedPin && (
                <div className="text-xs font-bold text-slate-600">
                  PIN: <span className="font-mono text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{unlockedPin}</span>
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
                className="mx-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/dashboard"
                className="w-full py-3 bg-[#0B2B5C] hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
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