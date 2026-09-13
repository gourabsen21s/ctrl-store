"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { THEMES, useTheme, type Theme } from "@/components/providers/ThemeProvider";

const SWATCH: Record<Theme, string> = {
  dark: "bg-black",
  light: "bg-cream",
  red: "bg-red",
};

const LABEL: Record<Theme, string> = {
  dark: "Switch to dark theme",
  light: "Switch to light theme",
  red: "Switch to red theme",
};

/**
 * Three dots with a travelling indicator. The indicator is positioned from
 * measured button offsets rather than an index times a constant, so it stays
 * correct if the swatch size or gap changes.
 */
export default function ThemeSwitcher() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const row = useRef<HTMLDivElement>(null);
  const pip = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const active = row.current?.querySelector<HTMLButtonElement>(`[data-theme-key="${theme}"]`);
    if (!active || !pip.current) return;
    const x = active.offsetLeft + active.offsetWidth / 2 - pip.current.offsetWidth / 2;
    const y = active.offsetTop + active.offsetHeight / 2 - pip.current.offsetHeight / 2;
    pip.current.style.transform = `translate(${x}px, ${y}px)`;
  }, [theme, pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      id="theme-switcher"
      className="fixed top-[2.56rem] right-6 z-[70] hidden md:block"
    >
      <div ref={row} className="relative flex gap-1">
        <span
          ref={pip}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-10 h-1 w-1 rounded-full bg-cream transition-transform duration-300 ease-[var(--ease-expo-out)] dark:bg-black"
        />
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            data-theme-key={t}
            aria-label={LABEL[t]}
            aria-pressed={theme === t}
            onClick={() => setTheme(t)}
            className={`inline-block h-[1.125rem] w-[1.125rem] rounded-full transition-transform duration-200 ease-out hover:scale-110 ${SWATCH[t]} shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)]`}
          />
        ))}
      </div>
    </div>
  );
}
