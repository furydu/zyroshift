import { TokenNameWithIcon } from "@/components/hubs/TokenNameWithIcon";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getTokenDirectoryData } from "@/lib/hubs";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explore Token Hubs | ZyroShift",
  description:
    "Browse supported token hubs across stablecoins, BTC routes, ecosystem-entry assets, and network-aware swap paths on ZyroShift.",
  alternates: {
    canonical: "https://zyroshift.com/tokens",
  },
};

function renderTokenDirectoryMeta(meta?: string) {
  if (!meta) {
    return null;
  }

  const [primary, secondary] = meta
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!secondary) {
    return (
      <span className="theme-text-soft ml-auto shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.18em]">
        {meta}
      </span>
    );
  }

  return (
    <span className="theme-text-soft ml-auto shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.18em] leading-[1.25]">
      <span className="block">{primary}</span>
      <span className="mt-0.5 block">· {secondary}</span>
    </span>
  );
}

export default function TokensDirectoryPage() {
  const data = getTokenDirectoryData();

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader activeKey="tokens" ctaHref="/swap" />

        <section className="theme-panel rounded-[32px] px-5 py-6 md:px-7 md:py-7">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Tokens
          </p>
          <h1 className="theme-text-main mx-auto mt-3 max-w-5xl text-center text-[clamp(2.2rem,4.5vw,4.6rem)] font-semibold leading-[0.95] tracking-tight">
            {data.heroTitle}
          </h1>
          <p className="theme-text-muted mx-auto mt-4 max-w-3xl text-center text-sm leading-7 md:text-[15px]">
            {data.heroDescription}
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href="/swap"
              className="theme-accent-cta inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Start swap
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.stats.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="theme-card rounded-[18px] px-4 py-2.5"
              >
                <p className="flex items-center justify-center gap-1.5 text-[12px] leading-5 md:text-[13px]">
                  <span className="theme-text-soft whitespace-nowrap font-mono uppercase tracking-[0.14em]">
                    {item.label}
                  </span>
                  <span className="theme-text-soft font-mono">:</span>
                  <span className="theme-text-main whitespace-nowrap font-semibold">
                    {item.value}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              {data.narrativeHeading}
            </p>
            <div className="theme-text-muted mt-4 space-y-4 text-sm leading-7 md:text-[15px]">
              {data.narrativeParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              {data.guidanceHeading}
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {data.guidancePoints.map((point) => (
                <li
                  key={point}
                  className="theme-card theme-text-main flex min-h-[56px] items-center justify-center rounded-[16px] px-4 py-2.5 text-center text-[13px] leading-5 md:text-sm"
                >
                  {point}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-3xl">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Explore token families
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              Start by asset role, not only by symbol. These groupings reflect how tokens behave across stable funding, BTC settlement, ecosystem entry, and longer-tail routes.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.categoryCards.map((category) => (
              <Link
                key={category.id}
                href={`#${category.id}`}
                className="theme-card block rounded-[20px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="theme-text-main text-lg font-semibold">
                    {category.label}
                  </p>
                  <span className="theme-chip inline-flex rounded-full px-3 py-2 text-[11px]">
                    {category.count}
                  </span>
                </div>
                <p className="theme-text-muted mt-3 text-sm leading-6">
                  {category.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <span className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.18em]">
                    Examples:
                  </span>
                  {category.examples.map((example) => (
                    <Link
                      key={`${category.id}-${example}`}
                      href={`/tokens/${example.toLowerCase()}`}
                      className="theme-card inline-flex rounded-full px-2.5 py-1.5 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                    >
                      <TokenNameWithIcon
                        symbol={example}
                        iconSize={14}
                        iconBoxClassName="h-5 w-5"
                        textClassName="theme-text-soft font-mono text-[10px] uppercase tracking-[0.18em]"
                        className="gap-1.5"
                      />
                    </Link>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Featured token hubs
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {data.featuredTokens.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                    <TokenNameWithIcon symbol={item.title} className="shrink-0" />
                    {renderTokenDirectoryMeta(item.meta)}
                  </div>
                  <p className="theme-text-muted mt-3 text-sm leading-6">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Common route patterns
            </p>
            <div className="mt-4 space-y-3">
              {data.routePatternCards.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <p className="theme-text-main text-base font-semibold">
                    {item.title}
                  </p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        {data.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6"
          >
            <div className="max-w-3xl">
              <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
                {section.title}
              </p>
              <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
                {section.description}
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item) => (
                <Link
                  key={`${section.id}-${item.title}`}
                  href={item.href}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                    <TokenNameWithIcon symbol={item.title} className="shrink-0" />
                    {renderTokenDirectoryMeta(item.meta)}
                  </div>
                  <p className="theme-text-muted mt-3 text-sm leading-6">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-3xl">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Related networks
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              Token hubs become more useful when the network decision is still open. These network hubs explain the rails most often paired with the assets above.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.relatedNetworks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="theme-text-main text-lg font-semibold">
                    {item.title}
                  </p>
                  {item.meta ? (
                    <span className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.18em]">
                      {item.meta}
                    </span>
                  ) : null}
                </div>
                <p className="theme-text-muted mt-3 text-sm leading-6">
                  {item.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 text-center md:px-6">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Ready to open a route?
          </p>
          <p className="theme-text-muted mx-auto mt-3 max-w-2xl text-sm leading-7 md:text-[15px]">
            Start with the live builder, then move into the token hub or pair page that best matches the asset and network choice you already understand.
          </p>
          <div className="mt-5">
            <Link
              href="/swap"
              className="theme-accent-cta inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Start swap
            </Link>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
