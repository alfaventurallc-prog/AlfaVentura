"use client";

interface SurfaceTabsProps {
  surfaces: { id: string; label: string }[];
  selectedSurface: string | null;
  onSelect: (id: string) => void;
}

/** Method B of the two-way surface selection: pick a surface from this list
 * instead of clicking it directly in the 3D room. Both write to the same
 * `selectedSurface` state, so either path works identically afterward. The
 * list itself comes from the active room's own surface set (Step 4) -- a
 * bathroom never shows "Countertop", a kitchen never shows "Shower Wall". */
const SurfaceTabs = ({ surfaces, selectedSurface, onSelect }: SurfaceTabsProps) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs font-bold uppercase tracking-wide text-[#78716C]">Surface</span>
    <div className="flex gap-1.5 flex-wrap">
      {surfaces.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
            selectedSurface === id ? "bg-[#1C1917] text-white" : "bg-[#F5F1EA] text-[#78716C] hover:bg-[#EDE6DA]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default SurfaceTabs;
