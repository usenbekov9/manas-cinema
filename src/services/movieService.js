import { supabase } from "./supabaseClient";

const FAVORITES_KEY = "manas-cinema-favorites";
const HISTORY_KEY = "manas-cinema-history";
const PROGRESS_KEY = "manas-cinema-progress";
const FAVORITES_EVENT = "manas-cinema:favorites-changed";
const HISTORY_EVENT = "manas-cinema:history-changed";
const PROGRESS_EVENT = "manas-cinema:progress-changed";
const HISTORY_MAX = 50;

const filmCache = {
  data: null,
  promise: null,
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function isSameFilmId(left, right) {
  if (left == null || right == null) {
    return false;
  }

  return String(left) === String(right);
}

export function hasFilmId(ids, id) {
  return safeArray(ids).some((item) => isSameFilmId(item, id));
}

function emitLibraryEvent(name, detail) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function readStorageArray(key) {
  if (!isBrowser()) {
    return [];
  }

  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return [];
    }

    return safeArray(JSON.parse(value));
  } catch {
    return [];
  }
}

function writeStorageArray(key, value) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function readStorageObject(key) {
  if (!isBrowser()) {
    return {};
  }

  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return {};
    }

    return safeObject(JSON.parse(value));
  } catch {
    return {};
  }
}

function writeStorageObject(key, value) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function uniqueFilmIds(ids) {
  return safeArray(ids).reduce((result, id) => {
    if (id == null || hasFilmId(result, id)) {
      return result;
    }

    result.push(id);
    return result;
  }, []);
}

function cacheFilms(films) {
  filmCache.data = safeArray(films);
  return filmCache.data;
}

function upsertCachedFilm(film) {
  if (!film || !filmCache.data) {
    return;
  }

  const next = [...filmCache.data];
  const index = next.findIndex((item) => isSameFilmId(item.id, film.id));

  if (index === -1) {
    next.push(film);
  } else {
    next[index] = film;
  }

  filmCache.data = next;
}

function rankFilmMatch(film, query) {
  const title = String(film?.title ?? "").toLowerCase();
  const description = String(film?.description ?? "").toLowerCase();
  const genre = String(film?.genre ?? "").toLowerCase();
  const type = String(film?.type ?? "").toLowerCase();

  let score = 0;

  if (title === query) score += 100;
  if (title.startsWith(query)) score += 60;
  if (title.includes(query)) score += 40;
  if (genre.includes(query)) score += 20;
  if (type.includes(query)) score += 10;
  if (description.includes(query)) score += 5;

  return score;
}

