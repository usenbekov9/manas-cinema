import { Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useLocale } from "../state/locale";

export default function Footer() {
  const { locale, setLocale, t } = useLocale();
  const { isAuthenticated } = useAuth();

  const exploreLinks = [
    { label: t("common.home"), to: "/" },
    { label: t("common.movies"), to: "/movies" },
    { label: t("common.series"), to: "/series" },
    { label: t("common.trailers"), to: "/trailers" },
  ];

  const accountLinks = [
    { label: t("common.favorites"), to: "/favorites" },
    { label: t("common.profile"), to: isAuthenticated ? "/profile" : "/auth?mode=signin" },
    { label: t("common.search"), to: "/search" },
  ];

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <strong>Manas Cinema</strong>
            <span>{t("footer.tagline")}</span>
            <p className="footer__description">{t("footer.description")}</p>
          </div>

          <div className="footer__group">
            <div className="footer__title">{t("footer.explore")}</div>
            <div className="footer__links">
              {exploreLinks.map((item) => (
                <Link key={item.to} to={item.to} className="footer__link">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer__group">
            <div className="footer__title">{t("footer.account")}</div>
            <div className="footer__links">
              {accountLinks.map((item) => (
                <Link key={item.to} to={item.to} className="footer__link">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer__group footer__group--accent">
            <div className="footer__title">{t("footer.languageTitle")}</div>
            <p className="footer__meta">{t("footer.languageText")}</p>
            <div className="footer__locale-switcher" aria-label={t("common.language")}>
              <button
                type="button"
                className={locale === "ru" ? "footer__locale-button footer__locale-button--active" : "footer__locale-button"}
                onClick={() => setLocale("ru")}
              >
                RU
              </button>
              <button
                type="button"
                className={locale === "ky" ? "footer__locale-button footer__locale-button--active" : "footer__locale-button"}
                onClick={() => setLocale("ky")}
              >
                KY
              </button>
            </div>
            <Link to={isAuthenticated ? "/profile" : "/auth?mode=signin"} className="footer__cta">
              {isAuthenticated ? t("footer.manageAccount") : t("footer.openAccount")}
            </Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p>{t("footer.copyright")}</p>
          <span>{t("footer.bottomNote")}</span>
        </div>
      </div>
    </footer>
  );
}
