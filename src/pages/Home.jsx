import Hero from "../components/Hero.jsx";
import Row from "../components/Row.jsx";
import { LoadingBlock } from "../components/States.jsx";
import { useFilms } from "../hooks/useFilms.js";

export default function HomePage() {
  const { films, loading, error } = useFilms();

  if (loading) return <LoadingBlock title="Loading home…" />;
  if (error) {
    return (
      <div className="panel">
        <div className="panel__title">Something went wrong</div>
        <div className="panel__sub">We couldn’t load movies from Supabase.</div>
      </div>
    );
  }

  const featured = films[0];
  const trending = films.slice(0, 12);
  const newForYou = films.slice(4, 16);
  const topPicks = films.slice(10, 22);

  return (
    <div className="stack">
      <Hero film={featured} />
      <Row title="Trending now" films={trending} />
      <Row title="New for you" films={newForYou} />
      <Row title="Top picks" films={topPicks} />
    </div>
  );
}

