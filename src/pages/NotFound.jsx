import { Link } from "react-router-dom";
import { useLocale } from "../state/locale";

export default function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div className="notfound">
      <div className="notfound__card">
        <div className="notfound__title">404</div>
        <div className="notfound__sub">{t("notFound.subtitle")}</div>
        <Link className="btn btn--primary" to="/">
          {t("notFound.action")}
        </Link>
      </div>
    </div>
  );
}

