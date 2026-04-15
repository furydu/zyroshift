import { NetworkNameWithIcon } from "@/components/hubs/NetworkNameWithIcon";
import { TokenNameWithIcon } from "@/components/hubs/TokenNameWithIcon";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CryptoIcon } from "@/components/swap/CryptoIcon";
import {
  getPairClusterStateLabel,
  type PairClusterPageData,
} from "@/lib/pairs/clusterPages";
import {
  getCoinIconSources,
  getNetworkIconSources,
} from "@/lib/sideshift/display";
import Link from "next/link";
import type { ReactNode } from "react";

function RouteAssetMark({
  token,
  label,
  networkId,
}: {
  token: string;
  label: string;
  networkId: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <CryptoIcon
          alt={`${label} icon`}
          className="rounded-full"
          size={18}
          sources={getCoinIconSources(token)}
        />
        <span className="theme-card-elevated absolute -bottom-1 -right-1 inline-flex h-[11px] w-[11px] items-center justify-center rounded-full border border-white/10">
          <CryptoIcon
            alt={`${networkId} network icon`}
            className="rounded-full"
            size={7}
            sources={getNetworkIconSources(networkId)}
          />
        </span>
      </span>
      <span>{label}</span>
    </span>
  );
}

function CountLinkCard({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={`${label}: ${count}`}
      className="theme-card flex items-center justify-between gap-3 rounded-[18px] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
    >
      <span className="min-w-0">{children}</span>
      <span className="theme-chip inline-flex shrink-0 rounded-full px-3 py-2 text-[11px]">
        {count}
      </span>
    </Link>
  );
}

