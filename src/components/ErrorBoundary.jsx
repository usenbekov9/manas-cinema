import { Component } from "react";
import PropTypes from "prop-types";
import { LocaleContext } from "../state/locale";

class ErrorBoundary extends Component {
  static contextType = LocaleContext;

  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const t = this.context?.t ?? ((key) => key);

      return (
        <div className="error-boundary">
          <div className="container error-boundary__content">
            <h1>{t("error.title")}</h1>
            <p>{this.state.error?.message || t("error.fallback")}</p>
            <button
              className="btn btn--primary"
              onClick={() => this.setState({ hasError: false })}
            >
              {t("error.action")}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default ErrorBoundary;
