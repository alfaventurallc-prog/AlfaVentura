"use client";

import { LAYOUTS, type LayoutId } from "@/data/kitchenCatalog";

interface LayoutSelectorProps {
  activeLayout: LayoutId;
  mirrored: boolean;
  onSelectLayout: (id: LayoutId) => void;
  onToggleMirror: () => void;
}

const LayoutSelector = ({ activeLayout, mirrored, onSelectLayout, onToggleMirror }: LayoutSelectorProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex gap-1.5">
      {LAYOUTS.map((layout) => (
        <button
          key={layout.id}
          type="button"
          onClick={() => onSelectLayout(layout.id)}
          aria-pressed={activeLayout === layout.id}
          title={layout.description}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
            activeLayout === layout.id
              ? "bg-[#9B7040] text-white border-[#9B7040] shadow-premium-hover"
              : "bg-white text-[#57534E] border-[#E8DDD0] shadow-premium hover:border-[#C9A96E] hover:-translate-y-0.5"
          }`}
        >
          {layout.name}
        </button>
      ))}
    </div>
    <button
      type="button"
      onClick={onToggleMirror}
      className="px-4 py-2 rounded-full text-sm font-semibold border border-[#E8DDD0] bg-white text-[#57534E] shadow-premium hover:border-[#C9A96E] hover:-translate-y-0.5 transition-all duration-200"
    >
      Swap Left / Right {mirrored ? "↺" : "↻"}
    </button>
  </div>
);

export default LayoutSelector;
