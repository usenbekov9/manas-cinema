import { Film, HeartCrack } from "lucide-react";
import PropTypes from "prop-types";
import { useLocale } from "../state/locale";

export function LoadingBlock({ title }) {
  const { t } = useLocale();

  return (
    <div className="state">
      <div className="spinner" aria-hidden="true" />
      <div className="state__title">{title || t("states.loading")}</div>
      <div className="state__sub">{t("states.loadingSub")}</div>
    </div>
  );
}

export function EmptyBlock({ title, subtitle }) {
  const { t } = useLocale();

  return (
    <div className="state">
      <Film size={22} className="state__icon" />
      <div className="state__title">{title || t("states.empty")}</div>
      <div className="state__sub">{subtitle || t("states.emptySub")}</div>
    </div>
  );
}

export function EmptyFavorites() {
  const { t } = useLocale();

  return (
    <div className="state">
      <HeartCrack size={22} className="state__icon" />
      <div className="state__title">{t("states.noFavorites")}</div>
      <div className="state__sub">{t("states.noFavoritesSub")}</div>
    </div>
  );
}

LoadingBlock.propTypes = {
  title: PropTypes.string,
};

EmptyBlock.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

