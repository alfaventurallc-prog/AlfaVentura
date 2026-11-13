import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { ContentSections, FaqList, faqJsonLd } from "@/components/seo/ContentBlocks";
import { COLLECTIONS, collectionPath, type ContentSection, type Faq } from "@/data/seoContent";
import { BUSINESS, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Wholesale Quartz Slabs for Fabricators, Contractors & Designers",
  description:
    "Trade supply of engineered quartz slabs, cut-to-size countertops, vanity tops, cabinets and SPC flooring for US fabricators, builders, contractors and designers. Request trade pricing.",
  alternates: { canonical: "/trade" },
};

const SECTIONS: ContentSection[] = [
  {
    heading: "Who we work with",
    bullets: [
      "Countertop fabricators and stone shops looking for more quartz designs",
      "General contractors and home builders supplying single homes or multi-unit projects",
      "Interior designers and architects specifying surfaces for clients",
      "Kitchen and bath dealers and remodelers",
      "Hospitality, office and retail fit-out teams",
    ],
  },
  {
    heading: "What we supply",
    bullets: [
      "Engineered quartz slabs in 150+ designs: Calacatta, Carrara, Statuario, gold-veined, grey, black and speckled",
      "Cut-to-size quartz countertops and polished vanity tops through our fabrication partners",
      "Kitchen and bath cabinets in shaker, oak and painted finishes",
      "SPC rigid-core plank flooring",
    ],
  },
  {
    heading: "How it works",
    bullets: [
      "Send us your designs, quantities, drawings or takeoffs and project location",
      "We confirm availability and prepare a quote for your project",
      "Samples available so you and your clients can approve colors",
      "We coordinate supply to your shop or job site",
    ],
  },
  {
    heading: "Tools that help you sell",
    paragraphs: [
      "Show clients any of our quartz designs on kitchen countertops, bathroom vanities, living-room feature walls and commercial reception desks in our free 3D visualizer, then share the exact design link with them. Every product page has full slab photos and installed-look images you can use in presentations.",
    ],
  },
];

const FAQS: Faq[] = [
  {
    q: "Do you offer trade or volume pricing?",
    a: "Yes. Pricing depends on the designs, quantities and delivery location, so send us your project details through the form and we will prepare a quote.",
  },
  {
    q: "Can you supply multi-unit or commercial projects?",
    a: "Yes. Consistent engineered quartz designs are well suited to repeat layouts across multiple units, offices or locations. Share your schedule and quantities and we will plan supply with you.",
  },
  {
    q: "Where are you located?",
    a: `Our office is at ${BUSINESS.street}, ${BUSINESS.city}, ${BUSINESS.region} ${BUSINESS.postalCode}. We supply projects across the United States.`,
  },
];

const TradePage = () => (
  <div className="bg-[#FDFAF7]">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLdScript([
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Trade & Wholesale", path: "/trade" },
        ]),
        faqJsonLd(FAQS),
      ])}
    />
    <div className="bg-[#1C1917] text-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-14 md:py-20">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#C9A96E] mb-4">Trade & Wholesale</p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mb-5" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Wholesale Quartz Slabs for Fabricators, Contractors & Designers
        </h1>
        <p className="text-white/75 text-base md:text-lg max-w-2xl leading-relaxed">
          Alfa Ventura is a USA-based quartz supplier headquartered in Albuquerque, New Mexico. We supply engineered quartz slabs, cut-to-size
          countertops, vanity tops, cabinets and flooring for residential and commercial projects across the United States.
        </p>
        <div className="flex flex-wrap gap-3 mt-7">
          <a href="#trade-quote" className="px-5 py-3 rounded-xl bg-[#9B7040] hover:bg-[#7A5520] font-semibold transition-colors">
            Request Trade Pricing
          </a>
          <a href="tel:+14807915581" className="px-5 py-3 rounded-xl border border-white/30 hover:border-white font-semibold transition-colors">
            Call +1 (480) 791-5581
          </a>
        </div>
      </div>
    </div>

    <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-12 space-y-14">
      <div className="space-y-10 max-w-4xl">
        <ContentSections sections={SECTIONS} />
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] mb-3 tracking-tight" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            Popular quartz looks
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(COLLECTIONS).map(([s, c]) => (
              <Link
                key={s}
                href={collectionPath(s)}
                className="px-4 py-2 rounded-full border border-[#E8DDD0] bg-white text-[#1C1917] text-sm font-semibold hover:border-[#9B7040] hover:text-[#9B7040] transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
        <FaqList faqs={FAQS} />
      </div>
      <section id="trade-quote" className="scroll-mt-28">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1917] mb-2 tracking-tight" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Request trade pricing
        </h2>
        <p className="text-[#6B5E52] mb-6">Include the designs, quantities and your project location in your message.</p>
        <ContactForm />
      </section>
    </div>
  </div>
);

export default TradePage;
