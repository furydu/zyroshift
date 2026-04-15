import { NetworkNameWithIcon } from "@/components/hubs/NetworkNameWithIcon";
import { RouteLabelWithIcons } from "@/components/hubs/RouteLabelWithIcons";
import { TokenNameWithIcon } from "@/components/hubs/TokenNameWithIcon";
import { CryptoIcon } from "@/components/swap/CryptoIcon";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getTokenCategoryLabel,
  getTokenHubData,
  getTokenHubStaticParams,
} from "@/lib/hubs";
import { getCoinIconSources } from "@/lib/sideshift/display";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type TokenHubPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function getTokenRoleLabel(category: string) {
  switch (category) {
    case "stable":
      return "Funding and landing asset";
    case "btc":
      return "Core destination asset";
    case "layer1":
      return "Ecosystem entry asset";
    case "layer2":
      return "Lower-cost chain asset";
    case "defi":
      return "DeFi and app asset";
    case "meme":
      return "High-volatility route asset";
    case "exchange":
      return "Exchange-linked asset";
    case "gaming":
      return "Gaming-linked asset";
    default:
      return "Multi-route crypto asset";
  }
}

export async function generateStaticParams() {
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  return getTokenHubStaticParams();
}

export async function generateMetadata({
  params,
}: TokenHubPageProps): Promise<Metadata> {
  const { token } = await params;
  const hub = getTokenHubData(token);

  if (!hub) {
    return {
      title: "Token routes not found | ZyroShift",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${hub.heroTitle} | ZyroShift`,
    description: hub.heroDescription,
    alternates: {
      canonical: `https://zyroshift.com/tokens/${hub.token}`,
    },
  };
}

