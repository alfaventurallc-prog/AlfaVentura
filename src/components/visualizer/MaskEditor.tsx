"use client";

import { useEffect, useRef, useState } from "react";
import { renderSlabOnImage } from "@/three/renderSlabOnImage";
import type { Point } from "@/three/homography";

const TEST_IMAGES = ["/ban4.png", "/ban1.webp", "/02.png", "/who.webp"];
const TEST_SLABS = [
  "/quartz-calacatta-series.webp",
  "/quartz-carrara-series.webp",
  "/quartz-basic-series.webp",
  "/quartz-multi-exotic.webp",
];

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const MaskEditor = () => {
  const [baseSrc, setBaseSrc] = useState(TEST_IMAGES[0]);
  const [slabSrc, setSlabSrc] = useState(TEST_SLABS[0]);
  const [points, setPoints] = useState<Point[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (points.length >= 4) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setPoints((prev) => [...prev, { x, y }]);
  };

  const handleDragPoint = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const onMove = (moveEvent: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (moveEvent.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (moveEvent.clientY - rect.top) / rect.height));
      setPoints((prev) => prev.map((p, i) => (i === index ? { x, y } : p)));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  useEffect(() => {
    if (points.length !== 4 || !showPreview) return;
    let cancelled = false;

    Promise.all([loadImage(baseSrc), loadImage(slabSrc)]).then(([baseImg, slabImg]) => {
      if (cancelled) return;
      const result = renderSlabOnImage(baseImg, slabImg, points as [Point, Point, Point, Point]);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = result.width;
      canvas.height = result.height;
      canvas.getContext("2d")!.drawImage(result, 0, 0);
    });

    return () => {
      cancelled = true;
    };
  }, [points, baseSrc, slabSrc, showPreview]);

  const jsonOutput = JSON.stringify(
    {
      image: baseSrc,
      corners: points.map((p) => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 })),
    },
    null,
    2
  );

  const copyJson = () => navigator.clipboard.writeText(jsonOutput);

  return (
    <div className="min-h-screen bg-[#1C1917] text-white p-6">
      <h1 className="text-xl font-bold mb-1">Visualizer Mask Editor</h1>
      <p className="text-sm text-white/50 mb-6">
        Internal tool — not linked from the site. Click 4 points around a surface's corners (in order: top-left,
        top-right, bottom-right, bottom-left), drag to adjust, then copy the JSON into src/data/imageScenes.ts.
      </p>

      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={baseSrc}
          onChange={(e) => {
            setBaseSrc(e.target.value);
            setPoints([]);
          }}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
        >
          {TEST_IMAGES.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>
        <select value={slabSrc} onChange={(e) => setSlabSrc(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm">
          {TEST_SLABS.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setPoints([])}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/10 border border-white/20 hover:bg-white/20"
        >
          Clear Points
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
            Click to place corners ({points.length}/4)
          </p>
          <div
            ref={containerRef}
            onClick={handleImageClick}
            className="relative w-full cursor-crosshair select-none border border-white/20 rounded-lg overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={baseSrc} alt="Base scene" className="w-full h-auto block pointer-events-none" draggable={false} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {points.length > 1 && (
                <polygon
                  points={points.map((p) => `${p.x * 100}%,${p.y * 100}%`).join(" ")}
                  fill="rgba(201,169,110,0.25)"
                  stroke="#C9A96E"
                  strokeWidth={2}
                />
              )}
            </svg>
            {points.map((p, i) => (
              <div
                key={i}
                onMouseDown={handleDragPoint(i)}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-[#C9A96E] border-2 border-white shadow cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-bold text-[#1C1917]"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/50 mb-2">Live preview</p>
          <div className="border border-white/20 rounded-lg overflow-hidden bg-black/30 min-h-[200px] flex items-center justify-center">
            {points.length === 4 ? (
              <canvas ref={canvasRef} className="w-full h-auto block" />
            ) : (
              <p className="text-sm text-white/40 p-8 text-center">Place all 4 corner points to see the preview</p>
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-wide text-white/50 mt-5 mb-2">JSON</p>
          <textarea
            readOnly
            value={jsonOutput}
            rows={8}
            className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-xs font-mono text-[#C9A96E]"
          />
          <button
            type="button"
            onClick={copyJson}
            className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#9B7040] hover:bg-[#7A5520] text-white"
          >
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaskEditor;
