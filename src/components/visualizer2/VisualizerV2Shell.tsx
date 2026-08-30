"use client";

import { useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { toast } from "sonner";
import VisualizerV2Canvas from "./VisualizerV2Canvas";
import VisualizerV2Controls from "./VisualizerV2Controls";
import SurfaceTabs from "./SurfaceTabs";
import ProductPanel from "./ProductPanel";
import MaterialConfigPanel from "./MaterialConfigPanel";
import VisualizerErrorBoundary from "../visualizer/VisualizerErrorBoundary";
import { DEFAULT_SURFACE_MATERIALS, SURFACE_IDS, SURFACE_LABELS, type SurfaceId } from "@/lib/visualizer2/surfaces";
import { DEMO_PRODUCTS } from "@/lib/visualizer2/demoProducts";
import type { Product } from "@/lib/visualizer2/product";
import { DEFAULT_SURFACE_CONFIG, type SurfaceMaterialConfig } from "@/lib/visualizer2/layout";

interface VisualizerV2ShellProps {
  /** Real Alfa Ventura quartz products (source: "alfa"), fetched server-side
   * in the page and passed down -- merged with the demo categories below. */
  alfaProducts: Product[];
}

const emptyConfigs = (): Record<SurfaceId, SurfaceMaterialConfig> => ({
  floor: { ...DEFAULT_SURFACE_CONFIG },
  backWall: { ...DEFAULT_SURFACE_CONFIG },
  leftWall: { ...DEFAULT_SURFACE_CONFIG },
  rightWall: { ...DEFAULT_SURFACE_CONFIG },
});

const VERTICAL_SURFACES: SurfaceId[] = ["backWall", "leftWall", "rightWall"];

/**
 * Step 3 extends Step 2's centralized state: each surface now stores a full
 * SurfaceMaterialConfig (product + mode/size/layout/rotation/scale/offset/
 * grout/alignment/vein), not just a product id. Product data (product.ts),
 * per-surface install configuration (this state), 3D rendering
 * (SurfaceProductMaterial), and UI controls (MaterialConfigPanel) are kept
 * as separate concerns on purpose.
 */
const VisualizerV2Shell = ({ alfaProducts }: VisualizerV2ShellProps) => {
  const [selectedSurface, setSelectedSurface] = useState<SurfaceId | null>(null);
  const [surfaceConfigs, setSurfaceConfigs] = useState<Record<SurfaceId, SurfaceMaterialConfig>>(emptyConfigs());

  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const products = [...alfaProducts, ...DEMO_PRODUCTS];
  const productById = (id: string | null) => (id ? products.find((p) => p.id === id) ?? null : null);

  const surfaceProducts: Record<SurfaceId, Product | null> = {
    floor: productById(surfaceConfigs.floor.productId),
    backWall: productById(surfaceConfigs.backWall.productId),
    leftWall: productById(surfaceConfigs.leftWall.productId),
    rightWall: productById(surfaceConfigs.rightWall.productId),
  };

  const activeProduct = selectedSurface ? surfaceProducts[selectedSurface] : null;
  const activeConfig = selectedSurface ? surfaceConfigs[selectedSurface] : null;

  const handleSelectSurface = (id: SurfaceId) => setSelectedSurface(id);

  const patchSurfaceConfig = (id: SurfaceId, patch: Partial<SurfaceMaterialConfig>) => {
    setSurfaceConfigs((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const handleSelectProduct = (product: Product) => {
    if (!selectedSurface) {
      toast.error("Select a surface first (click it in the room, or use the Surface buttons).");
      return;
    }
    const mode = product.availableModes[0];
    const firstSize = product.sizes.find((s) => s.mode === mode) ?? null;
    patchSurfaceConfig(selectedSurface, {
      productId: product.id,
      mode,
      sizeId: firstSize?.id ?? null,
    });
    toast(`Loading ${product.name}...`, { duration: 1200 });
  };

  const handleConfigChange = (patch: Partial<SurfaceMaterialConfig>) => {
    if (!selectedSurface) return;
    // Changing mode invalidates the previous sizeId if it belonged to the other mode.
    if (patch.mode && activeProduct) {
      const stillValid = activeProduct.sizes.some((s) => s.id === surfaceConfigs[selectedSurface].sizeId && s.mode === patch.mode);
      if (!stillValid) {
        const fallback = activeProduct.sizes.find((s) => s.mode === patch.mode);
        patch = { ...patch, sizeId: fallback?.id ?? null };
      }
    }
    patchSurfaceConfig(selectedSurface, patch);
  };

  const handleResetSurface = () => {
    if (!selectedSurface) return;
    patchSurfaceConfig(selectedSurface, { ...DEFAULT_SURFACE_CONFIG });
    toast.success(`${SURFACE_LABELS[selectedSurface]} reset to default.`);
  };

  const handleResetAllMaterials = () => {
    setSurfaceConfigs(emptyConfigs());
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
              surfaceConfigs={surfaceConfigs}
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
            onClick={handleResetAllMaterials}
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
              {surfaceProducts[id] && <p className="text-[#78716C] truncate">{surfaceConfigs[id].mode} · {surfaceConfigs[id].layout}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-[340px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0]">
        <ProductPanel
          products={products}
          selectedSurfaceLabel={selectedSurface ? SURFACE_LABELS[selectedSurface] : null}
          activeProduct={activeProduct}
          onSelectProduct={handleSelectProduct}
        />

        {activeProduct && activeConfig && (
          <MaterialConfigPanel
            product={activeProduct}
            config={activeConfig}
            isVerticalSurface={!!selectedSurface && VERTICAL_SURFACES.includes(selectedSurface)}
            onChange={handleConfigChange}
            onReset={handleResetSurface}
          />
        )}
      </div>
    </div>
  );
};

export default VisualizerV2Shell;
