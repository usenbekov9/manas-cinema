import { ShieldCheck, Sparkles } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="stack">
      <div className="pagehead">
        <div>
          <h1 className="pagehead__title">Profile</h1>
          <div className="pagehead__sub">Account & preferences</div>
        </div>
      </div>

      <div className="profile">
        <div className="profile__card">
          <div className="profile__avatar">MC</div>
          <div className="profile__info">
            <div className="profile__name">Manas Cinema</div>
            <div className="profile__meta">
              <span className="pill">
                <Sparkles size={14} /> Premium UI
              </span>
              <span className="pill pill--muted">
                <ShieldCheck size={14} /> Supabase ready
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__title">About</div>
          <div className="panel__sub">
            This is a production-style streaming UI built with React Router, Supabase, Framer Motion,
            and handcrafted CSS.
          </div>
        </div>

        <div className="panel panel--split">
          <div>
            <div className="panel__title">Playback</div>
            <div className="panel__sub">Optimized for smooth browsing and fast interactions.</div>
          </div>
          <button className="btn btn--ghost" type="button">
            Manage
          </button>
        </div>

        <div className="panel panel--split">
          <div>
            <div className="panel__title">Notifications</div>
            <div className="panel__sub">Coming soon (optional Supabase auth).</div>
          </div>
          <button className="btn btn--ghost" type="button">
            Configure
          </button>
        </div>
      </div>
    </div>
  );
}

