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
        reply: "Bhai, GEMINI_API_KEY missing hai! Apne .env.local ya Vercel settings me GEMINI_API_KEY check karo." 
      });
    }

    // 1. Fetch Fresh Inventory from Supabase
    let liveInventoryText = "Stores: Amazon, Swiggy, Zomato, Myntra, Flipkart. Flat 10% wholesale gift voucher discount available.";
    
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
            .limit(12),
          supabase
            .from('brand_coupons')
            .select('coupon_code, title, discount_value, stackable_with_voucher, brands(name)')
            .eq('is_verified', true)
            .limit(12)
        ]);

        const brands = (brandsRes.data || []).map((b: any) => {
          const v = b.brand_vouchers?.[0];
          return `• Store: ${b.name} (Slug: ${b.slug}) | Wholesale Cut: ${v?.resale_discount_pct || 10}% OFF | Value: ₹${v?.min_denomination || 1000} | Max Cap: ₹${v?.max_denomination || 10000}`;
        }).join('\n');

        const deals = (dealsRes.data || []).map((d: any) => 
          `• Loot Item: ${d.title} (${d.brand_name}) | Loot Price: ₹${d.deal_price} (MRP: ₹${d.mrp_price}) | Direct Link: ${d.affiliate_url} | Code: ${d.coupon_code || 'None'}`
        ).join('\n');

        const coupons = (couponsRes.data || []).map((c: any) => 
          `• Store Coupon: ${c.coupon_code} for ${c.brands?.name || 'Store'} | Cut: Flat ₹${c.discount_value} OFF | Stackable: ${c.stackable_with_voucher ? 'Yes' : 'No'}`
        ).join('\n');

        liveInventoryText = `
LIVE STORES & WHOLESALE VOUCHERS:
${brands || 'None'}

HOTTEST LIVE LOOT DEALS:
${deals || 'None'}

ACTIVE VERIFIED PROMO CODES:
${coupons || 'None'}
        `;
      } catch (dbErr) {
        console.error("Database fetch error for bot:", dbErr);
      }
    }

    // 2. Personality & Real-time Arbitrage Instructions
    const systemPrompt = `
You are "AIO Smart Saver", the ultra-smart, witty, and persuasive AI shopping companion for AllInOneVouchers.com.

YOUR PERSONALITY & TONE:
- Talk like a smart Indian shopping buddy in friendly, energetic Hinglish (Hindi + English blend).
- NEVER give robotic, dry, or repetitive answers. Treat the user like a friend trying to save money.
- Always explain how stacking 3 layers saves them the maximum cash:
  1. Buying wholesale discounted brand gift card (from /vouchers).
  2. Applying verified store coupons.
  3. Getting 5% statement cashback using SBI Cashback credit card.

LIVE DATABASE INVENTORY (USE THIS REAL-TIME DATA):
${liveInventoryText}

INSTRUCTIONS:
1. When asked about a specific store or item, calculate the exact breakdown using the data above.
2. If they ask for food, shoes, fashion, or electronics, recommend the best matching live deals or gift vouchers.
3. Keep your answers punchy, structured with bullet points, and highlight exact prices/savings in bold.
`;

    // 3. User Message & Context Packaging
    const userQuery = messages[messages.length - 1]?.content || "Hello";
    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `SYSTEM INSTRUCTIONS (DO NOT EXPOSE TO USER):\n${systemPrompt}\n\nUSER'S QUESTION:\n${userQuery}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    // 4. Auto-Discover Active Model for this API Key
    let activeModelPath = 'models/gemini-2.0-flash';
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const listData = await listRes.json();

      if (!listRes.ok) {
        console.error("List models failed:", listData);
        return NextResponse.json({ 
          reply: `Google API Key Error: ${listData.error?.message || "Invalid Key. Check Google AI Studio."}` 
        });
      }

      if (listData.models && Array.isArray(listData.models)) {
        // Pick whichever model supports generateContent
        const supported = listData.models.find((m: any) => 
          m.supportedGenerationMethods?.includes('generateContent') &&
          (m.name.includes('flash') || m.name.includes('gemini-2') || m.name.includes('gemini-1.5') || m.name.includes('pro'))
        );
        if (supported) {
          activeModelPath = supported.name;
        }
      }
    } catch (err: any) {
      console.warn("Model auto-discovery skipped, using fallback:", err?.message);
    }

    // 5. Generate Real Dynamic Content
    const cleanPath = activeModelPath.startsWith('models/') ? activeModelPath : `models/${activeModelPath}`;
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${cleanPath}:generateContent?key=${apiKey}`;

    const genRes = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const genData = await genRes.json();

    if (!genRes.ok || genData.error) {
      console.error("Gemini Generation Error:", genData);
      return NextResponse.json({ 
        reply: `API Error: ${genData.error?.message || "Generation failed. Please recheck your API Key."}` 
      });
    }

    const reply = genData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return NextResponse.json({ 
        reply: "Bhai baat samajh aa gayi par response generate nahi hua. Ek baar dubara try karo!" 
      });
    }

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Fatal route error:', error);
    return NextResponse.json({ 
      reply: `Server Crash: ${error.message || "Internal server error"}` 
    }, { status: 500 });
  }
}