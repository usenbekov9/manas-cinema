import PropTypes from "prop-types";
import { useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./pages/Home";
import MoviesPage from "./pages/Movies";
import SeriesPage from "./pages/Series";
import FavoritesPage from "./pages/Favorites";
import MovieDetailsPage from "./pages/MovieDetails";
import ProfilePage from "./pages/Profile";
import AuthPage from "./pages/Auth";
import NotFoundPage from "./pages/NotFound";
import SearchPage from "./pages/Search";
import TrailersPage from "./pages/Trailers";
import { useAuth } from "./state/auth";
import { useLocale } from "./state/locale";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLocale();

  if (isLoading) {
    return <main className="page"><div className="container empty-state">{t("app.loadingAccount")}</div></main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=signin" replace />;
  }

  return children;
}

export default function App() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { t } = useLocale();

  const closeMenu = () => setShowMobileMenu(false);

  return (
    <ErrorBoundary>
      <div className="app">
        <Header onToggleMobileMenu={() => setShowMobileMenu((prev) => !prev)} />

        {showMobileMenu && (
          <div className="mobile-menu">
            <div className="container mobile-menu__inner">
              <NavLink to="/" onClick={closeMenu}>
                {t("common.home")}
              </NavLink>
              <NavLink to="/movies" onClick={closeMenu}>
                {t("common.movies")}
              </NavLink>
              <NavLink to="/series" onClick={closeMenu}>
                {t("common.series")}
              </NavLink>
              <NavLink to="/trailers" onClick={closeMenu}>
                {t("common.trailers")}
              </NavLink>
              <NavLink to="/favorites" onClick={closeMenu}>
                {t("common.favorites")}
              </NavLink>
              <NavLink to="/profile" onClick={closeMenu}>
                {t("common.profile")}
              </NavLink>
            </div>
          </div>
        )}

        <Routes>
          <Route index element={<HomePage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="series" element={<SeriesPage />} />
          <Route path="trailers" element={<TrailersPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route
            path="profile"
            element={(
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            )}
          />
          <Route path="movies/:id" element={<MovieDetailsPage />} />
          <Route path="watch/:id" element={<MovieDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
