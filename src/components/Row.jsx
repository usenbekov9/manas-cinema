import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef } from "react";
import MovieCard from "./MovieCard.jsx";

function scrollByAmount(el, amount) {
  if (!el) return;
  el.scrollBy({ left: amount, behavior: "smooth" });
}

export default function Row({ title, films }) {
  const scrollerRef = useRef(null);

  const items = useMemo(() => (Array.isArray(films) ? films : []), [films]);
  if (items.length === 0) return null;

  return (
    <section className="row">
      <div className="row__head">
        <h2 className="row__title">{title}</h2>
        <div className="row__controls">
          <button
            className="iconbtn"
            onClick={() => scrollByAmount(scrollerRef.current, -560)}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="iconbtn"
            onClick={() => scrollByAmount(scrollerRef.current, 560)}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="row__scroller" ref={scrollerRef}>
        {items.map((film) => (
          <div className="row__item" key={film.id}>
            <MovieCard film={film} />
          </div>
        ))}
      </div>
    </section>
  );
}

