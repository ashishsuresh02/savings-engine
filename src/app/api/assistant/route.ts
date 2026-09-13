import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages format invalid' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "Bhai, Gemini API key missing hai. Please .env.local me GEMINI_API_KEY configure karein!" 
      });
    }

    // 1. Supabase se live data fetch karein (brands, vouchers, loot deals, coupons)
    let liveInventoryText = "No live items found in database.";
    if (supabase) {
      const [brandsRes, dealsRes, couponsRes] = await Promise.all([
        supabase
          .from('brands')
          .select('name, slug, is_active, brand_vouchers(resale_discount_pct, min_denomination, max_denomination)')
          .eq('is_active', true),
        supabase
          .from('curated_deals')
          .select('brand_name, title, deal_price, mrp_price, affiliate_url, coupon_code')
          .limit(10),
        supabase
          .from('brand_coupons')
          .select('coupon_code, title, discount_value, stackable_with_voucher, brands(name)')
          .eq('is_verified', true)
          .limit(10)
      ]);

      const brands = (brandsRes.data || []).map((b: any) => {
        const v = b.brand_vouchers?.[0];
        return `• Store: ${b.name} (Slug: ${b.slug}) | Voucher Flat Discount: ${v?.resale_discount_pct || 10}% OFF | Face Value: ₹${v?.min_denomination || 1000} | Max Limit: ₹${v?.max_denomination || 10000}`;
      }).join('\n');

      const deals = (dealsRes.data || []).map((d: any) => 
        `• Loot Item: ${d.title} (${d.brand_name}) | Deal Price: ₹${d.deal_price} (Original MRP: ₹${d.mrp_price}) | Direct Link: ${d.affiliate_url} | Code: ${d.coupon_code || 'None'}`
      ).join('\n');

      const coupons = (couponsRes.data || []).map((c: any) => 
        `• Coupon: ${c.coupon_code} for ${c.brands?.name || 'Store'} | Value: Flat ₹${c.discount_value} OFF | Stackable: ${c.stackable_with_voucher ? 'Yes' : 'No'}`
      ).join('\n');

      liveInventoryText = `
LIVE STORES & DIGITAL VOUCHERS:
${brands || 'None'}

LIVE CURATED LOOT DEALS:
${deals || 'None'}

ACTIVE VERIFIED COUPONS:
${coupons || 'None'}
      `;
    }

    // 2. System Instructions: AI ko personality aur brain dena
    const systemPrompt = `
You are "AIO Smart Saver", an intelligent, highly persuasive, and witty shopping & arbitrage buddy for AllInOneVouchers.com.

YOUR PERSONALITY & TONE:
- Talk like a smart Indian shopping companion in friendly Hinglish (Hindi + English blend).
- Never give dry, robotic, or scripted repetitive answers. Understand the user's emotion, budget, and intent.
- Be sharp with math and always explain how stacking 3 layers saves them money:
  1. Buying our wholesale discounted brand gift card (from /vouchers).
  2. Applying verified store coupons.
  3. Getting 5% statement cashback using SBI Cashback credit card.

LIVE DATABASE CONTEXT (THIS IS REAL-TIME DATA):
${liveInventoryText}

RULES:
1. When asked about a specific store or item, calculate the exact breakdown using the data above.
2. If an item or store is available in our database, encourage them to unlock it right away.
3. If they ask about random general shopping (e.g. shoes, electronics, food), suggest matching deals or gift cards from the live list.
4. Keep the output clean, using bold text and bullet points. Never make up stores or prices not supported by the data.
`;

    // 3. Format history for Google Gemini REST API
    const formattedContents = [
      {
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTION:\n${systemPrompt}\n\nAcknowledge this role.` }]
      },
      {
        role: 'model',
        parts: [{ text: "Haan bhai, main AllInOneVouchers ka smart AI shopping buddy hu! Hamesha live inventory dekhkar sabse sasta deal aur savings calculation bataunga." }]
      },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    ];

    // 4. Call Gemini 1.5 Flash (Super fast & free tier enabled)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return NextResponse.json({ 
        reply: "Bhai lagta hai AI server busy hai. Ek baar dobara puchiye!" 
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Bhai main aapka sawaal samajh gaya, par response create nahi ho paya. Ek baar fir se likho!";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Bot route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}