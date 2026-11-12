import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { ContentSections, FaqList, QuoteCta, faqJsonLd } from "@/components/seo/ContentBlocks";
import { COLLECTIONS, GUIDES, collectionPath, guidePath } from "@/data/seoContent";
import { BUSINESS, SITE_NAME, SITE_URL, absoluteUrl, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(GUIDES).map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: guidePath(slug) },
    openGraph: { type: "article", url: guidePath(slug), title: guide.title, description: guide.description, publishedTime: guide.published },
  };
}

const GuidePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.h1, path: guidePath(slug) },
  ];
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.published,
    mainEntityOfPage: absoluteUrl(guidePath(slug)),
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: BUSINESS.logo } },
  };

  return (
    <div className="bg-[#FDFAF7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([article, breadcrumbJsonLd(crumbs), ...(guide.faqs.length ? [faqJsonLd(guide.faqs)] : [])])}
      />
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#6B5E52] mb-6">
          <Link href="/" className="hover:text-[#9B7040] flex items-center transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/guides" className="hover:text-[#9B7040] transition-colors">
            Guides
          </Link>
        </nav>

        <article className="space-y-10">
          <header>
            <h1 className="text-3xl md:text-5xl font-bold text-[#1C1917] tracking-tight mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {guide.h1}
            </h1>
            <p className="text-sm text-[#8A7B68] mb-5">
              By {SITE_NAME} ·{" "}
              <time dateTime={guide.published}>
                {new Date(guide.published).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}
              </time>
            </p>
            <p className="text-[#57534E] text-base md:text-lg leading-relaxed">{guide.intro}</p>
          </header>

          <ContentSections sections={guide.sections} />
          <FaqList faqs={guide.faqs} />

          {guide.related.length > 0 && (
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] mb-4 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Browse quartz designs
              </h2>
              <div className="flex flex-wrap gap-2">
                {guide.related.map((s) => (
                  <Link
                    key={s}
                    href={collectionPath(s)}
                    className="px-4 py-2 rounded-full border border-[#E8DDD0] bg-white text-[#1C1917] text-sm font-semibold hover:border-[#9B7040] hover:text-[#9B7040] transition-colors"
                  >
                    {COLLECTIONS[s].name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <QuoteCta />
        </article>
      </div>
    </div>
  );
};

export default GuidePage;
