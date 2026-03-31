import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GenreFilter from "../components/GenreFilter";
import MovieCard from "../components/MovieCard";
import { getAllFilms, getFavoriteIds, parseGenres, toggleFavorite } from "../services/movieService";

export default function Series() {
  const [movies, setMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
    getAllFilms()
      .then(setMovies)
      .catch(() => setMovies([]));
  }, []);

  const seriesList = useMemo(() => {
    const base = movies.filter((movie) => movie.title?.toLowerCase().includes("season") || movie.year >= 2020);
    if (activeGenre === "All") return base;
    return base.filter((movie) =>
      parseGenres(movie).some((genre) => genre.toLowerCase() === activeGenre.toLowerCase())
    );
  }, [movies, activeGenre]);

  const handleToggleFavorite = (movieId) => setFavoriteIds(toggleFavorite(movieId));

  return (
    <motion.main className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="page-heading">
        <div className="container page-heading__inner">
          <h1>Series</h1>
          <p>Curated episodic titles and premium originals.</p>
        </div>
      </section>
      <GenreFilter activeGenre={activeGenre} onChange={setActiveGenre} />
      <section className="movie-grid-section">
        <div className="container movie-grid">
          {seriesList.map((movie) => (
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
