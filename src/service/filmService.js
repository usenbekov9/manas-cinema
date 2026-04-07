import { getAllFilms, getFilmById, searchFilms } from "../services/movieService";

export async function fetchFilms({ query } = {}) {
  if (typeof query === "string" && query.trim()) {
    return searchFilms(query);
  }

  return getAllFilms();
}

export async function fetchFilmById(id) {
  try {
    return await getFilmById(id);
  } catch {
    return null;
  }
}