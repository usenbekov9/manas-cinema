import { Film, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../state/locale";
import { getAllFilms, getFilmTrailerSource } from "../services/movieService";

export default function TrailersPage() {
  const [films, setFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLocale();

  useEffect(() => {
    getAllFilms()
      .then((items) => setFilms(Array.isArray(items) ? items : []))
      .catch((error) => {
        console.error("Failed to fetch trailers:", error);
        setFilms([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const trailerFilms = useMemo(
    () => films.filter((film) => Boolean(getFilmTrailerSource(film))),
    [films]
  );

  return (
    <main className="page trailers-page">
      <section className="page-heading">
        <div className="container page-heading__inner page-heading__inner--stacked">
          <div>
            <h1>{t("trailers.title")}</h1>
            <p>{t("trailers.subtitle")}</p>
          </div>
          <div className="trailers-page__stat">
            <Film size={18} />
            <span>{t("trailers.readyTitles", { count: trailerFilms.length })}</span>
          </div>
        </div>
      </section>

      <section className="trailers-page__grid-section">
        <div className="container trailers-page__grid">
          {isLoading && <div className="empty-state">{t("trailers.loading")}</div>}
          {!isLoading && trailerFilms.length === 0 && (
            <div className="empty-state">{t("trailers.empty")}</div>
          )}
          {!isLoading && trailerFilms.map((film) => (
            <article key={film.id} className="trailer-tile">
              <img src={film.image} alt={film.title} className="trailer-tile__image" />
              <div className="trailer-tile__overlay" />
              <div className="trailer-tile__content">
                <div>
                  <div className="watch-badge watch-badge--muted">{film.type || t("search.typeMovie")}</div>
                  <h2>{film.title}</h2>
                  <p>{film.description || t("trailers.sourceAvailable")}</p>
                </div>

                <div className="trailer-tile__actions">
                  <Link to={`/watch/${film.id}?source=trailer`} className="btn btn--primary">
                    <Play size={16} />
                    {t("trailers.watchTrailer")}
                  </Link>
                  <Link to={`/movies/${film.id}`} className="btn btn--ghost">{t("common.details")}</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}