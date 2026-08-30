"use client";

import { useEffect, useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { toast } from "sonner";
import VisualizerV2Canvas from "./VisualizerV2Canvas";
import VisualizerV2Controls from "./VisualizerV2Controls";
import SpaceSelector from "./SpaceSelector";
import SurfaceTabs from "./SurfaceTabs";
import ProductPanel from "./ProductPanel";
import MaterialConfigPanel from "./MaterialConfigPanel";
import FabricationPanel from "./FabricationPanel";
import ProductSummary from "./ProductSummary";
import { DEMO_PRODUCTS } from "@/lib/visualizer2/demoProducts";
import { isProductCompatible, validateProduct, type Product } from "@/lib/visualizer2/product";
import { DEFAULT_SURFACE_CONFIG, DEFAULT_FABRICATION_CONFIG, type SurfaceMaterialConfig, type CountertopFabricationConfig } from "@/lib/visualizer2/layout";
import { ROOMS, getRoom } from "@/lib/visualizer2/rooms";

interface VisualizerV2ShellProps {
  /** Real Alfa Ventura quartz products (source: "alfa"), fetched server-side
   * in the page and passed down -- merged with the demo categories below. */
  alfaProducts: Product[];
  /** From /visualizer-v2?product=PRODUCT_ID -- auto-selects that product
   * onto the first surface it's compatible with, once on mount. */
  deepLinkProductId?: string | null;
}

/** roomId -> surfaceId -> config. Kept as one flat object rather than
 * nested per-room state hooks so switching rooms is just changing which
 * slice of this object the rest of the UI reads -- no other room's data
 * is ever touched. */
type DesignState = Record<string, Record<string, SurfaceMaterialConfig>>;
type FabricationState = Record<string, Record<string, CountertopFabricationConfig>>;

const VERTICAL_TYPES = new Set(["wall", "backsplash"]);
const FABRICATED_TYPES = new Set(["countertop", "island"]);

/**
 * Step 4: adds multi-space/room switching on top of Step 1-3. Product data
 * (product.ts), room data (rooms.ts), per-room-per-surface install
 * configuration (designState below), 3D rendering (RoomRenderer), and UI
 * controls all stay separate concerns, matching the earlier steps.
 */
const VisualizerV2Shell = ({ alfaProducts, deepLinkProductId }: VisualizerV2ShellProps) => {
  const [activeRoomId, setActiveRoomId] = useState(ROOMS[0].id);
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null);
  const [designState, setDesignState] = useState<DesignState>({});
  const [fabricationState, setFabricationState] = useState<FabricationState>({});
  const [roomLoading, setRoomLoading] = useState(false);

  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeRoom = getRoom(activeRoomId);
  // Demo data is trusted, but still validated defensively -- a malformed
  // real product should never reach the 3D renderer and crash it.
  const products = [...alfaProducts, ...DEMO_PRODUCTS].filter(validateProduct);
  const productById = (id: string | null) => (id ? products.find((p) => p.id === id) ?? null : null);

  const roomConfigs = designState[activeRoomId] ?? {};
  const getConfig = (surfaceId: string): SurfaceMaterialConfig => roomConfigs[surfaceId] ?? DEFAULT_SURFACE_CONFIG;

  const roomFabrication = fabricationState[activeRoomId] ?? {};
  const getFabrication = (surfaceId: string): CountertopFabricationConfig => roomFabrication[surfaceId] ?? DEFAULT_FABRICATION_CONFIG;

  const surfaceProducts: Record<string, Product | null> = {};
  const surfaceConfigs: Record<string, SurfaceMaterialConfig> = {};
  const fabricationConfigs: Record<string, CountertopFabricationConfig> = {};
  for (const s of activeRoom.surfaces) {
    surfaceConfigs[s.id] = getConfig(s.id);
    surfaceProducts[s.id] = productById(surfaceConfigs[s.id].productId);
    fabricationConfigs[s.id] = getFabrication(s.id);
  }

  const activeProduct = selectedSurface ? surfaceProducts[selectedSurface] ?? null : null;
  const activeConfig = selectedSurface ? surfaceConfigs[selectedSurface] : null;
  const activeFabrication = selectedSurface ? fabricationConfigs[selectedSurface] : null;
  const activeSurfaceDef = selectedSurface ? activeRoom.surfaces.find((s) => s.id === selectedSurface) : null;
  const isFabricatedSurface = !!activeSurfaceDef && FABRICATED_TYPES.has(activeSurfaceDef.type);

  const handleSelectRoom = (roomId: string) => {
    if (roomId === activeRoomId) return;
    setRoomLoading(true);
    setActiveRoomId(roomId);
    setSelectedSurface(null);
  };

  // Brief "loading" state on room switch -- procedural rooms have nothing
  // real to await, but this is the same seam a future GLB load's actual
  // Suspense/loading signal would plug into.
  useEffect(() => {
    if (!roomLoading) return;
    const t = setTimeout(() => setRoomLoading(false), 350);
    return () => clearTimeout(t);
  }, [roomLoading]);

  // Deep link: /visualizer-v2?product=PRODUCT_ID -- auto-apply that
  // product to the first surface in the current room it's actually
  // compatible with (via the same isProductCompatible everything else
  // uses), once.
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);
  useEffect(() => {
    if (deepLinkHandled || !deepLinkProductId) return;
    const product = productById(deepLinkProductId);
    if (product) {
      const surface = activeRoom.surfaces.find((s) => isProductCompatible(product, s.type));
      if (surface) {
        const mode = product.availableModes[0];
        const firstSize = product.sizes.find((s) => s.mode === mode) ?? null;
        setSelectedSurface(surface.id);
        setDesignState((prev) => ({
          ...prev,
          [activeRoomId]: {
            ...prev[activeRoomId],
            [surface.id]: { ...DEFAULT_SURFACE_CONFIG, productId: product.id, mode, sizeId: firstSize?.id ?? null },
          },
        }));
        toast.success(`${product.name} loaded from link.`);
      } else {
        toast.error("That product isn't compatible with any surface in the default room.");
      }
    }
    setDeepLinkHandled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkProductId, deepLinkHandled]);

  const patchSurfaceConfig = (surfaceId: string, patch: Partial<SurfaceMaterialConfig>) => {
    setDesignState((prev) => ({
      ...prev,
      [activeRoomId]: {
        ...prev[activeRoomId],
        [surfaceId]: { ...(prev[activeRoomId]?.[surfaceId] ?? DEFAULT_SURFACE_CONFIG), ...patch },
      },
    }));
  };

  const handleSelectProduct = (product: Product) => {
    if (!selectedSurface) {
      toast.error("Select a surface first (click it in the room, or use the Surface buttons).");
      return;
    }
    const mode = product.availableModes[0];
    const firstSize = product.sizes.find((s) => s.mode === mode) ?? null;
    patchSurfaceConfig(selectedSurface, { productId: product.id, mode, sizeId: firstSize?.id ?? null });
    toast(`Loading ${product.name}...`, { duration: 1200 });
  };

  const handleConfigChange = (patch: Partial<SurfaceMaterialConfig>) => {
    if (!selectedSurface) return;
    if (patch.mode && activeProduct) {
      const current = getConfig(selectedSurface);
      const stillValid = activeProduct.sizes.some((s) => s.id === current.sizeId && s.mode === patch.mode);
      if (!stillValid) {
        const fallback = activeProduct.sizes.find((s) => s.mode === patch.mode);
        patch = { ...patch, sizeId: fallback?.id ?? null };
      }
    }
    patchSurfaceConfig(selectedSurface, patch);
  };

  const patchFabrication = (surfaceId: string, patch: Partial<CountertopFabricationConfig>) => {
    setFabricationState((prev) => ({
      ...prev,
      [activeRoomId]: {
        ...prev[activeRoomId],
        [surfaceId]: { ...(prev[activeRoomId]?.[surfaceId] ?? DEFAULT_FABRICATION_CONFIG), ...patch },
      },
    }));
  };

  const handleResetSurface = () => {
    if (!selectedSurface) return;
    patchSurfaceConfig(selectedSurface, { ...DEFAULT_SURFACE_CONFIG });
    patchFabrication(selectedSurface, { ...DEFAULT_FABRICATION_CONFIG });
    toast.success(`${activeSurfaceDef?.label ?? "Surface"} reset to default.`);
  };

  const handleResetRoomMaterials = () => {
    setDesignState((prev) => ({ ...prev, [activeRoomId]: {} }));
    setFabricationState((prev) => ({ ...prev, [activeRoomId]: {} }));
    toast.success(`${activeRoom.name} materials reset to default.`);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <SpaceSelector activeRoomId={activeRoomId} onSelect={handleSelectRoom} />

        <div
          ref={containerRef}
          className="relative w-full h-[64vh] min-h-[440px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]"
        >
          <VisualizerV2Canvas
            room={activeRoom}
            surfaceProducts={surfaceProducts}
            surfaceConfigs={surfaceConfigs}
            fabricationConfigs={fabricationConfigs}
            selectedSurface={selectedSurface}
            onSelectSurface={setSelectedSurface}
            cameraControlsRef={cameraControlsRef}
          />
          <VisualizerV2Controls cameraControlsRef={cameraControlsRef} fullscreenTargetRef={containerRef} />
          {roomLoading && (
            <div className="absolute inset-0 bg-[#EDE6DA]/90 flex items-center justify-center">
              <p className="text-sm font-semibold text-[#44403C]">Loading {activeRoom.name}...</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold uppercase tracking-wide text-xs text-[#78716C]">
              {activeRoom.name} / Selected Surface
            </span>
            <span className="font-semibold text-[#1C1917]">{activeSurfaceDef?.label ?? "None — click a surface"}</span>
          </div>
          <button
            type="button"
            onClick={handleResetRoomMaterials}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors"
          >
            Reset Materials
          </button>
        </div>

        <SurfaceTabs
          surfaces={activeRoom.surfaces.map((s) => ({ id: s.id, label: s.label }))}
          selectedSurface={selectedSurface}
          onSelect={setSelectedSurface}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {activeRoom.surfaces.map((s) => (
            <div key={s.id} className="px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8DDD0]">
              <p className="font-bold uppercase tracking-wide text-[#78716C]">{s.label}</p>
              <p className="text-[#1C1917] truncate">{surfaceProducts[s.id]?.name ?? "Default"}</p>
              {surfaceProducts[s.id] && (
                <p className="text-[#78716C] truncate">
                  {surfaceConfigs[s.id].mode} · {surfaceConfigs[s.id].layout}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-[340px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0]">
        {activeProduct && activeConfig && activeSurfaceDef && (
          <ProductSummary surfaceLabel={activeSurfaceDef.label} product={activeProduct} config={activeConfig} />
        )}

        <ProductPanel
          products={products}
          selectedSurfaceLabel={activeSurfaceDef?.label ?? null}
          selectedSurfaceType={activeSurfaceDef?.type ?? null}
          activeProduct={activeProduct}
          onSelectProduct={handleSelectProduct}
        />

        {activeProduct && activeConfig && activeSurfaceDef && (
          <MaterialConfigPanel
            product={activeProduct}
            config={activeConfig}
            isVerticalSurface={VERTICAL_TYPES.has(activeSurfaceDef.type)}
            onChange={handleConfigChange}
            onReset={handleResetSurface}
          />
        )}

        {activeProduct && activeFabrication && isFabricatedSurface && (
          <FabricationPanel
            product={activeProduct}
            config={activeFabrication}
            onChange={(patch) => selectedSurface && patchFabrication(selectedSurface, patch)}
          />
        )}
      </div>
    </div>
  );
};

export default VisualizerV2Shell;
