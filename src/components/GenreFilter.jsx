import PropTypes from "prop-types";
import { useLocale } from "../state/locale";

const genres = ["All", "Action", "Adventure", "Animation", "Sci-Fi", "Crime", "Comedy", "Thriller"];

export default function GenreFilter({ activeGenre, onChange }) {
  const { t } = useLocale();

  return (
    <section className="genre-filter">
      <div className="container">
        <div className="genre-filter__list">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`genre-filter__item ${activeGenre === genre ? "genre-filter__item--active" : ""}`}
              onClick={() => onChange(genre)}
            >
              {t(`genres.${genre}`)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

GenreFilter.propTypes = {
  activeGenre: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
