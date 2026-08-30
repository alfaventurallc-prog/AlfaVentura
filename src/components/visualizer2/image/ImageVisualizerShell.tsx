"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ImageUploadZone, { validateImageFile } from "./ImageUploadZone";
import MaskCanvas, { type MaskCanvasHandle } from "./MaskCanvas";
import BeforeAfterSlider from "./BeforeAfterSlider";
import ProductPanel from "../ProductPanel";
import MaterialConfigPanel from "../MaterialConfigPanel";
import { buildTilePatternCanvas } from "@/three/tilePattern";
import { compositeMaterialIntoMask } from "@/three/maskComposite";
import type { Product } from "@/lib/visualizer2/product";
import { DEFAULT_SURFACE_CONFIG, type SurfaceMaterialConfig } from "@/lib/visualizer2/layout";
import {
  IMAGE_SURFACE_TYPES,
  IMAGE_SURFACE_LABELS,
  type ImageSurfaceType,
  type ImageProcessingStatus,
} from "@/lib/visualizer2/imageVisualizer/types";
import { getSegmentationProvider } from "@/lib/visualizer2/imageVisualizer/segmentationProvider";
import { serializeImageDesign, createDesignId, DEFAULT_DESIGN_NAME, type Design } from "@/lib/visualizer2/design";
import { DesignRepository } from "@/lib/visualizer2/designRepository";

interface ImageVisualizerShellProps {
  products: Product[];
  deepLinkProductId?: string | null;
  /** Restored from a shared design link (?d=...) or "My Designs" -- see
   * VisualizerV2Shell, which routes image-mode Designs here instead of
   * through the 3D deserializer. */
  initialDesign?: Design["imageVisualization"] | null;
}

/** Downscales a data URL to a max width (keeps aspect) -- there's no
 * object-storage backend in this project, so a saved/shared image design
 * stores a compressed copy of the photo rather than the full-resolution
 * upload, keeping localStorage/share-URL size reasonable. */
const downscaleDataUrl = (dataUrl: string, maxWidth: number, quality = 0.8): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

const VERTICAL_SURFACES = new Set<ImageSurfaceType>(["wall", "backsplash", "accentWall"]);

/**
 * Step 8, scoped to what's honestly buildable with no AI provider
 * configured (see segmentationProvider.ts): upload -> pick a surface ->
 * paint it (manual mask, since automatic detection isn't available) ->
 * pick an Alfa material (reusing the Step 2/6 product system and Step 3
 * tile/slab engine) -> composite it into the painted region -> compare
 * before/after -> download. Everything runs in the browser; the photo is
 * never uploaded anywhere.
 */
