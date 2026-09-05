'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  CreditCard, 
  Sparkles, 
  Zap, 
  Check, 
  Copy, 
  User, 
  X, 
  Gift, 
  ArrowRight, 
  Clock, 
  ChevronDown, 
  ShieldCheck, 
  CheckCircle2,
  LogOut,
  Wallet
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  brand_vouchers?: { resale_discount_pct: number; direct_buy_url: string }[];
  brand_coupons?: { coupon_code: string; title: string; stackable_with_voucher: boolean }[];
}

interface BankCardItem {
  id: string;
  name: string;
  issuer_bank: string;
  base_online_cashback_pct: number;
  joining_fee: number;
  apply_referral_url: string;
}

export default function Home() {
  // Dynamic Data States
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [bankCards, setBankCards] = useState<BankCardItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Calculation States
  const [selectedBrand, setSelectedBrand] = useState('dominos');
  const [cartAmount, setCartAmount] = useState('500');
  const [hasSbiCard, setHasSbiCard] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // User & Auth States
  const [user, setUser] = useState<any>(null);
  const [lifetimeSavings, setLifetimeSavings] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [authStatus, setAuthStatus] = useState<'IDLE' | 'SENT' | 'ERROR'>('IDLE');

  // UI Interactive States
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 22, seconds: 15 });

  // 1. Initial Load: Fetch Brands, Cards & User from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch Brands with Vouchers & Coupons
        const { data: brandsData } = await supabase
          .from('brands')
          .select(`
            id, name, slug, logo_url,
            brand_vouchers (resale_discount_pct, direct_buy_url),
            brand_coupons (coupon_code, title, stackable_with_voucher)
          `)
          .eq('is_active', true)
          .order('name');

        if (brandsData) setBrands(brandsData as any);

        // Fetch Bank Cards
        const { data: cardsData } = await supabase
          .from('payment_instruments')
          .select('*')
          .eq('is_active', true);

        if (cardsData) setBankCards(cardsData as any);

        // Check Auth User
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          setUser(authData.user);
          loadUserLedger(authData.user.id);
        }
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();

    // Timer countdown loop
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Fetch User Lifetime Savings Ledger
  const loadUserLedger = async (userId: string) => {
    const { data } = await supabase
      .from('user_savings_ledger')
      .select('rupees_saved')
      .eq('user_id', userId);

    if (data) {
      const total = data.reduce((acc, row) => acc + Number(row.rupees_saved), 0);
      setLifetimeSavings(total);
    }
  };

  // 3. Calculation Dispatch
  const handleCalculate = async () => {
    if (!cartAmount || Number(cartAmount) <= 0) return;
    setCalcLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandSlug: selectedBrand,
          cartValue: Number(cartAmount),
          hasSbiCard,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCalcLoading(false);
    }
  };

  // 4. Claim Deal & Record to Savings Ledger
  const handleClaimDeal = async (buyUrl: string) => {
    if (user && result) {
      // Record transaction to Supabase ledger
      await supabase.from('user_savings_ledger').insert({
        user_id: user.id,
        brand_id: result.brandId,
        original_amount: result.originalCart,
        effective_amount_paid: result.bestEffectiveCost,
        rupees_saved: result.totalSavings,
        route_chosen: result.bestRoute === 'VOUCHER' ? 'DISCOUNTED_VOUCHER' : 'STACKED_OFFER'
      });
      // Refresh local balance
      loadUserLedger(user.id);
    }
    // Redirect to purchase
    window.open(buyUrl, '_blank');
  };

  // 5. Auth Handlers (Magic Link / Google)
  const handleMagicLinkLogin = async () => {
    if (!emailInput) return;
    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) {
      setAuthStatus('ERROR');
    } else {
      setAuthStatus('SENT');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLifetimeSavings(0);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans antialiased selection:bg-emerald-400 selection:text-black">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#0D0D11] border-b border-white/[0.06] py-2.5 px-4 text-center text-xs text-zinc-300">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <strong className="text-white font-semibold">Live Arbitrage Active:</strong> 
          Discovering verified discounts across {brands.length || '12'} top Indian platforms.
        </span>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className="border-b border-white/[0.08] backdrop-blur-xl sticky top-0 z-40 bg-[#070709]/80">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">
                Bachat<span className="text-emerald-400">Engine</span>
              </span>
              <span className="text-xs text-zinc-400">Smart Savings Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#calculator" className="hover:text-emerald-400 transition">Savings Calculator</a>
            <a href="#vouchers" className="hover:text-emerald-400 transition">Gift Cards</a>
            <a href="#coupons" className="hover:text-emerald-400 transition">Coupons</a>
            <a href="#cards" className="hover:text-emerald-400 transition">Bank Offers</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-xl">
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400 font-medium leading-none">Total Saved</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">₹{lifetimeSavings.toFixed(2)}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Logout" 
                  className="text-zinc-500 hover:text-white transition ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] px-4 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-95"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Member Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SHOWCASE */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Before you buy anything online, check here first
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Never pay full price <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                when you checkout.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              We scrape live wholesale vouchers, apply merchant coupons, and stack bank card cashback to calculate the single lowest price you have to pay.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <a 
                href="#calculator"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                Calculate My Savings
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified with real-time checkout terms</span>
              </div>
            </div>
          </div>

          {/* Interactive Scratch Card Box */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl p-6 bg-[#0E0E14] border border-white/[0.08] shadow-2xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Live Hack Example</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md font-medium">17% Instant Off</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Domino's ₹500 Pizza Voucher</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Click below to reveal the actual purchase cost.</p>
              </div>

              <div 
                onClick={() => setIsScratched(true)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] text-center ${
                  isScratched 
                    ? 'bg-emerald-950/30 border-emerald-500/30' 
                    : 'bg-zinc-900/90 border-white/[0.1] hover:border-emerald-500/40'
                }`}
              >
                {!isScratched ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Gift className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-white">Tap to scratch and reveal</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-in zoom-in-95">
                    <p className="text-xs text-emerald-400 font-semibold">Special Voucher Price</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-extrabold text-white">₹415</span>
                      <span className="text-sm text-zinc-500 line-through">₹500</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      With SBI Card: <strong className="text-emerald-400 font-bold">₹394.25 final cost</strong>
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 text-center">
                Delivered instantly on SMS & WhatsApp. Use like cash in app.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FLASH SALE TICKER */}
      <div className="border-y border-white/[0.06] bg-[#0A0A0F] py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-white font-semibold">Limited Voucher Drops Ending:</span>
            <div className="flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-md font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          </div>
          <div className="text-zinc-400">
            Swiggy ₹1,000 at ₹940 (6 left) • Myntra ₹2,000 at ₹1,810 (2 left)
          </div>
        </div>
      </div>

      {/* 5. THE REAL-TIME SAVINGS CALCULATOR */}
      <section id="calculator" className="max-w-4xl mx-auto px-6 py-20 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Calculation Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Calculate Your Bottom Line
          </h2>
          <p className="text-sm text-zinc-400">
            Select an app, enter order amount, and toggle card benefit to see how much you save.
          </p>
        </div>

        <div className="bg-[#0E0E14] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Dynamic Brands from Supabase */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              1. Choose Store / Brand
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {brands.map((b) => {
                const active = selectedBrand === b.slug;
                const discount = b.brand_vouchers?.[0]?.resale_discount_pct || 5;
                return (
                  <button
                    key={b.slug}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      active 
                        ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md' 
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:border-white/[0.15]'
                    }`}
                  >
                    <span className="text-xs text-emerald-400 font-semibold block">{discount}% Off Voucher</span>
                    <span className="font-bold text-sm text-white block mt-0.5 truncate">{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount and Card Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                2. Order Cart Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-white/[0.03] border border-white/[0.1] focus:border-emerald-400 rounded-xl py-3 pl-9 pr-4 text-xl font-bold text-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                3. Additional Card Offer
              </label>
              <div 
                onClick={() => setHasSbiCard(!hasSbiCard)}
                className={`cursor-pointer p-3 rounded-xl border transition flex items-center justify-between ${
                  hasSbiCard 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className={`w-5 h-5 ${hasSbiCard ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-white">SBI Cashback Card</p>
                    <p className="text-[11px] text-zinc-400">Gives 5% extra cashback on spends</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                  hasSbiCard ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-zinc-700'
                }`}>
                  {hasSbiCard && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={calcLoading}
            className="w-full py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-sm tracking-wide transition shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-black" />
            {calcLoading ? 'Calculating Savings...' : 'Calculate Lowest Effective Price'}
          </button>

          {/* Output Card */}
          {result && (
            <div className="mt-6 bg-[#08080C] border border-emerald-400/30 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Optimal Route: {result.bestRoute}
                </span>
                <span className="text-zinc-400">Retail Cart: <del>₹{result.originalCart}</del></span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-baseline">
                <div>
                  <p className="text-xs text-zinc-400">Net Payable Cost</p>
                  <p className="text-3xl sm:text-4xl font-black text-white mt-0.5">₹{result.bestEffectiveCost}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-400 font-medium">Your Savings</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-0.5">+₹{result.totalSavings}</p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/[0.06] rounded-xl p-3.5 text-xs space-y-2 text-zinc-300">
                {result.breakdown.voucherCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">E-Voucher Discount:</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.voucherCut}</span>
                  </div>
                )}
                {result.breakdown.couponCut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Promo Code ({result.breakdown.couponCode}):</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.couponCut}</span>
                  </div>
                )}
                {result.breakdown.cardCashback > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Card Cashback (5%):</span>
                    <span className="text-emerald-400 font-semibold">-₹{result.breakdown.cardCashback}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleClaimDeal(result.breakdown.buyUrl)}
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
              >
                Claim Deal & Buy Voucher
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. DYNAMIC VOUCHERS CATALOG */}
      <section id="vouchers" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Instant Arbitrage</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Popular Discounted Vouchers</h2>
          </div>
          <span className="text-xs text-zinc-400">Instant code delivery via SMS & WhatsApp</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {brands.slice(0, 4).map((b) => {
            const disc = b.brand_vouchers?.[0]?.resale_discount_pct || 8;
            const faceVal = 1000;
            const buyPrice = faceVal - (faceVal * disc) / 100;
            return (
              <div
                key={b.id}
                className="bg-[#0E0E14] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Prepaid Card</span>
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      {disc}% Instant Off
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{b.name}</h3>
                  <p className="text-xs font-semibold text-emerald-400">Save ₹{faceVal - buyPrice} instantly</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Offer Price</span>
                      <span className="text-2xl font-bold text-white">₹{buyPrice}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-500 block">Value</span>
                      <span className="text-sm text-zinc-500 line-through">₹{faceVal}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBrand(b.slug);
                      setCartAmount(faceVal.toString());
                      window.scrollTo({ top: 750, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 bg-white/[0.06] hover:bg-emerald-400 hover:text-black text-white text-xs font-bold rounded-xl transition"
                  >
                    Calculate for ₹{faceVal}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. VERIFIED PROMO CODES */}
      <section id="coupons" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">Tested Codes</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Active Store Coupons</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {brands.flatMap(b => b.brand_coupons?.map(c => ({ ...c, brandName: b.name })) || []).slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="bg-[#0E0E14] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{c.brandName}</span>
                  {c.stackable_with_voucher && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">
                      Works with Voucher
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{c.title}</p>
              </div>

              <button
                onClick={() => copyCoupon(c.coupon_code)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition active:scale-95 shrink-0"
              >
                {copiedCode === c.coupon_code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{c.coupon_code}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 8. HIGH-YIELD BANK CARDS (DIRECT MONETIZATION) */}
      <section id="cards" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Stack Extra 5%</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Recommended Cashback Cards</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {bankCards.map((card) => (
            <div
              key={card.id}
              className="bg-[#0E0E14] border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 transition"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-400 font-semibold">{card.base_online_cashback_pct}% Online Reward</span>
                  <span className="text-zinc-500">{card.issuer_bank}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{card.name}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Earn unlimited {card.base_online_cashback_pct}% cashback on online shopping and vouchers.
                </p>
                <p className="text-xs text-zinc-500">Joining Fee: ₹{card.joining_fee}</p>
              </div>

              <a
                href={card.apply_referral_url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-white/[0.06] hover:bg-cyan-400 hover:text-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Apply Online & Get Cashback
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 9. AUTH / LOGIN MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101018] border border-white/[0.1] rounded-3xl p-7 max-w-sm w-full space-y-5 relative shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Member Login</h3>
              <p className="text-xs text-zinc-400">Save deals to your lifetime savings ledger.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                Continue with Google
              </button>

              <div className="text-center text-[10px] text-zinc-500 uppercase tracking-widest font-mono py-1">
                OR MAGIC LINK EMAIL
              </div>

              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-white/[0.02] border border-white/[0.1] rounded-xl py-2.5 px-3.5 text-white text-sm outline-none focus:border-emerald-400"
              />

              <button
                onClick={handleMagicLinkLogin}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold rounded-xl transition"
              >
                {authStatus === 'SENT' ? 'Magic Link Sent to Email!' : 'Send Magic Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CLEAN FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#050507] py-12 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-white font-bold block">BachatEngine Technologies</span>
            <p className="text-[11px] text-zinc-500 mt-0.5">Discovering the lowest checkout price across India since 2026.</p>
          </div>
          <div className="flex gap-6 text-[11px]">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}