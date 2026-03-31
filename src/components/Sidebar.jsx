import { Heart, Home, ListVideo, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/movies", label: "Movies", Icon: ListVideo },
  { to: "/favorites", label: "Favorites", Icon: Heart },
  { to: "/profile", label: "Profile", Icon: User },
];

function SideNav({ variant }) {
  return (
    <nav className={variant === "bottom" ? "sidenav sidenav--bottom" : "sidenav"}>
      <div className="brand">
        <div className="brand__mark" aria-hidden="true" />
      </div>

      <div className="sidenav__links">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "navitem navitem--active" : "navitem")}
            title={label}
          >
            <Icon size={20} />
            <span className="srOnly">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function Sidebar() {
  return (
    <>
      <aside className="sidebar">
        <SideNav />
      </aside>
      <aside className="bottomnav" aria-label="Bottom navigation">
        <SideNav variant="bottom" />
      </aside>
    </>
  );
}