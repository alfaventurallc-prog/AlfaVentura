"use client";

import { useRef, useState } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import VisualizerV2Canvas from "./VisualizerV2Canvas";
import VisualizerV2Controls from "./VisualizerV2Controls";
import VisualizerErrorBoundary from "../visualizer/VisualizerErrorBoundary";
import { DEFAULT_SURFACE_MATERIALS, SURFACE_LABELS, type SurfaceId } from "@/lib/visualizer2/surfaces";

/**
 * Step 1 foundation only: a real, independently-selectable 3D room. No
 * product library, no save/share, no waterfall/thickness/vein controls yet
 * -- those build on top of this in later steps (see surfaces.ts).
 */
const VisualizerV2Shell = () => {
  const [selectedSurface, setSelectedSurface] = useState<SurfaceId | null>(null);
  const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative w-full h-[72vh] min-h-[480px] max-h-[760px] rounded-2xl overflow-hidden bg-[#EDE6DA] border border-[#E8DDD0]"
      >
        <VisualizerErrorBoundary>
          <VisualizerV2Canvas
            materials={DEFAULT_SURFACE_MATERIALS}
            selectedSurface={selectedSurface}
            onSelectSurface={setSelectedSurface}
            cameraControlsRef={cameraControlsRef}
          />
        </VisualizerErrorBoundary>
        <VisualizerV2Controls cameraControlsRef={cameraControlsRef} fullscreenTargetRef={containerRef} />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold uppercase tracking-wide text-xs text-[#78716C]">Selected Surface</span>
        <span className="font-semibold text-[#1C1917]">{selectedSurface ? SURFACE_LABELS[selectedSurface] : "None — click a surface"}</span>
      </div>
    </div>
  );
};

export default VisualizerV2Shell;
