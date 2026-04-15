import { NetworkNameWithIcon } from "@/components/hubs/NetworkNameWithIcon";
import { RouteLabelWithIcons } from "@/components/hubs/RouteLabelWithIcons";
import { TokenNameWithIcon } from "@/components/hubs/TokenNameWithIcon";
import { CryptoIcon } from "@/components/swap/CryptoIcon";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getNetworkHubData, getNetworkHubStaticParams } from "@/lib/hubs";
import { getNetworkIconSources } from "@/lib/sideshift/display";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type NetworkHubPageProps = {
  params: Promise<{
    network: string;
  }>;
};

export async function generateStaticParams() {
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  return getNetworkHubStaticParams();
}

export async function generateMetadata({
  params,
}: NetworkHubPageProps): Promise<Metadata> {
  const { network } = await params;
  const hub = getNetworkHubData(network);

  if (!hub) {
    return {
      title: "Network routes not found | ZyroShift",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${hub.heroTitle} | ZyroShift`,
    description: hub.heroDescription,
    alternates: {
      canonical: `https://zyroshift.com/networks/${hub.network}`,
    },
  };
}

export default async function NetworkHubPage({
  params,
}: NetworkHubPageProps) {
  const { network } = await params;
  const hub = getNetworkHubData(network);

  if (!hub) {
    notFound();
  }

  const summaryCards = [
    { label: "Supported assets", value: String(hub.assetCount) },
    { label: "Assets you can send", value: String(hub.depositAssetCount) },
    { label: "Assets you can receive", value: String(hub.settleAssetCount) },
    { label: "Live routes", value: String(hub.routeCount) },
    ...hub.quickFacts,
  ];
  const summaryRows = [
    summaryCards.slice(0, 2),
    summaryCards.slice(2, 4),
    summaryCards.slice(4, 6),
    summaryCards.slice(6, 8),
  ];
  const summaryRowWidths = [
    "max-w-[1080px]",
    "max-w-[1040px]",
    "max-w-[1000px]",
    "max-w-[960px]",
  ];
  const networkHeroMeta =
    hub.quickFacts.find((item) => item.label === "Best for")?.value ||
    "Supported swap routes";

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader
          activeKey="networks"
          ctaHref={hub.swapHref}
          breadcrumbs={[
            { label: "Networks", href: "/networks" },
            { label: hub.networkLabel },
          ]}
        />

        <section className="theme-panel rounded-[32px] px-5 py-6 md:px-7 md:py-7">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Network
          </p>
          <h1 className="theme-text-main mx-auto mt-3 max-w-4xl text-center text-[clamp(2.2rem,4.4vw,4.4rem)] font-semibold leading-[0.95] tracking-tight">
            {hub.heroTitle}
          </h1>
          <p className="theme-text-muted mx-auto mt-4 max-w-3xl text-center text-sm leading-7 md:text-[15px]">
            {hub.heroDescription}
          </p>
          <div className="mx-auto mt-6 grid max-w-[980px] gap-4 lg:grid-cols-[minmax(240px,1fr)_auto_minmax(240px,1fr)] lg:items-stretch">
            <div className="theme-card-elevated flex min-h-[138px] items-center justify-center rounded-[26px] border border-[var(--border-strong)] bg-[radial-gradient(circle_at_top,rgba(34,197,255,0.12),transparent_62%)] px-6 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
              <div className="theme-card flex h-[92px] w-[92px] items-center justify-center rounded-full border border-[var(--accent-cyan-border)] shadow-[0_14px_32px_rgba(34,197,255,0.14)]">
                <CryptoIcon
                  alt={`${hub.networkLabel} icon`}
                  size={68}
                  sources={getNetworkIconSources(hub.network)}
                />
              </div>
            </div>

              <div className="flex items-center justify-center">
                <Link
                  href={hub.swapHref}
                  className="theme-accent-cta inline-flex min-h-[50px] items-center justify-center rounded-full px-6 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
                >
                  Start swap
              </Link>
            </div>

            <div className="theme-card-elevated flex min-h-[138px] items-center justify-center rounded-[26px] border border-[var(--border-strong)] px-6 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
              <div className="text-center">
                <p className="theme-text-main text-[clamp(1.5rem,2vw,2rem)] font-semibold uppercase tracking-[0.12em]">
                  {hub.networkLabel}
                </p>
                <p className="theme-text-soft mt-2 font-mono text-[11px] uppercase tracking-[0.22em]">
                  {networkHeroMeta}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {summaryRows.map((row, index) => (
              <div
                key={`summary-row-${index}`}
                className={`mx-auto w-full ${summaryRowWidths[index] ?? "max-w-[960px]"}`}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {row.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="theme-card flex min-h-[68px] items-center justify-center rounded-[18px] px-4 py-3 text-center"
                    >
                      <p className="text-center text-sm leading-6 md:text-[15px]">
                        <span className="theme-text-soft font-mono uppercase tracking-[0.18em]">
                          {item.label}
                        </span>
                        <span className="theme-text-soft font-mono">: </span>
                        <span className="theme-text-main font-semibold">
                          {item.value}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="theme-card mx-auto flex max-w-[920px] items-center justify-center rounded-[18px] px-4 py-3 text-center">
              <p className="theme-text-muted text-center text-sm leading-6 md:text-[15px]">
                <span className="theme-text-soft font-mono uppercase tracking-[0.18em]">
                  Route timing:
                </span>{" "}
                ZyroShift shows the live estimate inside the swap flow, because
                completion time changes with the exact pair, market path, and
                destination confirmations.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.narrativeHeading}
            </p>
            <div className="theme-text-muted mt-4 space-y-4 text-sm leading-7 md:text-[15px]">
              {hub.narrativeParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.useGuidanceHeading}
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {hub.useGuidancePoints.map((point) => (
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

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.characteristicsHeading}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {hub.characteristics.map((item) => (
                <div key={item.label} className="theme-card rounded-[20px] px-4 py-4">
                  <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                    {item.label}
                  </p>
                  <p className="theme-text-main mt-2 text-lg font-semibold">
                    {item.value}
                  </p>
                  <p className="theme-text-muted mt-3 text-sm leading-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.riskHeading}
            </p>
            <div className="mt-4 space-y-3">
              {hub.riskNotes.map((note) => (
                <div
                  key={note}
                  className="theme-card theme-text-main rounded-[18px] px-4 py-3 text-sm leading-6"
                >
                  {note}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-3xl">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Explore common routes
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              Use these shortcuts to jump into the most common swap paths tied to {hub.networkLabel}.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {hub.routeClusters.map((cluster) => (
              <Link
                key={cluster.title}
                href={cluster.href}
                className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <p className="theme-text-main text-base font-semibold">
                  {cluster.title}
                </p>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  {cluster.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
            Routes you can start on {hub.networkLabel}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hub.sourceRoutes.map((route) => (
              <Link
                key={route.slug}
                href={route.href}
                className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="theme-chip inline-flex rounded-full px-3 py-2 text-[11px]">
                    {route.intentLabel}
                  </span>
                  <div className="flex flex-1 justify-center">
                    <RouteLabelWithIcons
                      arrowClassName="theme-text-soft font-mono text-[11px] uppercase tracking-[0.24em]"
                      className="justify-center gap-1.5"
                      endpointTextClassName="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]"
                      fromLabel={route.fromLabel}
                      fromNetworkId={route.fromNetworkId}
                      fromToken={route.fromToken}
                      toLabel={route.toLabel}
                      toNetworkId={route.toNetworkId}
                      toToken={route.toToken}
                    />
                  </div>
                </div>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  {route.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
            Routes you can receive on {hub.networkLabel}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hub.destinationRoutes.map((route) => (
              <Link
                key={route.slug}
                href={route.href}
                className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="theme-chip inline-flex rounded-full px-3 py-2 text-[11px]">
                    {route.intentLabel}
                  </span>
                  <div className="flex flex-1 justify-center">
                    <RouteLabelWithIcons
                      arrowClassName="theme-text-soft font-mono text-[11px] uppercase tracking-[0.24em]"
                      className="justify-center gap-1.5"
                      endpointTextClassName="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]"
                      fromLabel={route.fromLabel}
                      fromNetworkId={route.fromNetworkId}
                      fromToken={route.fromToken}
                      toLabel={route.toLabel}
                      toNetworkId={route.toNetworkId}
                      toToken={route.toToken}
                    />
                  </div>
                </div>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  {route.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Popular assets on {hub.networkLabel}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {hub.topAssets.map((asset) => (
                <Link
                  key={asset.symbol}
                  href={asset.href}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <TokenNameWithIcon symbol={asset.symbol} />
                  <p className="theme-text-muted mt-1 text-sm leading-6">
                    {asset.summary}
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
              {hub.intentStats.map((item) => (
                <div key={item.key} className="theme-card rounded-[18px] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="theme-text-main text-base font-semibold">
                      {item.label}
                    </p>
                    <p className="theme-text-main text-lg font-semibold">
                      {item.count}
                    </p>
                  </div>
                  <p className="theme-text-muted mt-3 text-sm leading-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.comparisonHeading}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {hub.comparisons.map((comparison) => (
                <Link
                  key={comparison.network}
                  href={comparison.href}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <NetworkNameWithIcon
                    label={comparison.label}
                    networkId={comparison.network}
                  />
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {comparison.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Related pages
            </p>
            <div className="mt-4">
              <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                Tokens
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {hub.relatedTokens.map((asset) => (
                  <Link
                    key={asset.symbol}
                    href={`/tokens/${asset.symbol.toLowerCase()}`}
                    className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                  >
                    <TokenNameWithIcon symbol={asset.symbol} />
                    <p className="theme-text-muted mt-1 text-sm leading-6">
                      Common asset on {hub.networkLabel} routes.
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                Networks
              </p>
              <div className="mt-3 space-y-3">
                {hub.relatedNetworks.map((comparison) => (
                  <Link
                    key={comparison.network}
                    href={comparison.href}
                    className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                  >
                    <NetworkNameWithIcon
                      label={comparison.label}
                      networkId={comparison.network}
                      textClassName="theme-text-main text-base font-semibold"
                    />
                    <p className="theme-text-muted mt-1 text-sm leading-6">
                      {comparison.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 text-center md:px-6">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Start a swap on {hub.networkLabel}
          </p>
          <p className="theme-text-muted mx-auto mt-3 max-w-2xl text-sm leading-7 md:text-[15px]">
            Open the live builder, choose the asset that matches your wallet, and keep the selected network explicit before you create the shift.
          </p>
            <div className="mt-5">
              <Link
                href={hub.swapHref}
                className="theme-accent-cta inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
              >
                Start swap
            </Link>
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
            FAQ
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {hub.faqs.map((faq) => (
              <div key={faq.question} className="theme-card rounded-[20px] px-4 py-4">
                <p className="theme-text-main text-base font-semibold">
                  {faq.question}
                </p>
                <p className="theme-text-muted mt-3 text-sm leading-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
