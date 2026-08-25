"use client";

import { useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import VisualizerCanvas from "./VisualizerCanvas";
import SceneControls from "./SceneControls";
import ProductSelector from "./ProductSelector";
import ProductInfoPanel from "./ProductInfoPanel";
import type { VisualizerProduct } from "../../../types";

interface VisualizerShellProps {
  products: VisualizerProduct[];
}

const VisualizerShell = ({ products }: VisualizerShellProps) => {
  const [selectedProduct, setSelectedProduct] = useState<VisualizerProduct | null>(products[0] ?? null);
  const [lightingMode, setLightingMode] = useState<"day" | "evening">("day");
  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      {/* Kitchen preview — the hero element */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div className="relative w-full h-[64vh] min-h-[440px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]">
          <VisualizerCanvas product={selectedProduct} lightingMode={lightingMode} cameraControlsRef={cameraControlsRef} />
          <SceneControls cameraControlsRef={cameraControlsRef} lightingMode={lightingMode} onLightingChange={setLightingMode} />
          {selectedProduct && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2 shadow-sm">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9B7040]">Selected Quartz</p>
              <p className="text-sm font-bold text-[#1C1917] leading-tight">{selectedProduct.name}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#78716C] mb-3">Quartz Collection</p>
          {products.length === 0 ? (
            <p className="text-center text-[#78716C] text-sm py-4">No products available to preview yet.</p>
          ) : (
            <ProductSelector products={products} activeProductId={selectedProduct?.id ?? null} onSelect={setSelectedProduct} />
          )}
        </div>
      </div>

      {/* Selected product info + CTA */}
      <div className="lg:w-[320px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0]">
        <ProductInfoPanel product={selectedProduct} />
      </div>
    </div>
  );
};

export default VisualizerShell;
