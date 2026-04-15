export function PairHowItWorks({ steps }: { steps: string[] }) {
  const stepToneClasses = [
    "border-[#18c9b5]/30 bg-[linear-gradient(135deg,rgba(24,201,181,0.12),rgba(24,201,181,0.05))]",
    "border-[#1ed1b4]/35 bg-[linear-gradient(135deg,rgba(30,209,180,0.16),rgba(30,209,180,0.06))]",
    "border-[#2cdaab]/40 bg-[linear-gradient(135deg,rgba(44,218,171,0.18),rgba(44,218,171,0.08))]",
    "border-[#42e39f]/45 bg-[linear-gradient(135deg,rgba(66,227,159,0.24),rgba(66,227,159,0.1))]",
  ] as const;

  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
        How this swap works
      </p>
      <div className="mt-4 grid gap-3">
        {steps.map((item, index) => (
          <div
            key={item}
            className={`theme-card rounded-[20px] border px-4 py-4 ${stepToneClasses[index] || stepToneClasses[3]}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#66e7b0]/50 bg-[rgba(18,139,111,0.14)] text-sm font-semibold text-[var(--text-main)]">
                {index + 1}
              </div>
              <p className="theme-text-muted text-sm leading-7">{item}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
