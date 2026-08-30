"use client";

import { useMemo, useState } from "react";
import ProceduralSwatch from "./ProceduralSwatch";
import { PRODUCT_CATEGORIES, isProductCompatible, type Product } from "@/lib/visualizer2/product";

interface ProductPanelProps {
  products: Product[];
  selectedSurfaceLabel: string | null;
  /** The selected surface's type (e.g. "floor", "countertop") -- when set,
   * the grid only shows products whose applicationTypes actually include
   * it, via the shared isProductCompatible() compatibility engine. */
  selectedSurfaceType: string | null;
  activeProduct: Product | null;
  onSelectProduct: (product: Product) => void;
}

const ProductThumbnail = ({ product }: { product: Product }) =>
  product.source === "alfa" && product.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
  ) : product.descriptor ? (
    <ProceduralSwatch descriptor={product.descriptor} className="w-full h-full object-cover" />
  ) : null;

/**
 * MATERIALS panel: search + category filter + product grid + a small info
 * block for whatever was last clicked. Clicking a card applies it to
 * whichever surface is currently selected (see VisualizerV2Shell).
 */
const ProductPanel = ({ products, selectedSurfaceLabel, selectedSurfaceType, activeProduct, onSelectProduct }: ProductPanelProps) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [collection, setCollection] = useState<string>("All");

  const compatibleProducts = useMemo(
    () => (selectedSurfaceType ? products.filter((p) => isProductCompatible(p, selectedSurfaceType)) : products),
    [products, selectedSurfaceType]
  );

  const collections = useMemo(() => Array.from(new Set(compatibleProducts.map((p) => p.collection))).sort(), [compatibleProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return compatibleProducts.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesCollection = collection === "All" || p.collection === collection;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.finish.toLowerCase().includes(q);
      return matchesCategory && matchesCollection && matchesSearch;
    });
  }, [compatibleProducts, search, category, collection]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Materials</span>
        <span className="text-xs text-[#78716C]">
          Applies to: <span className="font-semibold text-[#1C1917]">{selectedSurfaceLabel ?? "select a surface"}</span>
        </span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search materials..."
        className="w-full px-3 py-2 rounded-lg border border-[#E8DDD0] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9B7040]"
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["All", ...PRODUCT_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 transition-colors ${
              category === cat ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {collections.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["All", ...collections].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCollection(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                collection === c ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-[#78716C] py-6 text-center">No materials match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {filtered.map((product) => {
            const active = activeProduct?.id === product.id;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product)}
                className={`relative text-left rounded-xl border overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040] ${
                  active ? "border-[#9B7040] ring-1 ring-[#9B7040]" : "border-[#E8DDD0] hover:border-[#9B7040]"
                }`}
              >
                <span className="block w-full h-24 bg-[#EDE6DA]">
                  <ProductThumbnail product={product} />
                </span>
                <span className="block px-2.5 py-2">
                  <span className="block text-xs font-bold text-[#1C1917] truncate">{product.name}</span>
                  <span className="block text-[11px] text-[#78716C] truncate">{product.collection}</span>
                </span>
                {active && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#9B7040] text-white text-[11px] flex items-center justify-center">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {activeProduct && (
        <div className="mt-1 p-3 rounded-lg bg-[#F5F1EA] border border-[#E8DDD0]">
          <p className="text-sm font-bold text-[#1C1917] uppercase tracking-wide">{activeProduct.name}</p>
          <p className="text-xs text-[#78716C] mt-0.5">{activeProduct.collection}</p>
          <p className="text-xs text-[#78716C]">Finish: {activeProduct.finish}</p>
          <p className="text-xs text-[#78716C]">Size: {activeProduct.availableSizes.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default ProductPanel;
