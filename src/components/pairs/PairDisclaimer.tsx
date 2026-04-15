export function PairDisclaimer({ items }: { items: string[] }) {
  return (
    <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.28em]">
        Route disclaimer
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="theme-card rounded-[18px] px-4 py-4">
            <p className="theme-text-muted text-sm leading-6">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
