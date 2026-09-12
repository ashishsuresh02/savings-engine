'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. One-Click Google (Gmail) Auth
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      if (!supabase) throw new Error("Supabase client not initialized");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setErrorMsg(err.message || "Failed to initiate Google sign in.");
      setLoading(false);
    }
  };

  // 2. Email Magic Link / OTP Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      if (!supabase) throw new Error("Supabase client not initialized");

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
        },
      });

      if (error) throw error;

      // Save email session identifier
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', email.trim());
      }

      setEmailSent(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      setErrorMsg(err.message || "Failed to send sign-in link.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="space-y-2 mb-6 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E51B24] bg-red-50 px-2.5 py-1 rounded-full border border-red-200 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E51B24]" /> Member Access
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Unlock Your Savings Vault
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Access your purchase codes, voucher balance, and live cashback arbitrage ledger.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[#E51B24] text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {emailSent ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">Check Your Inbox</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  We've sent a magic sign-in link to <strong className="text-slate-900">{email}</strong>. Click it to log in instantly.
                </p>
              </div>
              <button
                onClick={() => setEmailSent(false)}
                className="text-xs font-bold text-[#E51B24] hover:underline"
              >
                Use another email or Google account
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 1-Click Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-slate-200 flex-1" />
                <span className="text-[10px] font-black uppercase text-slate-400">or sign in with email</span>
                <div className="h-[1px] bg-slate-200 flex-1" />
              </div>

              {/* Email Magic Link Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#E51B24] rounded-2xl text-xs font-semibold text-slate-900 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#E51B24] hover:bg-[#CC141D] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'Sending link...' : 'Send Magic Login Link'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}