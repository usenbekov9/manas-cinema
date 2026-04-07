import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { hasFilmId } from "../services/movieService";
import { filmShape } from "../utils/propTypes";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, movies, favoriteIds, onToggleFavorite }) {
  return (
    <section className="movie-row">
      <div className="container">
        <div className="movie-row__header">
          <h2>{title}</h2>
        </div>
        <motion.div
          className="movie-row__track"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={hasFilmId(favoriteIds, movie.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

MovieRow.propTypes = {
  title: PropTypes.string.isRequired,
  movies: PropTypes.arrayOf(filmShape).isRequired,
  favoriteIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
};
