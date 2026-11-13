import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import Analytics from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Engineered Quartz Slabs & Countertops Supplier in the USA | Alfa Ventura",
    template: "%s | Alfa Ventura",
  },
  description:
    "Alfa Ventura supplies 150+ engineered quartz slab designs, quartz countertops, vanity tops, cabinets and SPC flooring across the USA. Request a quote or sample today.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    images: [{ url: "/ban1.webp", alt: "Alfa Ventura engineered quartz kitchen" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className={inter.className}>
        <NextTopLoader
          color="#9B7040"
          height={3}
          showSpinner={false}
        />
        <div>{children}</div>
        <Analytics />
        <Toaster
          position="top-center"
          richColors
          closeButton={true}
          duration={4000}
        />
      </body>
    </html>
  );
}
