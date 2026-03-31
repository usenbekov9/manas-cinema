import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Plus, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../state/favorites.jsx";

function preloadImages(films) {
  if (!Array.isArray(films)) return;
  for (const f of films) {
    if (!f?.image) continue;
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = f.image;
  }
}

export default function Hero({ films, fallbackFilm }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const items = useMemo(
    () => (Array.isArray(films) && films.length ? films : fallbackFilm ? [fallbackFilm] : []),
    [films, fallbackFilm]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const pauseRef = useRef(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length]);

  useEffect(() => {
    preloadImages(items);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return;

    const id = setInterval(() => {
      if (pauseRef.current) return;
      setActiveIndex((i) => (i + 1) % items.length);
    }, 5000);

    return () => clearInterval(id);
  }, [items.length]);

  const active = items[activeIndex];
  const fav = active ? isFavorite(active.id) : false;

  const canSlide = items.length > 1;
  const prev = () => canSlide && setActiveIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => canSlide && setActiveIndex((i) => (i + 1) % items.length);

  if (!active) {
    return (
      <section className="hero hero--skeleton" aria-busy="true">
        <div className="hero__frame">
          <div className="hero__bgWrap" aria-hidden="true" />
          <div className="hero__content">
            <div className="hero__container">
              <div className="hero__badge">
                <Star size={14} /> Featured
              </div>
              <div className="skeleton skeleton--heroTitle" />
              <div className="skeleton skeleton--heroText" />
              <div className="hero__actions">
                <div className="skeleton skeleton--btn" />
                <div className="skeleton skeleton--btn2" />
              </div>
              <div className="hero__dots" aria-hidden="true">
                <div className="skeleton skeleton--dot" />
                <div className="skeleton skeleton--dot skeleton--dot2" />
                <div className="skeleton skeleton--dot" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hero"
      onMouseEnter={() => {
        pauseRef.current = true;
      }}
      onMouseLeave={() => {
        pauseRef.current = false;
      }}
    >
      <div className="hero__frame">
        <div className="hero__bgWrap" aria-hidden="true">
          <div className="hero__bgFade" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={active.id}
              className="hero__bg"
              src={active.image}
              alt={active.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              draggable={false}
            />
          </AnimatePresence>
          <div className="hero__overlay" aria-hidden="true" />
        </div>

        <div className="hero__content">
          <div className="hero__container">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="hero__inner"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <div className="hero__top">
                  <div className="hero__badge">
                    <Star size={14} /> Featured
                  </div>

                  <div className="hero__controls" aria-label="Hero controls">
                    <button className="hero__arrow" type="button" onClick={prev} disabled={!canSlide} aria-label="Previous">
                      <ChevronLeft size={18} />
                    </button>
                    <button className="hero__arrow" type="button" onClick={next} disabled={!canSlide} aria-label="Next">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <h1 className="hero__title">{active.title}</h1>
                <p className="hero__desc">{active.description}</p>

                <div className="hero__actions">
                  <button className="btn btn--primary" onClick={() => navigate(`/movies/${active.id}`)} type="button">
                    <Play size={18} /> Details
                  </button>
                  <button
                    className={fav ? "btn btn--ghost btn--active" : "btn btn--ghost"}
                    onClick={() => toggleFavorite(active.id)}
                    type="button"
                  >
                    <Plus size={18} /> {fav ? "Saved" : "Save"}
                  </button>
                </div>

                <div className="hero__dots" role="tablist" aria-label="Select featured movie">
                  {items.map((f, idx) => (
                    <button
                      key={f.id}
                      className={idx === activeIndex ? "hero__dot hero__dot--active" : "hero__dot"}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Show ${f.title}`}
                      role="tab"
                      aria-selected={idx === activeIndex}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

