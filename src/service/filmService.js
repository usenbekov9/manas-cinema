import { supabase } from "../supabase/supabase";

export async function fetchFilms({ query } = {}) {
  const q = typeof query === "string" ? query.trim() : "";

  let request = supabase.from("films").select("id,title,description,image").order("id", {
    ascending: false,
  });

  // Optional: server-side search for large catalogs (requires text fields).
  if (q) {
    request = request.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, error } = await request;

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};

export async function fetchFilmById(id) {
  const { data, error } = await supabase
    .from("films")
    .select("id,title,description,image")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data ?? null;
}