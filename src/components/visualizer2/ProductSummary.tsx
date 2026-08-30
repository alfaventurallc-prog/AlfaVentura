"use client";

import Link from "next/link";
import type { Product } from "@/lib/visualizer2/product";
import type { SurfaceMaterialConfig } from "@/lib/visualizer2/layout";

interface ProductSummaryProps {
  surfaceLabel: string;
  product: Product;
  config: SurfaceMaterialConfig;
}

/**
 * "What am I currently changing?" -- a compact, always-current summary of
 * the selected surface's applied material (Step 6 spec: Product Summary).
 * "View Product" links to the product's real Alfa Ventura page when one
 * exists (source: "alfa" products only -- demo products have no page).
 */
const ProductSummary = ({ surfaceLabel, product, config }: ProductSummaryProps) => {
  const size = product.sizes.find((s) => s.id === config.sizeId);

  return (
    <div className="p-3 rounded-lg bg-white border border-[#E8DDD0]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#78716C]">Current Material — {surfaceLabel}</p>
      <p className="text-sm font-bold text-[#1C1917] mt-1">{product.name}</p>
      <p className="text-xs text-[#78716C]">Collection: {product.collection}</p>
      <p className="text-xs text-[#78716C]">Finish: {product.finish}</p>
      {size && (
        <p className="text-xs text-[#78716C]">
          Size: {size.width} × {size.height} mm
        </p>
      )}
      {product.source === "alfa" && (
        // The real product page route is /products/[id] (confirmed against
        // the site's own product links), not a slug -- product.id is the
        // stable identifier to use here.
        <Link href={`/products/${product.id}`} className="inline-block mt-2 text-xs font-semibold text-[#9B7040] hover:underline">
          View Product →
        </Link>
      )}
    </div>
  );
};

export default ProductSummary;
