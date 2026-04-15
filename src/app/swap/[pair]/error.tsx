"use client";

export default function PairPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-6 lg:px-8">
        <section className="theme-panel rounded-[32px] px-6 py-10 text-center">
          <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
            Route error
          </p>
          <h1 className="theme-text-main mt-3 text-3xl font-semibold">
            This swap route could not load.
          </h1>
          <p className="theme-text-muted mx-auto mt-3 max-w-2xl text-sm leading-7 md:text-[15px]">
            {error.message || "An unexpected error happened while loading this route."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="theme-accent-cta mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
          >
            Try again
          </button>
        </section>
      </div>
    </main>
  );
}
