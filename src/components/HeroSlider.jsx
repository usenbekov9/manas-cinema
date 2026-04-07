import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Play } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getFilmRatingLabel, hasFilmId, parseGenres } from "../services/movieService";
import { useLocale } from "../state/locale";
import { filmShape } from "../utils/propTypes";

export default function HeroSlider({ movies, favoriteIds, onToggleFavorite }) {
  const { t } = useLocale();
  const heroMovies = useMemo(() => movies.slice(0, 5), [movies]);
  const [index, setIndex] = useState(0);
  const safeIndex = heroMovies.length ? Math.min(index, heroMovies.length - 1) : 0;

  useEffect(() => {
    if (heroMovies.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  if (!heroMovies.length) {
    return (
      <section className="hero-slider">
        <div className="container">
          <div className="hero-slider__empty">{t("heroSlider.empty")}</div>
        </div>
      </section>
    );
  }

  const movie = heroMovies[safeIndex];
  const genres = parseGenres(movie).slice(0, 3).join(" • ");
  const isFavorite = hasFilmId(favoriteIds, movie.id);

  const goNext = () => setIndex((prev) => (prev + 1) % heroMovies.length);
  const goPrev = () => setIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);

  return (
    <section className="hero-slider">
      <div className="container">
        <div className="hero-slider__shell">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              className="hero-slider__content"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            >
              <div className="hero-slider__left">
                <p className="hero-slider__meta">
                  {genres || t("heroSlider.featured")} • {getFilmRatingLabel(movie)} ★ • {movie.year}
                </p>
                <h1>{movie.title}</h1>
                <p>{movie.description}</p>
                <div className="hero-slider__buttons">
                  <Link className="btn btn--primary" to={`/watch/${movie.id}`}>
                    <Play size={16} />
                    {t("common.watch")}
                  </Link>
                  <button
                    type="button"
                    className={`btn btn--ghost ${isFavorite ? "btn--favorite" : ""}`}
                    onClick={() => onToggleFavorite(movie.id)}
                  >
                    <Heart size={16} />
                    {t("heroSlider.addToFavorites")}
                  </button>
                </div>
              </div>

              <div className="hero-slider__right">
                <img src={movie.image} alt={movie.title} loading="eager" />
              </div>
            </motion.div>
          </AnimatePresence>

          <button type="button" className="hero-slider__arrow hero-slider__arrow--left" onClick={goPrev}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="hero-slider__arrow hero-slider__arrow--right" onClick={goNext}>
            <ChevronRight size={20} />
          </button>

          <div className="hero-slider__dots">
            {heroMovies.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                className={`hero-slider__dot ${itemIndex === safeIndex ? "hero-slider__dot--active" : ""}`}
                onClick={() => setIndex(itemIndex)}
                aria-label={t("heroSlider.goToSlide", { index: itemIndex + 1 })}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

HeroSlider.propTypes = {
  movies: PropTypes.arrayOf(filmShape).isRequired,
  favoriteIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
};
