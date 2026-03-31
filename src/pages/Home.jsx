import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GenreFilter from "../components/GenreFilter";
import HeroSlider from "../components/HeroSlider";
import MovieRow from "../components/MovieRow";
import { getAllFilms, parseGenres, toggleFavorite, getFavoriteIds } from "../services/movieService";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeGenre, setActiveGenre] = useState("All");

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
    getAllFilms()
      .then(setMovies)
      .catch(() => setMovies([]));
  }, []);

  const filtered = useMemo(() => {
    if (activeGenre === "All") return movies;
    return movies.filter((movie) =>
      parseGenres(movie).some((genre) => genre.toLowerCase() === activeGenre.toLowerCase())
    );
  }, [movies, activeGenre]);

  const trending = filtered.slice(0, 10);
  const popular = filtered.slice(5, 15);
  const recentlyAdded = filtered.slice(0, 12);
  const continueWatching = filtered.slice(8, 18);

  const handleToggleFavorite = (movieId) => {
    setFavoriteIds(toggleFavorite(movieId));
  };

  return (
    <motion.main className="page page--home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <HeroSlider movies={filtered} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
      <GenreFilter activeGenre={activeGenre} onChange={setActiveGenre} />
      <MovieRow title="Trending Now" movies={trending} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
      <MovieRow title="Popular" movies={popular} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
      <MovieRow
        title="Recently Added"
        movies={recentlyAdded}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />
      <MovieRow
        title="Continue Watching"
        movies={continueWatching}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />
    </motion.main>
  );
}
