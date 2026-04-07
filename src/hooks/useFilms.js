import { useEffect, useMemo, useReducer } from "react";
import { fetchFilms } from "../service/filmService";

export function useFilms({ query } = {}) {
  const [{ films, loading, error }, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "start":
          return { films: [], loading: true, error: null };
        case "success":
          return { films: Array.isArray(action.films) ? action.films : [], loading: false, error: null };
        case "error":
          return { films: [], loading: false, error: action.error };
        default:
          return state;
      }
    },
    {
      films: [],
      loading: true,
      error: null,
    }
  );

  const normalizedQuery = useMemo(() => (typeof query === "string" ? query.trim() : ""), [query]);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });

    fetchFilms({ query: normalizedQuery })
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: "success", films: data });
      })
      .catch((e) => {
        if (cancelled) return;
        dispatch({ type: "error", error: e });
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedQuery]);

  return { films, loading, error };
}

