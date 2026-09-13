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
        reply: "Bhai, Gemini API key missing hai. Vercel / .env.local me GEMINI_API_KEY check karo!" 
      });
    }

    // 1. Supabase se Live Data Fetch karein
    let liveInventoryText = "Stores: Amazon, Swiggy, Zomato, Myntra. Standard 10% wholesale voucher cut.";
    
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

    // 2. Personality & Rules (System Instruction)
    const systemInstructionText = `
You are "AIO Smart Saver", an intelligent, highly persuasive, and witty shopping & arbitrage assistant for AllInOneVouchers.com.

YOUR PERSONALITY & TONE:
- Talk like a smart Indian shopping companion in friendly Hinglish (Hindi + English blend).
- Never give robotic, dry, or repetitive answers.
- Always explain how stacking 3 layers saves them money:
  1. Buying our wholesale discounted brand gift card (from /vouchers).
  2. Applying verified store coupons.
  3. Getting 5% statement cashback using SBI Cashback credit card.

LIVE DATABASE INVENTORY (ACCURATE & FRESH):
${liveInventoryText}

INSTRUCTIONS:
1. When asked about a specific store or item, calculate the exact breakdown using the data above.
2. Keep answers concise, formatted in bullet points, and highlight savings in bold.
`;

    // 3. Clean history: ensure only 'user' and 'model' roles exist and alternate properly
    const contents = messages
      .filter((m: any) => m && m.content && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // If first message is from model, strip it (Gemini requires first message from user)
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    // Fallback if no user message left
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: "Hello" }] });
    }

    // 4. Official Google Gemini 1.5 Flash API Payload (Using proper system_instruction)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiBody = {
      system_instruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiBody)
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Gemini API Error details:', JSON.stringify(data.error || data));
      return NextResponse.json({ 
        reply: `API Error: ${data.error?.message || "Server issue, check console"}` 
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json({ 
        reply: "Bhai baat toh samajh aa gayi par response generate nahi hua, ek baar dobara try karo!" 
      });
    }

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Bot route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}