import { ArrowLeft, Heart, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { LoadingBlock } from "../components/States.jsx";
import { useFilm } from "../hooks/useFilm.js";
import { useFavorites } from "../state/favorites.jsx";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const { film, loading, error } = useFilm(id);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (loading) return <LoadingBlock title="Loading details…" />;
  if (error || !film) {
    return (
      <div className="panel">
        <div className="panel__title">Movie not found</div>
        <div className="panel__sub">This title doesn’t exist (or failed to load).</div>
        <div className="panel__actions">
          <Link className="btn btn--ghost" to="/movies">
            <ArrowLeft size={18} /> Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const fav = isFavorite(film.id);

  return (
    <div className="details">
      <div className="details__hero" style={{ backgroundImage: `url(${film.image})` }}>
        <div className="details__scrim" />
        <div className="details__inner">
          <Link className="btn btn--ghost btn--sm" to="/movies">
            <ArrowLeft size={18} /> Back
          </Link>

          <div className="details__grid">
            <div className="details__poster">
              <img src={film.image} alt={film.title} />
            </div>

            <div className="details__info">
              <h1 className="details__title">{film.title}</h1>
              <p className="details__desc">{film.description}</p>

              <div className="details__actions">
                <button className="btn btn--primary" type="button">
                  <Play size={18} /> Watch (UI)
                </button>
                <button
                  className={fav ? "btn btn--ghost btn--active" : "btn btn--ghost"}
                  type="button"
                  onClick={() => toggleFavorite(film.id)}
                >
                  <Heart size={18} /> {fav ? "Saved" : "Save"}
                </button>
              </div>

              <div className="details__note">
                Streaming playback is UI-only here; your Supabase table powers the catalog and pages.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

