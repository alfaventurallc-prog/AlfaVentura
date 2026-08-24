"use client";

import { useState } from "react";
import Slab3DViewer from "./Slab3DViewer";
import PhotoVisualizer from "./PhotoVisualizer";

type Mode = "3d" | "photo";

const ThreeDTryTabs = () => {
  const [mode, setMode] = useState<Mode>("3d");

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setMode("3d")}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
            mode === "3d"
              ? "bg-[#1C1917] text-white border-[#1C1917]"
              : "bg-white text-[#57534E] border-[#E8DDD0] hover:border-[#1C1917]"
          }`}
        >
          3D Room View
        </button>
        <button
          type="button"
          onClick={() => setMode("photo")}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
            mode === "photo"
              ? "bg-[#1C1917] text-white border-[#1C1917]"
              : "bg-white text-[#57534E] border-[#E8DDD0] hover:border-[#1C1917]"
          }`}
        >
          Photo Visualizer
        </button>
      </div>

      {mode === "3d" ? <Slab3DViewer /> : <PhotoVisualizer />}
    </div>
  );
};

export default ThreeDTryTabs;
