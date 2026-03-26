import { useEffect, useState } from "react";
import { fetchFilmById } from "../service/filmService";

export function useFilm(id) {
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFilmById(id)
      .then((data) => {
        if (cancelled) return;
        setFilm(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e);
        setFilm(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { film, loading, error };
}

