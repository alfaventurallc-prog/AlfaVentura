import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, productPath } from "@/lib/seo";
import { categoryPath } from "@/lib/categorySeo";
import { COLLECTIONS, GUIDES, collectionPath, guidePath } from "@/data/seoContent";
import { productTraits } from "@/lib/productTraits";
import { getQuartzProducts } from "@/actions/products";

// Rebuilt at most hourly; product create/update/delete also revalidates it.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, quartz] = await Promise.all([
    prisma.product.findMany({ select: { id: true, slug: true, updatedAt: true, images: true } }),
    prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
        parent: { select: { slug: true } },
        _count: { select: { products: true, subcategories: true } },
      },
    }),
    getQuartzProducts(),
  ]);

  // same rule as the collection pages: fewer than 3 designs = noindex
  const quartzTraits = (quartz.data ?? []).map((p) => productTraits(p.title, p.description));
  const indexableCollections = Object.entries(COLLECTIONS)
    .filter(([, c]) => quartzTraits.filter((t) => (c.trait.kind === "colour" ? t.colours : t.styles).includes(c.trait.id)).length >= 3)
    .map(([slug]) => slug);

  const latest = products.reduce((d, p) => (p.updatedAt > d ? p.updatedAt : d), new Date(0));
  const page = (path: string, priority: number, lastModified: Date = latest) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    priority,
  });

  return [
    page("/", 1),
    page("/all-products", 0.9),
    page("/visualizer", 0.8),
    page("/contact", 0.7),
    page("/about", 0.6),
    page("/trade", 0.9),
    page("/guides", 0.5),
    ...indexableCollections.map((slug) => page(collectionPath(slug), 0.8)),
    ...Object.entries(GUIDES).map(([slug, g]) => page(guidePath(slug), 0.6, new Date(g.published))),
    page("/privacy-policy", 0.2, new Date("2026-01-01")),
    // empty categories are noindex, so they stay out of the sitemap too
    ...categories
      .filter((c) => c._count.products > 0 || c._count.subcategories > 0)
      .map((c) => page(categoryPath(c), 0.8, c.updatedAt)),
    ...products.map((p) => ({
      ...page(productPath(p), 0.7, p.updatedAt),
      images: p.images.slice(0, 3),
    })),
  ];
}
