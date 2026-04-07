import { useEffect, useState } from "react";
import { ArrowRight, Clapperboard, X, Search as SearchIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { getFilmTrailerSource, searchFilms } from "../services/movieService";
import { useLocale } from "../state/locale";

export default function SearchModal({ isOpen, onClose, onMovieSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLocale();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchFilms(query);

        if (!isActive) {
          return;
        }

        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setError(err?.message || t("search.failed"));
        setResults([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectMovie = (movie) => {
    navigate(`/watch/${movie.id}`);
    onMovieSelect?.();
    onClose();
  };

  const handleOpenResults = () => {
    if (!query.trim()) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal" onClick={onClose}>
      <div className="search-modal__content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="search-modal__close" onClick={onClose} aria-label={t("common.closeSearch")}>
          <X size={24} />
        </button>

        <div className="search-modal__input-wrapper">
          <SearchIcon size={20} className="search-modal__icon" />
          <input
            type="text"
            className="search-modal__input"
            placeholder={t("search.modalPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {query.trim() && (
          <div className="search-modal__results">
            {error && <div className="search-modal__status" style={{ color: "#ff3b3b" }}>{t("search.modalError", { error })}</div>}
            {isLoading && !error && <div className="search-modal__status">{t("search.modalLoading")}</div>}
            {!isLoading && !error && results.length === 0 && (
              <div className="search-modal__status">{t("search.modalNoResults", { query })}</div>
            )}
            {!isLoading && !error && results.length > 0 && (
              <>
                <div className="search-modal__meta">
                  <span>{t("search.modalMatches", { count: results.length })}</span>
                  <button type="button" className="search-modal__more" onClick={handleOpenResults}>
                    {t("search.modalOpenFull")} <ArrowRight size={16} />
                  </button>
                </div>
                <div className="search-modal__grid">
                  {results.slice(0, 8).map((movie) => {
                    const hasTrailer = Boolean(getFilmTrailerSource(movie));

                    return (
                      <div
                        key={movie.id}
                        className="search-result-item"
                        onClick={() => handleSelectMovie(movie)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleSelectMovie(movie)}
                      >
                        <img src={movie.image} alt={movie.title} loading="lazy" onError={(e) => (e.target.src = "https://via.placeholder.com/50x75")} />
                        <div className="search-result-item__info">
                          <h4>{movie.title}</h4>
                          <p>{movie.year || t("search.na")}</p>
                        </div>
                        {hasTrailer && (
                          <div className="search-result-item__tag">
                            <Clapperboard size={14} /> {t("search.trailerTag")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

SearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMovieSelect: PropTypes.func,
};

SearchModal.defaultProps = {
  onMovieSelect: undefined,
};
