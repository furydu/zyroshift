import type { PairPageFaq } from "@/lib/pairs/types";

export function PairFaq({ faqs }: { faqs: PairPageFaq[] }) {
  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-emerald font-mono text-[11px] uppercase tracking-[0.28em]">
        Pair FAQ
      </p>
      <div className="mt-4 grid gap-3">
        {faqs.map((faq) => (
          <div key={faq.question} className="theme-card rounded-[20px] px-4 py-4">
            <h2 className="theme-text-main text-base font-semibold">
              {faq.question}
            </h2>
            <p className="theme-text-muted mt-2 text-sm leading-7">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
