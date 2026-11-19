import type { Metadata } from "next";
import { getCategoryBySlug } from "@/actions/categories";
import { SITE_NAME, metaText } from "./seo";

/** Search-facing title/description per category slug, written for what US
 * buyers type. Categories not listed fall back to their name and stored
 * description. */
const CATEGORY_SEO: Record<string, { title: string; description: string; h1?: string }> = {
  "engineered-quartz-slab": {
    title: "Engineered Quartz Slabs - 150+ Designs for US Projects",
    h1: "Engineered Quartz Slabs",
    description:
      "Shop 150+ engineered quartz slab designs: Calacatta, Carrara, Statuario, speckled and solid colors. Supplied across the USA for countertops, vanities and walls.",
  },
  "countertops-vanities": {
    title: "Quartz Countertops & Vanity Tops - Calacatta, Carrara & More",
    h1: "Quartz Countertops & Vanity Tops",
    description:
      "Quartz countertop and vanity top designs from Alfa Ventura: white, grey, black and gold-veined slabs for kitchens and bathrooms across the USA. Get a quote.",
  },
  cabinets: {
    title: "Kitchen Cabinets - Shaker, Oak & Painted Finishes",
    h1: "Kitchen & Bath Cabinets",
    description:
      "Kitchen and bath cabinets built to project specs: white and green shaker, white oak, espresso and grey finishes. Pair them with our quartz countertops.",
  },
  "spc-flooring": {
    title: "SPC Flooring - Rigid Core Wood-Look Plank Flooring",
    h1: "SPC Rigid Core Plank Flooring",
    description:
      "SPC (stone plastic composite) plank flooring in oak, grey and warm wood looks for homes and commercial spaces across the USA. Request samples and pricing.",
  },
  vanities: {
    title: "Bathroom Vanities",
    description: "Bathroom vanities from Alfa Ventura, pairing with our quartz vanity tops.",
  },
};

/** Keyword heading for a category page; falls back to its admin name. */
export const categoryH1 = (c: { slug: string; name: string }) => CATEGORY_SEO[c.slug]?.h1 ?? c.name;

/** The single public URL of a category: subcategories live under their parent. */
export const categoryPath = (c: { slug: string; parent?: { slug: string } | null }) =>
  c.parent ? `/${c.parent.slug}/${c.slug}` : `/${c.slug}`;

export const categoryMetadata = async (slug: string): Promise<Metadata> => {
  const res = await getCategoryBySlug(slug);
  const category = res.success ? res.data : null;
  if (!category) return { title: "Category Not Found", robots: { index: false } };
  const seo = CATEGORY_SEO[category.slug];
  const title = seo?.title ?? category.name;
  const description =
    seo?.description ?? (metaText(category.description) || `${category.name} from ${SITE_NAME}, supplied across the USA.`);
  const productCount = category._count.products + category.subcategories.reduce((n, s) => n + s._count.products, 0);
  return {
    title,
    description,
    alternates: { canonical: categoryPath(category) },
    openGraph: { url: categoryPath(category), title: `${title} | ${SITE_NAME}`, description, ...(category.imageUrl ? { images: [category.imageUrl] } : {}) },
    // An empty category is a thin page; keep it out of the index until it has products.
    ...(productCount === 0 ? { robots: { index: false, follow: true } } : {}),
  };
};