const ImageVisualizerShell = ({ products, deepLinkProductId, initialDesign }: ImageVisualizerShellProps) => {
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [currentDesignName, setCurrentDesignName] = useState(DEFAULT_DESIGN_NAME);
  const [status, setStatus] = useState<ImageProcessingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [surfaceType, setSurfaceType] = useState<ImageSurfaceType>("floor");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(60);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [surfaceConfigs, setSurfaceConfigs] = useState<Record<ImageSurfaceType, SurfaceMaterialConfig>>(
    () => Object.fromEntries(IMAGE_SURFACE_TYPES.map((s) => [s, { ...DEFAULT_SURFACE_CONFIG }])) as Record<ImageSurfaceType, SurfaceMaterialConfig>
  );
  // One mask per surface, kept as data URLs so switching tabs doesn't lose
  // a surface's painted region (Step 8 section 13 -- independent masks).
  const maskDataUrls = useRef<Partial<Record<ImageSurfaceType, string>>>({});
  const maskCanvasRef = useRef<MaskCanvasHandle | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 800, height: 600 });

  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) ?? null : null;
  const activeConfig = surfaceConfigs[surfaceType];

  useEffect(() => {
    if (deepLinkProductId && products.some((p) => p.id === deepLinkProductId)) {
      setSelectedProductId(deepLinkProductId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkProductId]);

  // Restore a saved/shared Image Visualizer session (see VisualizerV2Shell).
  useEffect(() => {
    if (!initialDesign) return;
    const img = new Image();
    img.onload = () => {
      setSourceImage(img);
      setSourceDataUrl(initialDesign.sourceImageDataUrl);
      const maxW = 1000;
      const scale = Math.min(1, maxW / img.naturalWidth);
      setDisplaySize({ width: Math.round(img.naturalWidth * scale), height: Math.round(img.naturalHeight * scale) });
      maskDataUrls.current = { ...initialDesign.masks } as Partial<Record<ImageSurfaceType, string>>;
      setSurfaceConfigs((prev) => ({ ...prev, ...(initialDesign.surfaceConfigurations as Partial<Record<ImageSurfaceType, SurfaceMaterialConfig>>) }));
      setSurfaceType((initialDesign.activeSurfaceType as ImageSurfaceType) ?? "floor");
      setSelectedProductId(initialDesign.productId);
      setResultDataUrl(initialDesign.resultImageDataUrl ?? null);
      setStatus(initialDesign.resultImageDataUrl ? "complete" : "editing");
      requestAnimationFrame(() => {
        const saved = maskDataUrls.current[(initialDesign.activeSurfaceType as ImageSurfaceType) ?? "floor"];
        if (saved) maskCanvasRef.current?.loadFromDataUrl(saved);
      });
      toast.success("Restored saved visualization.");
    };
    img.src = initialDesign.sourceImageDataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDesign]);

  const handleSaveOrShare = async (action: "save" | "share") => {
    if (!sourceDataUrl) return;
    const current = maskCanvasRef.current?.getMaskCanvas();
    if (current) maskDataUrls.current[surfaceType] = current.toDataURL();

    const compressedSource = await downscaleDataUrl(sourceDataUrl, 1000);
    const design = serializeImageDesign({
      id: currentDesignId ?? createDesignId(),
      name: currentDesignName,
      imageVisualization: {
        sourceImageDataUrl: compressedSource,
        masks: { ...maskDataUrls.current },
        surfaceConfigurations: surfaceConfigs,
        activeSurfaceType: surfaceType,
        productId: selectedProductId,
        resultImageDataUrl: resultDataUrl ?? undefined,
      },
    });

    if (action === "save") {
      DesignRepository.update(design);
      setCurrentDesignId(design.id);
      toast.success("Design saved.");
    } else {
      const url = DesignRepository.share(design);
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied.");
      } catch {
        toast.error(`Couldn't copy automatically — here's the link: ${url}`);
      }
    }
  };

  const handleFileSelected = async (file: File) => {
    setError(null);
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setStatus("uploading");
    try {
      // createImageBitmap with imageOrientation "from-image" applies the
      // photo's own EXIF rotation so it never appears sideways/upside down.
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
        setSourceDataUrl(dataUrl);
        const maxW = 1000;
        const scale = Math.min(1, maxW / img.naturalWidth);
        setDisplaySize({ width: Math.round(img.naturalWidth * scale), height: Math.round(img.naturalHeight * scale) });
        setResultDataUrl(null);
        maskDataUrls.current = {};
        setStatus("analyzing");

        const provider = getSegmentationProvider();
        provider.analyze(bitmap ? (img as unknown as HTMLImageElement) : img).then(() => {
          // No provider is configured -- this always resolves empty. The
          // UI goes straight to manual masking, which is fully functional
          // on its own (see segmentationProvider.ts for why).
          setStatus("editing");
          toast("Automatic detection isn't available yet — paint the area manually below.", { duration: 3500 });
        });
      };
      img.onerror = () => {
        setError("That image couldn't be read. It may be corrupted.");
        setStatus("error");
      };
      img.src = dataUrl;
    } catch {
      setError("Something went wrong reading that file.");
      setStatus("error");
    }
  };

  const handleSwitchSurface = (next: ImageSurfaceType) => {
    const current = maskCanvasRef.current?.getMaskCanvas();
    if (current) maskDataUrls.current[surfaceType] = current.toDataURL();
    setSurfaceType(next);
    requestAnimationFrame(() => {
      const saved = maskDataUrls.current[next];
      if (saved) maskCanvasRef.current?.loadFromDataUrl(saved);
      else maskCanvasRef.current?.clear();
    });
  };

  const handleGenerate = () => {
    if (!sourceImage) return;
    if (!selectedProduct) {
      toast.error("Select a material first.");
      return;
    }
    const maskCanvas = maskCanvasRef.current?.getMaskCanvas();
    if (!maskCanvas) return;

    setStatus("generating");
    setError(null);

    // Give the "Generating..." state a frame to paint before the
    // (synchronous, fast) canvas work runs.
    requestAnimationFrame(() => {
      try {
        const config = surfaceConfigs[surfaceType];
        let patternCanvas: HTMLCanvasElement;
        let repeatX = 1;
        let repeatY = 1;

        if (config.mode === "slab" && selectedProduct.source === "alfa" && selectedProduct.imageUrl) {
          const slabImg = new Image();
          slabImg.crossOrigin = "anonymous";
          slabImg.src = selectedProduct.imageUrl;
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext("2d")!;
          try {
            ctx.drawImage(slabImg, 0, 0, canvas.width, canvas.height);
          } catch {
            // CORS-blocked photo -- fall back to its average color below.
          }
          patternCanvas = canvas;
        } else {
          const size =
            selectedProduct.sizes.find((s) => s.id === config.sizeId) ?? selectedProduct.sizes.find((s) => s.mode === config.mode) ?? selectedProduct.sizes[0];
          const tileColor =
            selectedProduct.source === "demo" && selectedProduct.descriptor ? selectedProduct.descriptor.baseColor : "#D8C9AE";
          const built = buildTilePatternCanvas({
            layout: config.layout,
            tileWidthMm: size?.width ?? 600,
            tileHeightMm: size?.height ?? 600,
            groutWidthMm: config.mode === "tile" ? config.groutWidthMm : 0,
            groutColor: config.groutColor,
            tileColor,
            seed: selectedProduct.id.length,
          });
          patternCanvas = built.canvas;
          repeatX = Math.max(1, Math.round((maskCanvas.width / built.cellWidthMm) * 0.15 * config.scale));
          repeatY = Math.max(1, Math.round((maskCanvas.height / built.cellHeightMm) * 0.15 * config.scale));
        }

        const result = compositeMaterialIntoMask({ sourceImage, maskCanvas, patternCanvas, repeatX, repeatY });
        setResultDataUrl(result.toDataURL("image/jpeg", 0.92));
        setStatus("complete");
      } catch (e) {
        console.error("[ImageVisualizer] generate failed:", e);
        setError("We couldn't generate the visualization. Your original image is safe.");
        setStatus("error");
      }
    });
  };

  const handleDownload = (format: "png" | "jpg") => {
    if (!resultDataUrl) return;
    const link = document.createElement("a");
    link.download = `alfa-ventura-visualization.${format}`;
    link.href = resultDataUrl;
    link.click();
  };

  const handleReset = () => {
    setSourceImage(null);
    setSourceDataUrl(null);
    setResultDataUrl(null);
    setStatus("idle");
    setError(null);
    maskDataUrls.current = {};
  };

  if (!sourceImage || !sourceDataUrl) {
    return (
      <div className="w-full h-[64vh] min-h-[440px] max-h-[680px]">
        <ImageUploadZone onFileSelected={handleFileSelected} error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="relative w-full h-[64vh] min-h-[440px] max-h-[680px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]">
          {resultDataUrl && status === "complete" ? (
            <BeforeAfterSlider beforeSrc={sourceDataUrl} afterSrc={resultDataUrl} />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative" style={{ width: displaySize.width, height: displaySize.height, maxWidth: "100%", maxHeight: "100%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sourceDataUrl} alt="Uploaded space" className="absolute inset-0 w-full h-full object-contain" />
                <MaskCanvas ref={maskCanvasRef} width={displaySize.width} height={displaySize.height} tool={tool} brushSize={brushSize} />
              </div>
            </div>
          )}

          {status === "generating" && (
            <div className="absolute inset-0 bg-[#EDE6DA]/90 flex items-center justify-center">
              <p className="text-sm font-semibold text-[#44403C]">Generating visualization...</p>
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-1.5">
            <button type="button" onClick={handleReset} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 border border-white/20 hover:bg-white">
              Replace Image
            </button>
          </div>
        </div>

        {status === "error" && error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between gap-3">
            <span>{error}</span>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={handleGenerate} className="text-xs font-semibold underline">
                Try Again
              </button>
              <button type="button" onClick={() => setStatus("editing")} className="text-xs font-semibold underline">
                Edit Mask
              </button>
            </div>
          </div>
        )}

        {(status === "editing" || status === "complete" || status === "generating") && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Surface</span>
              <div className="flex gap-1.5 flex-wrap">
                {IMAGE_SURFACE_TYPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSwitchSurface(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                      surfaceType === s ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
                    }`}
                  >
                    {IMAGE_SURFACE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Mask Tool</span>
              <div className="flex gap-1.5">
                {(["brush", "eraser"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTool(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                      tool === t ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input type="range" min={15} max={140} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-28 accent-[#9B7040]" />
              <button type="button" onClick={() => maskCanvasRef.current?.undo()} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E8DDD0] hover:border-[#9B7040]">
                Undo
              </button>
              <button type="button" onClick={() => maskCanvasRef.current?.redo()} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E8DDD0] hover:border-[#9B7040]">
                Redo
              </button>
              <button type="button" onClick={() => maskCanvasRef.current?.clear()} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E8DDD0] hover:border-[#9B7040]">
                Clear
              </button>
            </div>

            {resultDataUrl && status === "complete" && (
              <div className="flex gap-2 flex-wrap items-center">
                <button type="button" onClick={() => handleDownload("png")} className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] hover:border-[#9B7040]">
                  Download PNG
                </button>
                <button type="button" onClick={() => handleDownload("jpg")} className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] hover:border-[#9B7040]">
                  Download JPG
                </button>
                <input
                  type="text"
                  value={currentDesignName}
                  onChange={(e) => setCurrentDesignName(e.target.value)}
                  placeholder="Design name"
                  className="px-2 py-2 rounded-lg border border-[#E8DDD0] text-xs w-32"
                />
                <button type="button" onClick={() => handleSaveOrShare("save")} className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] hover:border-[#9B7040]">
                  Save Design
                </button>
                <button type="button" onClick={() => handleSaveOrShare("share")} className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#E8DDD0] hover:border-[#9B7040]">
                  Share
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="lg:w-[340px] lg:shrink-0 lg:pl-6 lg:border-l lg:border-[#E8DDD0] flex flex-col gap-3">
        <ProductPanel
          products={products}
          selectedSurfaceLabel={IMAGE_SURFACE_LABELS[surfaceType]}
          selectedSurfaceType={surfaceType === "accentWall" ? "wall" : surfaceType}
          activeProduct={selectedProduct}
          onSelectProduct={(p) => setSelectedProductId(p.id)}
        />

        {selectedProduct && (
          <MaterialConfigPanel
            product={selectedProduct}
            config={activeConfig}
            isVerticalSurface={VERTICAL_SURFACES.has(surfaceType)}
            onChange={(patch) => setSurfaceConfigs((prev) => ({ ...prev, [surfaceType]: { ...prev[surfaceType], ...patch } }))}
            onReset={() => setSurfaceConfigs((prev) => ({ ...prev, [surfaceType]: { ...DEFAULT_SURFACE_CONFIG } }))}
          />
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!selectedProduct || status === "generating"}
          className="px-4 py-3 rounded-lg text-sm font-bold bg-[#1C1917] text-white hover:bg-[#33302B] transition-colors disabled:opacity-40"
        >
          Generate Visualization
        </button>
        <p className="text-[10px] text-[#A8A29E] text-center">
          Processed entirely in your browser — this photo is never uploaded anywhere.
        </p>
      </div>
    </div>
  );
};

export default ImageVisualizerShell;
