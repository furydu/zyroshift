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

export function ThemeToggle() {
  return (
    <div className="fixed right-4 top-4 z-50 md:right-6 md:top-5">
      <button
        type="button"
        data-theme-toggle
        aria-label="Toggle light and dark mode"
        title="Toggle light and dark mode"
        className="theme-outline-button flex h-10 w-10 items-center justify-center rounded-full shadow-[0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur"
      >
        <ThemeBulbIcon />
      </button>
    </div>
  );
}
