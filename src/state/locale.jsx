/* eslint-disable react-refresh/only-export-components */

import PropTypes from "prop-types";
import { createContext, useContext, useMemo, useState } from "react";
import { messages } from "../translations/messages";

const STORAGE_KEY = "manas-cinema-locale";

function readStoredLocale() {
  if (typeof window === "undefined") {
    return "ru";
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "ky" ? "ky" : "ru";
}

function getMessage(locale, key) {
  return key.split(".").reduce((result, segment) => result?.[segment], messages[locale]);
}

function interpolate(template, vars) {
  if (typeof template !== "string") {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars?.[name] ?? `{${name}}`));
}

export const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setLocale = (nextLocale) => {
    const safeLocale = nextLocale === "ky" ? "ky" : "ru";
    setLocaleState(safeLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, safeLocale);
    }
  };

  const value = useMemo(() => {
    const t = (key, vars) => {
      const message = getMessage(locale, key) ?? getMessage("ru", key) ?? key;
      return interpolate(message, vars);
    };

    return {
      locale,
      setLocale,
      t,
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

LocaleProvider.propTypes = {
  children: PropTypes.node,
};

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}