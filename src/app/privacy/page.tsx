'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E51B24] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E51B24] flex items-center justify-center font-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500 font-medium">Last updated: September 2026</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              When you visit <strong>AllInOneVouchers.com</strong>, browse deals, or interact with our AI Savings Assistant, we may collect minimal non-personally identifiable information such as browser details, IP address, device type, and visited links via tracking technologies (including Google Analytics).
            </p>
            <p>
              If you authenticate via Google OAuth or create an account, we collect your name, email address, and wallet interaction data to deliver your saved vouchers to your Member Vault.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. How We Use Your Data</h2>
            <p>We use the collected information exclusively to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and verify purchased gift vouchers and promo codes.</li>
              <li>Personalize real-time discount calculations in the AI assistant.</li>
              <li>Detect, prevent, and protect against fraudulent transactions and bot abuse.</li>
              <li>Analyze aggregated site usage to optimize merchant deal selection.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. AI Assistant & Conversation Logs</h2>
            <p>
              Interactions with the AI shopping assistant are processed securely via Google Gemini API. Chat messages are analyzed solely in real time to suggest relevant vouchers and coupons from our inventory. We do not sell your personal chat data to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Third-Party Links & Cookies</h2>
            <p>
              Our website contains outgoing links to third-party merchant platforms (e.g., Amazon, Swiggy, Zomato, Myntra). When clicking merchant deals, cookies may be placed on your browser to verify session integrity and affiliate tracking. We encourage you to review the privacy policies of any third-party websites you visit.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Contact Support</h2>
            <p>
              For questions, account removal requests, or privacy concerns, reach out to our team at{' '}
              <a href="mailto:support@allinonevouchers.com" className="text-[#E51B24] font-semibold underline">
                support@allinonevouchers.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}