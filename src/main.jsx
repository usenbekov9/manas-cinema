import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import App from "./App.jsx";
import { AuthProvider } from "./state/auth.jsx";
import { LocaleProvider } from "./state/locale.jsx";
import { FavoritesProvider } from "./state/favorites.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <AuthProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>
);
