import { NetworkNameWithIcon } from "@/components/hubs/NetworkNameWithIcon";
import { RouteLabelWithIcons } from "@/components/hubs/RouteLabelWithIcons";
import { TokenNameWithIcon } from "@/components/hubs/TokenNameWithIcon";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CryptoIcon } from "@/components/swap/CryptoIcon";
import {
  getPricePageData,
  type PricePageData,
} from "@/lib/prices/provider";
import {
  getPriceBreadcrumbSchema,
  getPriceFaqSchema,
  getPriceWebPageSchema,
} from "@/lib/prices/schema";
import { getCoinIconSources } from "@/lib/sideshift/display";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PriceTokenPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const revalidate = 300;

function formatUsdPrice(value: number | null) {
  if (value === null) {
    return "Live price unavailable";
  }

  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "24h data pending";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatUpdatedTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getChangeTone(value: number | null) {
  if (value === null) {
    return "text-slate-300";
  }

  if (value > 0) {
    return "text-emerald-300";
  }

  if (value < 0) {
    return "text-rose-300";
  }

  return "text-cyan-200";
}

function buildSchemas(data: PricePageData) {
  const canonicalUrl = `https://zyroshift.com/prices/${data.token}`;

  return [
    getPriceBreadcrumbSchema(data.tokenLabel, canonicalUrl),
    getPriceFaqSchema(data.faqs),
    getPriceWebPageSchema({
      title: data.seoTitle,
      description: data.seoDescription,
      url: canonicalUrl,
      tokenLabel: data.tokenLabel,
      tokenName: data.tokenName,
      supportedNetworkCount: data.supportedNetworkCount,
    }),
  ];
}

export async function generateMetadata({
  params,
}: PriceTokenPageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getPricePageData(token);

  if (!data) {
    return {
      title: "Token price page not found | ZyroShift",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: data.seoTitle,
    description: data.seoDescription,
    alternates: {
      canonical: `https://zyroshift.com/prices/${data.token}`,
    },
  };
}

export default async function PriceTokenPage({ params }: PriceTokenPageProps) {
  const { token } = await params;
  const data = await getPricePageData(token);

  if (!data) {
    notFound();
  }

  const schemas = buildSchemas(data);

  return (
    <main className="relative overflow-hidden">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_24%),linear-gradient(180deg,rgba(6,10,18,0.98),rgba(4,7,15,1))]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-25" />

        <div className="relative mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
          <SiteHeader
            ctaHref={data.swapHref}
            ctaLabel={`Swap ${data.tokenLabel}`}
            breadcrumbs={[
              { label: "Prices", href: "/prices" },
              { label: `${data.tokenLabel} Price Today` },
            ]}
          />

          {schemas.map((schema, index) => (
            <script
              key={`price-schema-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema),
              }}
            />
          ))}

          <section className="grid gap-8 pb-12 pt-2 lg:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)] lg:items-end lg:pb-16">
            <div className="max-w-4xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-cyan-200/90">
                Price Today
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(3.2rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                {data.tokenLabel} PRICE TODAY
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-300 md:text-[17px]">
                Live market context for {data.tokenName} with ZyroShift support
                data underneath it. This page answers the price-first question,
                then hands the user into swap only when that intent is ready.
              </p>

              <div className="mt-8 border-y border-white/10 py-6">
                <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
                  <p className="text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-white">
                    {formatUsdPrice(data.livePriceUsd)}
                  </p>
                  <div className="pb-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      24h move
                    </p>
                    <p
                      className={`mt-2 text-xl font-semibold ${getChangeTone(
                        data.change24h,
                      )}`}
                    >
                      {formatPercent(data.change24h)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-slate-300">
                  <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 font-mono uppercase tracking-[0.16em] text-[11px] text-slate-200">
                    {data.supportedNetworkCount} supported networks
                  </span>
                  {data.liveNetworkCount ? (
                    <span className="rounded-full border border-cyan-200/18 bg-cyan-300/10 px-3 py-2 font-mono uppercase tracking-[0.16em] text-[11px] text-cyan-100">
                      {data.liveNetworkCount} live deposit rails
                    </span>
                  ) : null}
                  <span className="rounded-full border border-amber-200/18 bg-amber-300/10 px-3 py-2 font-mono uppercase tracking-[0.16em] text-[11px] text-amber-100">
                    Updated {formatUpdatedTime(data.lastUpdatedIso)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={data.swapHref}
                  className="inline-flex min-h-[48px] items-center rounded-full bg-[linear-gradient(135deg,#67e8f9,#fcd34d)] px-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:-translate-y-0.5"
                >
                  Swap {data.tokenLabel}
                </Link>
                <Link
                  href={data.tokenHubHref}
                  className="inline-flex min-h-[48px] items-center rounded-full border border-white/14 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/86 transition hover:border-cyan-200/40 hover:text-white"
                >
                  View token routes
                </Link>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                Market price is informational. The live swap rate can differ by
                route, amount, network, and provider conditions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_48%)]" />
                <div className="relative">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">
                    Asset
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-5">
                    <div>
                      <p className="text-[2.8rem] font-semibold leading-none tracking-[-0.05em] text-white">
                        {data.tokenLabel}
                      </p>
                      <p className="mt-2 text-base text-slate-300">
                        {data.tokenName}
                      </p>
                      <p className="mt-4 text-sm text-slate-400">
                        {data.categoryLabel}
                      </p>
                    </div>
                    <span className="theme-card-elevated inline-flex h-[96px] w-[96px] items-center justify-center rounded-full border border-white/12">
                      <CryptoIcon
                        alt={`${data.tokenLabel} icon`}
                        size={72}
                        sources={getCoinIconSources(data.tokenLabel)}
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">
                  ZyroShift support
                </p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[2.6rem] font-semibold leading-none tracking-[-0.05em] text-white">
                        {data.supportedNetworkCount}
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        supported network{data.supportedNetworkCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="max-w-[180px] text-right">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                        Key use
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        Review the price, then route into the network that
                        actually fits the next wallet action.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {data.supportedNetworkLabels.slice(0, 6).map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-200"
                      >
                        {label}
                      </span>
                    ))}
                    {data.supportedNetworkLabels.length > 6 ? (
                      <span className="rounded-full border border-amber-200/18 bg-amber-300/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">
                        +{data.supportedNetworkLabels.length - 6} more
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.14fr)_minmax(320px,0.86fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Market context
            </p>
            <div className="theme-text-muted mt-4 space-y-4 text-sm leading-7 md:text-[15px]">
              {data.summaryParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Why this page exists
            </p>
            <ul className="mt-4 space-y-3">
              {data.whyUsePoints.map((point) => (
                <li
                  key={point}
                  className="theme-card rounded-[18px] px-4 py-3 text-sm leading-6 text-[var(--foreground)]"
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
              Supported networks
            </p>
            <h2 className="theme-text-main mt-3 text-[clamp(2rem,3vw,3rem)] font-semibold tracking-tight">
              {data.tokenLabel} is currently supported on {data.supportedNetworkCount} network{data.supportedNetworkCount === 1 ? "" : "s"}
            </h2>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              This is the support layer users rarely get on generic price pages.
              They can see the market price first, then understand how broadly
              the asset is actually usable inside ZyroShift.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.networkBreakdown.map((network) => (
              <Link
                key={network.id}
                href={network.href}
                className="theme-card block rounded-[20px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <NetworkNameWithIcon
                  label={network.label}
                  networkId={network.id}
                />
                <p className="theme-text-muted mt-3 text-sm leading-6">
                  {network.useCase}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
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

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Price-to-swap handoff
            </p>
            <div className="mt-4 grid gap-3">
              {data.featuredRoutes.map((route) => (
                <Link
                  key={route.slug}
                  href={route.href}
                  className="theme-card block rounded-[20px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <RouteLabelWithIcons
                    fromToken={route.fromToken}
                    fromLabel={route.fromLabel}
                    fromNetworkId={route.fromNetworkId}
                    toToken={route.toToken}
                    toLabel={route.toLabel}
                    toNetworkId={route.toNetworkId}
                    className="justify-between"
                  />
                  <p className="theme-text-muted mt-3 text-sm leading-6">
                    {route.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Related price pages
            </p>
            <div className="mt-4 grid gap-3">
              {data.relatedTokens.map((tokenItem) => (
                <Link
                  key={tokenItem.symbol}
                  href={tokenItem.href}
                  className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <TokenNameWithIcon
                    symbol={tokenItem.symbol}
                    label={tokenItem.name}
                    textClassName="theme-text-main text-base font-semibold"
                  />
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    Compare another asset in the same support ecosystem, then
                    move into the route that fits the next action.
                  </p>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-4xl">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Common questions
            </p>
            <div className="mt-5 grid gap-3">
              {data.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="theme-card rounded-[20px] px-4 py-4"
                >
                  <p className="theme-text-main text-base font-semibold">
                    {faq.question}
                  </p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
                Final handoff
              </p>
              <h2 className="theme-text-main mt-3 text-[clamp(1.9rem,3vw,3rem)] font-semibold tracking-tight">
                Reviewed the price. Ready to route {data.tokenLabel}?
              </h2>
              <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
                This page keeps the user in a price-first mindset until the
                market context is clear. The route action stays one click away,
                but it does not take over the page.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={data.swapHref}
                className="theme-accent-cta inline-flex min-h-[48px] items-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
              >
                Start {data.tokenLabel} swap
              </Link>
              <Link
                href="/prices"
                className="theme-outline-button inline-flex min-h-[48px] items-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
              >
                Explore more prices
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