function pickFilmField(movie, keys) {
  for (const key of keys) {
    const value = movie?.[key];

    if (value === 0) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function parseNumericValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(",", ".").match(/\d+(?:\.\d+)?/);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeEmbedUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      const videoId = host.includes("youtu.be")
        ? parsedUrl.pathname.replace(/^\//, "")
        : parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host.includes("vimeo.com")) {
      const segments = parsedUrl.pathname.split("/").filter(Boolean);
      const videoId = segments.at(-1);

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

function getUrlExtension(url) {
  try {
    const { pathname } = new URL(url);
    return pathname.split(".").at(-1)?.toLowerCase() ?? "";
  } catch {
    return url.split("?")[0].split(".").at(-1)?.toLowerCase() ?? "";
  }
}

function buildMediaSource(rawSource) {
  if (!rawSource || typeof rawSource !== "string") {
    return null;
  }

  const src = normalizeEmbedUrl(rawSource);
  const extension = getUrlExtension(src);
  const isDirectVideo = ["mp4", "webm", "ogg", "mov", "m3u8"].includes(extension);
  const isEmbed = /youtube\.com\/embed|player\.vimeo\.com|iframe|embed|player/i.test(src);

  return {
    src,
    type: isDirectVideo ? "video" : isEmbed ? "iframe" : "iframe",
  };
}

function setWatchHistoryEntries(entries) {
  const next = safeArray(entries)
    .filter((item) => item?.movieId != null && Number.isFinite(Number(item.timestamp)))
    .map((item) => ({
      movieId: item.movieId,
      timestamp: Number(item.timestamp),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  writeStorageArray(HISTORY_KEY, next);
  emitLibraryEvent(HISTORY_EVENT, next);
  return next;
}

function subscribeToStorageValue(key, eventName, readValue, listener) {
  if (!isBrowser()) {
    return () => {};
  }

  const handleCustomEvent = (event) => {
    listener(event.detail);
  };

  const handleStorageEvent = (event) => {
    if (event.key === key) {
      listener(readValue());
    }
  };

  window.addEventListener(eventName, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(eventName, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

function subscribeToStorageArray(key, eventName, readValue, listener) {
  return subscribeToStorageValue(key, eventName, readValue, (value) => listener(safeArray(value)));
}

function normalizeProgressValue(progress) {
  const value = Number(progress);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

// ===== FETCH FILMS =====
export async function getAllFilms(options = {}) {
  const { force = false } = options;

  if (!force && filmCache.data) {
    return filmCache.data;
  }

  if (!force && filmCache.promise) {
    return filmCache.promise;
  }

  filmCache.promise = supabase
    .from("films")
    .select("*")
    .then(({ data, error }) => {
      if (error) {
        throw new Error(error.message || "Failed to fetch films");
      }

      return cacheFilms(data);
    })
    .finally(() => {
      filmCache.promise = null;
    });

  return filmCache.promise;
}

export async function getFilmById(id) {
  const cachedFilm = filmCache.data?.find((item) => isSameFilmId(item.id, id));

  if (cachedFilm) {
    return cachedFilm;
  }

  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to fetch movie details");
  }

  if (!data) {
    throw new Error("Movie not found");
  }

  upsertCachedFilm(data);

  return data;
}

export async function searchFilms(query) {
  const normalizedQuery = typeof query === "string" ? query.trim().toLowerCase() : "";

  if (!normalizedQuery) {
    return [];
  }

  const allFilms = await getAllFilms();

  return allFilms
    .filter((film) => rankFilmMatch(film, normalizedQuery) > 0)
    .sort((left, right) => {
      const scoreDiff = rankFilmMatch(right, normalizedQuery) - rankFilmMatch(left, normalizedQuery);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return String(left?.title ?? "").localeCompare(String(right?.title ?? ""));
    });
}

export async function getFilmsByType(type) {
  const normalizedType = String(type ?? "").trim().toLowerCase();

  if (!normalizedType) {
    return [];
  }

  const allFilms = await getAllFilms();

  return allFilms.filter((film) => String(film?.type ?? "").toLowerCase() === normalizedType);
}

// ===== FAVORITES =====
export function getFavoriteIds() {
  return uniqueFilmIds(readStorageArray(FAVORITES_KEY));
}

export function setFavoriteIds(ids) {
  const next = uniqueFilmIds(ids);
  writeStorageArray(FAVORITES_KEY, next);
  emitLibraryEvent(FAVORITES_EVENT, next);
  return next;
}

export function toggleFavorite(id) {
  const current = getFavoriteIds();
  const hasItem = hasFilmId(current, id);
  const next = hasItem
    ? current.filter((itemId) => !isSameFilmId(itemId, id))
    : [...current, id];

  return setFavoriteIds(next);
}

export function subscribeToFavoriteIds(listener) {
  return subscribeToStorageArray(FAVORITES_KEY, FAVORITES_EVENT, getFavoriteIds, listener);
}

// ===== WATCH HISTORY =====
export function getWatchHistory() {
  return safeArray(readStorageArray(HISTORY_KEY))
    .filter((item) => item?.movieId != null && Number.isFinite(Number(item.timestamp)))
    .map((item) => ({
      movieId: item.movieId,
      timestamp: Number(item.timestamp),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function addToWatchHistory(movieId) {
  if (movieId == null) {
    return getWatchHistory();
  }

  const history = getWatchHistory();

  const filtered = history.filter((item) => !isSameFilmId(item.movieId, movieId));
  const updated = [
    { movieId, timestamp: Date.now() },
    ...filtered,
  ].slice(0, HISTORY_MAX);

  return setWatchHistoryEntries(updated);
}

export function clearWatchHistory() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(HISTORY_KEY);
  emitLibraryEvent(HISTORY_EVENT, []);
}

export function subscribeToWatchHistory(listener) {
  return subscribeToStorageArray(HISTORY_KEY, HISTORY_EVENT, getWatchHistory, listener);
}

// ===== WATCH PROGRESS =====
export function getWatchProgressMap() {
  return Object.entries(readStorageObject(PROGRESS_KEY)).reduce((result, [movieId, progress]) => {
    const normalizedProgress = normalizeProgressValue(progress);

    if (normalizedProgress > 0) {
      result[movieId] = normalizedProgress;
    }

    return result;
  }, {});
}

export function getWatchProgress(movieId) {
  if (movieId == null) {
    return 0;
  }

  const progressMap = getWatchProgressMap();
  return progressMap[String(movieId)] ?? 0;
}

export function setWatchProgress(movieId, progress) {
  if (movieId == null) {
    return getWatchProgressMap();
  }

  const key = String(movieId);
  const nextProgress = normalizeProgressValue(progress);
  const nextMap = {
    ...getWatchProgressMap(),
  };

  if (nextProgress <= 0) {
    delete nextMap[key];
  } else {
    nextMap[key] = nextProgress;
  }

  writeStorageObject(PROGRESS_KEY, nextMap);
  emitLibraryEvent(PROGRESS_EVENT, nextMap);
  return nextMap;
}

export function subscribeToWatchProgress(listener) {
  return subscribeToStorageValue(PROGRESS_KEY, PROGRESS_EVENT, getWatchProgressMap, (value) => listener(safeObject(value)));
}

// ===== UTILITIES =====
export function getFilmRating(movie) {
  const value = pickFilmField(movie, [
    "rating",
    "avg_rating",
    "average_rating",
    "imdb_rating",
    "kp_rating",
    "score",
    "film_rating",
    "stars",
    "rate",
  ]);

  return parseNumericValue(value);
}

export function getFilmRatingLabel(movie) {
  const rating = getFilmRating(movie);
  return rating == null ? "-" : rating.toFixed(1);
}

export function getFilmVoteCount(movie) {
  const value = pickFilmField(movie, [
    "votes",
    "votes_count",
    "ratingCount",
    "rating_count",
    "review_count",
    "reviews_count",
    "vote_count",
  ]);

  const count = parseNumericValue(value);
  return count == null ? null : Math.round(count);
}

export function getFilmPlayerSource(movie) {
  const rawSource = pickFilmField(movie, [
    "video_url",
    "videoUrl",
    "stream_url",
    "streamUrl",
    "player_url",
    "playerUrl",
    "iframe_url",
    "iframeUrl",
    "embed_url",
    "embedUrl",
    "watch_url",
    "watchUrl",
    "source_url",
    "sourceUrl",
    "video",
    "stream",
    "src",
    "url",
  ]);

  return buildMediaSource(rawSource);
}

export function getFilmTrailerSource(movie) {
  const rawSource = pickFilmField(movie, [
    "trailer_url",
    "trailerUrl",
    "trailer",
    "preview_url",
    "previewUrl",
    "preview",
    "teaser_url",
    "teaserUrl",
    "teaser",
    "promo_url",
    "promoUrl",
    "promo",
    "youtube_url",
    "youtubeUrl",
    "youtube",
    "trailer_link",
    "trailerLink",
  ]);

  return buildMediaSource(rawSource);
}

export function getAutoplayMediaSource(source, autoplay = false) {
  if (!source) {
    return null;
  }

  if (!autoplay || source.type !== "iframe") {
    return source;
  }

  try {
    const url = new URL(source.src);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("muted", "1");
    url.searchParams.set("mute", "1");

    if (url.hostname.includes("youtube.com")) {
      url.searchParams.set("rel", "0");
    }

    return {
      ...source,
      src: url.toString(),
    };
  } catch {
    return source;
  }
}

export function parseGenres(movie) {
  if (!movie?.genre) return [];
  return String(movie.genre)
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}
