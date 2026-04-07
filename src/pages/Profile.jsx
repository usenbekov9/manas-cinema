import { ShieldCheck, Sparkles, LogOut, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchHistory } from "../hooks/useWatchHistory";
import { useAuth } from "../state/auth";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";
import { clearWatchHistory } from "../services/movieService";

export default function ProfilePage() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user, signOut, isLoading, isAuthenticated } = useAuth();
  const { favoriteIds } = useFavorites();
  const watchHistory = useWatchHistory();
  const favoriteCount = favoriteIds.length;
  const historyCount = watchHistory.length;

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate("/auth?mode=signin", { replace: true });
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm(t("profile.clearConfirm"))) {
      clearWatchHistory();
    }
  };

  const userName = useMemo(() => user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("profile.anonymous"), [t, user]);
  const userInitials = useMemo(
    () =>
      userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [userName]
  );

  if (!isLoading && !isAuthenticated) {
    return (
      <main className="page">
        <div className="container profile-guest">
          <h1>{t("profile.guestTitle")}</h1>
          <p>{t("profile.guestSubtitle")}</p>
          <Link to="/auth?mode=signin" className="btn btn--primary">{t("profile.openSignIn")}</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="stack">
      <div className="pagehead">
        <div>
          <h1 className="pagehead__title">{t("profile.title")}</h1>
          <div className="pagehead__sub">{t("profile.subtitle")}</div>
        </div>
      </div>

      {!isLoading && (
        <>
          <div className="profile">
            <div className="profile__card">
              <div className="profile__avatar">{userInitials || "MC"}</div>
              <div className="profile__info">
                <div className="profile__name">{userName}</div>
                <div className="profile__meta">
                  <span className="pill">
                    <Sparkles size={14} /> {t("profile.premiumUi")}
                  </span>
                  <span className="pill pill--muted">
                    <ShieldCheck size={14} /> {t("profile.supabaseReady")}
                  </span>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel__title">{t("profile.about")}</div>
              <div className="panel__sub">{t("profile.aboutText")}</div>
            </div>

            <div className="panel panel--split">
              <div>
                <div className="panel__title">{t("profile.yourFavorites")}</div>
                <div className="panel__sub">{t("profile.itemsSaved", { count: favoriteCount })}</div>
              </div>
              <button className="btn btn--ghost" type="button" onClick={() => navigate("/favorites")}>
                {t("profile.viewAll")}
              </button>
            </div>

            <div className="panel panel--split">
              <div>
                <div className="panel__title">{t("profile.watchHistory")}</div>
                <div className="panel__sub">{t("profile.itemsWatched", { count: historyCount })}</div>
              </div>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={handleClearHistory}
                disabled={historyCount === 0}
              >
                <Trash2 size={16} />
                {t("profile.clear")}
              </button>
            </div>

            <div className="panel">
              <button className="btn btn--primary" type="button" onClick={handleLogout}>
                <LogOut size={16} />
                {isSigningOut ? t("profile.loggingOut") : t("profile.logout")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

