"use client";

import { useEffect, useState } from "react";
import type { VisualizerProduct } from "../../../types";

interface ProductImageGalleryProps {
  product: VisualizerProduct | null;
}

/**
 * The Image Visualizer, honestly scoped: it shows the real photos already
 * uploaded for the selected product -- no fabricated "installed in a
 * kitchen" composite, no second 3D scene standing in for photography.
 * Whatever image is added for a product in the admin is exactly what
 * shows up here.
 */
const ProductImageGallery = ({ product }: ProductImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActiveIndex((i) => (product ? (i + 1) % product.images.length : i));
      if (e.key === "ArrowLeft") setActiveIndex((i) => (product ? (i - 1 + product.images.length) % product.images.length : i));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, product]);

  if (!product || product.images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[380px] bg-[#EDE6DA] text-center px-6">
        <p className="text-[#78716C] text-sm">No photos available for this product yet.</p>
      </div>
    );
  }

  const images = product.images;
  const active = images[activeIndex] ?? images[0];

  return (
    <>
      <div className="relative w-full h-full flex flex-col">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative flex-1 min-h-0 w-full bg-[#EDE6DA] group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt={product.name} className="w-full h-full object-contain" />
          <span className="absolute bottom-3 right-3 text-xs font-semibold uppercase tracking-wide text-[#44403C] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to Expand
          </span>
        </button>

        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto shrink-0 bg-[#EDE6DA]/60">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeIndex ? "border-[#9B7040]" : "border-transparent hover:border-[#E8DDD0]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${product.name} photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % images.length);
                }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors"
              >
                →
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt={product.name} className="max-w-[92vw] max-h-[88vh] object-contain" onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-wide text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
            {product.name} — {activeIndex + 1}/{images.length}
          </p>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;
