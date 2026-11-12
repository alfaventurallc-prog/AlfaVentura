// Site-wide SEO constants and JSON-LD builders. The business details here
// must match the Google Business Profile exactly (name, address, phone), or
// Google treats them as different businesses.

export const SITE_URL = "https://www.alfa-ventura.com";
export const SITE_NAME = "Alfa Ventura";

export const BUSINESS = {
  name: "Alfa Ventura",
  phone: "+1-480-791-5581",
  email: "info@alfa-ventura.com",
  street: "1209 Mountain Road Place NE, Suite N",
  city: "Albuquerque",
  region: "NM",
  postalCode: "87110",
  country: "US",
  instagram: "https://www.instagram.com/alfaventura_/",
  logo: `${SITE_URL}/new_logo.png`,
};

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Plain text of at most `max` chars, cut at a word boundary, for meta descriptions. */
export const metaText = (text: string | null | undefined, max = 158) => {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "")}…`;
};

/** Public URL of a product page; slugs are the canonical form. */
export const productPath = (p: { slug?: string | null; id: string }) => `/products/${p.slug || p.id}`;

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${SITE_URL}/#business`,
  name: BUSINESS.name,
  url: SITE_URL,
  logo: BUSINESS.logo,
  image: BUSINESS.logo,
  description:
    "USA-based supplier of engineered quartz slabs, quartz countertops and vanity tops, cabinets and SPC flooring for fabricators, contractors, designers and homeowners.",
  telephone: BUSINESS.phone,
  email: BUSINESS.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postalCode,
    addressCountry: BUSINESS.country,
  },
  areaServed: { "@type": "Country", name: "United States" },
  sameAs: [BUSINESS.instagram],
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { "@id": `${SITE_URL}/#business` },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

/** Renders JSON-LD; "<" is escaped so a description can't close the script tag. */
export const jsonLdScript = (data: unknown) => ({
  __html: JSON.stringify(data).replace(/</g, "\\u003c"),
});
