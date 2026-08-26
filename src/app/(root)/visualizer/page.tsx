import type { Metadata } from "next";
import VisualizerShell from "@/components/visualizer/VisualizerShell";
import { getProducts } from "@/actions/products";
import type { VisualizerProduct } from "../../../../types";

export const metadata: Metadata = {
  title: "Quartz Visualizer — Alfa Ventura",
  description: "Explore our quartz designs in a real kitchen setting.",
};

const toVisualizerProduct = (p: { id: string; slug: string; title: string; images: string[]; category?: { name: string } | null }): VisualizerProduct => ({
  id: p.id,
  slug: p.slug,
  name: p.title,
  image: p.images[0],
  categoryName: p.category?.name ?? "Alfa Ventura",
});

export default async function VisualizerPage() {
  const productsRes = await getProducts({ limit: 60 });
  const withImages = productsRes.success && productsRes.data ? productsRes.data.products.filter((p) => p.images?.length > 0) : [];

  const cabinetProducts = withImages.filter((p) => /cabinet/i.test(p.category?.name ?? "")).map(toVisualizerProduct);
  // "Countertop"/"backsplash" both draw from the same real quartz slab
  // catalog -- one stone family used across multiple applications, same as
  // how the product photos are already organized in the category.
  const quartzProducts = withImages.filter((p) => /slab|design/i.test(p.category?.name ?? "")).map(toVisualizerProduct);

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
            Design Your Kitchen
          </h1>
          <p className="text-[#57534E] text-base md:text-lg max-w-2xl leading-relaxed">
            Explore our quartz designs in a real kitchen setting — switch the layout, swap cabinets, floors and
            quartz finishes, and watch it update instantly.
          </p>
        </div>

        <VisualizerShell cabinetProducts={cabinetProducts} quartzProducts={quartzProducts} />
      </div>
    </section>
  );
}
