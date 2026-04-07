import { Link } from "react-router-dom";
import { useLocale } from "../state/locale";

export default function NotFoundPage() {
  const { t } = useLocale();

  return (
    <main className="page notfound">
      <div className="container notfound__container">
        <div className="notfound__card" role="status" aria-live="polite">
          <h1 className="notfound__title">404</h1>
          <h2 className="notfound__subtitle">{t("notFound.heading")}</h2>
          <p className="notfound__description">{t("notFound.description")}</p>
          <Link className="btn btn--primary notfound__action" to="/">
            {t("notFound.action")}
          </Link>
        </div>
      </div>
    </main>
  );
}
