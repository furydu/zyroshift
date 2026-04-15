export function PairNotes({ notes }: { notes: string[] }) {
  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
        Route-specific notes
      </p>
      <div className="mt-4 grid gap-3">
        {notes.map((note) => (
          <div key={note} className="theme-warning-panel rounded-[18px] px-4 py-3">
            <p className="theme-accent-amber text-sm leading-6">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
