"use client";

import { useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { toast } from "sonner";
import VisualizerV2Canvas from "./VisualizerV2Canvas";
import VisualizerV2Controls from "./VisualizerV2Controls";
import SurfaceTabs from "./SurfaceTabs";
import ProductPanel from "./ProductPanel";
import VisualizerErrorBoundary from "../visualizer/VisualizerErrorBoundary";
import { DEFAULT_SURFACE_MATERIALS, SURFACE_IDS, SURFACE_LABELS, type SurfaceId } from "@/lib/visualizer2/surfaces";
import { DEMO_PRODUCTS } from "@/lib/visualizer2/demoProducts";
import type { Product } from "@/lib/visualizer2/product";

interface VisualizerV2ShellProps {
  /** Real Alfa Ventura quartz products (source: "alfa"), fetched server-side
   * in the page and passed down -- merged with the demo categories below. */
  alfaProducts: Product[];
}

const EMPTY_SURFACE_PRODUCTS: Record<SurfaceId, Product | null> = {
  floor: null,
  backWall: null,
  leftWall: null,
  rightWall: null,
};

/**
 * Step 2: adds the material/product selection engine on top of the Step 1
 * room. Centralized state (selectedSurface, selectedProduct,
 * surfaceProducts) is the single source of truth everything else reads
 * from -- Save/Share/Export/AI-visualizer in later steps all build on this
 * same shape without needing to touch it.
 */
const VisualizerV2Shell = ({ alfaProducts }: VisualizerV2ShellProps) => {
  const [selectedSurface, setSelectedSurface] = useState<SurfaceId | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [surfaceProducts, setSurfaceProducts] = useState<Record<SurfaceId, Product | null>>(EMPTY_SURFACE_PRODUCTS);

  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const products = [...alfaProducts, ...DEMO_PRODUCTS];

  const handleSelectSurface = (id: SurfaceId) => {
    setSelectedSurface(id);
    // Keep the info panel/active-card in sync with whatever's already on
    // this surface, so re-selecting it doesn't lose that context.
    setSelectedProduct(surfaceProducts[id]);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (!selectedSurface) {
      toast.error("Select a surface first (click it in the room, or use the Surface buttons).");
      return;
    }
    setSurfaceProducts((prev) => ({ ...prev, [selectedSurface]: product }));
    toast(`Loading ${product.name}...`, { duration: 1200 });
  };

  const handleResetMaterials = () => {
    setSurfaceProducts(EMPTY_SURFACE_PRODUCTS);
    setSelectedProduct(null);
    toast.success("Materials reset to default.");
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div
          ref={containerRef}
          className="relative w-full h-[64vh] min-h-[440px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]"
        >
          <VisualizerErrorBoundary>
            <VisualizerV2Canvas
              materials={DEFAULT_SURFACE_MATERIALS}
              surfaceProducts={surfaceProducts}
              selectedSurface={selectedSurface}
              onSelectSurface={handleSelectSurface}
              cameraControlsRef={cameraControlsRef}
            />
          </VisualizerErrorBoundary>
          <VisualizerV2Controls cameraControlsRef={cameraControlsRef} fullscreenTargetRef={containerRef} />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold uppercase tracking-wide text-xs text-[#78716C]">Selected Surface</span>
            <span className="font-semibold text-[#1C1917]">
              {selectedSurface ? SURFACE_LABELS[selectedSurface] : "None — click a surface"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetMaterials}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors"
          >
            Reset Materials
          </button>
        </div>

        <SurfaceTabs selectedSurface={selectedSurface} onSelect={handleSelectSurface} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {SURFACE_IDS.map((id) => (
            <div key={id} className="px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8DDD0]">
              <p className="font-bold uppercase tracking-wide text-[#78716C]">{SURFACE_LABELS[id]}</p>
              <p className="text-[#1C1917] truncate">{surfaceProducts[id]?.name ?? "Default"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-[340px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0]">
        <ProductPanel
          products={products}
          selectedSurfaceLabel={selectedSurface ? SURFACE_LABELS[selectedSurface] : null}
          activeProduct={selectedProduct}
          onSelectProduct={handleSelectProduct}
        />
      </div>
    </div>
  );
};

export default VisualizerV2Shell;
