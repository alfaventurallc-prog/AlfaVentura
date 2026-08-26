"use client";

export interface SwatchItem {
  id: string;
  name: string;
  thumbnail?: string;
  color?: string;
}

interface MaterialCategorySelectorProps {
  items: SwatchItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
}

const MaterialCategorySelector = ({ items, activeId, onSelect, isFavorite, onToggleFavorite }: MaterialCategorySelectorProps) => (
  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
    {items.map((item) => {
      const active = activeId === item.id;
      const favorited = isFavorite?.(item.id) ?? false;
      return (
        <div key={item.id} className="relative shrink-0 w-32">
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
            className={`w-full text-left rounded-xl border overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040] ${
              active ? "border-[#9B7040] ring-1 ring-[#9B7040]" : "border-[#E8DDD0] hover:border-[#9B7040]"
            }`}
          >
            <span
              className="block w-full h-24 bg-cover bg-center"
              style={item.thumbnail ? { backgroundImage: `url(${item.thumbnail})` } : { backgroundColor: item.color }}
            />
            <span className="block px-2.5 py-2">
              <span className="block text-xs font-bold text-[#1C1917] truncate">{item.name}</span>
            </span>
          </button>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-sm hover:bg-white transition-colors"
            >
              {favorited ? "♥" : "♡"}
            </button>
          )}
        </div>
      );
    })}
  </div>
);

export default MaterialCategorySelector;
