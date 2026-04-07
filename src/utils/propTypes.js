import PropTypes from "prop-types";

export const filmShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  genre: PropTypes.string,
  type: PropTypes.string,
});