import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection missing' }, { status: 500 });
    }

    // 1. Fetch live platform inventory directly from Supabase
    const [brandsRes, dealsRes, couponsRes] = await Promise.all([
      supabase.from('brands').select('name, slug, brand_vouchers(resale_discount_pct, min_denomination, max_denomination)').eq('is_active', true),
      supabase.from('curated_deals').select('brand_name, title, deal_price, mrp_price, affiliate_url, coupon_code').limit(15),
      supabase.from('brand_coupons').select('coupon_code, title, discount_value, stackable_with_voucher, brands(name)').eq('is_verified', true).limit(15)
    ]);

    const liveBrands = brandsRes.data || [];
    const liveDeals = dealsRes.data || [];
    const liveCoupons = couponsRes.data || [];

    // 2. Prepare structured system context
    const brandKnowledge = liveBrands.map((b: any) => {
      const v = b.brand_vouchers?.[0];
      return `${b.name} (Slug: ${b.slug}): ${v?.resale_discount_pct || 10}% Off on Vouchers (Cap ₹${v?.max_denomination || 10000})`;
    }).join('\n');

    const dealsKnowledge = liveDeals.map((d: any) => 
      `${d.brand_name} - ${d.title}: Loot Price ₹${d.deal_price} (MRP: ₹${d.mrp_price}), Coupon: ${d.coupon_code || 'None'}, Link: ${d.affiliate_url}`
    ).join('\n');

    const couponsKnowledge = liveCoupons.map((c: any) => 
      `Store: ${c.brands?.name || 'Partner'}, Code: ${c.coupon_code}, Value: Flat ₹${c.discount_value} Off, Stackable: ${c.stackable_with_voucher ? 'Yes' : 'No'}`
    ).join('\n');

    const systemPrompt = `
You are "AIO Smart Saver", the supreme AI fintech shopping assistant for AllInOneVouchers.com.
Your goal is to save the maximum amount of money for users so they never shop full price again.

TONE & STYLE:
- Speak in warm, energetic, witty Hinglish (Hindi + English).
- Be a helpful money-saving buddy, not a robotic script.
- Always recommend stacking 3 layers: (1) Wholesale Brand Voucher + (2) Merchant Promo Code + (3) 5% SBI Credit Card Rebate.

CURRENT LIVE PLATFORM DATA (ALWAYS ACCURATE & UPDATED):
[STORES & VOUCHERS]:
${brandKnowledge}

[HOTTEST CURATED LOOT DEALS]:
${dealsKnowledge}

[VERIFIED STORE COUPONS]:
${couponsKnowledge}

RULES:
1. If the user asks about an item or brand, calculate their exact savings using the 3X Arbitrage math.
2. Give actionable links or actions:
   - For vouchers: suggest visiting "/vouchers".
   - For direct affiliate deals: provide the direct link.
   - For coupons: tell them the exact code.
3. Keep answers punchy, structured in bullet points, and highly persuasive.
`;

    // 3. Fallback AI response generator if external API key is pending
    // Integrates with Gemini / OpenAI standard endpoint
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Smart Fallback Parser if API keys are not yet configured in .env
      const userText = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Bhai main AllInOneVouchers ka live AI assistant hu! Aapko kis store ya product pe sabse bada discount chahiye? (Amazon, Swiggy, Zomato, Myntra, etc.)";

      const matchedBrand = liveBrands.find((b: any) => userText.includes(b.name.toLowerCase()));
      if (matchedBrand) {
        const cut = matchedBrand.brand_vouchers?.[0]?.resale_discount_pct || 10;
        reply = `Bhai **${matchedBrand.name}** par zabardast loot hai! 🔥\n\n• **Wholesale Voucher:** Flat **${cut}% OFF** instant milega.\n• **Extra Savings:** Agar SBI Cashback credit card use karoge to **5% extra** statement credit!\n\nDirect buy karne ke liye **Wholesale Vouchers** page par jaake instant code unlock kar lo!`;
      } else if (userText.includes('deal') || userText.includes('loot')) {
        const topDeal = liveDeals[0];
        if (topDeal) {
          reply = `Top trending loot ye rhi: **${topDeal.title}**\n• Deal Price: **₹${topDeal.deal_price}** (MRP ₹${topDeal.mrp_price})\n• Grab link: ${topDeal.affiliate_url}`;
        }
      }

      return NextResponse.json({ reply });
    }

    // Call Gemini API (gemini-1.5-flash / gemini-2.0-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ];

    const aiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const aiData = await aiRes.json();
    const reply = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Bhai lagta hai network thoda busy hai. Ek baar refresh karke pucho!";

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error('Assistant API error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}