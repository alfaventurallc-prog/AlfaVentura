"use client";

import { MATERIAL_CATEGORY_LABELS, type MaterialCategory } from "@/data/kitchenCatalog";
import type { FavoriteEntry } from "@/hooks/useFavorites";
import type { SwatchItem } from "./MaterialCategorySelector";

interface FavoritesPanelProps {
  open: boolean;
  onClose: () => void;
  favorites: FavoriteEntry[];
  catalog: Record<MaterialCategory, SwatchItem[]>;
  onApply: (category: MaterialCategory, id: string) => void;
  onRemove: (entry: FavoriteEntry) => void;
}

const FavoritesPanel = ({ open, onClose, favorites, catalog, onApply, onRemove }: FavoritesPanelProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[340px] max-w-[90vw] h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD0]">
          <h3 className="font-bold text-[#1C1917]">My Selections</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5EFE6] text-[#44403C]">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {favorites.length === 0 ? (
            <p className="text-sm text-[#78716C]">
              No favorites yet — tap the ♡ on any material to save it here.
            </p>
          ) : (
            (Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]).map((category) => {
              const entries = favorites.filter((f) => f.category === category);
              if (entries.length === 0) return null;
              return (
                <div key={category}>
                  <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#78716C] mb-2">
                    {MATERIAL_CATEGORY_LABELS[category]}
                  </p>
                  <div className="space-y-2">
                    {entries.map((entry) => {
                      const item = catalog[category]?.find((i) => i.id === entry.productId);
                      if (!item) return null;
                      return (
                        <div key={entry.productId} className="flex items-center gap-3 bg-[#FDFAF7] rounded-lg p-2">
                          <span
                            className="w-10 h-10 rounded-md shrink-0 bg-cover bg-center"
                            style={item.thumbnail ? { backgroundImage: `url(${item.thumbnail})` } : { backgroundColor: item.color }}
                          />
                          <span className="text-sm font-semibold text-[#1C1917] flex-1 truncate">{item.name}</span>
                          <button
                            type="button"
                            onClick={() => onApply(category, item.id)}
                            className="text-xs font-semibold text-[#9B7040] hover:underline"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(entry)}
                            aria-label="Remove from favorites"
                            className="text-sm text-[#A8A29E] hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPanel;
