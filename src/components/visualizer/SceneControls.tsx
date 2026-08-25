"use client";

import type { RefObject } from "react";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import type { SpaceDef } from "@/data/scenes";

interface SceneControlsProps {
  space: SpaceDef;
  cameraControlsRef: RefObject<CameraControlsImpl | null>;
  lightingMode: "day" | "evening";
  onLightingChange: (mode: "day" | "evening") => void;
}

const btnClass =
  "px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 bg-white/80 backdrop-blur-sm text-[#44403C] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040]";

const SceneControls = ({ space, cameraControlsRef, lightingMode, onLightingChange }: SceneControlsProps) => {
  const goTo = (preset: keyof SpaceDef["cameraPresets"]) => {
    const [px, py, pz, tx, ty, tz] = space.cameraPresets[preset];
    cameraControlsRef.current?.setLookAt(px, py, pz, tx, ty, tz, true);
  };

  const reset = () => {
    cameraControlsRef.current?.reset(true);
  };

  return (
    <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={btnClass} onClick={() => goTo("front")}>
          Front
        </button>
        <button type="button" className={btnClass} onClick={() => goTo("perspective")}>
          Perspective
        </button>
        <button type="button" className={btnClass} onClick={() => goTo("top")}>
          Top
        </button>
        <button type="button" className={btnClass} onClick={reset}>
          Reset View
        </button>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          className={`${btnClass} ${lightingMode === "day" ? "bg-[#1C1917] text-white border-[#1C1917] hover:bg-[#1C1917]" : ""}`}
          onClick={() => onLightingChange("day")}
        >
          Day
        </button>
        <button
          type="button"
          className={`${btnClass} ${lightingMode === "evening" ? "bg-[#1C1917] text-white border-[#1C1917] hover:bg-[#1C1917]" : ""}`}
          onClick={() => onLightingChange("evening")}
        >
          Evening
        </button>
      </div>
    </div>
  );
};

export default SceneControls;
