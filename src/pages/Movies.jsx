import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GenreFilter from "../components/GenreFilter";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";
import { getAllFilms, getFilmRating, hasFilmId, parseGenres } from "../services/movieService";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
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

  const filteredAndSorted = useMemo(() => {
    const genreFiltered =
      activeGenre === "All"
        ? movies
        : movies.filter((movie) =>
            parseGenres(movie).some((genre) => genre.toLowerCase() === activeGenre.toLowerCase())
          );

    const list = [...genreFiltered];
    if (sortBy === "Latest") list.sort((a, b) => b.year - a.year);
    if (sortBy === "A-Z") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "Year") list.sort((a, b) => a.year - b.year);
    if (sortBy === "Rating") list.sort((a, b) => (getFilmRating(b) || 0) - (getFilmRating(a) || 0));

    return list;
  }, [activeGenre, movies, sortBy]);

  const handleToggleFavorite = (movieId) => toggleFavorite(movieId);

  return (
    <motion.main className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="page-heading">
        <div className="container page-heading__inner">
          <h1>{t("movies.title")}</h1>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="sort-select">
            <option>Latest</option>
            <option>A-Z</option>
            <option>Year</option>
            <option>Rating</option>
          </select>
        </div>
      </section>

      <GenreFilter activeGenre={activeGenre} onChange={setActiveGenre} />

      <section className="movie-grid-section">
        <div className="container movie-grid">
          {isLoading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <p>{t("movies.loading")}</p>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <p>{t("movies.empty")}</p>
            </div>
          ) : (
            filteredAndSorted.map((movie) => (
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
