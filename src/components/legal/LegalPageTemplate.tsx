import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Link from "next/link";

type LegalSection = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export function LegalPageTemplate({
  eyebrow,
  title,
  intro,
  effectiveDate,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  effectiveDate: string;
  sections: readonly LegalSection[];
}) {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader ctaHref="/swap" breadcrumbs={[{ label: title }]} />

        <section className="theme-panel rounded-[32px] px-5 py-6 md:px-7 md:py-7">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            {eyebrow}
          </p>
          <h1 className="theme-text-main mx-auto mt-3 max-w-4xl text-center text-[clamp(2.2rem,4.6vw,4.9rem)] font-semibold leading-[0.95] tracking-tight">
            {title}
          </h1>
          <p className="theme-text-muted mx-auto mt-4 max-w-3xl text-center text-sm leading-7 md:text-[15px]">
            {intro}
          </p>

          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <span className="theme-chip inline-flex min-h-[38px] items-center rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em]">
              Effective {effectiveDate}
            </span>
            <Link
              href="/track-order"
              className="theme-chip inline-flex min-h-[38px] items-center rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:border-[var(--border-strong)] hover:-translate-y-0.5"
            >
              Need help with a route?
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="theme-panel rounded-[28px] px-5 py-5 md:px-6"
            >
              <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
                {section.title}
              </p>
              <div className="mt-4 grid gap-3">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="theme-text-muted text-sm leading-7 md:text-[15px]"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="mt-1 grid gap-3 md:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="theme-card rounded-[18px] px-4 py-3 text-sm leading-6"
                      >
                        <span className="theme-text-main">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.96fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Legal contact
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              For legal, privacy, or route-related questions, contact ZyroShift
              using the addresses below. Replace these addresses before
              publishing if your final operational inboxes differ.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="theme-card rounded-[18px] px-4 py-4">
                <p className="theme-text-main text-sm font-semibold">
                  General support
                </p>
                <p className="theme-text-muted mt-2 text-sm">
                  hello@zyroshift.com
                </p>
              </div>
              <div className="theme-card rounded-[18px] px-4 py-4">
                <p className="theme-text-main text-sm font-semibold">
                  Legal and privacy
                </p>
                <p className="theme-text-muted mt-2 text-sm">
                  legal@zyroshift.com
                </p>
              </div>
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Service reminder
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              ZyroShift is a direct-to-wallet route experience. Always verify
              the asset, network, receiving address, deposit instructions, and
              status page details before sending funds.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/swap"
                className="theme-accent-cta inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
              >
                Start swap
              </Link>
              <Link
                href="/how-it-works"
                className="theme-chip inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                How it works
              </Link>
            </div>
          </aside>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
