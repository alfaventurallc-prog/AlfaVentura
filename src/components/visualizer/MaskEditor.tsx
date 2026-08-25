"use client";

import { useEffect, useRef, useState } from "react";
import { renderSlabOnImage, type Quad } from "@/three/renderSlabOnImage";
import type { Point } from "@/three/homography";

const TEST_IMAGES = ["/ban4.png", "/ban1.webp", "/02.png", "/who.webp"];
const FALLBACK_SLABS = [
  { name: "Calacatta (fallback swatch)", image: "/quartz-calacatta-series.webp" },
  { name: "Carrara (fallback swatch)", image: "/quartz-carrara-series.webp" },
];

interface SlabOption {
  name: string;
  image: string;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const swatchColors = ["#C9A96E", "#7FB3D5", "#82E0AA", "#F1948A", "#BB8FCE"];

const MaskEditor = ({ slabOptions }: { slabOptions: SlabOption[] }) => {
  const slabs = slabOptions.length > 0 ? slabOptions : FALLBACK_SLABS;
  const [baseSrc, setBaseSrc] = useState(TEST_IMAGES[0]);
  const [slabSrc, setSlabSrc] = useState(slabs[0].image);
  const [surfaces, setSurfaces] = useState<Record<string, Quad[]>>({});
  const [activeSurface, setActiveSurface] = useState("island");
  const [surfaceNameInput, setSurfaceNameInput] = useState("island");
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const surfaceNames = Object.keys(surfaces);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentPoints.length >= 4) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setCurrentPoints((prev) => [...prev, { x, y }]);
  };

  const handleDragPoint = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const onMove = (moveEvent: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (moveEvent.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (moveEvent.clientY - rect.top) / rect.height));
      setCurrentPoints((prev) => prev.map((p, i) => (i === index ? { x, y } : p)));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const addPolygonToSurface = () => {
    if (currentPoints.length !== 4 || !surfaceNameInput.trim()) return;
    const name = surfaceNameInput.trim();
    setSurfaces((prev) => ({
      ...prev,
      [name]: [...(prev[name] ?? []), currentPoints as Quad],
    }));
    setActiveSurface(name);
    setCurrentPoints([]);
  };

  const deletePolygon = (surfaceName: string, index: number) => {
    setSurfaces((prev) => {
      const remaining = prev[surfaceName].filter((_, i) => i !== index);
      const next = { ...prev };
      if (remaining.length === 0) delete next[surfaceName];
      else next[surfaceName] = remaining;
      return next;
    });
  };

  const deleteSurface = (surfaceName: string) => {
    setSurfaces((prev) => {
      const next = { ...prev };
      delete next[surfaceName];
      return next;
    });
  };

  useEffect(() => {
    if (!showPreview) return;
    const allPolygons = Object.values(surfaces).flat();
    if (allPolygons.length === 0 && currentPoints.length !== 4) return;
    let cancelled = false;

    Promise.all([loadImage(baseSrc), loadImage(slabSrc)]).then(([baseImg, slabImg]) => {
      if (cancelled) return;
      const polygons = currentPoints.length === 4 ? [...allPolygons, currentPoints as Quad] : allPolygons;
      const result = renderSlabOnImage(baseImg, slabImg, polygons);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = result.width;
      canvas.height = result.height;
      canvas.getContext("2d")!.drawImage(result, 0, 0);
    });

    return () => {
      cancelled = true;
    };
  }, [surfaces, currentPoints, baseSrc, slabSrc, showPreview]);

  const sceneJson = JSON.stringify(
    {
      id: "scene-id-here",
      name: "Scene name here",
      image: baseSrc,
      spaceId: "kitchen",
      surfaces: Object.fromEntries(
        Object.entries(surfaces).map(([name, polygons]) => [
          name,
          {
            label: name,
            polygons: polygons.map((quad) => quad.map((p) => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 }))),
          },
        ])
      ),
    },
    null,
    2
  );

  const copyJson = () => navigator.clipboard.writeText(sceneJson);

  return (
    <div className="min-h-screen bg-[#1C1917] text-white p-6">
      <h1 className="text-xl font-bold mb-1">Visualizer Mask Editor</h1>
      <p className="text-sm text-white/50 mb-6 max-w-3xl">
        Internal tool — not linked from the site. 1) Type a surface name below (e.g. "island", or "islandTop" /
        "islandFront" / "islandLeftSide" if one application needs several polygons). 2) Click 4 corner points on the
        image (top-left, top-right, bottom-right, bottom-left). 3) Click "Add Polygon to Surface". Repeat for more
        surfaces/polygons, then copy the full scene JSON into src/data/imageScenes.ts.
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label className="block text-xs text-white/50 mb-1">Base image</label>
          <select
            value={baseSrc}
            onChange={(e) => {
              setBaseSrc(e.target.value);
              setSurfaces({});
              setCurrentPoints([]);
            }}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
          >
            {TEST_IMAGES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Preview slab</label>
          <select value={slabSrc} onChange={(e) => setSlabSrc(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm">
            {slabs.map((s) => (
              <option key={s.image} value={s.image}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Surface name</label>
          <input
            value={surfaceNameInput}
            onChange={(e) => setSurfaceNameInput(e.target.value)}
            placeholder="e.g. island, islandTop"
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm w-40"
          />
        </div>
        <button
          type="button"
          onClick={addPolygonToSurface}
          disabled={currentPoints.length !== 4 || !surfaceNameInput.trim()}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-[#9B7040] hover:bg-[#7A5520] disabled:opacity-40 disabled:cursor-not-allowed text-white"
        >
          Add Polygon to Surface ({currentPoints.length}/4)
        </button>
        <button
          type="button"
          onClick={() => setCurrentPoints([])}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 border border-white/20 hover:bg-white/20"
        >
          Clear Current Points
        </button>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 border border-white/20 hover:bg-white/20"
        >
          {showPreview ? "Hide" : "Show"} Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
            Click to place corners for "{surfaceNameInput || "…"}" ({currentPoints.length}/4)
          </p>
          <div
            ref={containerRef}
            onClick={handleImageClick}
            className="relative w-full cursor-crosshair select-none border border-white/20 rounded-lg overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={baseSrc} alt="Base scene" className="w-full h-auto block pointer-events-none" draggable={false} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {surfaceNames.map((name, si) =>
                surfaces[name].map((quad, qi) => (
                  <polygon
                    key={`${name}-${qi}`}
                    points={quad.map((p) => `${p.x * 100}%,${p.y * 100}%`).join(" ")}
                    fill={`${swatchColors[si % swatchColors.length]}33`}
                    stroke={swatchColors[si % swatchColors.length]}
                    strokeWidth={2}
                  />
                ))
              )}
              {currentPoints.length > 1 && (
                <polygon
                  points={currentPoints.map((p) => `${p.x * 100}%,${p.y * 100}%`).join(" ")}
                  fill="rgba(255,255,255,0.25)"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
              )}
            </svg>
            {currentPoints.map((p, i) => (
              <div
                key={i}
                onMouseDown={handleDragPoint(i)}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-white border-2 border-[#1C1917] shadow cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-bold text-[#1C1917]"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {surfaceNames.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-white/50">Defined surfaces</p>
              {surfaceNames.map((name, si) => (
                <div key={name} className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-3 py-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: swatchColors[si % swatchColors.length] }} />
                  <span className="font-semibold flex-1">
                    {name} <span className="text-white/40 font-normal">({surfaces[name].length} polygon{surfaces[name].length > 1 ? "s" : ""})</span>
                  </span>
                  {surfaces[name].map((_, qi) => (
                    <button
                      key={qi}
                      type="button"
                      onClick={() => deletePolygon(name, qi)}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                    >
                      Del #{qi + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => deleteSurface(name)}
                    className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300"
                  >
                    Delete surface
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/50 mb-2">Live preview (all surfaces)</p>
          <div className="border border-white/20 rounded-lg overflow-hidden bg-black/30 min-h-[200px] flex items-center justify-center">
            {surfaceNames.length > 0 || currentPoints.length === 4 ? (
              <canvas ref={canvasRef} className="w-full h-auto block" />
            ) : (
              <p className="text-sm text-white/40 p-8 text-center">Add a polygon to see the preview</p>
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-white/50 mt-5 mb-2">Scene JSON</p>
          <textarea
            readOnly
            value={sceneJson}
            rows={14}
            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-xs font-mono text-[#C9A96E]"
          />
          <button
            type="button"
            onClick={copyJson}
            className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#9B7040] hover:bg-[#7A5520] text-white"
          >
            Copy Scene JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaskEditor;
