"use client";

import { ROOMS, type RoomDef } from "@/lib/visualizer2/rooms";

interface SpaceSelectorProps {
  activeRoomId: string;
  onSelect: (roomId: string) => void;
}

const CATEGORY_ICON: Record<RoomDef["category"], string> = {
  kitchen: "🍳",
  bathroom: "🛁",
  living: "🛋️",
  bedroom: "🛏️",
};

/**
 * Space cards use a plain icon + tint instead of a rendered 3D thumbnail or
 * any stock photo -- a real render-to-texture preview pipeline is a
 * reasonable next addition, deferred for now (see Step 4 report). Never
 * hotlinked/stock imagery either way.
 */
const SpaceSelector = ({ activeRoomId, onSelect }: SpaceSelectorProps) => (
  <div>
    <span className="text-xs font-bold uppercase tracking-wide text-[#78716C] block mb-2">Space</span>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {ROOMS.map((room) => {
        const active = room.id === activeRoomId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className={`shrink-0 w-28 text-left rounded-xl border overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040] ${
              active ? "border-[#9B7040] ring-1 ring-[#9B7040]" : "border-[#E8DDD0] hover:border-[#9B7040]"
            }`}
          >
            <span className={`flex items-center justify-center w-full h-16 text-2xl ${active ? "bg-[#F5EDE1]" : "bg-[#F5F1EA]"}`}>
              {CATEGORY_ICON[room.category]}
            </span>
            <span className="block px-2 py-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-[#1C1917] truncate">{room.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default SpaceSelector;
