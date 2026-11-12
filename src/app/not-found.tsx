import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-[#FDFAF7] px-5">
      <div className="text-center max-w-md">
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040] mb-3">404</p>
        <h1 className="text-3xl font-bold text-[#1C1917] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          This page doesn&apos;t exist
        </h1>
        <p className="text-[#6B5E52] mb-6">The link may be old or mistyped. Browse our quartz slabs or get in touch for a quote.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/all-products" className="px-5 py-2.5 rounded-xl bg-[#9B7040] hover:bg-[#7A5520] text-white font-semibold transition-colors">
            Browse Products
          </Link>
          <Link href="/contact" className="px-5 py-2.5 rounded-xl border border-[#E8DDD0] bg-white text-[#1C1917] font-semibold hover:border-[#9B7040] transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
