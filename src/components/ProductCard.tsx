"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string | null;
    images: string[];
    isPremium?: boolean;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const showPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group transition-all hover:-translate-y-1">
      <Link href={`/products/${product.id}`}>
        <div
          className={`bg-white relative rounded-xl border overflow-hidden border-[#E8DDD0] hover:shadow-[0_8px_28px_rgba(155,112,64,0.15)] transition-shadow ${
            product.isPremium ? "ring-2 ring-[#C9A96E]" : ""
          }`}
        >
          {product.isPremium && (
            <div className="absolute top-2 right-2 bg-[#C9A96E] text-white text-xs font-semibold px-2 py-1 rounded-full z-10 flex items-center gap-1">
              Premium
            </div>
          )}
          {images.length > 0 && (
            <div className="relative w-full h-64 overflow-hidden">
              <Image
                src={images[activeImage]}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#1C1917] rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#1C1917] rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${
                          idx === activeImage ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="p-4">
            <h3
              className="text-base font-semibold text-[#1C1917] mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {product.title}
            </h3>
            {product.description && (
              <p className="text-sm text-[#6B5E52] line-clamp-2 whitespace-pre-line">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
