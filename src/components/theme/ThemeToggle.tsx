"use client";

import { useEffect, useRef, useState } from "react";

type ThemeMode = "dark" | "light";
type ThemePreference = ThemeMode | "auto";

const STORAGE_KEY = "crypto-swap-theme";

function resolveAutoTheme(date = new Date()): ThemeMode {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

function applyTheme(themePreference: ThemePreference) {
  const theme = themePreference === "auto" ? resolveAutoTheme() : themePreference;
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(STORAGE_KEY, themePreference);
}

function ThemeBulbIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.9 10.56c.78.68 1.4 1.56 1.72 2.54h4.36c.32-.98.94-1.86 1.72-2.54A6 6 0 0 0 12 3Z" />
      <path d="M12 1.5v1.5" />
      <path d="m4.93 4.93 1.06 1.06" />
      <path d="m18.01 5.99 1.06-1.06" />
      <path d="M3 12h1.5" />
      <path d="M19.5 12H21" />
    </svg>
  );
}

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    value: "auto",
    label: "Auto",
    description: "06:00-18:00 light, otherwise dark",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use the dark interface",
  },
  {
    value: "light",
    label: "Light",
    description: "Always use the light interface",
  },
];

export function ThemeToggle() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    if (typeof document === "undefined") {
      return "auto";
    }

    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    return savedTheme === "dark" || savedTheme === "light" || savedTheme === "auto"
      ? savedTheme
      : "auto";
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    applyTheme(themePreference);

    if (themePreference !== "auto") {
      return;
    }

    const timer = window.setInterval(() => {
      applyTheme("auto");
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [themePreference]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function selectTheme(nextTheme: ThemePreference) {
    setThemePreference(nextTheme);
    applyTheme(nextTheme);
    setOpen(false);
  }

  const resolvedTheme =
    themePreference === "auto" ? resolveAutoTheme() : themePreference;

  return (
    <div
      ref={containerRef}
      className="fixed right-4 top-4 z-50 md:right-6 md:top-5"
    >
      <button
        type="button"
        aria-label="Open theme settings"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="theme-outline-button flex h-10 w-10 items-center justify-center rounded-full shadow-[0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur"
      >
        <ThemeBulbIcon />
      </button>

      {open ? (
        <div
          className="theme-panel-strong absolute right-0 mt-2 w-[220px] rounded-[18px] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
          role="menu"
          aria-label="Theme options"
        >
          <div className="px-2 pb-2 pt-1">
            <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.24em]">
              Theme
            </p>
            <p className="theme-text-main mt-1 text-sm font-medium">
              {themePreference === "auto"
                ? `Auto now uses ${resolvedTheme}`
                : `${themePreference} mode selected`}
            </p>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((option) => {
              const active = themePreference === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => selectTheme(option.value)}
                  className={`flex w-full items-start gap-3 rounded-[14px] px-3 py-2.5 text-left transition ${
                    active
                      ? "theme-info-panel"
                      : "theme-card hover:border-[var(--border-strong)]"
                  }`}
                >
                  <span
                    className={`mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full ${
                      active ? "bg-[var(--accent-cyan)]" : "bg-[var(--border-strong)]"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="theme-text-main block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="theme-text-muted mt-0.5 block text-xs leading-5">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
