/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  getFavoriteIds,
  hasFilmId,
  setFavoriteIds,
  subscribeToFavoriteIds,
  toggleFavorite as toggleFavoriteInStorage,
} from "../services/movieService";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIdsState] = useState(() => getFavoriteIds());

  useEffect(() => {
    return subscribeToFavoriteIds(setFavoriteIdsState);
  }, []);

  const value = useMemo(() => {
    return {
      favoriteIds,
      isFavorite: (id) => hasFilmId(favoriteIds, id),
      toggleFavorite: (id) => setFavoriteIdsState(toggleFavoriteInStorage(id)),
      clearFavorites: () => setFavoriteIdsState(setFavoriteIds([])),
    };
  }, [favoriteIds]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

FavoritesProvider.propTypes = {
  children: PropTypes.node,
};

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

