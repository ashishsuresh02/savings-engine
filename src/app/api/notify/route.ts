import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { deliveryMode, email, phone, brandName, voucherCode, pinCode, amountPaid } = await req.json();

    if (!voucherCode) {
      return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 });
    }

    let emailSent = false;
    let smsSent = false;

    // 1. FREE EMAIL DISPATCH (Nodemailer + Gmail SMTP)
    if (deliveryMode === 'EMAIL' && email) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"BachatEngine Vault" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `🎉 Your ${brandName} Voucher Code is Ready!`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              
              <div style="background: #09090B; color: #ffffff; padding: 24px; text-align: center;">
                <h2 style="margin: 0; font-size: 20px;">BachatEngine Secure Vault</h2>
                <p style="margin: 5px 0 0; font-size: 12px; color: #a1a1aa;">Instant Arbitrage Settlement</p>
              </div>

              <div style="padding: 24px;">
                <p style="font-size: 14px; color: #52525b;">Hello,</p>
                <p style="font-size: 14px; color: #27272a;">Your payment of <strong>₹${amountPaid}</strong> for <strong>${brandName}</strong> was successfully verified. Here is your unmasked code:</p>
                
                <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">16-Digit Voucher Code</span>
                  <div style="font-family: monospace; font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 5px; letter-spacing: 2px;">
                    ${voucherCode}
                  </div>
                  ${pinCode ? `<div style="font-size: 12px; color: #475569; margin-top: 8px;">PIN: <strong>${pinCode}</strong></div>` : ''}
                </div>

                <p style="font-size: 12px; color: #71717a; line-height: 1.5;">
                  You can use this code directly on the official ${brandName} app. Keep this safe.
                </p>
              </div>

              <div style="background: #f4f4f5; padding: 12px; text-align: center; font-size: 11px; color: #71717a;">
                &copy; 2026 BachatEngine. All rights reserved.
              </div>

            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
    }

    // 2. PHONE / SMS DISPATCH (Optional Gateway - Fast2SMS)
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
      
      if (FAST2SMS_API_KEY && cleanPhone.length === 10) {
        const message = `🎉 BachatEngine: Your ${brandName} Voucher is Unlocked!
Code: ${voucherCode}
${pinCode ? `PIN: ${pinCode}\n` : ''}Amount Paid: ₹${amountPaid}
Happy Savings!`;

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
        smsSent = true;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification processed successfully',
      details: { emailSent, smsSent }
    });

  } catch (error: any) {
    console.error('Notification dispatch failed:', error);
    return NextResponse.json({ error: error.message || 'Dispatch error' }, { status: 500 });
  }
}