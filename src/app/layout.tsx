import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#E51B24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "AllInOneVouchers • Real-Time Savings Discovery & Stacking Engine",
    template: "%s | AllInOneVouchers",
  },
  description: "Buy wholesale discounted brand gift cards, stack verified promo coupons, and pocket 5% statement cashback on Amazon, Flipkart, Swiggy, Zomato, and Myntra.",
  applicationName: "AllInOneVouchers",
  authors: [{ name: "AllInOneVouchers Team", url: "https://www.allinonevouchers.com" }],
  generator: "Next.js",
  keywords: [
    "discount gift vouchers",
    "wholesale brand cards",
    "savings stacking engine",
    "swiggy coupon codes",
    "zomato gift cards",
    "amazon pay balance discount",
    "myntra promo codes",
    "credit card arbitrage",
    "cashback deals india"
  ],
  referrer: "origin-when-cross-origin",
  creator: "AllInOneVouchers",
  publisher: "AllInOneVouchers",
  metadataBase: new URL("https://www.allinonevouchers.com"),
  alternates: {
    canonical: "https://www.allinonevouchers.com",
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "AllInOneVouchers • Save More. Shop Smarter.",
    description: "Never pay full price again. Stack wholesale brand vouchers, verified merchant coupons, and direct card cashbacks all in one platform.",
    url: "https://www.allinonevouchers.com",
    siteName: "AllInOneVouchers",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo1.png",
        width: 1200,
        height: 630,
        alt: "AllInOneVouchers - Triple Stack Savings Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AllInOneVouchers • Save More. Shop Smarter.",
    description: "Instant digital delivery of brand vouchers with up to 70% savings and verified promo codes.",
    creator: "@allinonevouchers",
    images: ["/logo1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Google Structured Data (JSON-LD) for Rich Results & Sitelinks Searchbox
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AllInOneVouchers",
    url: "https://www.allinonevouchers.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.allinonevouchers.com/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    description: "Real-time savings discovery engine stacking wholesale vouchers, coupons, and cashbacks.",
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F6F9] text-slate-900 selection:bg-[#E51B24] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}