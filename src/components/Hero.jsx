import { motion } from "framer-motion";
import { Play, Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../state/favorites.jsx";

export default function Hero({ film }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!film) {
    return (
      <section className="hero hero--skeleton" aria-busy="true">
        <div className="hero__inner">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text" />
          <div className="hero__actions">
            <div className="skeleton skeleton--btn" />
            <div className="skeleton skeleton--btn2" />
          </div>
        </div>
      </section>
    );
  }

  const fav = isFavorite(film.id);

  return (
    <section className="hero" style={{ backgroundImage: `url(${film.image})` }}>
      <div className="hero__scrim" />
      <div className="hero__grain" />
      <div className="hero__inner">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="hero__badge">
            <Star size={14} /> Featured
          </div>
          <h1 className="hero__title">{film.title}</h1>
          <p className="hero__desc">{film.description}</p>
          <div className="hero__actions">
            <button className="btn btn--primary" onClick={() => navigate(`/movies/${film.id}`)}>
              <Play size={18} /> Details
            </button>
            <button
              className={fav ? "btn btn--ghost btn--active" : "btn btn--ghost"}
              onClick={() => toggleFavorite(film.id)}
            >
              <Plus size={18} /> {fav ? "In Favorites" : "Add to Favorites"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
