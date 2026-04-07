import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Heart, Play, Share2, Sparkles, Star, TriangleAlert, Users } from "lucide-react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import MovieRow from "../components/MovieRow";
import { useWatchProgress } from "../hooks/useWatchProgress";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";
import {
  getAutoplayMediaSource,
  getAllFilms,
  getFilmById,
  getFilmPlayerSource,
  getFilmRatingLabel,
  getFilmTrailerSource,
  getFilmVoteCount,
  hasFilmId,
  isSameFilmId,
  parseGenres,
  addToWatchHistory,
} from "../services/movieService";

function getListField(movie, keys) {
  return keys.reduce((result, key) => {
    const value = movie?.[key];

    if (Array.isArray(value)) {
      return result.concat(value.map((item) => String(item).trim()).filter(Boolean));
    }

    if (typeof value === "string") {
      return result.concat(value.split(/[,;|]/).map((item) => item.trim()).filter(Boolean));
    }

    return result;
  }, []);
}

function getTextField(movie, keys) {
  return keys.map((key) => movie?.[key]).find((value) => typeof value === "string" && value.trim()) ?? "";
}

function formatDuration(movie, t) {
  const value = movie?.duration ?? movie?.runtime ?? movie?.length ?? movie?.minutes;
  const minutes = Number(value);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return t("movieDetails.feature");
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) {
    return `${restMinutes}m`;
  }

  return restMinutes === 0 ? `${hours}h` : `${hours}h ${restMinutes}m`;
}

function getAgeLabel(movie) {
  return getTextField(movie, ["ageRating", "age_rating", "ageLimit", "age_limit", "certificate"]) || "12+";
}

function getAccessLabel(movie, t) {
  return getTextField(movie, ["access", "license", "plan", "subscription", "monetization"]) || t("movieDetails.subscription");
}

function getReviewItems(movie, t) {
  if (!Array.isArray(movie?.reviews)) {
    return [];
  }

  return movie.reviews
    .map((review, index) => {
      if (typeof review === "string") {
        return { id: index, author: t("movieDetails.viewer"), text: review };
      }

      if (review && typeof review === "object") {
        return {
          id: review.id ?? index,
          author: review.author ?? review.user ?? t("movieDetails.viewer"),
          text: review.text ?? review.comment ?? "",
        };
      }

      return null;
    })
    .filter((review) => review?.text);
}

function getProgressLabel(progress, t) {
  if (progress >= 100) {
    return t("movieDetails.completed");
  }

  if (progress > 0) {
    return t("movieDetails.continueFrom", { progress });
  }

  return t("movieDetails.readyToStart");
}

