"use client";

import type { RefObject } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";

interface SceneControlsProps {
  cameraControlsRef: RefObject<CameraControlsImpl | null>;
  fullscreenTargetRef: RefObject<HTMLDivElement | null>;
  lightingMode: "day" | "evening";
  onLightingChange: (mode: "day" | "evening") => void;
}

const btnClass =
  "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border border-white/20 bg-white/80 backdrop-blur-sm text-[#44403C] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040]";
const pillClass =
  "px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 bg-white/80 backdrop-blur-sm text-[#44403C] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040]";

const SceneControls = ({ cameraControlsRef, fullscreenTargetRef, lightingMode, onLightingChange }: SceneControlsProps) => {
  const reset = () => cameraControlsRef.current?.reset(true);
  const zoomIn = () => cameraControlsRef.current?.dolly(0.6, true);
  const zoomOut = () => cameraControlsRef.current?.dolly(-0.6, true);
  const toggleFullscreen = () => {
    const el = fullscreenTargetRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-1.5">
        <button type="button" className={btnClass} onClick={zoomIn} aria-label="Zoom in" title="Zoom in">
          +
        </button>
        <button type="button" className={btnClass} onClick={zoomOut} aria-label="Zoom out" title="Zoom out">
          −
        </button>
        <button type="button" className={pillClass} onClick={reset}>
          Reset View
        </button>
        <button type="button" className={pillClass} onClick={toggleFullscreen}>
          Fullscreen
        </button>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          className={`${pillClass} ${lightingMode === "day" ? "bg-[#1C1917] text-white border-[#1C1917] hover:bg-[#1C1917]" : ""}`}
          onClick={() => onLightingChange("day")}
        >
          Day
        </button>
        <button
          type="button"
          className={`${pillClass} ${lightingMode === "evening" ? "bg-[#1C1917] text-white border-[#1C1917] hover:bg-[#1C1917]" : ""}`}
          onClick={() => onLightingChange("evening")}
        >
          Evening
        </button>
      </div>
    </div>
  );
};

export default SceneControls;
