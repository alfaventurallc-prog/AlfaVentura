import type { Metadata } from "next";
import MaskEditor from "@/components/visualizer/MaskEditor";
import { getProducts } from "@/actions/products";

export const metadata: Metadata = {
  title: "Mask Editor",
  robots: { index: false, follow: false },
};

export default async function MaskEditorPage() {
  const productsRes = await getProducts({ limit: 40 });
  const slabOptions =
    productsRes.success && productsRes.data
      ? productsRes.data.products
          .filter((p) => p.images && p.images.length > 0)
          .filter((p) => /slab|design/i.test(p.category?.name ?? ""))
          .map((p) => ({ name: p.title, image: p.images[0] }))
      : [];

  return <MaskEditor slabOptions={slabOptions} />;
}
