import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript([organizationJsonLd(), websiteJsonLd()])} />
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <main className="relative overflow-hidden">{children}</main>
      <footer id="footer">
        <Footer />
      </footer>
      <FloatingWhatsApp />
    </main>
  );
}