export default function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isWatchRoute = location.pathname.startsWith("/watch/");
  const requestedSource = searchParams.get("source") === "trailer" ? "trailer" : "main";
  const { t } = useLocale();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { progress, setProgress } = useWatchProgress(id);
  const [activeTab, setActiveTab] = useState("description");
  const [shareFeedback, setShareFeedback] = useState("");
  const [sourceSelection, setSourceSelection] = useState(() => ({ movieId: id, mode: requestedSource }));
  const playerRef = useRef(null);
  const hlsRef = useRef(null);
  const [playerError, setPlayerError] = useState(null);
  const [{ movie, allMovies, isLoading }, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "start":
          return { ...state, isLoading: true, movie: null };
        case "success":
          return {
            movie: action.movie,
            allMovies: action.allMovies,
            isLoading: false,
          };
        case "error":
          return { ...state, movie: null, isLoading: false };
        default:
          return state;
      }
    },
    {
      movie: null,
      allMovies: [],
      isLoading: true,
    }
  );

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });

    Promise.all([getFilmById(id), getAllFilms()])
      .then(([filmData, allFilmsData]) => {
        if (cancelled) {
          return;
        }

        dispatch({ type: "success", movie: filmData, allMovies: allFilmsData });
        
        if (filmData?.id) {
          addToWatchHistory(filmData.id);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch movie details:", error);
        dispatch({ type: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const relatedMovies = useMemo(() => {
    if (!movie) return [];
    const currentGenres = parseGenres(movie).map((item) => item.toLowerCase());
    return allMovies
      .filter((item) => !isSameFilmId(item.id, movie.id))
      .filter((item) => parseGenres(item).some((genre) => currentGenres.includes(genre.toLowerCase())))
      .slice(0, 10);
  }, [allMovies, movie]);

  const genres = useMemo(() => parseGenres(movie), [movie]);
  const tabItems = useMemo(() => ([
    { id: "description", label: t("movieDetails.tabDescription") },
    { id: "reviews", label: t("movieDetails.tabReviews") },
    { id: "cast", label: t("movieDetails.tabCast") },
    { id: "crew", label: t("movieDetails.tabCrew") },
  ]), [t]);
  const cast = useMemo(() => getListField(movie, ["cast", "actors", "actor", "starring"]), [movie]);
  const crew = useMemo(() => getListField(movie, ["crew", "director", "directors", "writers", "producer"]), [movie]);
  const reviews = useMemo(() => getReviewItems(movie, t), [movie, t]);
  const accessLabel = useMemo(() => getAccessLabel(movie, t), [movie, t]);
  const ageLabel = useMemo(() => getAgeLabel(movie), [movie]);
  const durationLabel = useMemo(() => formatDuration(movie, t), [movie, t]);
  const playerSource = useMemo(() => getFilmPlayerSource(movie), [movie]);
  const trailerSource = useMemo(() => getFilmTrailerSource(movie), [movie]);

  useEffect(() => {
    setSourceSelection({ movieId: id, mode: requestedSource });
  }, [id, requestedSource]);

  const activeSourceMode = sourceSelection.movieId === id
    ? sourceSelection.mode
    : playerSource
      ? "main"
      : trailerSource
        ? "trailer"
        : "main";
  const mediaSource = activeSourceMode === "trailer" ? trailerSource : playerSource;
  const playableSource = useMemo(() => getAutoplayMediaSource(mediaSource, isWatchRoute), [mediaSource, isWatchRoute]);
  const isHlsStream = Boolean(
    playableSource?.type === "video" && playableSource.src.toLowerCase().includes(".m3u8")
  );
  const sourceKey = playableSource ? `${activeSourceMode}:${playableSource.src}` : `poster:${movie?.id ?? id}`;
  const statusLabel = getProgressLabel(progress, t);
  const voteLabel = getFilmVoteCount(movie);

  useEffect(() => {
    const video = playerRef.current;
    let isActive = true;

    if (!video || playableSource?.type !== "video") {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      return undefined;
    }

    if (!isHlsStream) {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      return undefined;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playableSource.src;
      return undefined;
    }

    import("hls.js")
      .then(({ default: Hls }) => {
        if (!isActive) {
          return;
        }

        if (!Hls.isSupported()) {
          setPlayerError({
            sourceKey,
            message: t("movieDetails.hlsUnsupported"),
          });
          return;
        }

        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(playableSource.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal) {
            setPlayerError({
              sourceKey,
              message: t("movieDetails.streamFailed"),
            });
          }
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setPlayerError({
          sourceKey,
          message: t("movieDetails.hlsInitFailed"),
        });
      });

    return () => {
      isActive = false;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [isHlsStream, playableSource, sourceKey, t]);

  if (isLoading) {
    return (
      <main className="page">
        <div className="container empty-state">{t("movieDetails.loading")}</div>
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="page">
        <div className="container empty-state">{t("movieDetails.notFound")}</div>
      </main>
    );
  }

  const isFavorite = hasFilmId(favoriteIds, movie.id);

  const handleWatch = () => {
    addToWatchHistory(movie.id);
    setPlayerError(null);

    if (playableSource?.type === "video") {
      playerRef.current?.play?.().catch(() => {});
    }

    setProgress((currentProgress) => {
      if (currentProgress >= 100) {
        return 12;
      }

      return Math.min(Math.max(currentProgress, 0) + 18, 100);
    });
  };

  const handleOpenTrailer = () => {
    if (!trailerSource) {
      return;
    }

    setPlayerError(null);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("source", "trailer");
      return next;
    }, { replace: true });
    setSourceSelection({ movieId: id, mode: "trailer" });
  };

  const handleVideoLoadedMetadata = () => {
    const player = playerRef.current;

    if (!player || !Number.isFinite(player.duration) || player.duration <= 0 || progress <= 0) {
      return;
    }

    setPlayerError(null);

    player.currentTime = (progress / 100) * player.duration;
  };

  const handleVideoTimeUpdate = () => {
    const player = playerRef.current;

    if (!player || !Number.isFinite(player.duration) || player.duration <= 0) {
      return;
    }

    const nextProgress = Math.round((player.currentTime / player.duration) * 100);

    if (Math.abs(nextProgress - progress) >= 1) {
      setProgress(nextProgress);
    }
  };

  const handleFinish = () => {
    addToWatchHistory(movie.id);
    setProgress(100);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/watch/${movie.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: movie.title,
          text: movie.description,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }

      setShareFeedback(t("movieDetails.shareCopied"));
      window.setTimeout(() => setShareFeedback(""), 2000);
    } catch {
      setShareFeedback(t("movieDetails.shareUnavailable"));
      window.setTimeout(() => setShareFeedback(""), 2000);
    }
  };

  const tabContent = {
    description: (
      <div className="watch-panel__copy">
        <p>{movie.description || t("movieDetails.descriptionPending")}</p>
        <div className="watch-chip-list">
          {genres.map((genre) => (
            <span key={genre} className="watch-chip">{genre}</span>
          ))}
          <span className="watch-chip">{movie.type || t("movieDetails.feature")}</span>
          <span className="watch-chip">{accessLabel}</span>
        </div>
      </div>
    ),
    reviews: reviews.length > 0 ? (
      <div className="watch-review-list">
        {reviews.map((review) => (
          <article key={review.id} className="watch-review">
            <div className="watch-review__author">{review.author}</div>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
    ) : (
      <div className="watch-panel__empty">{t("movieDetails.noReviews")}</div>
    ),
    cast: cast.length > 0 ? (
      <div className="watch-people-grid">
        {cast.map((person) => (
          <div key={person} className="watch-person-card">{person}</div>
        ))}
      </div>
    ) : (
      <div className="watch-panel__empty">{t("movieDetails.noCast")}</div>
    ),
    crew: crew.length > 0 ? (
      <div className="watch-people-grid">
        {crew.map((person) => (
          <div key={person} className="watch-person-card">{person}</div>
        ))}
      </div>
    ) : (
      <div className="watch-panel__empty">{t("movieDetails.noCrew")}</div>
    ),
  };

  const activePlayerError = playerError?.sourceKey === sourceKey ? playerError.message : "";

  return (
    <motion.main className="page watch-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="watch-stage">
        <div className="watch-stage__backdrop" style={{ backgroundImage: `url(${movie.image})` }} aria-hidden="true" />
        <div className="container watch-stage__shell">
          <div className="watch-stage__player">
            <div className="watch-player">
              <div className="watch-player__screen">
                {playableSource?.type === "video" ? (
                  <video
                    ref={playerRef}
                    className="watch-player__media"
                    src={isHlsStream ? undefined : playableSource.src}
                    poster={movie.image}
                    controls
                    playsInline
                    autoPlay={isWatchRoute}
                    muted={isWatchRoute}
                    preload="metadata"
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleFinish}
                    onError={() => {
                      setPlayerError({
                        sourceKey,
                        message: t("movieDetails.videoFailed"),
                      });
                    }}
                  />
                ) : playableSource?.type === "iframe" ? (
                  <iframe
                    className="watch-player__media"
                    src={playableSource.src}
                    title={movie.title}
                    loading="eager"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    onError={() => {
                      setPlayerError({
                        sourceKey,
                        message: t("movieDetails.embedFailed"),
                      });
                    }}
                  />
                ) : (
                  <img className="watch-player__media" src={movie.image} alt={movie.title} />
                )}
                <div className="watch-player__overlay" />
                {!playableSource && (
                  <button type="button" className="watch-player__play" onClick={handleWatch}>
                    <Play size={22} />
                    {progress > 0 ? t("common.continue") : t("common.watch")}
                  </button>
                )}
                <div className="watch-player__caption">
                  <span>{activeSourceMode === "trailer" ? t("common.trailer") : isWatchRoute ? t("movieDetails.watchPage") : t("movieDetails.detailsPage")}</span>
                  <span>{playableSource ? statusLabel : t("movieDetails.posterOnly")}</span>
                </div>
              </div>
              {activePlayerError && (
                <div className="watch-player__error">
                  <TriangleAlert size={16} />
                  <span>{activePlayerError}</span>
                </div>
              )}
              <div className="watch-player__progress">
                <div className="watch-player__progress-bar">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="watch-player__progress-meta">
                  <span>{statusLabel}</span>
                  <span>{progress}%</span>
                </div>
                {(playerSource || trailerSource) && (
                  <div className="watch-player__sources">
                    {playerSource && (
                      <button
                        type="button"
                        className={activeSourceMode === "main" ? "watch-player__source watch-player__source--active" : "watch-player__source"}
                        onClick={() => {
                          setPlayerError(null);
                          setSearchParams((current) => {
                            const next = new URLSearchParams(current);
                            next.delete("source");
                            return next;
                          }, { replace: true });
                          setSourceSelection({ movieId: id, mode: "main" });
                        }}
                      >
                        {t("movieDetails.fullVideo")}
                      </button>
                    )}
                    {trailerSource && (
                      <button
                        type="button"
                        className={activeSourceMode === "trailer" ? "watch-player__source watch-player__source--active" : "watch-player__source"}
                        onClick={() => {
                          setPlayerError(null);
                          setSearchParams((current) => {
                            const next = new URLSearchParams(current);
                            next.set("source", "trailer");
                            return next;
                          }, { replace: true });
                          setSourceSelection({ movieId: id, mode: "trailer" });
                        }}
                      >
                        {t("common.trailer")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="watch-stage__details">
            <div className="watch-stage__eyebrow">
              <span className="watch-badge">{accessLabel}</span>
              <span className="watch-badge watch-badge--muted">{movie.type || t("search.typeMovie")}</span>
            </div>

            <h1>{movie.title}</h1>

            <div className="watch-stage__meta">
              {genres.slice(0, 2).map((genre) => (
                <span key={genre} className="watch-stage__meta-item">{genre}</span>
              ))}
              <span className="watch-stage__meta-item">{movie.year || t("movieDetails.unknownYear")}</span>
              <span className="watch-stage__meta-item">{durationLabel}</span>
              <span className="watch-stage__meta-item">{ageLabel}</span>
            </div>

            <div className="watch-stage__stats">
              <div className="watch-stat">
                <Star size={16} />
                <div>
                  <strong>{getFilmRatingLabel(movie)}</strong>
                  <span>{voteLabel ? t("movieDetails.votes", { count: voteLabel }) : t("movieDetails.audienceRating")}</span>
                </div>
              </div>
              <div className="watch-stat">
                <Clock3 size={16} />
                <div>
                  <strong>{durationLabel}</strong>
                  <span>{t("movieDetails.runtime")}</span>
                </div>
              </div>
              <div className="watch-stat">
                <Users size={16} />
                <div>
                  <strong>{cast.length || crew.length || "-"}</strong>
                  <span>{t("movieDetails.peopleAttached")}</span>
                </div>
              </div>
            </div>

            <p className="watch-stage__description">{movie.description}</p>

            <div className="watch-stage__actions">
              <button type="button" className="btn btn--primary" onClick={handleWatch}>
                <Play size={16} />
                {progress > 0 ? t("movieDetails.continueWatching") : t("movieDetails.watchNow")}
              </button>
              {trailerSource && activeSourceMode !== "trailer" && (
                <button type="button" className="btn btn--ghost" onClick={handleOpenTrailer}>
                  <Play size={16} />
                  {t("movieDetails.watchTrailer")}
                </button>
              )}
              <button
                type="button"
                className={`btn btn--ghost ${isFavorite ? "btn--favorite" : ""}`}
                onClick={() => toggleFavorite(movie.id)}
              >
                <Heart size={16} />
                {isFavorite ? t("common.saved") : t("common.save")}
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleShare}>
                <Share2 size={16} />
                {t("movieDetails.share")}
              </button>
            </div>

            <div className="watch-stage__footer">
              <div className="watch-stage__status">
                <Sparkles size={16} />
                <span>{shareFeedback || statusLabel}</span>
              </div>
              <button type="button" className="watch-link-button" onClick={handleFinish}>
                {t("movieDetails.markFinished")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="watch-tabs-section">
        <div className="container">
          <div className="watch-tabs" role="tablist" aria-label={t("movieDetails.movieDetailsSections")}>
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={tab.id === activeTab ? "watch-tab watch-tab--active" : "watch-tab"}
                aria-selected={tab.id === activeTab}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="watch-panel">{tabContent[activeTab]}</div>
        </div>
      </section>

      {trailerSource && activeSourceMode !== "trailer" && (
        <section className="watch-trailer-section">
          <div className="container">
            <div className="watch-trailer-card">
              <div className="watch-trailer-card__media">
                <img src={movie.image} alt={movie.title} />
                <button type="button" className="watch-trailer-card__play" onClick={handleOpenTrailer}>
                  <Play size={18} />
                  {t("movieDetails.watchTrailer")}
                </button>
              </div>
              <div className="watch-trailer-card__content">
                <div className="watch-badge watch-badge--muted">{t("common.trailer")}</div>
                <h2>{t("movieDetails.trailerPreviewTitle")}</h2>
                <p>{t("movieDetails.trailerPreviewText")}</p>
                <button type="button" className="btn btn--ghost" onClick={handleOpenTrailer}>
                  <Play size={16} />
                  {t("movieDetails.watchTrailer")}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {relatedMovies.length > 0 && (
        <MovieRow
          title={t("movieDetails.recommendations")}
          movies={relatedMovies}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </motion.main>
  );
}
