import Link from "next/link";
import { CATEGORY_CONTENT, COLLECTIONS, collectionPath } from "@/data/seoContent";
import { jsonLdScript } from "@/lib/seo";
import { ContentSections, FaqList, QuoteCta, faqJsonLd } from "./ContentBlocks";

/** Long-form copy, quartz "shop by look" links and a quote CTA under a
 * category's products. Renders nothing extra for categories without copy. */
const CategoryContent = ({ slug, isQuartz }: { slug: string; isQuartz: boolean }) => {
  const content = CATEGORY_CONTENT[slug];
  return (
    <div className="mt-12 space-y-12">
      {content?.faqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(content.faqs))} /> : null}
      {isQuartz && (
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] mb-4 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Shop quartz by look
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
      )}
      {content && (
        <div className="max-w-4xl space-y-10">
          <ContentSections sections={content.sections} />
          <FaqList faqs={content.faqs} />
        </div>
      )}
      <QuoteCta />
    </div>
  );
};

export default CategoryContent;
