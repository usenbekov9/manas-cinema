import { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import MoviesPage from "./pages/Movies";
import SeriesPage from "./pages/Series";
import FavoritesPage from "./pages/Favorites";
import MovieDetailsPage from "./pages/MovieDetails";

export default function App() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const closeMenu = () => setShowMobileMenu(false);

  return (
    <div className="app">
      <Header onToggleMobileMenu={() => setShowMobileMenu((prev) => !prev)} />

      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="container mobile-menu__inner">
            <NavLink to="/" onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/movies" onClick={closeMenu}>
              Movies
            </NavLink>
            <NavLink to="/series" onClick={closeMenu}>
              Series
            </NavLink>
            <NavLink to="/favorites" onClick={closeMenu}>
              Favorites
            </NavLink>
          </div>
        </div>
      )}

      <Routes>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="movies/:id" element={<MovieDetailsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      <Footer />
    </div>
  );
}
