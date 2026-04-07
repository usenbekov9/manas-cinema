import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GenreFilter from "../components/GenreFilter";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";
import { getAllFilms, hasFilmId, parseGenres } from "../services/movieService";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLocale();
  const { favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    getAllFilms()
      .then(setMovies)
      .catch((error) => {
        console.error("Failed to fetch movies:", error);
        setMovies([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredMovies = useMemo(() => {
    return (
      activeGenre === "All"
        ? movies
        : movies.filter((movie) =>
            parseGenres(movie).some((genre) => genre.toLowerCase() === activeGenre.toLowerCase())
          )
    );
  }, [activeGenre, movies]);

  const handleToggleFavorite = (movieId) => toggleFavorite(movieId);

  return (
    <motion.main className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="page-heading">
        <div className="container page-heading__inner">
          <h1>{t("movies.title")}</h1>
        </div>
      </section>

      <GenreFilter activeGenre={activeGenre} onChange={setActiveGenre} />

      <section className="movie-grid-section">
        <div className="container movie-grid">
          {isLoading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <p>{t("movies.loading")}</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <p>{t("movies.empty")}</p>
            </div>
          ) : (
            filteredMovies.map((movie) => (
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