export default async function TokenHubPage({ params }: TokenHubPageProps) {
  const { token } = await params;
  const hub = getTokenHubData(token);

  if (!hub) {
    notFound();
  }

  const summaryCards = [
    { label: "Category", value: getTokenCategoryLabel(hub.category) },
    { label: "Common role", value: getTokenRoleLabel(hub.category) },
    { label: "Supported networks", value: String(hub.networkCount) },
    { label: "Popular routes", value: String(hub.featuredRoutes.length) },
  ];

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader
          activeKey="tokens"
          ctaHref={hub.swapHref}
          breadcrumbs={[
            { label: "Tokens", href: "/tokens" },
            { label: hub.tokenLabel },
          ]}
        />

        <section className="theme-panel rounded-[32px] px-5 py-6 md:px-7 md:py-7">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Token
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
                  alt={`${hub.tokenLabel} icon`}
                  size={72}
                  sources={getCoinIconSources(hub.tokenLabel)}
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Link
                href={hub.swapHref}
                className="theme-accent-cta inline-flex min-h-[50px] items-center justify-center rounded-full px-6 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
              >
                Swap {hub.tokenLabel}
              </Link>
            </div>

            <div className="theme-card-elevated flex min-h-[138px] items-center justify-center rounded-[26px] border border-[var(--border-strong)] px-6 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
              <div className="text-center">
                <p className="theme-text-main text-[clamp(1.5rem,2vw,2rem)] font-semibold uppercase tracking-[0.12em]">
                  {hub.tokenName}
                </p>
                <p className="theme-text-soft mt-2 font-mono text-[11px] uppercase tracking-[0.22em]">
                  {hub.tokenLabel} | {getTokenCategoryLabel(hub.category)}
                </p>
                <p className="sr-only">
                  {hub.tokenLabel} · {getTokenCategoryLabel(hub.category)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="theme-card rounded-[18px] px-4 py-3"
              >
                <p className="text-sm leading-6 md:text-[15px]">
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
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.summaryHeading}
            </p>
            <div className="theme-text-muted mt-4 space-y-4 text-sm leading-7 md:text-[15px]">
              {hub.summaryParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.whyUseHeading}
            </p>
            <ul className="mx-auto mt-4 max-w-[620px] space-y-3 pl-2 text-left">
              {hub.whyUsePoints.map((point) => (
                <li
                  key={point}
                  className="theme-card theme-text-main rounded-[18px] px-4 py-3 text-sm leading-6"
                >
                  {point}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-5xl">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              {hub.seoEntryHeading}
            </p>
            <p className="theme-text-muted mt-4 text-sm leading-7 md:text-[15px]">
              {hub.seoEntryParagraph}
            </p>
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-3xl">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Supported networks
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              Each supported network changes cost, compatibility, and wallet expectations. Use the right rail for the wallet or ecosystem you plan to use next.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hub.networkBreakdown.map((network) => (
              <Link
                key={network.id}
                href={network.href}
                className="theme-card rounded-[20px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <NetworkNameWithIcon label={network.label} networkId={network.id} />
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  {network.useCase}
                </p>
                <div className="mt-4">
                  <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                    Use when
                  </p>
                  <ul className="theme-text-muted mt-2 space-y-1 text-sm leading-6">
                    {network.useWhen.map((point) => (
                      <li key={point}>- {point}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {network.badges.map((badge) => (
                    <span
                      key={badge}
                      className="theme-chip rounded-full px-3 py-2 text-[11px]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Popular ways to swap from {hub.tokenLabel}
            </p>
            <div className="mt-4 space-y-4">
              {hub.sendRouteGroups.map((group) => (
                <div key={group.key} className="theme-card rounded-[22px] px-4 py-4">
                  <p className="theme-text-main text-lg font-semibold">{group.title}</p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {group.description}
                  </p>
                  <div className="mt-4 space-y-3">
                    {group.routes.map((route) => (
                      <Link
                        key={route.slug}
                        href={route.href}
                        className="block rounded-[18px] border border-[var(--border-subtle)] px-4 py-3 transition hover:border-[var(--border-strong)]"
                      >
                        <span className="theme-chip mb-3 inline-flex rounded-full px-3 py-2 text-[11px]">
                          {route.intentLabel}
                        </span>
                        <RouteLabelWithIcons
                          arrowClassName="theme-text-soft font-mono text-[11px] uppercase tracking-[0.24em]"
                          className="gap-1.5"
                          endpointTextClassName="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]"
                          fromLabel={route.fromLabel}
                          fromNetworkId={route.fromNetworkId}
                          fromToken={route.fromToken}
                          toLabel={route.toLabel}
                          toNetworkId={route.toNetworkId}
                          toToken={route.toToken}
                        />
                        <p className="theme-text-muted mt-2 text-sm leading-6">
                          {route.summary}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Popular ways to receive {hub.tokenLabel}
            </p>
            <div className="mt-4 space-y-4">
              {hub.receiveRouteGroups.map((group) => (
                <div key={group.key} className="theme-card rounded-[22px] px-4 py-4">
                  <p className="theme-text-main text-lg font-semibold">{group.title}</p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {group.description}
                  </p>
                  <div className="mt-4 space-y-3">
                    {group.routes.map((route) => (
                      <Link
                        key={route.slug}
                        href={route.href}
                        className="block rounded-[18px] border border-[var(--border-subtle)] px-4 py-3 transition hover:border-[var(--border-strong)]"
                      >
                        <span className="theme-chip mb-3 inline-flex rounded-full px-3 py-2 text-[11px]">
                          {route.intentLabel}
                        </span>
                        <RouteLabelWithIcons
                          arrowClassName="theme-text-soft font-mono text-[11px] uppercase tracking-[0.24em]"
                          className="gap-1.5"
                          endpointTextClassName="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]"
                          fromLabel={route.fromLabel}
                          fromNetworkId={route.fromNetworkId}
                          fromToken={route.fromToken}
                          toLabel={route.toLabel}
                          toNetworkId={route.toNetworkId}
                          toToken={route.toToken}
                        />
                        <p className="theme-text-muted mt-2 text-sm leading-6">
                          {route.summary}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Common route patterns
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {hub.intentStats.map((item) => (
                <div key={item.key} className="theme-card rounded-[20px] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="theme-text-main text-base font-semibold">{item.label}</p>
                    <p className="theme-text-main text-lg font-semibold">{item.count}</p>
                  </div>
                  <p className="theme-text-muted mt-3 text-sm leading-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Common swap partners
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {hub.topIntegrationTokens.map((tokenItem) => (
                <Link
                  key={tokenItem.symbol}
                  href={`/tokens/${tokenItem.symbol.toLowerCase()}`}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <TokenNameWithIcon symbol={tokenItem.symbol} />
                  <p className="theme-text-muted mt-1 text-sm leading-6">
                    Common route partner for {hub.tokenLabel} across high-intent send and receive paths.
                  </p>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              More {hub.tokenLabel} routes
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {hub.moreRouteCards.map((route) => (
                <Link
                  key={route.slug}
                  href={route.href}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <RouteLabelWithIcons
                    arrowClassName="theme-text-soft font-mono text-[11px] uppercase tracking-[0.24em]"
                    className="gap-1.5"
                    endpointTextClassName="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]"
                    fromLabel={route.fromLabel}
                    fromNetworkId={route.fromNetworkId}
                    fromToken={route.fromToken}
                    toLabel={route.toLabel}
                    toNetworkId={route.toNetworkId}
                    toToken={route.toToken}
                  />
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {route.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Related tokens
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {hub.relatedTokens.slice(0, 4).map((tokenItem) => (
                <Link
                  key={tokenItem.symbol}
                  href={`/tokens/${tokenItem.symbol.toLowerCase()}`}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <TokenNameWithIcon symbol={tokenItem.symbol} />
                  <p className="theme-text-muted mt-1 text-sm leading-6">
                    {getTokenCategoryLabel(tokenItem.category)} with {tokenItem.networkCount} supported network
                    {tokenItem.networkCount === 1 ? "" : "s"}.
                  </p>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 text-center md:px-6">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Start a {hub.tokenLabel} swap
          </p>
          <p className="theme-text-muted mx-auto mt-3 max-w-2xl text-sm leading-7 md:text-[15px]">
            Open the live builder, choose the network that matches your wallet, and create the shift from there.
          </p>
          <div className="mt-5">
            <Link
              href={hub.swapHref}
              className="theme-accent-cta inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Swap {hub.tokenLabel} now
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
