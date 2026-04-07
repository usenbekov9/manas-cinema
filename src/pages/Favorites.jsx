import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";
import { getAllFilms, hasFilmId } from "../services/movieService";

export default function Favorites() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLocale();
  const { favoriteIds, toggleFavorite, clearFavorites } = useFavorites();

  useEffect(() => {
    getAllFilms()
      .then(setMovies)
      .catch((error) => {
        console.error("Failed to fetch movies:", error);
        setMovies([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const favorites = useMemo(() => movies.filter((movie) => hasFilmId(favoriteIds, movie.id)), [movies, favoriteIds]);

  const handleToggleFavorite = (movieId) => toggleFavorite(movieId);

  return (
    <motion.main className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="page-heading">
        <div className="container page-heading__inner">
          <div>
            <h1>{t("favorites.title")}</h1>
            <p>{t("favorites.subtitle")}</p>
          </div>
          {!isLoading && favorites.length > 0 && (
            <div className="favorites-toolbar">
              <span className="favorites-toolbar__count">{t("favorites.savedCount", { count: favorites.length })}</span>
              <button type="button" className="btn btn--ghost" onClick={clearFavorites}>
                {t("favorites.clearAll")}
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="movie-grid-section">
        <div className="container movie-grid">
          {isLoading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <p>{t("favorites.loading")}</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="favorites-empty" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <p>{t("favorites.empty")}</p>
              <Link to="/movies" className="btn btn--primary favorites-empty__action">
                {t("favorites.browseMovies")}
              </Link>
            </div>
          ) : (
            favorites.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isFavorite={hasFilmId(favoriteIds, movie.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>
      </section>
    </motion.main>
  );
}
