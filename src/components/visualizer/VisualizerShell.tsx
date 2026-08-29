"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { toast } from "sonner";
import VisualizerCanvas from "./VisualizerCanvas";
import SceneControls from "./SceneControls";
import LayoutSelector from "./LayoutSelector";
import MaterialCategorySelector, { type SwatchItem } from "./MaterialCategorySelector";
import FavoritesPanel from "./FavoritesPanel";
import ProductInfoPanel from "./ProductInfoPanel";
import {
  FLOOR_FINISHES,
  MATERIAL_CATEGORY_LABELS,
  THICKNESS_OPTIONS,
  EDGE_PROFILES,
  type LayoutId,
  type MaterialCategory,
  type ThicknessMm,
  type EdgeProfile,
} from "@/data/kitchenCatalog";
import { getAverageColorForImage } from "@/three/extractAverageColor";
import { encodeConfigToParams, decodeConfigFromParams, type KitchenConfig, type WaterfallOption } from "@/lib/visualizerUrlState";
import { useFavorites } from "@/hooks/useFavorites";
import type { VisualizerProduct } from "../../../types";

interface VisualizerShellProps {
  cabinetProducts: VisualizerProduct[];
  quartzProducts: VisualizerProduct[];
}

const SAVED_DESIGN_KEY = "alfa-ventura-visualizer-saved-design";
const DEFAULT_CABINET_COLOR = "#D8C9AE";

const toSwatch = (p: VisualizerProduct): SwatchItem => ({ id: p.id, name: p.name, thumbnail: p.image });

