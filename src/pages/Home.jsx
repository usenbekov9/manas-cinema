import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GenreFilter from "../components/GenreFilter";
import HeroSlider from "../components/HeroSlider";
import MovieRow from "../components/MovieRow";
import { useWatchHistory } from "../hooks/useWatchHistory";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";
import { getAllFilms, getFilmRating, isSameFilmId, parseGenres } from "../services/movieService";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLocale();
  const watchHistory = useWatchHistory();
  const { favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    getAllFilms()
      .then(setMovies)
      .catch((error) => {
        console.error("Failed to fetch films:", error);
        setMovies([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeGenre === "All") return movies;
    return movies.filter((movie) =>
      parseGenres(movie).some((genre) => genre.toLowerCase() === activeGenre.toLowerCase())
    );
  }, [movies, activeGenre]);

  // Continue Watching from history
  const continueWatching = useMemo(() => {
    return watchHistory
      .slice(0, 12)
      .map((item) => movies.find((movie) => isSameFilmId(movie.id, item.movieId)))
      .filter(Boolean);
  }, [watchHistory, movies]);

  const { trending, popular, recentlyAdded } = useMemo(() => {
    const byRating = [...filtered].sort((left, right) => (getFilmRating(right) || 0) - (getFilmRating(left) || 0));
    const byYear = [...filtered].sort((left, right) => (right.year || 0) - (left.year || 0));

    return {
      trending: byRating.slice(0, 10),
      popular: byRating.filter((movie) => (getFilmRating(movie) || 0) >= 7).slice(0, 15),
      recentlyAdded: byYear.slice(0, 12),
    };
  }, [filtered]);

  const handleToggleFavorite = (movieId) => toggleFavorite(movieId);

  return (
    <motion.main
      className="page page--home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {!isLoading && <HeroSlider movies={filtered} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />}
      <GenreFilter activeGenre={activeGenre} onChange={setActiveGenre} />
      <MovieRow title={t("home.trending")} movies={trending} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
      <MovieRow title={t("home.popular")} movies={popular} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
      <MovieRow
        title={t("home.recent")}
        movies={recentlyAdded}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />
      {continueWatching.length > 0 && (
        <MovieRow
          title={t("home.continueWatching")}
          movies={continueWatching}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </motion.main>
  );
}
