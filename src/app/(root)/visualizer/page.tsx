import type { Metadata } from "next";
import VisualizerShell from "@/components/visualizer/VisualizerShell";
import { getProducts } from "@/actions/products";

export const metadata: Metadata = {
  title: "Quartz Visualizer — Alfa Ventura",
  description: "Explore our quartz designs in a real kitchen setting.",
};

export default async function VisualizerPage() {
  const productsRes = await getProducts({ limit: 40 });
  const products =
    productsRes.success && productsRes.data
      ? productsRes.data.products
          .filter((p) => p.images && p.images.length > 0)
          // Only real slab/material designs belong in the quartz collection --
          // items from categories like Vanities or Cabinets tend to be photos
          // of an installed application, not a raw material swatch.
          .filter((p) => /slab|design/i.test(p.category?.name ?? ""))
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.title,
            image: p.images[0],
            categoryName: p.category?.name ?? "Alfa Ventura",
          }))
      : [];

  return (
    <section className="bg-[#FDFAF7] py-12 md:py-20 px-5 md:px-10 xl:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#9B7040] border-l-[3px] border-[#9B7040] pl-3 mb-4">
            Quartz Visualizer
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-[#1C1917] leading-tight mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            See It In a Real Kitchen
          </h1>
          <p className="text-[#57534E] text-base md:text-lg max-w-2xl leading-relaxed">
            Explore our quartz designs in a real kitchen setting — pick a slab below and watch the countertop,
            island and backsplash change instantly.
          </p>
        </div>

        <VisualizerShell products={products} />
      </div>
    </section>
  );
}
