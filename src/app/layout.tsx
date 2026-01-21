import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Alfa Ventura",
  description: "Export and import company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader
          color="#1F2A44"
          height={4}
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
