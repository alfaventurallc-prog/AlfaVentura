"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface MaskCanvasHandle {
  getMaskCanvas: () => HTMLCanvasElement | null;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  loadFromDataUrl: (dataUrl: string) => void;
}

interface MaskCanvasProps {
  width: number;
  height: number;
  tool: "brush" | "eraser";
  brushSize: number;
  onChange?: () => void;
}

/**
 * Manual mask painting -- the fallback surface-selection tool (Step 8
 * section 8), and the only one active in this build since no automatic
 * segmentation provider is configured. Paints solid white with full alpha
 * (used directly as a clip mask by maskComposite.ts). Undo/redo keeps a
 * short history of full-canvas ImageData snapshots -- simple and correct
 * for a mask this size; not meant to scale to thousands of strokes.
 */
const MaskCanvas = forwardRef<MaskCanvasHandle, MaskCanvasProps>(({ width, height, tool, brushSize, onChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const history = useRef<ImageData[]>([]);
  const historyIndex = useRef(-1);
  const [, forceRender] = useState(0);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const pushHistory = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(snapshot);
    historyIndex.current = history.current.length - 1;
    forceRender((n) => n + 1);
    onChange?.();
  };

  useImperativeHandle(ref, () => ({
    getMaskCanvas: () => canvasRef.current,
    clear: () => {
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pushHistory();
    },
    undo: () => {
      if (historyIndex.current <= 0) return;
      historyIndex.current -= 1;
      const ctx = getCtx();
      if (ctx) ctx.putImageData(history.current[historyIndex.current], 0, 0);
      forceRender((n) => n + 1);
      onChange?.();
    },
    redo: () => {
      if (historyIndex.current >= history.current.length - 1) return;
      historyIndex.current += 1;
      const ctx = getCtx();
      if (ctx) ctx.putImageData(history.current[historyIndex.current], 0, 0);
      forceRender((n) => n + 1);
      onChange?.();
    },
    loadFromDataUrl: (dataUrl: string) => {
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pushHistory();
      };
      img.src = dataUrl;
    },
  }));

  useEffect(() => {
    // Seed history with a blank canvas once, on mount / size change.
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    history.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    historyIndex.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const draw = (x: number, y: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const { x, y } = pointFromEvent(e);
    draw(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const { x, y } = pointFromEvent(e);
    draw(x, y);
  };

  const handlePointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    pushHistory();
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none opacity-45"
      style={{ mixBlendMode: "normal" }}
      aria-label="Mask painting canvas"
    />
  );
});

MaskCanvas.displayName = "MaskCanvas";

export default MaskCanvas;
