import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <main className="relative overflow-hidden">{children}</main>
      <footer id="footer">
        <Footer />
      </footer>
    </main>
  );
}
