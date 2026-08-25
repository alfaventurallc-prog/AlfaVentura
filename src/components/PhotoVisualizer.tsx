"use client";

import { useState } from "react";
import type { Finish } from "../../types";

// Estimated polygon over the island countertop's top surface in /ban4.png (1913x822).
// Percentages are relative to the image box, which is locked to the photo's own
// aspect ratio via the wrapper's `aspect-ratio`, so this stays aligned at any size.
const COUNTERTOP_CLIP = "polygon(27% 66%, 61% 37%, 89% 47%, 73% 79%)";

const PhotoVisualizer = ({ finishes }: { finishes: Finish[] }) => {
  const [finish, setFinish] = useState(finishes[0]);

  return (
    <div className="w-full">
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-[#E8DDD0] bg-[#EDE6DA]"
        style={{ aspectRatio: "1913 / 822" }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "url(/ban4.png)", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${finish.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            clipPath: COUNTERTOP_CLIP,
            WebkitClipPath: COUNTERTOP_CLIP,
            mixBlendMode: "multiply",
          }}
        />
      </div>

      <p className="text-center text-sm text-[#78716C] mt-3">
        Kitchen island countertop shown in <span className="font-semibold text-[#44403C]">{finish.name}</span>
      </p>

      <p className="text-center text-sm font-semibold text-[#44403C] mt-6 mb-3">Choose one of your products</p>
      <div className="flex items-center gap-4 overflow-x-auto px-2 pb-2">
        {finishes.map((f) => (
          <button
            key={f.name}
            type="button"
            onClick={() => setFinish(f)}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <span
              className={`block w-16 h-16 rounded-xl bg-cover bg-center border-2 transition-colors ${
                finish.name === f.name ? "border-[#9B7040]" : "border-transparent"
              }`}
              style={{ backgroundImage: `url(${f.image})` }}
            />
            <span
              className={`text-xs font-semibold text-center max-w-[80px] leading-tight ${
                finish.name === f.name ? "text-[#9B7040]" : "text-[#57534E]"
              }`}
            >
              {f.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PhotoVisualizer;
