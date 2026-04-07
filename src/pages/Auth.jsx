import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useLocale } from "../state/locale";

function getSafeMode(value) {
  return value === "signup" || value === "reset" ? value : "signin";
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = getSafeMode(searchParams.get("mode"));
  const { isAuthenticated, isLoading, signIn, signUp, resetPassword } = useAuth();
  const { t } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSubmitError("");
    setSuccessMessage("");
  }, [mode]);

  const config = useMemo(() => ({
    signin: {
      title: t("auth.titleSignin"),
      subtitle: t("auth.subtitleSignin"),
      buttonLabel: t("auth.buttonSignin"),
    },
    signup: {
      title: t("auth.titleSignup"),
      subtitle: t("auth.subtitleSignup"),
      buttonLabel: t("auth.buttonSignup"),
    },
    reset: {
      title: t("auth.titleReset"),
      subtitle: t("auth.subtitleReset"),
      buttonLabel: t("auth.buttonReset"),
    },
  })[mode], [mode, t]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const updateMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    next.set("mode", nextMode);
    setSearchParams(next, { replace: true });
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (!form.email.trim()) {
        throw new Error(t("auth.emailRequired"));
      }

      if (mode === "reset") {
        await resetPassword(form.email.trim());
        setSuccessMessage(t("auth.resetSent"));
        return;
      }

      if (!form.password.trim()) {
        throw new Error(t("auth.passwordRequired"));
      }

      if (mode === "signup") {
        await signUp({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
        });

        setSuccessMessage(t("auth.accountCreated"));
        updateMode("signin");
        return;
      }

      await signIn({
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/profile", { replace: true });
    } catch (error) {
      setSubmitError(error?.message || t("auth.authFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <div className="container auth-layout auth-layout--compact">
        <section className="auth-card">
          <div className="auth-card__switcher" role="tablist" aria-label={t("auth.modeAria")}>
            <button
              type="button"
              className={mode === "signin" ? "auth-tab auth-tab--active" : "auth-tab"}
              onClick={() => updateMode("signin")}
            >
              {t("auth.buttonSignin")}
            </button>
            <button
              type="button"
              className={mode === "signup" ? "auth-tab auth-tab--active" : "auth-tab"}
              onClick={() => updateMode("signup")}
            >
              {t("auth.register")}
            </button>
            <button
              type="button"
              className={mode === "reset" ? "auth-tab auth-tab--active" : "auth-tab"}
              onClick={() => updateMode("reset")}
            >
              {t("auth.reset")}
            </button>
          </div>

          <div className="auth-card__header">
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className="auth-field">
                <span>{t("auth.name")}</span>
                <div className="auth-input">
                  <UserRound size={18} />
                  <input
                    type="text"
                    placeholder={t("auth.yourName")}
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span>{t("auth.email")}</span>
              <div className="auth-input">
                <Mail size={18} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>
            </label>

            {mode !== "reset" && (
              <label className="auth-field">
                <span>{t("auth.password")}</span>
                <div className="auth-input">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder={t("auth.enterPassword")}
                    value={form.password}
                    onChange={handleChange("password")}
                  />
                  <button
                    type="button"
                    className="auth-input__toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            {submitError && <div className="auth-message auth-message--error">{submitError}</div>}
            {successMessage && <div className="auth-message auth-message--success">{successMessage}</div>}

            <button type="submit" className="btn btn--primary auth-form__submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? t("auth.pleaseWait") : config.buttonLabel}
            </button>
          </form>

          <div className="auth-card__footer">
            {mode === "signin" && (
              <button type="button" className="watch-link-button" onClick={() => updateMode("reset")}>
                {t("auth.forgotPassword")}
              </button>
            )}
            {mode !== "signin" && (
              <button type="button" className="watch-link-button" onClick={() => updateMode("signin")}>
                {t("auth.backToSignIn")}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}