"use client";

import type { RefObject } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";

interface VisualizerV2ControlsProps {
  cameraControlsRef: RefObject<CameraControlsImpl | null>;
  fullscreenTargetRef: RefObject<HTMLDivElement | null>;
}

const btnClass =
  "w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold border border-white/20 bg-white/80 backdrop-blur-sm text-[#44403C] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040]";

/** Subtle floating camera controls -- zoom in/out, reset to the hero angle,
 * fullscreen. Deliberately minimal for this foundation step. */
const VisualizerV2Controls = ({ cameraControlsRef, fullscreenTargetRef }: VisualizerV2ControlsProps) => {
  const zoomIn = () => cameraControlsRef.current?.dolly(0.6, true);
  const zoomOut = () => cameraControlsRef.current?.dolly(-0.6, true);
  const reset = () => cameraControlsRef.current?.reset(true);
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
    <div className="absolute bottom-3 right-3 flex gap-1.5">
      <button type="button" className={btnClass} onClick={zoomIn} aria-label="Zoom in" title="Zoom in">
        +
      </button>
      <button type="button" className={btnClass} onClick={zoomOut} aria-label="Zoom out" title="Zoom out">
        −
      </button>
      <button type="button" className={btnClass} onClick={reset} aria-label="Reset view" title="Reset view">
        ⟳
      </button>
      <button type="button" className={btnClass} onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen">
        ⛶
      </button>
    </div>
  );
};

export default VisualizerV2Controls;
