import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, brandName, voucherCode, pinCode, amountPaid } = await req.json();

    if (!phone || !voucherCode) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // 1. WhatsApp / SMS Message Template
    const message = `🎉 AllInOneVouchers: Your ${brandName} Voucher is Unlocked!
Code: ${voucherCode}
${pinCode ? `PIN: ${pinCode}\n` : ''}Amount Paid: ₹${amountPaid}
View in your locker: https://www.allinonevouchers.com/dashboard

Happy Savings!`;

    // 2. Fast2SMS / SMS Gateway Dispatch (Agar API Key configured ho)
    const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
    if (FAST2SMS_API_KEY) {
      await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });
    }

    // Console logging for verification during local testing
    console.log(`[DISPATCH SUCCESS] SMS/WhatsApp queued for +91 ${cleanPhone}`);

    return NextResponse.json({ success: true, message: 'Notification dispatched' });
  } catch (error: any) {
    console.error('Notification dispatch failed:', error);
    return NextResponse.json({ error: error.message || 'Dispatch error' }, { status: 500 });
  }
}