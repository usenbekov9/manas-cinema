import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  const queryFromUrl = useMemo(() => params.get("q") ?? "", [params]);
  const [query, setQuery] = useState(queryFromUrl);

  // Keep input in sync when user navigates back/forward.
  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  const debounced = useDebounced(query, 220);

  useEffect(() => {
    // Search is defined for Movies page; typing elsewhere takes you there.
    const q = debounced.trim();
    if (q && !location.pathname.startsWith("/movies")) {
      navigate(`/movies?q=${encodeURIComponent(q)}`);
      return;
    }
    if (location.pathname.startsWith("/movies")) {
      if (!q) {
        setParams({}, { replace: true });
      } else {
        setParams({ q }, { replace: true });
      }
    }
  }, [debounced, location.pathname, navigate, setParams]);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="topbar__title">Browse</div>
        <div className="topbar__hint">Premium picks, every day</div>
      </div>

      <div className="topbar__right">
        <div className="search">
          <Search size={18} className="search__icon" />
          <input
            className="search__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies…"
            aria-label="Search movies"
            type="search"
          />
        </div>

        <div className="userchip" title="Profile">
          <div className="userchip__avatar" aria-hidden="true">
            MC
          </div>
          <div className="userchip__meta">
            <div className="userchip__name">Manas Cinema</div>
            <div className="userchip__sub">Member</div>
          </div>
        </div>
      </div>
    </header>
  );
}

