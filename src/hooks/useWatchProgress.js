import { useEffect, useState } from "react";
import { getWatchProgressMap, setWatchProgress, subscribeToWatchProgress } from "../services/movieService";

export function useWatchProgress(movieId) {
  const [progressMap, setProgressMap] = useState(() => getWatchProgressMap());

  useEffect(() => subscribeToWatchProgress(setProgressMap), []);

  const progress = movieId == null ? 0 : progressMap[String(movieId)] ?? 0;

  const updateProgress = (valueOrUpdater) => {
    const nextProgress = typeof valueOrUpdater === "function" ? valueOrUpdater(progress) : valueOrUpdater;
    setWatchProgress(movieId, nextProgress);
  };

  return {
    progress,
    setProgress: updateProgress,
  };
}