import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const Theme = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type Theme = (typeof Theme)[keyof typeof Theme];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return Theme.SYSTEM;
    return (localStorage.getItem("theme") as Theme) ?? Theme.SYSTEM;
  });

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t: Theme) {
      if (t === Theme.SYSTEM) {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", t === Theme.DARK);
      }
    }

    applyTheme(theme);

    if (theme === Theme.SYSTEM) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme(Theme.SYSTEM);
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
