import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);

const STORAGE_KEY = "manas-cinema:favorites:v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const value = useMemo(() => {
    const set = new Set(favoriteIds);

    return {
      favoriteIds,
      isFavorite: (id) => set.has(String(id)),
      toggleFavorite: (id) => {
        const key = String(id);
        setFavoriteIds((prev) =>
          prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
        );
      },
      clearFavorites: () => setFavoriteIds([]),
    };
  }, [favoriteIds]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

