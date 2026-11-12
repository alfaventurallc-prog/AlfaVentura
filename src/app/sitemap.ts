import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, productPath } from "@/lib/seo";
import { categoryPath } from "@/lib/categorySeo";

// Rebuilt at most hourly; product create/update/delete also revalidates it.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ select: { id: true, slug: true, updatedAt: true, images: true } }),
    prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
        parent: { select: { slug: true } },
        _count: { select: { products: true, subcategories: true } },
      },
    }),
  ]);

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
