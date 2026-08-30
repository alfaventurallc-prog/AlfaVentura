import type { Metadata } from "next";
import VisualizerV2Shell from "@/components/visualizer2/VisualizerV2Shell";
import { getProducts } from "@/actions/products";
import type { Product } from "@/lib/visualizer2/product";

export const metadata: Metadata = {
  title: "3D Visualizer (Preview) — Alfa Ventura",
  description: "An early, in-progress preview of Alfa Ventura's new interactive 3D visualizer.",
};

const toAlfaProduct = (p: { id: string; title: string; images: string[] }): Product => ({
  id: p.id,
  name: p.title,
  collection: "Alfa Ventura Quartz",
  category: "Quartz",
  finish: "Polished",
  availableSizes: ["600 x 600 mm", "3200 x 1600 mm"],
  availableModes: ["tile", "slab"],
  sizes: [
    { id: "600x600", width: 600, height: 600, unit: "mm", mode: "tile" },
    { id: "3200x1600", width: 3200, height: 1600, unit: "mm", mode: "slab" },
  ],
  source: "alfa",
  imageUrl: p.images[0],
});

export default async function VisualizerV2Page() {
  const productsRes = await getProducts({ limit: 24 });
  const quartzProducts =
    productsRes.success && productsRes.data
      ? productsRes.data.products
          .filter((p) => p.images?.length > 0 && /slab|design/i.test(p.category?.name ?? ""))
          .map(toAlfaProduct)
      : [];

  return (
    <section className="bg-[#FDFAF7] py-12 md:py-20 px-5 md:px-10 xl:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#9B7040] border-l-[3px] border-[#9B7040] pl-3 mb-4">
            Alfa Ventura
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-[#1C1917] leading-tight mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            3D Visualizer — Foundation Preview
          </h1>
          <p className="text-[#57534E] text-base md:text-lg max-w-2xl leading-relaxed">
            Step 2: pick a surface (click it in the room, or use the Surface buttons), then choose a material — it
            applies instantly. Quartz uses real Alfa Ventura products; the other categories are placeholders until
            those product lines exist in the catalogue.
          </p>
        </div>

        <VisualizerV2Shell alfaProducts={quartzProducts} />
      </div>
    </section>
  );
}
