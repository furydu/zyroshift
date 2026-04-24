import type { PairPageFaq } from "@/lib/pairs/types";

export function PairFaq({ faqs }: { faqs: PairPageFaq[] }) {
  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-emerald font-mono text-[11px] uppercase tracking-[0.28em]">
        Pair FAQ
      </p>
      <div className="mt-4 grid gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="theme-card group rounded-[20px] px-4 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <h2 className="theme-text-main text-base font-semibold">
                {faq.question}
              </h2>
              <span className="theme-card-elevated flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] transition group-open:rotate-180">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--text-main)]"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </summary>
            <p className="theme-text-muted mt-3 text-sm leading-7">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
