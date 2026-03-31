import { Menu, Search, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "Series", to: "/series" },
  { label: "Trailers", to: "/movies" },
];

export default function Header({ onToggleMobileMenu }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          NeonFlix
        </Link>

        <nav className="header__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `header__nav-link ${isActive ? "header__nav-link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <button type="button" className="icon-button" aria-label="Search">
            <Search size={18} />
          </button>
          <button type="button" className="icon-button" aria-label="Profile">
            <User size={18} />
          </button>
          <button
            type="button"
            className="icon-button header__menu-button"
            aria-label="Open menu"
            onClick={onToggleMobileMenu}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
