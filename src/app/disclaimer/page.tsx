'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E51B24] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Affiliate & Deal Disclaimer</h1>
            <p className="text-xs text-slate-500 font-medium">Compliance Notice for Consumers & Ad Networks</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Affiliate Disclosure</h2>
            <p>
              AllInOneVouchers.com is a participant in affiliate marketing programs. When you click on outgoing deal links to merchants (including Amazon Associates, Flipkart Affiliate Network, EarnKaro, or direct brand partner portals) and complete a purchase, we may earn an affiliate commission at <strong>zero extra cost to you</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Real-Time Price Discrepancies</h2>
            <p>
              Online merchant prices and promotional codes fluctuate rapidly. While our curated loot deals reflect verified rates at the time of publication, final purchase prices, delivery surcharges, and taxes are strictly governed by the official merchant's checkout counter. Always confirm the final cart value before paying.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Brand Trademarks</h2>
            <p>
              All merchant logos, brand names, product titles, and trademarks (including Amazon, Swiggy, Zomato, Myntra, Paytm, PhonePe, and Flipkart) belong exclusively to their respective copyright holders. Their display on our website is purely for nominative and informational identification purposes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}