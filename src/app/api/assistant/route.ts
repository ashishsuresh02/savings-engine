import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages format invalid' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "Bhai, GEMINI_API_KEY missing hai! .env.local ya Vercel me check karein." 
      });
    }

    // 1. Live Supabase Data Fetch
    let liveInventoryText = "Stores: Amazon, Swiggy, Zomato, Myntra, Flipkart. Flat 10% wholesale gift voucher discount.";
    
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
          return `• Store: ${b.name} (Slug: ${b.slug}) | Wholesale Cut: ${v?.resale_discount_pct || 10}% OFF | Face Value: ₹${v?.min_denomination || 1000} | Max Limit: ₹${v?.max_denomination || 10000}`;
        }).join('\n');

        const deals = (dealsRes.data || []).map((d: any) => 
          `• Loot: ${d.title} (${d.brand_name}) | Deal Price: ₹${d.deal_price} (MRP: ₹${d.mrp_price}) | Link: ${d.affiliate_url} | Code: ${d.coupon_code || 'None'}`
        ).join('\n');

        const coupons = (couponsRes.data || []).map((c: any) => 
          `• Coupon: ${c.coupon_code} for ${c.brands?.name || 'Store'} | Cut: Flat ₹${c.discount_value} OFF | Stackable: ${c.stackable_with_voucher ? 'Yes' : 'No'}`
        ).join('\n');

        liveInventoryText = `
LIVE STORES & WHOLESALE VOUCHERS:
${brands || 'None'}

HOTTEST LIVE LOOT DEALS:
${deals || 'None'}

ACTIVE VERIFIED STORE COUPONS:
${coupons || 'None'}
        `;
      } catch (dbErr) {
        console.error("Database fetch error for bot:", dbErr);
      }
    }

    // 2. Personality Prompt
    const systemPrompt = `
You are "AIO Smart Saver", the supreme AI shopping companion for "AllInOneVouchers.com".

MISSION & BEHAVIOR:
- Speak in natural, energetic Hinglish (casual friend + smart financial advisor vibe).
- IF USER SAYS "HI", "HELLO", "HEY", OR GREETS:
  Greet warmly, introduce yourself as AllInOneVouchers' live savings assistant, and ask what they want to buy today (Food on Swiggy/Zomato, Clothes on Myntra, or Electronics on Amazon) so you can stack their savings!
- IF USER ASKS ABOUT SHOPPING/SAVINGS:
  Always explain the 3X Savings Stack model:
  1. Buying our wholesale discounted brand gift card (from /vouchers).
  2. Applying merchant promo codes.
  3. Getting 5% statement credit via SBI Cashback Credit Card.
- Use REAL data from the inventory below. Do NOT invent prices or discounts.

LIVE DATABASE CONTEXT:
${liveInventoryText}

FORMAT RULES:
- Use bullet points, bold savings/prices, and keep messages punchy.
- Always end with an actionable question (e.g. "Kitne ka cart value hai aapka?").
`;

    // 3. Multi-turn History Formatting
    const validHistory = messages
      .filter((m: any) => m && m.content && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    if (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift();
    }
    if (validHistory.length === 0) {
      validHistory.push({ role: 'user', parts: [{ text: "Hi" }] });
    }

    // 4. Call gemini-3.6-flash Directly
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const apiBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: validHistory,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 800
      }
    };

    const genRes = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiBody)
    });

    const genData = await genRes.json();

    if (!genRes.ok || genData.error) {
      console.error("Gemini API Error:", genData);
      return NextResponse.json({ 
        reply: `API Issue (${genData.error?.code || genRes.status}): ${genData.error?.message || "Please re-check your API key."}` 
      });
    }

    const reply = genData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return NextResponse.json({ 
        reply: "Bhai baat samajh aa gayi par response generate nahi hua. Ek baar wapas likho!" 
      });
    }

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Fatal route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}