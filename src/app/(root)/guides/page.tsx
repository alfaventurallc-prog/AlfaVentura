import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, guidePath } from "@/data/seoContent";

export const metadata: Metadata = {
  title: "Quartz Countertop Guides & Advice",
  description:
    "Practical guides on choosing, comparing and caring for quartz countertops: quartz vs. granite, buying tips, thickness, edges and cleaning.",
  alternates: { canonical: "/guides" },
};

const GuidesPage = () => (
  <div className="bg-[#FDFAF7]">
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
      <h1 className="text-3xl md:text-5xl font-bold text-[#1C1917] tracking-tight mb-4" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        Quartz Guides & Advice
      </h1>
      <p className="text-[#57534E] text-lg max-w-2xl mb-10">
        Straightforward answers to help homeowners, designers and contractors choose and care for quartz surfaces.
      </p>
      <div className="grid md:grid-cols-2 gap-5">
        {Object.entries(GUIDES).map(([slug, g]) => (
          <Link
            key={slug}
            href={guidePath(slug)}
            className="block bg-white rounded-2xl border border-[#E8DDD0] p-6 hover:shadow-[0_8px_28px_rgba(155,112,64,0.15)] hover:-translate-y-1 transition-all"
          >
            <h2 className="text-lg font-bold text-[#1C1917] mb-2" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
              {g.h1}
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">{g.description}</p>
            <span className="inline-block mt-4 text-sm font-semibold text-[#9B7040]">Read guide →</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default GuidesPage;
