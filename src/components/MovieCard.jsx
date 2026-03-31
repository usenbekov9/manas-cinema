import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie, isFavorite, onToggleFavorite }) {
  return (
    <motion.article whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.25 }} className="movie-card">
      <Link to={`/movies/${movie.id}`} className="movie-card__poster">
        <img src={movie.image} alt={movie.title} loading="lazy" />
        <span className="movie-card__overlay" />
      </Link>

      <div className="movie-card__body">
        <div>
          <h3>{movie.title}</h3>
          <p>
            {movie.rating} ★ • {movie.year}
          </p>
        </div>
        <button
          type="button"
          className={`icon-button ${isFavorite ? "icon-button--active" : ""}`}
          onClick={() => onToggleFavorite(movie.id)}
          aria-label="Toggle favorite"
        >
          <Heart size={16} />
        </button>
      </div>
    </motion.article>
  );
}