import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page notfound">
      <div className="container notfound__container">
        <div className="notfound__card" role="status" aria-live="polite">
          <h1 className="notfound__title">404</h1>
          <h2 className="notfound__subtitle">Page Not Found</h2>
          <p className="notfound__description">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link className="btn btn--primary notfound__action" to="/">
            Go Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}

