import { motion } from "framer-motion";
import { Heart, Play } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getFilmRatingLabel, getFilmTrailerSource } from "../services/movieService";
import { useLocale } from "../state/locale";
import { filmShape } from "../utils/propTypes";

export default function MovieCard({ movie, isFavorite, onToggleFavorite }) {
  const { t } = useLocale();
  const trailerSource = getFilmTrailerSource(movie);

  return (
    <motion.article whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.25 }} className="movie-card">
      <Link to={`/watch/${movie.id}`} className="movie-card__poster">
        <img src={movie.image} alt={movie.title} loading="lazy" />
        <span className="movie-card__overlay" />
      </Link>

      <div className="movie-card__body">
        <div>
          <h3>{movie.title}</h3>
          <p>
            {getFilmRatingLabel(movie)} ★ • {movie.year}
          </p>
        </div>
        <button
          type="button"
          className={`icon-button ${isFavorite ? "icon-button--active" : ""}`}
          onClick={() => onToggleFavorite(movie.id)}
          aria-label={t("movieCard.toggleFavorite")}
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="movie-card__footer">
        <Link to={`/movies/${movie.id}`} className="movie-card__link">
          {t("common.details")}
        </Link>
        {trailerSource ? (
          <Link to={`/watch/${movie.id}?source=trailer`} className="movie-card__trailer-link">
            <Play size={14} /> {t("common.trailer")}
          </Link>
        ) : (
          <span className="movie-card__trailer-link movie-card__trailer-link--disabled">{t("common.noTrailer")}</span>
        )}
      </div>
    </motion.article>
  );
}

MovieCard.propTypes = {
  movie: filmShape.isRequired,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};

MovieCard.defaultProps = {
  isFavorite: false,
  onToggleFavorite: () => {},
};