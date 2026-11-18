import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home, MapPin } from "lucide-react";
import { getQuartzProducts } from "@/actions/products";
import ProductCard from "@/components/ProductCard";
import { ContentSections, FaqList, QuoteCta, faqJsonLd } from "@/components/seo/ContentBlocks";
import { COLLECTIONS, GUIDES, collectionPath, guidePath } from "@/data/seoContent";
import { LOCATIONS, locationPath } from "@/data/locations";
import { SITE_NAME, SITE_URL, absoluteUrl, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = false;

export const generateStaticParams = () => Object.keys(LOCATIONS).map((slug) => ({ slug }));

const FEATURED = 8;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = LOCATIONS[slug];
  if (!area) return {};
  return {
    title: area.title,
    description: area.description,
    alternates: { canonical: locationPath(slug) },
    openGraph: { url: locationPath(slug), title: `${area.title} | ${SITE_NAME}`, description: area.description },
  };
}

const LocationPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const area = LOCATIONS[slug];
  if (!area) notFound();
  const products = ((await getQuartzProducts()).data ?? []).slice(0, FEATURED);
  const place = `${area.city}, ${area.state}`;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: place, path: locationPath(slug) },
  ];
  // A service offered in the city by the one real business (Albuquerque
  // NAP) -- no local address, so no second LocalBusiness entity.
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Quartz slabs and countertops in ${place}`,
    serviceType: "Engineered quartz slab supply, countertop fabrication and installation",
    url: absoluteUrl(locationPath(slug)),
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: {
      "@type": "City",
      name: area.city,
      containedInPlace: { "@type": "State", name: area.stateName },
    },
  };

  const links = [
    { href: "/engineered-quartz-slab", label: "All quartz slabs" },
    { href: "/engineered-quartz-slab/countertops-vanities", label: "Countertops & vanities" },
    { href: "/cabinets", label: "Cabinets" },
    { href: "/spc-flooring", label: "SPC flooring" },
    { href: "/trade", label: "Trade & contractors" },
  ];

  return (
    <div className="bg-[#FDFAF7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([breadcrumbJsonLd(crumbs), service, faqJsonLd(area.faqs)])}
      />
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-10">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#6B5E52] mb-6">
          <Link href="/" className="hover:text-[#9B7040] flex items-center transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1C1917] font-medium">{place}</span>
        </nav>

        <header className="max-w-3xl mb-10">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040] mb-3">
            <MapPin className="w-4 h-4" />
            Serving {area.city} &amp; nearby areas
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-[#1C1917] tracking-tight mb-4" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            {area.h1}
          </h1>
          <p className="text-[#57534E] text-base md:text-lg leading-relaxed">{area.intro}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/contact" className="px-5 py-3 rounded-xl bg-[#9B7040] hover:bg-[#7A5520] text-white font-semibold transition-colors">
              Request a Quote
            </Link>
            <Link href="/visualizer" className="px-5 py-3 rounded-xl border border-[#E8DDD0] bg-white text-[#1C1917] font-semibold hover:border-[#9B7040] transition-colors">
              Try in 3D Visualizer
            </Link>
          </div>
        </header>

        {products.length > 0 && (
          <section className="mb-14">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
              <h2 className="text-xl font-semibold text-[#1C1917]" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                Popular quartz designs for {area.city} projects
              </h2>
              <Link href="/engineered-quartz-slab" className="text-sm font-semibold text-[#9B7040] hover:text-[#7A5520]">
                See all designs →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-16 mb-14">
          <div className="space-y-10">
            <ContentSections sections={area.sections} />
            <section>
              <h2 className="text-2xl font-semibold text-[#1C1917] mb-3" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                Areas we serve around {area.city}
              </h2>
              <p className="text-[#57534E] leading-relaxed">
                We supply projects in {area.city} and nearby communities including {area.nearby.slice(0, -1).join(", ")} and{" "}
                {area.nearby[area.nearby.length - 1]}, {area.stateName}. Not sure if we cover your area? Send us your project address.
              </p>
            </section>
            <FaqList faqs={area.faqs} />
          </div>
          <aside className="space-y-8">
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040] mb-3">Shop</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[#1C1917] hover:text-[#9B7040] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040] mb-3">Shop by look</p>
              <ul className="space-y-2">
                {Object.entries(COLLECTIONS).map(([s, c]) => (
                  <li key={s}>
                    <Link href={collectionPath(s)} className="text-[#1C1917] hover:text-[#9B7040] transition-colors">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040] mb-3">Guides</p>
              <ul className="space-y-2">
                {Object.entries(GUIDES).map(([s, g]) => (
                  <li key={s}>
                    <Link href={guidePath(s)} className="text-[#1C1917] hover:text-[#9B7040] transition-colors">
                      {g.h1}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <QuoteCta title={`Get a quote for your ${area.city} project`} />
      </div>
    </div>
  );
};

export default LocationPage;
