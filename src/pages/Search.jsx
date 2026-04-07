import { Clapperboard, Play, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";
import { getFilmTrailerSource, hasFilmId, searchFilms } from "../services/movieService";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLocale();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const trimmedQuery = query.trim();

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setError("");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError("");

    searchFilms(trimmedQuery)
      .then((data) => {
        if (isMounted) {
          setResults(Array.isArray(data) ? data : []);
        }
      })
      .catch((nextError) => {
        if (isMounted) {
          setError(nextError?.message || t("search.failed"));
          setResults([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [trimmedQuery, t]);

  const trailerCount = useMemo(
    () => results.filter((movie) => Boolean(getFilmTrailerSource(movie))).length,
    [results]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);

    if (trimmedQuery) {
      next.set("q", trimmedQuery);
    } else {
      next.delete("q");
    }

    setSearchParams(next, { replace: true });
  };

  return (
    <main className="page search-page">
      <section className="page-heading">
        <div className="container page-heading__inner page-heading__inner--stacked">
          <div>
            <h1>{t("search.pageTitle")}</h1>
            <p>{t("search.pageSubtitle")}</p>
          </div>

          <form className="search-page__form" onSubmit={handleSubmit}>
            <div className="search-page__input">
              <SearchIcon size={18} />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search.placeholder")}
              />
            </div>
            <button type="submit" className="btn btn--primary">{t("common.search")}</button>
          </form>
        </div>
      </section>

      <section className="search-page__summary">
        <div className="container search-summary">
          <div className="search-summary__card">
            <SearchIcon size={18} />
            <div>
              <strong>{results.length}</strong>
              <span>{t("search.matches")}</span>
            </div>
          </div>
          <div className="search-summary__card">
            <Clapperboard size={18} />
            <div>
              <strong>{trailerCount}</strong>
              <span>{t("search.withTrailers")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="movie-grid-section">
        <div className="container">
          {!trimmedQuery && <div className="empty-state">{t("search.startTyping")}</div>}
          {trimmedQuery && isLoading && <div className="empty-state">{t("search.searching")}</div>}
          {trimmedQuery && error && <div className="empty-state">{error}</div>}
          {trimmedQuery && !isLoading && !error && results.length === 0 && (
            <div className="empty-state">{t("search.noResults", { query: trimmedQuery })}</div>
          )}

          {results.length > 0 && (
            <>
              <div className="movie-grid">
                {results.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorite={hasFilmId(favoriteIds, movie.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              <div className="search-page__list">
                {results.map((movie) => {
                  const trailerSource = getFilmTrailerSource(movie);

                  return (
                    <article key={`search-${movie.id}`} className="search-result-card">
                      <img src={movie.image} alt={movie.title} className="search-result-card__image" />
                      <div className="search-result-card__body">
                        <div>
                          <h2>{movie.title}</h2>
                          <p>{movie.description || t("search.descriptionPending")}</p>
                        </div>

                        <div className="search-result-card__meta">
                          <span>{movie.year || t("search.unknownYear")}</span>
                          <span>{movie.genre || t("search.genrePending")}</span>
                          <span>{movie.type || t("search.typeMovie")}</span>
                        </div>

                        <div className="search-result-card__actions">
                          <Link to={`/watch/${movie.id}`} className="btn btn--primary">
                            <Play size={16} />
                            {t("common.watch")}
                          </Link>
                          {trailerSource && (
                            <Link to={`/watch/${movie.id}?source=trailer`} className="btn btn--ghost">
                              <Play size={16} />
                              {t("common.trailer")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}