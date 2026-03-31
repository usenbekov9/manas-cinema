import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import MovieRow from "../components/MovieRow";
import { getAllFilms, getFilmById, getFavoriteIds, parseGenres, toggleFavorite } from "../services/movieService";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
    getFilmById(id)
      .then(setMovie)
      .catch(() => setMovie(null));
    getAllFilms()
      .then(setAllMovies)
      .catch(() => setAllMovies([]));
  }, [id]);

  const relatedMovies = useMemo(() => {
    if (!movie) return [];
    const currentGenres = parseGenres(movie).map((item) => item.toLowerCase());
    return allMovies
      .filter((item) => item.id !== movie.id)
      .filter((item) =>
        parseGenres(item).some((genre) => currentGenres.includes(genre.toLowerCase()))
      )
      .slice(0, 10);
  }, [allMovies, movie]);

  if (!movie) {
    return (
      <main className="page">
        <div className="container empty-state">Movie not found.</div>
      </main>
    );
  }

  const isFavorite = favoriteIds.includes(movie.id);

  return (
    <motion.main className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="details-hero">
        <div className="container details-hero__shell">
          <div className="details-hero__poster">
            <img src={movie.image} alt={movie.title} />
          </div>
          <div className="details-hero__content">
            <p className="details-hero__meta">
              {parseGenres(movie).join(" • ")} • {movie.rating} ★ • {movie.year}
            </p>
            <h1>{movie.title}</h1>
            <p>{movie.description}</p>
            <div className="details-hero__actions">
              <Link className="btn btn--primary" to="/">
                <Play size={16} />
                Watch
              </Link>
              <button
                type="button"
                className={`btn btn--ghost ${isFavorite ? "btn--favorite" : ""}`}
                onClick={() => setFavoriteIds(toggleFavorite(movie.id))}
              >
                <Heart size={16} />
                Add to Favorites
              </button>
            </div>
          </div>
        </div>
      </section>

      <MovieRow
        title="Related Movies"
        movies={relatedMovies}
        favoriteIds={favoriteIds}
        onToggleFavorite={(movieId) => setFavoriteIds(toggleFavorite(movieId))}
      />
    </motion.main>
  );
}
