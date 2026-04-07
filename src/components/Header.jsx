import { useMemo, useState } from "react";
import { Heart, Menu, Search, User } from "lucide-react";
import PropTypes from "prop-types";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import SearchModal from "./SearchModal";
import { useAuth } from "../state/auth";
import { useFavorites } from "../state/favorites";
import { useLocale } from "../state/locale";

export default function Header({ onToggleMobileMenu }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { favoriteIds } = useFavorites();
  const { locale, setLocale, t } = useLocale();

  const navItems = useMemo(() => [
    { label: t("common.home"), to: "/" },
    { label: t("common.movies"), to: "/movies" },
    { label: t("common.series"), to: "/series" },
    { label: t("common.trailers"), to: "/trailers" },
  ], [t]);

  const userInitials = useMemo(() => {
    const nameSource = user?.user_metadata?.full_name || user?.email || "MC";

    return String(nameSource)
      .split(/\s+|@/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  const handleProfileClick = () => {
    navigate(isAuthenticated ? "/profile" : "/auth?mode=signin");
  };

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="header__logo">
            <span className="header__logo-mark">Manas</span>
            <span className="header__logo-sub">Cinema</span>
          </Link>

          <nav className="header__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `header__nav-link ${isActive ? "header__nav-link--active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <button
              type="button"
              className="icon-button"
              aria-label={t("common.searchAria")}
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={18} />
            </button>
            <NavLink
              to="/favorites"
              className={location.pathname.startsWith("/favorites") ? "icon-button icon-button--active icon-button--favorites" : "icon-button icon-button--favorites"}
              aria-label={t("common.favorites")}
            >
              <Heart size={18} />
              {favoriteIds.length > 0 && <span className="icon-button__badge">{favoriteIds.length}</span>}
            </NavLink>
            <div className="locale-switcher" aria-label={t("common.language")}>
              <button
                type="button"
                className={locale === "ru" ? "locale-switcher__button locale-switcher__button--active" : "locale-switcher__button"}
                onClick={() => setLocale("ru")}
              >
                RU
              </button>
              <button
                type="button"
                className={locale === "ky" ? "locale-switcher__button locale-switcher__button--active" : "locale-switcher__button"}
                onClick={() => setLocale("ky")}
              >
                KY
              </button>
            </div>
            <button type="button" className="icon-button icon-button--profile" aria-label={t("common.profileAria")} onClick={handleProfileClick}>
              {isAuthenticated ? <span className="icon-button__initials">{userInitials}</span> : <User size={18} />}
            </button>
            <button
              type="button"
              className="icon-button header__menu-button"
              aria-label={t("common.openMenu")}
              onClick={onToggleMobileMenu}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onMovieSelect={() => setIsSearchOpen(false)}
      />
    </>
  );
}

Header.propTypes = {
  onToggleMobileMenu: PropTypes.func.isRequired,
};
