import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages format invalid' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "Bhai, Gemini API key missing hai. Vercel ya .env.local me GEMINI_API_KEY add karein!" 
      });
    }

    // 1. Supabase se Live Platform Inventory Fetch karein
    let liveInventoryText = "Stores: Amazon, Swiggy, Zomato, Myntra. Flat 10% wholesale gift voucher discount.";
    
    if (supabase) {
      try {
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
          return `• Store: ${b.name} (Slug: ${b.slug}) | Voucher Cut: ${v?.resale_discount_pct || 10}% OFF | Face Value: ₹${v?.min_denomination || 1000} | Max Cap: ₹${v?.max_denomination || 10000}`;
        }).join('\n');

        const deals = (dealsRes.data || []).map((d: any) => 
          `• Deal: ${d.title} (${d.brand_name}) | Loot Price: ₹${d.deal_price} (MRP: ₹${d.mrp_price}) | Link: ${d.affiliate_url} | Code: ${d.coupon_code || 'None'}`
        ).join('\n');

        const coupons = (couponsRes.data || []).map((c: any) => 
          `• Coupon: ${c.coupon_code} for ${c.brands?.name || 'Store'} | Cut: Flat ₹${c.discount_value} OFF | Stackable: ${c.stackable_with_voucher ? 'Yes' : 'No'}`
        ).join('\n');

        liveInventoryText = `
LIVE BRANDS & VOUCHERS:
${brands || 'None'}

LIVE CURATED LOOT DEALS:
${deals || 'None'}

ACTIVE PROMO CODES:
${coupons || 'None'}
        `;
      } catch (dbErr) {
        console.error("Database fetch error for bot:", dbErr);
      }
    }

    // 2. Personality & Rules Prompt
    const systemPrompt = `
You are "AIO Smart Saver", an intelligent, witty, and persuasive shopping buddy for AllInOneVouchers.com.

YOUR PERSONALITY & TONE:
- Talk like a smart Indian shopping companion in friendly Hinglish (Hindi + English blend).
- Never give dry, robotic, or repetitive answers.
- Always explain how stacking 3 layers saves them money:
  1. Buying wholesale discounted brand gift card (from /vouchers).
  2. Applying verified store coupons.
  3. Getting 5% statement cashback using SBI Cashback credit card.

LIVE DATABASE INVENTORY (FRESH DATA):
${liveInventoryText}

INSTRUCTIONS:
1. When asked about a specific store or item, calculate the exact breakdown using the data above.
2. Keep answers concise, formatted in bullet points, and highlight prices/savings in bold.
`;

    // 3. Clean history: ensure only valid user & model turns
    const cleanContents = messages
      .filter((m: any) => m && m.content && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    if (cleanContents.length > 0 && cleanContents[0].role === 'model') {
      cleanContents.shift();
    }
    if (cleanContents.length === 0) {
      cleanContents.push({ role: 'user', parts: [{ text: "Hello" }] });
    }

    // Prepend System Instructions inside conversation
    const contentsWithSystem = [
      {
        role: 'user',
        parts: [{ text: `INSTRUCTIONS FOR ASSISTANT (DO NOT REPEAT TO USER):\n${systemPrompt}\n\nUSER MESSAGE: ${cleanContents[cleanContents.length - 1]?.parts[0]?.text || 'Hello'}` }]
      }
    ];

    // 4. Stable Target Models Matrix (Supports v1 and v1beta automatically)
    const endpointsToTry = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
    ];

    let replyText = '';
    let lastError: any = null;

    for (const url of endpointsToTry) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: contentsWithSystem,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          })
        });

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          replyText = data.candidates[0].content.parts[0].text;
          break; // First working model will immediately break and return
        } else {
          lastError = data.error?.message || JSON.stringify(data);
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!replyText) {
      console.error('All endpoint attempts failed:', lastError);
      return NextResponse.json({ 
        reply: "Bhai live response ban nahi pa raha. Ek baar apna GEMINI_API_KEY check kar lo!" 
      });
    }

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error('Bot route fatal error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}