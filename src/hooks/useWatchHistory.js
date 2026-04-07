import { useEffect, useState } from "react";
import { getWatchHistory, subscribeToWatchHistory } from "../services/movieService";

export function useWatchHistory() {
  const [watchHistory, setWatchHistory] = useState(() => getWatchHistory());

  useEffect(() => subscribeToWatchHistory(setWatchHistory), []);

  return watchHistory;
}