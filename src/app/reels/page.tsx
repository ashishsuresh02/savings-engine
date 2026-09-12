'use client';

import React, { useState } from 'react';
import DynamicFintechNavbar from '@/components/Navbar';
import SponsoredReelsFeed from '@/components/SponsoredReelsFeed';
import AuthModal from '@/components/AuthModal';

export default function ReelsPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased pb-20">
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8 space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-[#E51B24] bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          Video Discoveries
        </span>
        <h1 className="text-3xl font-black text-slate-900">Sponsored Deal Reels</h1>
        <p className="text-xs text-slate-500 font-medium">Watch quick unboxings, discount previews, and exclusive promo codes.</p>
      </div>

      <SponsoredReelsFeed onSelectBrand={() => {}} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}