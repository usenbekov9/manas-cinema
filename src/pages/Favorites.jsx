import { useMemo } from "react";
import MovieCard from "../components/MovieCard.jsx";
import { EmptyFavorites, LoadingBlock } from "../components/States.jsx";
import { useFilms } from "../hooks/useFilms.js";
import { useFavorites } from "../state/favorites.jsx";

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const { films, loading, error } = useFilms();

  const favorites = useMemo(() => {
    const set = new Set(favoriteIds.map(String));
    return films.filter((f) => set.has(String(f.id)));
  }, [favoriteIds, films]);

  if (loading) return <LoadingBlock title="Loading favorites…" />;
  if (error) {
    return (
      <div className="panel">
        <div className="panel__title">Can’t load favorites</div>
        <div className="panel__sub">We couldn’t load movies from Supabase.</div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="pagehead">
        <div>
          <h1 className="pagehead__title">Favorites</h1>
          <div className="pagehead__sub">{favorites.length} saved</div>
        </div>
      </div>

      {favoriteIds.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <div className="grid">
          {favorites.map((film) => (
            <MovieCard key={film.id} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}

