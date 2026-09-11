"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const THEMES = ["dark", "light", "red"] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "outfit-theme";
const DEFAULT_THEME: Theme = "red";

type Ctx = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeContext = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // Read after mount rather than during render: the inline script in the
  // document head has already painted the right theme, so this only syncs
  // React's copy of it and never causes a flash.
  useEffect(() => {
    const attr = document.documentElement.dataset.theme as Theme | undefined;
    if (attr && THEMES.includes(attr)) setThemeState(attr);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the theme just won't persist */
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

/** Runs before first paint so the stored theme never flashes. */
export const themeScript = `
(function(){
  try {
    var t = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    if (t !== "dark" && t !== "light" && t !== "red") t = ${JSON.stringify(DEFAULT_THEME)};
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = ${JSON.stringify(DEFAULT_THEME)};
  }
})();
`;
