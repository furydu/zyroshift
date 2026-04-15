export function PairRouteInfo({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
}) {
  return (
    <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
      <div className="flex flex-wrap items-end justify-center gap-3 text-center">
        <div className="mx-auto">
          <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
            Live route context
          </p>
          <h2 className="theme-text-main mt-2 text-[clamp(1.8rem,2.8vw,2.5rem)] font-semibold leading-tight tracking-tight">
            Builder first, then route-specific timing and limit context.
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="theme-card rounded-[22px] px-4 py-4">
            <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.24em]">
              {item.label}
            </p>
            <p className="theme-text-main mt-3 text-lg font-semibold">
              {item.value}
            </p>
            <p className="theme-text-muted mt-2 text-sm leading-6">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
