import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "../state/favorites.jsx";

export default function MovieCard({ film }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(film.id);

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.16, ease: "easeOut" }}>
      <Link className="card" to={`/movies/${film.id}`} aria-label={`Open ${film.title}`}>
        <div className="card__poster">
          <img className="card__img" src={film.image} alt={film.title} loading="lazy" />
          <div className="card__overlay">
            <div className="card__title">{film.title}</div>
            <div className="card__subtitle">{film.description}</div>
          </div>
        </div>

        <div className="card__meta">
          <div className="card__name" title={film.title}>
            {film.title}
          </div>
          <button
            className={fav ? "iconbtn iconbtn--active" : "iconbtn"}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(film.id);
            }}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={16} />
          </button>
        </div>
      </Link>
    </motion.div>
  );
}