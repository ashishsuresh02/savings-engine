'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E51B24] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B2B5C] flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Terms & Conditions</h1>
            <p className="text-xs text-slate-500 font-medium">Effective Date: September 2026</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Agreement to Terms</h2>
            <p>
              By accessing or using <strong>AllInOneVouchers.com</strong>, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you must refrain from using the platform and its affiliated services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Coupon Codes & Price Volatility</h2>
            <p>
              AllInOneVouchers is an automated deal aggregator and voucher discovery engine. While we continually verify promo codes, coupons and price drops remain subject to real-time merchant discretion, merchant stock constraints, and expiry without prior warning.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Digital Gift Vouchers</h2>
            <p>
              Digital vouchers purchased through the platform are delivered in the form of an encrypted alphanumeric code and secret security PIN. Users are responsible for redeeming their vouchers on the merchant's respective mobile application or website.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Prohibited Activities</h2>
            <p>
              You agree not to scrape, reverse engineer, or deploy automated bots to exhaust our Gemini AI chat quota, probe security vulnerabilities, or inject unauthorized data into our database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
            <p>
              AllInOneVouchers shall not be held liable for any indirect, incidental, or merchant-side fulfillment errors arising out of third-party orders (e.g., late food delivery by Swiggy/Zomato or shipping delays by Amazon/Flipkart).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}