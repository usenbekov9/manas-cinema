import { useEffect, useReducer } from "react";
import { fetchFilmById } from "../service/filmService";

export function useFilm(id) {
  const [{ film, loading, error }, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "start":
          return { film: null, loading: true, error: null };
        case "success":
          return { film: action.film, loading: false, error: null };
        case "error":
          return { film: null, loading: false, error: action.error };
        default:
          return state;
      }
    },
    {
      film: null,
      loading: true,
      error: null,
    }
  );

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });

    fetchFilmById(id)
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: "success", film: data });
      })
      .catch((e) => {
        if (cancelled) return;
        dispatch({ type: "error", error: e });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { film, loading, error };
}

