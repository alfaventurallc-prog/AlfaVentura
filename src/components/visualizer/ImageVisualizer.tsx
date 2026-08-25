"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SPACES } from "@/data/scenes";
import { getImageScenesForSpace } from "@/data/imageScenes";
import { renderSlabOnImage } from "@/three/renderSlabOnImage";
import type { Point } from "@/three/homography";
import SpaceSelector from "./SpaceSelector";
import ApplicationSelector from "./ApplicationSelector";
import ProductSelector from "./ProductSelector";
import ProductInfoPanel from "./ProductInfoPanel";
import type { VisualizerProduct } from "../../../types";

interface ImageVisualizerProps {
  products: VisualizerProduct[];
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const ImageVisualizer = ({ products }: ImageVisualizerProps) => {
  const [spaceId, setSpaceId] = useState(SPACES[0].id);
  const [applicationId, setApplicationId] = useState(SPACES[0].defaultApplication);
  const [selectedProduct, setSelectedProduct] = useState<VisualizerProduct | null>(products[0] ?? null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [detail, setDetail] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const space = SPACES.find((s) => s.id === spaceId) ?? SPACES[0];
  const scene = useMemo(
    () => getImageScenesForSpace(spaceId).find((s) => s.surfaces[applicationId]),
    [spaceId, applicationId]
  );
  const surface = scene?.surfaces[applicationId];

  const handleSelectSpace = (id: string) => {
    setSpaceId(id);
    const s = SPACES.find((sp) => sp.id === id);
    setApplicationId(s?.defaultApplication ?? "");
  };

  useEffect(() => {
    if (!scene || !surface || showOriginal || !selectedProduct) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");

    Promise.all([loadImage(scene.image), loadImage(selectedProduct.image)])
      .then(([baseImg, slabImg]) => {
        if (cancelled) return;
        const result = renderSlabOnImage(baseImg, slabImg, surface.corners);
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = result.width;
        canvas.height = result.height;
        canvas.getContext("2d")!.drawImage(result, 0, 0);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [scene, surface, selectedProduct, showOriginal]);

  const detailTransform = useMemo(() => {
    if (!detail || !surface) return undefined;
    const xs = surface.corners.map((c) => c.x);
    const ys = surface.corners.map((c) => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const scale = Math.min(3.2, 0.85 / Math.max(maxX - minX, maxY - minY, 0.05));
    return { transform: `scale(${scale})`, transformOrigin: `${cx * 100}% ${cy * 100}%` };
  }, [detail, surface]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      <div className="order-1 lg:order-2 flex-1 min-w-0 flex flex-col gap-5">
        <div className="relative w-full min-h-[400px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0] flex items-center justify-center">
          {!scene || !surface ? (
            <p className="text-center text-[#78716C] text-sm px-8 py-16">
              No predefined image yet for {space.label} →{" "}
              {space.applications.find((a) => a.id === applicationId)?.label}. Try Kitchen → Island.
            </p>
          ) : (
            <>
              {showOriginal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={scene.image} alt={scene.name} className="w-full h-auto block" />
              ) : (
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto block transition-transform duration-500 ease-out"
                  style={detailTransform}
                />
              )}
              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <p className="text-sm text-[#78716C]">Rendering…</p>
                </div>
              )}

              <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowOriginal(false)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${!showOriginal ? "bg-[#1C1917] text-white border-[#1C1917]" : "bg-white/80 backdrop-blur-sm text-[#44403C] border-white/20"}`}
                  >
                    Visualized
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOriginal(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${showOriginal ? "bg-[#1C1917] text-white border-[#1C1917]" : "bg-white/80 backdrop-blur-sm text-[#44403C] border-white/20"}`}
                  >
                    Original
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setDetail((v) => !v)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 bg-white/80 backdrop-blur-sm text-[#44403C] hover:bg-white transition-colors"
                >
                  {detail ? "Zoom Out" : "View Detail"}
                </button>
              </div>

              {selectedProduct && !showOriginal && (
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9B7040]">Selected Surface</p>
                  <p className="text-sm font-bold text-[#1C1917] leading-tight">{selectedProduct.name}</p>
                </div>
              )}
            </>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-[#78716C] text-sm py-4">No products available to preview yet.</p>
        ) : (
          <ProductSelector products={products} activeProductId={selectedProduct?.id ?? null} onSelect={setSelectedProduct} />
        )}
      </div>

      <div className="order-2 lg:order-1 lg:w-[260px] lg:shrink-0 space-y-8">
        <SpaceSelector activeSpaceId={spaceId} onSelect={handleSelectSpace} />
        <ApplicationSelector
          applications={space.applications}
          activeApplicationId={applicationId}
          onSelect={setApplicationId}
        />
      </div>

      <div className="order-3 lg:w-[320px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0]">
        <ProductInfoPanel
          product={selectedProduct}
          spaceLabel={space.label}
          applicationLabel={space.applications.find((a) => a.id === applicationId)?.label ?? ""}
          onNavigate={(targetSpaceId, targetApplicationId) => {
            setSpaceId(targetSpaceId);
            setApplicationId(targetApplicationId);
          }}
        />
      </div>
    </div>
  );
};

export default ImageVisualizer;
