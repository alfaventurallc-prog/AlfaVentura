import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getQuartzProducts } from "@/actions/products";
import ProductCard from "@/components/ProductCard";
import { ContentSections, FaqList, QuoteCta, faqJsonLd } from "@/components/seo/ContentBlocks";
import { COLLECTIONS, GUIDES, collectionPath, guidePath } from "@/data/seoContent";
import { productTraits } from "@/lib/productTraits";
import { SITE_NAME, absoluteUrl, breadcrumbJsonLd, jsonLdScript, productPath } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = false;

export const generateStaticParams = () => Object.keys(COLLECTIONS).map((slug) => ({ slug }));

/** Below this many matching products a collection is too thin to index. */
const MIN_INDEXABLE = 3;

const collectionProducts = async (slug: string) => {
  const collection = COLLECTIONS[slug];
  const res = await getQuartzProducts();
  return (res.data ?? []).filter((p) => {
    const t = productTraits(p.title, p.description);
    return (collection.trait.kind === "colour" ? t.colours : t.styles).includes(collection.trait.id);
  });
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = COLLECTIONS[slug];
  if (!collection) return {};
  const products = await collectionProducts(slug);
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: collectionPath(slug) },
    openGraph: {
      url: collectionPath(slug),
      title: `${collection.title} | ${SITE_NAME}`,
      description: collection.description,
      images: products.slice(0, 1).map((p) => ({ url: p.images[0], alt: p.title })),
    },
    ...(products.length < MIN_INDEXABLE ? { robots: { index: false, follow: true } } : {}),
  };
}

const CollectionPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const collection = COLLECTIONS[slug];
  if (!collection) notFound();
  const products = await collectionProducts(slug);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Engineered Quartz Slab", path: "/engineered-quartz-slab" },
    { name: collection.name, path: collectionPath(slug) },
  ];
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.h1,
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(productPath(p)), name: p.title })),
  };
  const others = Object.entries(COLLECTIONS).filter(([s]) => s !== slug);

  return (
    <div className="bg-[#FDFAF7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([breadcrumbJsonLd(crumbs), itemList, ...(collection.faqs.length ? [faqJsonLd(collection.faqs)] : [])])}
      />
      <div className="max-w-[1400px] mx-auto px-5 md:px-12 lg:px-20 xl:px-32 py-10">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#6B5E52] mb-6">
          <Link href="/" className="hover:text-[#9B7040] flex items-center transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/engineered-quartz-slab" className="hover:text-[#9B7040] transition-colors">
            Engineered Quartz Slab
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1C1917] font-medium">{collection.name}</span>
        </nav>

        <header className="max-w-3xl mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-[#1C1917] tracking-tight mb-4" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            {collection.h1}
          </h1>
          <p className="text-[#57534E] text-base md:text-lg leading-relaxed">{collection.intro}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/contact" className="px-5 py-3 rounded-xl bg-[#9B7040] hover:bg-[#7A5520] text-white font-semibold transition-colors">
              Request a Quote
            </Link>
            <Link href="/visualizer" className="px-5 py-3 rounded-xl border border-[#E8DDD0] bg-white text-[#1C1917] font-semibold hover:border-[#9B7040] transition-colors">
              Try in 3D Visualizer
            </Link>
          </div>
        </header>

        {products.length > 0 ? (
          <section className="mb-14">
            <h2 className="text-xl font-semibold text-[#1C1917] mb-5" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
              {products.length} {collection.name} {products.length === 1 ? "design" : "designs"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : (
          <p className="mb-14 text-[#57534E]">
            New designs in this look are coming soon. <Link href="/engineered-quartz-slab" className="text-[#9B7040] font-semibold">Browse all quartz slabs</Link>.
          </p>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-16 mb-14">
          <div className="space-y-10">
            <ContentSections sections={collection.sections} />
            <FaqList faqs={collection.faqs} />
          </div>
          <aside className="space-y-8">
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#9B7040] mb-3">Shop by look</p>
              <ul className="space-y-2">
                {others.map(([s, c]) => (
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

        <QuoteCta title={`Get a quote on ${collection.name.toLowerCase()}`} />
      </div>
    </div>
  );
};

export default CollectionPage;
