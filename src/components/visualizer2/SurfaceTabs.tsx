"use client";

import { SURFACE_IDS, SURFACE_LABELS, type SurfaceId } from "@/lib/visualizer2/surfaces";

interface SurfaceTabsProps {
  selectedSurface: SurfaceId | null;
  onSelect: (id: SurfaceId) => void;
}

/** Method B of the two-way surface selection: pick a surface from this list
 * instead of clicking it directly in the 3D room. Both write to the same
 * `selectedSurface` state, so either path works identically afterward. */
const SurfaceTabs = ({ selectedSurface, onSelect }: SurfaceTabsProps) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Surface</span>
    <div className="flex gap-1.5 flex-wrap">
      {SURFACE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
            selectedSurface === id ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
          }`}
        >
          {SURFACE_LABELS[id]}
        </button>
      ))}
    </div>
  </div>
);

export default SurfaceTabs;
