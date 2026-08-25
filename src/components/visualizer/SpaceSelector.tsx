"use client";

import { SPACES } from "@/data/scenes";

interface SpaceSelectorProps {
  activeSpaceId: string;
  onSelect: (spaceId: string) => void;
}

const SpaceSelector = ({ activeSpaceId, onSelect }: SpaceSelectorProps) => (
  <div>
    <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#78716C] mb-3">01. Select Your Space</p>
    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
      {SPACES.map((space) => (
        <button
          key={space.id}
          type="button"
          onClick={() => onSelect(space.id)}
          aria-pressed={activeSpaceId === space.id}
          className={`shrink-0 text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040] ${
            activeSpaceId === space.id
              ? "bg-[#1C1917] text-white border-[#1C1917]"
              : "bg-white text-[#44403C] border-[#E8DDD0] hover:border-[#9B7040]"
          }`}
        >
          {space.label}
        </button>
      ))}
    </div>
  </div>
);

export default SpaceSelector;
