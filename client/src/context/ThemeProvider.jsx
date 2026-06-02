import { useState, useEffect, useCallback } from "react";
import { ThemeContext } from "./ThemeContext";

const THEMES = ["light", "dark"];

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "dark";

    const stored = localStorage.getItem("app-theme");

    if (THEMES.includes(stored)) return stored;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    return prefersDark ? "dark" : "light";
  };

  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }

    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const setTheme = useCallback((value) => {
    if (!THEMES.includes(value)) return;
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
