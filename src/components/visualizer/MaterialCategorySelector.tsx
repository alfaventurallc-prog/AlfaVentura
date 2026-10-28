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

// A wrapping grid in a vertically scrolling box: with 100+ products a single
// horizontal row meant sliding through the whole catalogue to find one.
const MaterialCategorySelector = ({ items, activeId, onSelect, isFavorite, onToggleFavorite }: MaterialCategorySelectorProps) => (
  <div className="grid grid-cols-2 min-[440px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[440px] overflow-y-auto p-1.5 -mx-1.5">
    {items.map((item) => {
      const active = activeId === item.id;
      const favorited = isFavorite?.(item.id) ?? false;
      return (
        <div key={item.id} className="relative min-w-0 group">
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={active}
            className={`w-full text-left rounded-xl border bg-white overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B7040] ${
              active
                ? "border-[#9B7040] ring-2 ring-[#9B7040]/40 shadow-premium-hover -translate-y-0.5"
                : "border-[#E8DDD0] shadow-premium hover:border-[#C9A96E] hover:shadow-premium-hover hover:-translate-y-0.5"
            }`}
          >
            <span className="block w-full aspect-[4/3] overflow-hidden">
              <span
                className="block w-full h-full bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-110"
                style={item.thumbnail ? { backgroundImage: `url(${item.thumbnail})` } : { backgroundColor: item.color }}
              />
            </span>
            <span className="block px-2.5 py-2 border-t border-[#F0E8DB]">
              <span
                className={`text-xs font-bold leading-snug line-clamp-2 break-words min-h-[2lh] transition-colors ${active ? "text-[#9B7040]" : "text-[#1C1917]"}`}
              >
                {item.name}
              </span>
            </span>
          </button>
          {active && (
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#9B7040] text-white text-[10px] flex items-center justify-center shadow-premium">
              ✓
            </span>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-sm hover:bg-white hover:scale-110 transition-all duration-200"
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
