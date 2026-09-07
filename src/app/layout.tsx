import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AllInOneVouchers • Real-Time Savings Discovery & Stacking Engine",
  description: "Auto-combine wholesale gift cards, verified store coupons, and credit card cashbacks to uncover the lowest possible checkout price on Swiggy, Domino's, and Myntra.",
  keywords: [
    "gift vouchers", 
    "arbitrage savings", 
    "swiggy coupons", 
    "dominos gift card", 
    "credit card rewards", 
    "stacking engine"
  ],
  metadataBase: new URL("https://www.allinonevouchers.com"),
  openGraph: {
    title: "AllInOneVouchers • 3-Layer Arbitrage Stacking Engine",
    description: "Stop paying full price. Stack wholesale vouchers, verified coupons, and 5% credit card cashbacks in one click.",
    url: "https://www.allinonevouchers.com",
    siteName: "AllInOneVouchers",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "AllInOneVouchers Live Engine",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AllInOneVouchers • Real-Time Arbitrage Engine",
    description: "Save 10% to 25% on every online purchase by stacking gift cards and verified promo codes.",
    images: ["https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&auto=format&fit=crop&q=80"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0B10] text-slate-100">
        {children}
      </body>
    </html>
  );
}