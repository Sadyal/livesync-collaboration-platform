import { createContext, useState, useEffect, useCallback } from "react";

// Allowed themes (future scalable)
const THEMES = ["light", "dark"];

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // ==========================================
  // INITIAL THEME (SSR + SYSTEM SAFE)
  // ==========================================
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "dark";

    const stored = localStorage.getItem("app-theme");

    if (THEMES.includes(stored)) return stored;

    // 🌙 System preference fallback
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    return prefersDark ? "dark" : "light";
  };

  const [theme, setThemeState] = useState(getInitialTheme);

  // ==========================================
  // APPLY THEME TO DOM
  // ==========================================
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme"); // dark is default
    }

    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // ==========================================
  // SET THEME (SAFE)
  // ==========================================
  const setTheme = useCallback((value) => {
    if (!THEMES.includes(value)) return;
    setThemeState(value);
  }, []);

  // ==========================================
  // TOGGLE
  // ==========================================
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  const value = {
    theme,
    setTheme,      // 🔥 new (important)
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};