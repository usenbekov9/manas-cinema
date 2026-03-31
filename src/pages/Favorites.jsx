import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import MovieCard from "../components/MovieCard";
import { getAllFilms, getFavoriteIds, toggleFavorite } from "../services/movieService";

export default function Favorites() {
  const [movies, setMovies] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
    getAllFilms()
      .then(setMovies)
      .catch(() => setMovies([]));
  }, []);

  const favorites = useMemo(() => movies.filter((movie) => favoriteIds.includes(movie.id)), [movies, favoriteIds]);

  const handleToggleFavorite = (movieId) => setFavoriteIds(toggleFavorite(movieId));

  return (
    <motion.main className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="page-heading">
        <div className="container page-heading__inner">
          <h1>Favorites</h1>
          <p>Your saved movies and series.</p>
        </div>
      </section>
      <section className="movie-grid-section">
        <div className="container movie-grid">
          {favorites.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={favoriteIds.includes(movie.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      </section>
    </motion.main>
  );
}
