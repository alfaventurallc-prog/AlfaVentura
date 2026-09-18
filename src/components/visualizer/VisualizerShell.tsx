"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import { toast } from "sonner";
import { Heart, Save, Share2, Download as DownloadIcon, Columns2, X } from "lucide-react";
import VisualizerCanvas from "./VisualizerCanvas";
import ProductImageGallery from "./ProductImageGallery";
import OnboardingBanner from "./OnboardingBanner";
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
    syncBacksplash: false,
  });
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>("countertop");
  const [lightingMode, setLightingMode] = useState<"day" | "evening">("day");
  const [cabinetColor, setCabinetColor] = useState(DEFAULT_CABINET_COLOR);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [hasSavedDesign, setHasSavedDesign] = useState(false);
  // Two modes sharing one product/material config above: an interactive 3D
  // kitchen, and a real-photo gallery for the selected product ("Image
  // Visualizer" -- deliberately just the actual uploaded product photos,
  // not a fabricated installed-kitchen composite).
  const [mode, setMode] = useState<"3d" | "image">("3d");
  const [surfaceSearch, setSurfaceSearch] = useState("");
  const surfaceCarouselRef = useRef<HTMLDivElement | null>(null);

  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
  const compareCameraControlsRef = useRef<CameraControlsImpl | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // "Compare Designs": freezes the current config+cabinet color as a
  // snapshot, then keeps rendering it side-by-side with the live config
  // while the user keeps changing materials -- so they can compare the
  // look they had against whatever they're trying next.
  const [snapshot, setSnapshot] = useState<{ config: KitchenConfig; cabinetColor: string } | null>(null);

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

  // The 3D surfaces texture from `.image` -- always uses the product's
  // second real photo (images[1]) as the texture source, per the removed
  // "Texture Photo" selector's Photo 2 option, falling back to the first
  // photo if a product doesn't have a second one.
  const withTexturePhoto = (p: VisualizerProduct | null): VisualizerProduct | null =>
    p ? { ...p, image: p.images[1] ?? p.images[0] ?? p.image } : null;
  const countertopTextureProduct = withTexturePhoto(countertopProduct);
  const backsplashTextureProduct = withTexturePhoto(backsplashProduct);

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
      // MSI-style "use countertop for backsplash": while on, selecting a
      // countertop also carries it over to the backsplash automatically.
      backsplashId: category === "backsplash" ? id : category === "countertop" && prev.syncBacksplash ? id : prev.backsplashId,
      floorId: category === "floor" ? id : prev.floorId,
    }));
  };

  const handleToggleSyncBacksplash = () => {
    setConfig((prev) => ({
      ...prev,
      syncBacksplash: !prev.syncBacksplash,
      backsplashId: !prev.syncBacksplash ? prev.countertopId : prev.backsplashId,
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

  const handleToggleCompare = () => {
    if (snapshot) {
      setSnapshot(null);
      return;
    }
    setSnapshot({ config, cabinetColor });
    toast.success("Snapshot A locked in — change materials to compare against it.");
  };

  const snapshotCountertop = snapshot ? quartzProducts.find((p) => p.id === snapshot.config.countertopId) ?? null : null;
  const snapshotBacksplash = snapshot ? quartzProducts.find((p) => p.id === snapshot.config.backsplashId) ?? null : null;
  const snapshotFloor = snapshot ? FLOOR_FINISHES.find((f) => f.id === snapshot.config.floorId) ?? FLOOR_FINISHES[0] : null;

  const handleDownload = async () => {
    if (mode === "image") {
      if (!countertopProduct) return;
      try {
        const res = await fetch(countertopProduct.image);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `alfa-ventura-${countertopProduct.slug}.jpg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error("Couldn't download the photo — try opening it in a new tab instead.");
      }
      return;
    }
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
        <OnboardingBanner />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex gap-1 p-1 rounded-full bg-[#F0E8DB] shadow-inner-glow">
            {(["3d", "image"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                  mode === m ? "bg-[#1C1917] text-white shadow-premium" : "text-[#8A7B68] hover:text-[#1C1917]"
                }`}
              >
                {m === "3d" ? "3D Visualizer" : "Image Visualizer"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {mode === "3d" && (
              <button
                type="button"
                onClick={handleToggleCompare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                  snapshot ? "bg-[#9B7040] text-white shadow-premium-hover" : "bg-[#F5F1EA] text-[#78716C] shadow-premium hover:bg-white hover:text-[#1C1917]"
                }`}
              >
                <Columns2 size={13} /> {snapshot ? "Exit Compare" : "Compare"}
              </button>
            )}
            {mode === "3d" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-[#A8987F]">Space</span>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#9B7040] text-white shadow-premium"
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
            )}
          </div>
        </div>

        <div
          ref={canvasContainerRef}
          className={`relative w-full h-[64vh] min-h-[440px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#F0E8DB] shadow-premium-lg ${
            snapshot && mode === "3d" ? "grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-[#F0E8DB]" : ""
          }`}
        >
          {mode === "3d" ? (
            snapshot ? (
              <>
                <div className="relative w-full h-full overflow-hidden">
                  <VisualizerCanvas
                    layout={snapshot.config.layout}
                    mirrored={snapshot.config.mirrored}
                    cabinetColor={snapshot.cabinetColor}
                    countertopProduct={withTexturePhoto(snapshotCountertop)}
                    backsplashProduct={withTexturePhoto(snapshotBacksplash)}
                    floorColor={snapshotFloor!.color}
                    floorRoughness={snapshotFloor!.roughness}
                    waterfall={snapshot.config.waterfall}
                    thicknessMm={snapshot.config.thicknessMm}
                    veinRotation={snapshot.config.veinRotation}
                    edgeProfile={snapshot.config.edgeProfile}
                    lightingMode={lightingMode}
                    cameraControlsRef={compareCameraControlsRef}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/55 text-white text-[10px] font-bold uppercase tracking-wide">
                    Design A
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleCompare}
                    aria-label="Exit compare"
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition-colors duration-200"
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="relative w-full h-full overflow-hidden">
                  <VisualizerCanvas
                    layout={config.layout}
                    mirrored={config.mirrored}
                    cabinetColor={cabinetColor}
                    countertopProduct={countertopTextureProduct}
                    backsplashProduct={backsplashTextureProduct}
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
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#9B7040] text-white text-[10px] font-bold uppercase tracking-wide">
                    Design B (current)
                  </span>
                  <SceneControls
                    cameraControlsRef={cameraControlsRef}
                    fullscreenTargetRef={canvasContainerRef}
                    lightingMode={lightingMode}
                    onLightingChange={setLightingMode}
                  />
                </div>
              </>
            ) : (
              <>
                <VisualizerCanvas
                  layout={config.layout}
                  mirrored={config.mirrored}
                  cabinetColor={cabinetColor}
                  countertopProduct={countertopTextureProduct}
                  backsplashProduct={backsplashTextureProduct}
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
              </>
            )
          ) : (
            <ProductImageGallery product={countertopProduct} />
          )}
        </div>

        {mode === "3d" && (
          <>
            <LayoutSelector
              activeLayout={config.layout}
              mirrored={config.mirrored}
              onSelectLayout={(layout: LayoutId) => setConfig((prev) => ({ ...prev, layout }))}
              onToggleMirror={() => setConfig((prev) => ({ ...prev, mirrored: !prev.mirrored }))}
            />

          <div className="bg-white rounded-2xl shadow-premium border border-[#F0E8DB] p-5 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide text-[#A8987F]">Thickness</span>
              <div className="flex gap-1.5">
                {THICKNESS_OPTIONS.map((mm) => (
                  <button
                    key={mm}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, thicknessMm: mm as ThicknessMm }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                      config.thicknessMm === mm ? "bg-[#1C1917] text-white shadow-premium-hover" : "bg-[#F5F1EA] text-[#78716C] shadow-premium hover:bg-white hover:text-[#1C1917]"
                    }`}
                  >
                    {mm}mm
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide text-[#A8987F]">Vein Direction</span>
              <div className="flex gap-1.5">
                {([0, 90] as const).map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, veinRotation: deg }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                      config.veinRotation === deg ? "bg-[#1C1917] text-white shadow-premium-hover" : "bg-[#F5F1EA] text-[#78716C] shadow-premium hover:bg-white hover:text-[#1C1917]"
                    }`}
                  >
                    {deg === 0 ? "Horizontal" : "Vertical"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide text-[#A8987F]">Edge Profile</span>
              <div className="flex gap-1.5">
                {EDGE_PROFILES.map((profile: EdgeProfile) => (
                  <button
                    key={profile}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, edgeProfile: profile }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                      config.edgeProfile === profile ? "bg-[#1C1917] text-white shadow-premium-hover" : "bg-[#F5F1EA] text-[#78716C] shadow-premium hover:bg-white hover:text-[#1C1917]"
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
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                        config.waterfall === option ? "bg-[#1C1917] text-white shadow-premium-hover" : "bg-[#F5F1EA] text-[#78716C] shadow-premium hover:bg-white hover:text-[#1C1917]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-xs font-semibold text-[#44403C] cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={config.syncBacksplash}
                onChange={handleToggleSyncBacksplash}
                className="w-4 h-4 accent-[#9B7040] rounded"
              />
              Use countertop for backsplash
            </label>
          </div>

          <div className="bg-white rounded-2xl shadow-premium border border-[#F0E8DB] p-5">
              <span className="text-xs font-bold uppercase tracking-wide text-[#A8987F] block mb-2">Application</span>
              <div className="flex gap-1.5 mb-3 overflow-x-auto">
                {(Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 transition-all duration-200 ${
                      activeCategory === cat ? "bg-[#1C1917] text-white shadow-premium-hover" : "bg-[#F5F1EA] text-[#78716C] shadow-premium hover:bg-white hover:text-[#1C1917]"
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
          </>
        )}

        {mode === "image" && (
          <div className="bg-white rounded-2xl shadow-premium border border-[#F0E8DB] p-5">
            <span className="text-xs font-bold uppercase tracking-wide text-[#A8987F] block mb-2">Select Surface</span>
            <input
              type="text"
              value={surfaceSearch}
              onChange={(e) => setSurfaceSearch(e.target.value)}
              placeholder="Search surfaces..."
              className="w-full mb-3 px-3 py-2.5 rounded-lg border border-[#E8DDD0] text-sm text-[#1C1917] placeholder:text-[#A8A29E] transition-colors duration-200 focus:outline-none focus:border-[#9B7040] focus:ring-2 focus:ring-[#9B7040]/15"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => surfaceCarouselRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
                aria-label="Scroll surfaces left"
                className="shrink-0 w-8 h-8 rounded-full border border-[#E8DDD0] shadow-premium text-[#44403C] hover:border-[#9B7040] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                ←
              </button>
              <div ref={surfaceCarouselRef} className="flex-1 min-w-0">
                {(() => {
                  const filtered = quartzProducts.filter(
                    (p) =>
                      !surfaceSearch.trim() ||
                      p.name.toLowerCase().includes(surfaceSearch.toLowerCase()) ||
                      p.categoryName.toLowerCase().includes(surfaceSearch.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    <p className="text-sm text-[#78716C] py-4 text-center">No surfaces match your search.</p>
                  ) : (
                    <MaterialCategorySelector
                      items={filtered.map(toSwatch)}
                      activeId={config.countertopId}
                      onSelect={(id) => applySelection("countertop", id)}
                      isFavorite={(id) => isFavorite({ category: "countertop", productId: id })}
                      onToggleFavorite={(id) => toggleFavorite({ category: "countertop", productId: id })}
                    />
                  );
                })()}
              </div>
              <button
                type="button"
                onClick={() => surfaceCarouselRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                aria-label="Scroll surfaces right"
                className="shrink-0 w-8 h-8 rounded-full border border-[#E8DDD0] shadow-premium text-[#44403C] hover:border-[#9B7040] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:w-[320px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#F0E8DB] space-y-5">
        <ProductInfoPanel product={countertopProduct} />

        <div className="bg-white rounded-2xl shadow-premium border border-[#F0E8DB] p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#A8987F]">Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSaveDesign}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#9B7040] text-white shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <Save size={14} /> Save Design
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-[#E8DDD0] text-[#44403C] shadow-premium hover:border-[#9B7040] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Share2 size={14} /> Share Look
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-[#E8DDD0] text-[#44403C] shadow-premium hover:border-[#9B7040] hover:-translate-y-0.5 transition-all duration-200"
            >
              <DownloadIcon size={14} /> Download
            </button>
            {hasSavedDesign ? (
              <button
                type="button"
                onClick={handleLoadSavedDesign}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-[#E8DDD0] text-[#44403C] shadow-premium hover:border-[#9B7040] hover:-translate-y-0.5 transition-all duration-200"
              >
                Load Saved
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleCompare}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border border-[#E8DDD0] text-[#44403C] shadow-premium hover:border-[#9B7040] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Columns2 size={14} /> Compare
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-premium border border-[#F0E8DB] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-[#A8987F] flex items-center gap-1.5">
              <Heart size={13} className={favorites.length > 0 ? "fill-[#9B7040] text-[#9B7040]" : ""} /> My Selections ({favorites.length})
            </p>
            {favorites.length > 0 && (
              <button type="button" onClick={() => setFavoritesOpen(true)} className="text-xs font-semibold text-[#9B7040] hover:underline">
                View all
              </button>
            )}
          </div>
          {favorites.length === 0 ? (
            <p className="text-xs text-[#A8987F]">Tap the ♡ on any material to save it here.</p>
          ) : (
            <button type="button" onClick={() => setFavoritesOpen(true)} className="flex gap-2 overflow-x-auto pb-1 w-full text-left">
              {favorites.slice(0, 6).map((entry) => {
                const item = catalog[entry.category as MaterialCategory]?.find((i) => i.id === entry.productId);
                if (!item) return null;
                return (
                  <span
                    key={`${entry.category}:${entry.productId}`}
                    className="shrink-0 w-11 h-11 rounded-lg border border-[#E8DDD0] bg-cover bg-center shadow-premium"
                    style={item.thumbnail ? { backgroundImage: `url(${item.thumbnail})` } : { backgroundColor: item.color }}
                    title={item.name}
                  />
                );
              })}
            </button>
          )}
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
