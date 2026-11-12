import Link from "next/link";
import type { ContentSection, Faq } from "@/data/seoContent";

const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export const ContentSections = ({ sections }: { sections: ContentSection[] }) => (
  <div className="space-y-8">
    {sections.map((s) => (
      <section key={s.heading}>
        <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] mb-3 tracking-tight" style={heading}>
          {s.heading}
        </h2>
        {s.paragraphs?.map((p) => (
          <p key={p.slice(0, 40)} className="text-[#57534E] leading-relaxed mb-3">
            {p}
          </p>
        ))}
        {s.bullets && (
          <ul className="space-y-2 mt-2">
            {s.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-[#57534E] leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#9B7040] shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </section>
    ))}
  </div>
);

export const FaqList = ({ faqs }: { faqs: Faq[] }) =>
  faqs.length ? (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-[#1C1917] mb-4 tracking-tight" style={heading}>
        Frequently asked questions
      </h2>
      <div className="divide-y divide-[#E8DDD0] border-y border-[#E8DDD0]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none flex justify-between gap-4 font-semibold text-[#1C1917]">
              {f.q}
              <span className="text-[#9B7040] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
            </summary>
            <p className="mt-3 text-[#57534E] leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  ) : null;

/** Quote / sample call to action used at the end of content pages. */
export const QuoteCta = ({ title = "Get a quote for your project" }: { title?: string }) => (
  <section className="rounded-2xl bg-[#1C1917] text-white p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-2" style={heading}>
        {title}
      </h2>
      <p className="text-white/70 max-w-xl">
        Tell us the designs, quantities and project location. We supply homeowners, designers, contractors and fabricators across the USA.
      </p>
    </div>
    <div className="flex flex-wrap gap-3 shrink-0">
      <Link href="/contact" className="px-5 py-3 rounded-xl bg-[#9B7040] hover:bg-[#7A5520] font-semibold transition-colors">
        Request a Quote
      </Link>
      <Link href="/visualizer" className="px-5 py-3 rounded-xl border border-white/30 hover:border-white font-semibold transition-colors">
        Try the 3D Visualizer
      </Link>
    </div>
  </section>
);

export const faqJsonLd = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