function SectionLead({
  accentClassName,
  title,
  description,
}: {
  accentClassName: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`${accentClassName} font-mono text-[11px] uppercase tracking-[0.28em]`}>
        {title}
      </p>
      {description ? (
        <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PairClusterPage({ data }: { data: PairClusterPageData }) {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader
          activeKey="swap"
          ctaHref="/swap"
          breadcrumbs={[
            { label: "Swap", href: "/swap" },
            { label: data.title },
          ]}
        />

        <section className="theme-panel rounded-[32px] px-5 py-6 md:px-7 md:py-7">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Route family
          </p>
          <h1 className="theme-text-main mx-auto mt-3 max-w-5xl text-center text-[clamp(2.2rem,4.5vw,4.8rem)] font-semibold leading-[0.95] tracking-tight">
            {data.heroTitle}
          </h1>
          <p className="theme-text-muted mx-auto mt-4 max-w-3xl text-center text-sm leading-7 md:text-[15px]">
            {data.heroDescription}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/swap"
              className="theme-accent-cta inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Start swap
            </Link>
            <a
              href="#cluster-routes"
              className="theme-outline-button inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Browse routes
            </a>
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
          <SectionLead
            accentClassName="theme-accent-cyan"
            title={data.decisionHeading}
          />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {data.decisionCards.map((card) => (
              <div key={card.title} className="theme-card rounded-[18px] px-4 py-4">
                <p className="theme-text-main text-base font-semibold">{card.title}</p>
                <p className="theme-text-muted mt-2 text-sm leading-6">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="cluster-routes"
          className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6"
        >
          <SectionLead
            accentClassName="theme-accent-cyan"
            title={data.routeSectionHeading}
            description={data.routeSectionDescription}
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.topRoutes.map((route) => (
              <Link
                key={route.slug}
                href={route.href}
                className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="theme-text-main flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em]">
                    <RouteAssetMark
                      token={route.fromToken}
                      label={route.fromLabel}
                      networkId={route.fromNetworkId}
                    />
                    <span aria-hidden="true">→</span>
                    <RouteAssetMark
                      token={route.toToken}
                      label={route.toLabel}
                      networkId={route.toNetworkId}
                    />
                  </p>
                  <span className="theme-chip inline-flex shrink-0 rounded-full px-3 py-2 text-[10px]">
                    {getPairClusterStateLabel(route.state)}
                  </span>
                </div>
                <p className="theme-text-muted mt-3 text-sm leading-6">{route.summary}</p>
                <p className="theme-text-soft mt-3 font-mono text-[10px] uppercase tracking-[0.18em]">
                  {route.fromNetworkLabel} → {route.toNetworkLabel}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <SectionLead
              accentClassName="theme-accent-amber"
              title={data.sourceTokenHeading}
              description={data.sourceTokenDescription}
            />
            <div className="mt-4 grid gap-3">
              {data.topSourceTokens.map((item) => (
                <CountLinkCard
                  key={`source-token-${item.id}`}
                  count={item.count}
                  href={item.href}
                  label={item.label}
                >
                  <TokenNameWithIcon
                    symbol={item.label}
                    className="shrink-0"
                    iconSize={16}
                    iconBoxClassName="h-7 w-7"
                    textClassName="theme-text-main text-base font-semibold"
                  />
                </CountLinkCard>
              ))}
            </div>
          </div>

          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <SectionLead
              accentClassName="theme-accent-cyan"
              title={data.destinationTokenHeading}
              description={data.destinationTokenDescription}
            />
            <div className="mt-4 grid gap-3">
              {data.topDestinationTokens.map((item) => (
                <CountLinkCard
                  key={`destination-token-${item.id}`}
                  count={item.count}
                  href={item.href}
                  label={item.label}
                >
                  <TokenNameWithIcon
                    symbol={item.label}
                    className="shrink-0"
                    iconSize={16}
                    iconBoxClassName="h-7 w-7"
                    textClassName="theme-text-main text-base font-semibold"
                  />
                </CountLinkCard>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <SectionLead
              accentClassName="theme-accent-amber"
              title={data.sourceNetworkHeading}
              description={data.sourceNetworkDescription}
            />
            <div className="mt-4 grid gap-3">
              {data.topSourceNetworks.map((item) => (
                <CountLinkCard
                  key={`source-network-${item.id}`}
                  count={item.count}
                  href={item.href}
                  label={item.label}
                >
                  <NetworkNameWithIcon
                    label={item.label}
                    networkId={item.id}
                    className="shrink-0"
                    iconSize={16}
                    iconBoxClassName="h-7 w-7"
                    textClassName="theme-text-main text-base font-semibold"
                  />
                </CountLinkCard>
              ))}
            </div>
          </div>

          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <SectionLead
              accentClassName="theme-accent-cyan"
              title={data.destinationNetworkHeading}
              description={data.destinationNetworkDescription}
            />
            <div className="mt-4 grid gap-3">
              {data.topDestinationNetworks.map((item) => (
                <CountLinkCard
                  key={`destination-network-${item.id}`}
                  count={item.count}
                  href={item.href}
                  label={item.label}
                >
                  <NetworkNameWithIcon
                    label={item.label}
                    networkId={item.id}
                    className="shrink-0"
                    iconSize={16}
                    iconBoxClassName="h-7 w-7"
                    textClassName="theme-text-main text-base font-semibold"
                  />
                </CountLinkCard>
              ))}
            </div>
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <SectionLead
            accentClassName="theme-accent-cyan"
            title={data.faqHeading}
          />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.faqs.map((faq) => (
              <div key={faq.question} className="theme-card rounded-[18px] px-4 py-4">
                <p className="theme-text-main text-base font-semibold">{faq.question}</p>
                <p className="theme-text-muted mt-2 text-sm leading-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <SectionLead
            accentClassName="theme-accent-cyan"
            title="Related route families"
            description="These related families usually sit one decision away from the current cluster. Use them to compare whether the next route should preserve value, end in BTC, or enter another ecosystem instead."
          />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {data.relatedClusters.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <p className="theme-text-main text-base font-semibold">{item.title}</p>
                <p className="theme-text-muted mt-2 text-sm leading-6">{item.summary}</p>
                <p className="theme-text-soft mt-3 font-mono text-[10px] uppercase tracking-[0.18em]">
                  {item.totalRoutes} routes · {item.indexRoutes} launch-ready ·{" "}
                  {item.noindexRoutes} render-only
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
            Move from this family view into the live builder or open one of the top
            routes above when the pair and network direction are already clear enough
            to act on.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/swap"
              className="theme-accent-cta inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Start swap
            </Link>
            <a
              href="#cluster-routes"
              className="theme-outline-button inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Review top routes
            </a>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
