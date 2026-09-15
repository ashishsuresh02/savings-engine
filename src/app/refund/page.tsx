'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E51B24] mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Refund & Cancellation Policy</h1>
            <p className="text-xs text-slate-500 font-medium">Clear Digital Goods Policy</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Digital Voucher Codes (Non-Refundable Once Unmasked)</h2>
            <p>
              Due to the digital and instant nature of financial gift vouchers, once a voucher code and secret PIN have been revealed, synced, or unlocked inside your Member Vault, <strong>cancellation or exchange cannot be granted</strong>. This protects against voucher redemption exploitation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Defective or Invalid Codes</h2>
            <p>
              In the rare event that a voucher code delivered by our automated inventory displays an "Already Redeemed" or "Invalid Voucher" error on the merchant's portal:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submit a grievance ticket to <strong>support@allinonevouchers.com</strong> within 24 hours of delivery.</li>
              <li>Provide an unedited screenshot of the merchant portal displaying the error message alongside the code.</li>
              <li>Once our supplier verification audits validate that the code was issued defective, a replacement code or full wallet refund will be processed within 3 business days.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Affiliate Product Returns</h2>
            <p>
              Products purchased through external merchant links (such as electronics on Amazon or clothes on Myntra) fall under the direct refund, cancellation, and exchange policies of that specific merchant. AllInOneVouchers does not dispatch physical parcels and cannot process returns for merchant deliveries.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}