const VisualizerShell = ({ cabinetProducts, quartzProducts }: VisualizerShellProps) => {
  const [config, setConfig] = useState<KitchenConfig>({
    layout: "island",
    mirrored: false,
    cabinetId: cabinetProducts[0]?.id ?? null,
    countertopId: quartzProducts[0]?.id ?? null,
    backsplashId: quartzProducts[1]?.id ?? quartzProducts[0]?.id ?? null,
    floorId: FLOOR_FINISHES[0].id,
    waterfall: "both",
    thicknessMm: 20,
    veinRotation: 0,
    edgeProfile: "square",
  });
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>("countertop");
  const [lightingMode, setLightingMode] = useState<"day" | "evening">("day");
  const [cabinetColor, setCabinetColor] = useState(DEFAULT_CABINET_COLOR);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [hasSavedDesign, setHasSavedDesign] = useState(false);

  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Restore a shared/deep-linked configuration from the URL on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) {
      setHasSavedDesign(!!window.localStorage.getItem(SAVED_DESIGN_KEY));
      return;
    }
    const decoded = decodeConfigFromParams(params);
    setConfig((prev) => ({ ...prev, ...decoded }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract a representative color from the selected cabinet product's photo
  useEffect(() => {
    const product = cabinetProducts.find((p) => p.id === config.cabinetId);
    if (!product) {
      setCabinetColor(DEFAULT_CABINET_COLOR);
      return;
    }
    let cancelled = false;
    getAverageColorForImage(product.image).then((color) => {
      if (!cancelled) setCabinetColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [config.cabinetId, cabinetProducts]);

  const countertopProduct = quartzProducts.find((p) => p.id === config.countertopId) ?? null;
  const backsplashProduct = quartzProducts.find((p) => p.id === config.backsplashId) ?? null;
  const floorFinish = FLOOR_FINISHES.find((f) => f.id === config.floorId) ?? FLOOR_FINISHES[0];

  const catalog: Record<MaterialCategory, SwatchItem[]> = {
    cabinet: cabinetProducts.map(toSwatch),
    countertop: quartzProducts.map(toSwatch),
    backsplash: quartzProducts.map(toSwatch),
    floor: FLOOR_FINISHES.map((f) => ({ id: f.id, name: f.name, color: f.color })),
  };

  const activeIdForCategory: Record<MaterialCategory, string | null> = {
    cabinet: config.cabinetId,
    countertop: config.countertopId,
    backsplash: config.backsplashId,
    floor: config.floorId,
  };

  const applySelection = (category: MaterialCategory, id: string) => {
    setConfig((prev) => ({
      ...prev,
      cabinetId: category === "cabinet" ? id : prev.cabinetId,
      countertopId: category === "countertop" ? id : prev.countertopId,
      backsplashId: category === "backsplash" ? id : prev.backsplashId,
      floorId: category === "floor" ? id : prev.floorId,
    }));
  };

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = encodeConfigToParams(config);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [config]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Couldn't copy the link — copy it from the address bar instead.");
    }
  };

  const handleSaveDesign = () => {
    try {
      window.localStorage.setItem(SAVED_DESIGN_KEY, JSON.stringify(config));
      setHasSavedDesign(true);
      toast.success("Design saved on this device.");
    } catch {
      toast.error("Couldn't save the design.");
    }
  };

  const handleLoadSavedDesign = () => {
    try {
      const raw = window.localStorage.getItem(SAVED_DESIGN_KEY);
      if (!raw) return;
      setConfig((prev) => ({ ...prev, ...(JSON.parse(raw) as Partial<KitchenConfig>) }));
      toast.success("Saved design loaded.");
    } catch {
      toast.error("Couldn't load the saved design.");
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "alfa-ventura-kitchen-design.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Space</span>
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#1C1917] text-white"
            >
              Kitchen
            </button>
            {["Bathroom", "Living", "Commercial"].map((space) => (
              <button
                key={space}
                type="button"
                disabled
                title="Coming soon"
                className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#F5F1EA] text-[#C4BCAF] cursor-not-allowed"
              >
                {space}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={canvasContainerRef}
          className="relative w-full h-[64vh] min-h-[440px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]"
        >
          <VisualizerCanvas
            layout={config.layout}
            mirrored={config.mirrored}
            cabinetColor={cabinetColor}
            countertopProduct={countertopProduct}
            backsplashProduct={backsplashProduct}
            floorColor={floorFinish.color}
            floorRoughness={floorFinish.roughness}
            waterfall={config.waterfall}
            thicknessMm={config.thicknessMm}
            veinRotation={config.veinRotation}
            edgeProfile={config.edgeProfile}
            lightingMode={lightingMode}
            cameraControlsRef={cameraControlsRef}
            canvasRef={canvasRef}
          />
          <SceneControls
            cameraControlsRef={cameraControlsRef}
            fullscreenTargetRef={canvasContainerRef}
            lightingMode={lightingMode}
            onLightingChange={setLightingMode}
          />
        </div>

        <LayoutSelector
          activeLayout={config.layout}
          mirrored={config.mirrored}
          onSelectLayout={(layout: LayoutId) => setConfig((prev) => ({ ...prev, layout }))}
          onToggleMirror={() => setConfig((prev) => ({ ...prev, mirrored: !prev.mirrored }))}
        />

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Thickness</span>
          <div className="flex gap-1.5">
            {THICKNESS_OPTIONS.map((mm) => (
              <button
                key={mm}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, thicknessMm: mm as ThicknessMm }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                  config.thicknessMm === mm ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
                }`}
              >
                {mm}mm
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Vein Direction</span>
          <div className="flex gap-1.5">
            {([0, 90] as const).map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, veinRotation: deg }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                  config.veinRotation === deg ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
                }`}
              >
                {deg === 0 ? "Horizontal" : "Vertical"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Edge Profile</span>
          <div className="flex gap-1.5">
            {EDGE_PROFILES.map((profile: EdgeProfile) => (
              <button
                key={profile}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, edgeProfile: profile }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                  config.edgeProfile === profile ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
                }`}
              >
                {profile}
              </button>
            ))}
          </div>
        </div>

        {config.layout === "island" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Waterfall edge</span>
            <div className="flex gap-1.5">
              {(["none", "left", "right", "both"] as WaterfallOption[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, waterfall: option }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                    config.waterfall === option ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#78716C] block mb-2">Application</span>
          <div className="flex gap-1.5 mb-3 overflow-x-auto">
            {(Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 transition-colors ${
                  activeCategory === cat ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
                }`}
              >
                {MATERIAL_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold uppercase tracking-wide text-[#78716C] block mb-2">
            Products &mdash; {MATERIAL_CATEGORY_LABELS[activeCategory]}
          </span>

          {catalog[activeCategory].length === 0 ? (
            <p className="text-sm text-[#78716C] py-4">No options available for this category yet.</p>
          ) : (
            <MaterialCategorySelector
              items={catalog[activeCategory]}
              activeId={activeIdForCategory[activeCategory]}
              onSelect={(id) => applySelection(activeCategory, id)}
              isFavorite={(id) => isFavorite({ category: activeCategory, productId: id })}
              onToggleFavorite={(id) => toggleFavorite({ category: activeCategory, productId: id })}
            />
          )}
        </div>
      </div>

      <div className="lg:w-[320px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0] space-y-6">
        <ProductInfoPanel product={countertopProduct} />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFavoritesOpen(true)}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors"
          >
            ♥ My Selections ({favorites.length})
          </button>
          <button
            type="button"
            onClick={handleSaveDesign}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors"
          >
            Save Design
          </button>
          {hasSavedDesign && (
            <button
              type="button"
              onClick={handleLoadSavedDesign}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors"
            >
              Load Saved
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors"
          >
            Share Look
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] text-[#44403C] hover:border-[#9B7040] transition-colors"
          >
            Download
          </button>
        </div>
      </div>

      <FavoritesPanel
        open={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        favorites={favorites}
        catalog={catalog}
        onApply={(category, id) => {
          applySelection(category, id);
          setActiveCategory(category);
          setFavoritesOpen(false);
        }}
        onRemove={toggleFavorite}
      />
    </div>
  );
};

export default VisualizerShell;
