"use client";

import { useEffect, useRef } from "react";
import { drawProceduralPattern, type ProceduralDescriptor } from "@/three/proceduralPattern";

/**
 * A DOM (non-3D) thumbnail for a demo material -- draws into a real
 * `<canvas>` element after mount so nothing runs during SSR (a bare
 * `document.createElement('canvas')` at render time would).
 */
const ProceduralSwatch = ({ descriptor, className }: { descriptor: ProceduralDescriptor; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawProceduralPattern(ctx, descriptor, canvas.width, canvas.height);
  }, [descriptor]);

  return <canvas ref={canvasRef} width={160} height={160} className={className} />;
};

export default ProceduralSwatch;
