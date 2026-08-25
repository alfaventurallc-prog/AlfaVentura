"use client";

import { useState } from "react";
import VisualizerShell from "./VisualizerShell";
import ImageVisualizer from "./ImageVisualizer";
import type { VisualizerProduct } from "../../../types";

type Mode = "3d" | "image";

const VisualizerModeTabs = ({ products }: { products: VisualizerProduct[] }) => {
  const [mode, setMode] = useState<Mode>("3d");

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setMode("3d")}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
            mode === "3d"
              ? "bg-[#9B7040] text-white border-[#9B7040]"
              : "bg-white text-[#57534E] border-[#E8DDD0] hover:border-[#9B7040]"
          }`}
        >
          3D Visualizer
        </button>
        <button
          type="button"
          onClick={() => setMode("image")}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
            mode === "image"
              ? "bg-[#9B7040] text-white border-[#9B7040]"
              : "bg-white text-[#57534E] border-[#E8DDD0] hover:border-[#9B7040]"
          }`}
        >
          Image Visualizer
        </button>
      </div>

      {mode === "3d" ? <VisualizerShell products={products} /> : <ImageVisualizer products={products} />}
    </div>
  );
};

export default VisualizerModeTabs;
