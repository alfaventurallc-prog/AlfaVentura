import type { Metadata } from "next";
import VisualizerV2Shell from "@/components/visualizer2/VisualizerV2Shell";
import { getProducts } from "@/actions/products";
import { adaptAlfaProduct } from "@/lib/visualizer2/productAdapter";
import { validateProduct } from "@/lib/visualizer2/product";

export const metadata: Metadata = {
  title: "Virtual Kitchen & Space Visualizer — Alfa Ventura",
  description: "Design your space with real Alfa Ventura quartz — configure countertops, floors and walls in 3D, or upload your own photo.",
};

interface VisualizerV2PageProps {
  // /visualizer-v2?product=PRODUCT_ID deep-links straight to that product;
  // &mode=image opens directly in the Image Visualizer (Step 8's "Product
  // -> Image Visualizer" flow).
  searchParams: Promise<{ product?: string; mode?: string }>;
}

export default async function VisualizerV2Page({ searchParams }: VisualizerV2PageProps) {
  const { product: deepLinkProductId, mode } = await searchParams;

  const productsRes = await getProducts({ limit: 60 });
  const quartzProducts =
    productsRes.success && productsRes.data
      ? productsRes.data.products
          .filter((p) => p.images?.length > 0 && /slab|design/i.test(p.category?.name ?? ""))
          .map(adaptAlfaProduct)
          .filter(validateProduct)
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
            Design Your Space
          </h1>
          <p className="text-[#57534E] text-base md:text-lg max-w-2xl leading-relaxed">
            Pick a surface — in the 3D room or your own uploaded photo — then choose an Alfa Ventura material and see
            it applied instantly. Quartz uses our real catalogue; a few additional material categories are shown as
            placeholders until those product lines are added.
          </p>
        </div>

        <VisualizerV2Shell alfaProducts={quartzProducts} deepLinkProductId={deepLinkProductId ?? null} initialMode={mode === "image" ? "image" : "3d"} />
      </div>
    </section>
  );
}
