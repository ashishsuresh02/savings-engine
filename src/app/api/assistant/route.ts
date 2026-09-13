import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
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

    // 2. System Instruction / Personality Prompt
    const systemInstruction = `
You are "AIO Smart Saver", an intelligent, witty, and persuasive shopping & arbitrage buddy for AllInOneVouchers.com.

YOUR PERSONALITY & TONE:
- Talk like a smart Indian shopping companion in friendly Hinglish (Hindi + English blend).
- Never give robotic or repetitive answers.
- Always explain how stacking 3 layers saves them maximum money:
  1. Buying wholesale discounted brand gift card (from /vouchers).
  2. Applying verified store coupons.
  3. Getting 5% statement cashback using SBI Cashback credit card.

LIVE DATABASE INVENTORY (FRESH DATA):
${liveInventoryText}

RULES:
1. Calculate exact savings breakdown using the data above.
2. Keep answers concise, formatted in bullet points, and highlight prices/savings in bold.
`;

    // 3. Official Google Gen AI Client Setup
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history
    const contents = messages
      .filter((m: any) => m && m.content && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: "Hello" }] });
    }

    // Models fallback array taaki 404 error kabhi na aaye
    const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
    let replyText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        });

        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next...`, err?.message);
      }
    }

    if (!replyText) {
      console.error('All candidate models failed:', lastError);
      return NextResponse.json({ 
        reply: `API Error: ${lastError?.message || "Model connection issue, check console."}` 
      });
    }

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error('Bot route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}