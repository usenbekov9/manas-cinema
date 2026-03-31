import { supabase } from "./supabaseClient";

// const FAVORITES_KEY = "manas-cinema-favorites";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export async function getAllFilms() {
  const { data, error } = await supabase
    .from("films")
    .select("*")

  if (error) {
    throw new Error(error.message || "Failed to fetch films");
  }

  return safeArray(data);
}

export async function getFilmById(id) {
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message || "Failed to fetch movie details");
  }

  return data;
}

export function parseGenres(movie) {
  if (!movie?.genre) return [];
  return String(movie.genre)
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

export function getFavoriteIds() {
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return safeArray(parsed);
  } catch {
    return [];
  }
}

export function toggleFavorite(id) {
  const current = getFavoriteIds();
  const hasItem = current.includes(id);
  const next = hasItem ? current.filter((itemId) => itemId !== id) : [...current, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}
