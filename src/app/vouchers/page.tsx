'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  CreditCard, 
  Zap, 
  Check, 
  ArrowRight, 
  Ticket, 
  Search,
  Wallet
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DynamicFintechNavbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import LiveArbitrageTicker from '@/components/LiveArbitrageTicker';

export default function VouchersPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [cartAmount, setCartAmount] = useState('2000');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [result, setResult] = useState<any>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (!supabase) return;

        const { data: bData } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        const { data: vData } = await supabase.from('brand_vouchers').select('*');

        if (bData && bData.length > 0) {
          const liveMerged = bData.map((b: any) => {
            const voucherRule = vData?.find((v: any) => v.brand_id === b.id);
            const discountPct = Number(voucherRule?.resale_discount_pct) || 10;
            const baseFace = Number(voucherRule?.min_denomination) === 500 ? 500 : 1000;
            const dealPay = Math.round(baseFace - (baseFace * discountPct) / 100);

            return {
              id: b.id,
              name: b.name,
              slug: b.slug,
              discount: discountPct,
              faceValue: baseFace,
              dealPrice: dealPay,
              buy_url: b.website_url || 'https://google.com',
              logoUrl: b.logo_url || '/logo.png',
            };
          });

          setBrands(liveMerged);
          if (liveMerged.length > 0) {
            setSelectedBrand(liveMerged[0].slug);
            calculate(cartAmount, liveMerged[0].slug, liveMerged, hasSbiCard);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const calculate = (amt: string, slug: string, list = brands, cardActive = hasSbiCard) => {
    let num = Number(amt) || 2000;
    const curr = list.find((b) => b.slug === slug) || list[0];
    const cut = Math.round((num * (curr?.discount || 10)) / 100);
    const postVoucher = num - cut;
    const cardCashback = cardActive ? Math.round((postVoucher * 5) / 100) : 0;
    const finalCost = Math.max(0, postVoucher - cardCashback);

    setResult({
      original: num,
      voucherCut: cut,
      cardCashback,
      finalCost,
      savings: num - finalCost
    });
  };

  const handlePurchase = () => {
    const isUserLoggedIn = (typeof window !== 'undefined' && (localStorage.getItem('user_email') || localStorage.getItem('user_phone')));
    if (isUserLoggedIn) {
      setIsCheckoutOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans antialiased pb-20">
      <DynamicFintechNavbar onOpenAuth={() => setIsAuthOpen(true)} brandCount={brands.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 space-y-10">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-wider text-[#E51B24] bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Direct Vault Issuance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Wholesale Brand Vouchers & Gift Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            100% verified codes with secret PIN delivery for instant checkout redemption.
          </p>
        </div>

        {/* Vouchers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((b) => (
            <div 
              key={b.id}
              className="bg-white border border-slate-200 rounded-[28px] p-5 flex flex-col justify-between hover:shadow-xl hover:border-red-300 transition group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow border border-slate-100 flex items-center justify-center">
                  <img src={b.logoUrl} alt={b.name} className="max-h-8 max-w-full object-contain" />
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E51B24] font-black text-xs">
                  {b.discount}% OFF
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">{b.name} Voucher</h3>
                  <p className="text-xs text-[#E51B24] font-bold">Face Value ₹{b.faceValue}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Deal Price</span>
                    <span className="text-2xl font-black text-slate-900">₹{b.dealPrice}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-400 line-through">₹{b.faceValue}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedBrand(b.slug);
                    setCartAmount(String(b.faceValue));
                    calculate(String(b.faceValue), b.slug);
                    handlePurchase();
                  }}
                  className="w-full py-3 rounded-xl bg-[#E51B24] hover:bg-[#CC141D] text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
                >
                  Buy Voucher
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => { setIsAuthOpen(false); setIsCheckoutOpen(true); }} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        brandName={brands.find((b) => b.slug === selectedBrand)?.name || selectedBrand}
        brandSlug={selectedBrand}
        faceValue={Number(cartAmount) || 1000}
        dealPrice={result?.finalCost || 900}
        savings={result?.savings || 100}
      />
      <LiveArbitrageTicker />
    </div>
  );
}