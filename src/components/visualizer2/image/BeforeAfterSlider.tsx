"use client";

import { useRef, useState } from "react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
}

/** Drag the divider to compare the original photo against the visualized
 * result. The original image is never modified -- both are separate
 * sources, this just clips the "after" layer's visible width. */
const BeforeAfterSlider = ({ beforeSrc, afterSrc }: BeforeAfterSliderProps) => {
  const [split, setSplit] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const updateSplit = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-2xl"
      onPointerDown={(e) => {
        dragging.current = true;
        updateSplit(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && updateSplit(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={beforeSrc} alt="Original photo" className="absolute inset-0 w-full h-full object-contain bg-[#EDE6DA]" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterSrc} alt="Visualization result" className="absolute inset-0 w-full h-full object-contain bg-[#EDE6DA]" />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize" style={{ left: `${split}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-xs font-bold text-[#44403C]">
          ⇔
        </div>
      </div>
      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-white/80 px-2 py-1 rounded-full text-[#44403C]">
        Before
      </span>
      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide bg-white/80 px-2 py-1 rounded-full text-[#44403C]">
        After
      </span>
    </div>
  );
};

export default BeforeAfterSlider;
