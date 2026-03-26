import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard.jsx";
import { EmptyBlock, LoadingBlock } from "../components/States.jsx";
import { useFilms } from "../hooks/useFilms.js";

export default function MoviesPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";

  const { films, loading, error } = useFilms({ query: q });

  const title = useMemo(() => {
    const trimmed = q.trim();
    return trimmed ? `Results for “${trimmed}”` : "Movies";
  }, [q]);

  if (loading) return <LoadingBlock title="Loading movies…" />;
  if (error) {
    return (
      <div className="panel">
        <div className="panel__title">Can’t load movies</div>
        <div className="panel__sub">Check your Supabase connection and try again.</div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="pagehead">
        <div>
          <h1 className="pagehead__title">{title}</h1>
          <div className="pagehead__sub">{films.length} titles</div>
        </div>
      </div>

      {films.length === 0 ? (
        <EmptyBlock
          title="No matches"
          subtitle="Try searching for a different title or keyword."
        />
      ) : (
        <div className="grid">
          {films.map((film) => (
            <MovieCard key={film.id} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}

