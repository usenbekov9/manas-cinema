import { useEffect, useMemo, useState } from "react";
import { fetchFilms } from "../service/filmService";

export function useFilms({ query } = {}) {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedQuery = useMemo(() => (typeof query === "string" ? query.trim() : ""), [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFilms({ query: normalizedQuery })
      .then((data) => {
        if (cancelled) return;
        setFilms(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e);
        setFilms([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedQuery]);

  return { films, loading, error };
}

