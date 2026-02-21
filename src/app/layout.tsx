import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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
  title: "Alfa Ventura — Premium Engineered Quartz Export",
  description: "USA-based premier exporter of engineered quartz slabs, precision countertops, and stone surfaces for residential and commercial projects worldwide.",
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
