import { Film, HeartCrack } from "lucide-react";

export function LoadingBlock({ title = "Loading…" }) {
  return (
    <div className="state">
      <div className="spinner" aria-hidden="true" />
      <div className="state__title">{title}</div>
      <div className="state__sub">Fetching the latest catalog.</div>
    </div>
  );
}

export function EmptyBlock({ title = "Nothing here yet", subtitle = "Try a different search." }) {
  return (
    <div className="state">
      <Film size={22} className="state__icon" />
      <div className="state__title">{title}</div>
      <div className="state__sub">{subtitle}</div>
    </div>
  );
}

export function EmptyFavorites() {
  return (
    <div className="state">
      <HeartCrack size={22} className="state__icon" />
      <div className="state__title">No favorites yet</div>
      <div className="state__sub">Tap the heart on a movie to save it.</div>
    </div>
  );
}

