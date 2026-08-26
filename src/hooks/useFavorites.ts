"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "alfa-ventura-visualizer-favorites";

export interface FavoriteEntry {
  category: string;
  productId: string;
}

const keyOf = (e: FavoriteEntry) => `${e.category}:${e.productId}`;

const readStorage = (): FavoriteEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteEntry[]) : [];
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    setFavorites(readStorage());
  }, []);

  const persist = useCallback((next: FavoriteEntry[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private mode, etc.) -- favorites just won't persist
    }
  }, []);

  const isFavorite = useCallback((entry: FavoriteEntry) => favorites.some((f) => keyOf(f) === keyOf(entry)), [favorites]);

  const toggleFavorite = useCallback(
    (entry: FavoriteEntry) => {
      const exists = favorites.some((f) => keyOf(f) === keyOf(entry));
      persist(exists ? favorites.filter((f) => keyOf(f) !== keyOf(entry)) : [...favorites, entry]);
    },
    [favorites, persist]
  );

  return { favorites, isFavorite, toggleFavorite };
};
