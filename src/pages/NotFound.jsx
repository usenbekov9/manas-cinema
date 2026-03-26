import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <div className="notfound__card">
        <div className="notfound__title">404</div>
        <div className="notfound__sub">That page doesn’t exist.</div>
        <Link className="btn btn--primary" to="/">
          Go Home
        </Link>
      </div>
    </div>
  );
}

