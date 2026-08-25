"use client";

import type { VisualizerProduct } from "../../../types";

interface ProductSelectorProps {
  products: VisualizerProduct[];
  activeProductId: string | null;
  onSelect: (product: VisualizerProduct) => void;
}

const ProductSelector = ({ products, activeProductId, onSelect }: ProductSelectorProps) => (
  <div>
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          onClick={() => onSelect(product)}
          aria-pressed={activeProductId === product.id}
          className={`shrink-0 w-32 text-left rounded-xl border overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040] ${
            activeProductId === product.id
              ? "border-[#9B7040] ring-1 ring-[#9B7040]"
              : "border-[#E8DDD0] hover:border-[#9B7040]"
          }`}
        >
          <span
            className="block w-full h-24 bg-cover bg-center"
            style={{ backgroundImage: `url(${product.image})` }}
          />
          <span className="block px-2.5 py-2">
            <span className="block text-xs font-bold text-[#1C1917] truncate">{product.name}</span>
            <span className="block text-[11px] text-[#78716C] truncate">{product.categoryName}</span>
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default ProductSelector;
