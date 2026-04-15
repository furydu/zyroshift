import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CryptoIcon } from "@/components/swap/CryptoIcon";
import { SwapExperience } from "@/components/swap/SwapExperience";
import { getPairLaunchSpecs } from "@/lib/site/pairs";
import {
  getCoinIconSources,
  getNetworkIconSources,
} from "@/lib/sideshift/display";
import Link from "next/link";
import type { PairPageSpec } from "@/lib/pairs";

const TRUST_POINTS = [
  {
    title: "Non-custodial flow",
    body: "Create the shift, send funds from your own wallet, and follow settlement without parking assets in an account.",
  },
  {
    title: "No sign-up friction",
    body: "Start with the route itself. The builder, deposit instructions, and status page handle the transaction flow directly.",
  },
  {
    title: "Variable and fixed modes",
    body: "Use variable rate for live market routing or fixed quote when you need a short lock window and exact deposit amount.",
  },
  {
    title: "Dedicated status tracking",
    body: "Every shift has its own waiting, received, processing, and completed state so the lifecycle stays easy to follow.",
  },
];

const COVERAGE_SNAPSHOT = [
  {
    value: "205",
    label: "supported assets",
  },
  {
    value: "47",
    label: "active networks",
  },
  {
    value: "271",
    label: "coin-network routes",
  },
];

const SUPPORTED_TOKENS = [
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "SOL",
  "BNB",
  "TRX",
  "ADA",
  "XRP",
  "BCH",
];

const POPULAR_NETWORKS = [
  {
    slug: "bitcoin",
    name: "Bitcoin",
    note: "Native BTC settlement and classic store-of-value routes.",
  },
  {
    slug: "ethereum",
    name: "Ethereum",
    note: "Main route for ETH, ERC20 assets, and fixed-quote demand.",
  },
  {
    slug: "tron",
    name: "Tron",
    note: "Low-cost stablecoin routing, especially USDT TRC20 flows.",
  },
  {
    slug: "bsc",
    name: "BNB Chain",
    note: "Popular for broad asset coverage and lower transfer cost.",
  },
  {
    slug: "solana",
    name: "Solana",
    note: "Fast settlement routes for SOL and selected stablecoin exits.",
  },
  {
    slug: "base",
    name: "Base",
    note: "Growing stablecoin and ETH ecosystem routes for EVM users.",
  },
  {
    slug: "arbitrum",
    name: "Arbitrum",
    note: "Useful when route intent depends on cheaper Ethereum-side execution.",
  },
  {
    slug: "polygon",
    name: "Polygon",
    note: "Another network where token symbol alone is not enough context.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose the route",
    body: "Select the token and network you send, then choose the token and network you want to receive.",
  },
  {
    step: "02",
    title: "Enter the destination",
    body: "Add the receiving wallet address before creating the shift so settlement has a defined destination.",
  },
  {
    step: "03",
    title: "Create the shift",
    body: "Review the live quote or fixed quote, create the order, and copy the deposit address from the shift page.",
  },
  {
    step: "04",
    title: "Track to settlement",
    body: "Watch the shift move from waiting to received, processing, and completed on the dedicated status flow.",
  },
];

const FAQ_ITEMS = [
  {
    question: "What is a non-custodial crypto swap?",
    answer:
      "It means the site helps create and track the route, but the user still sends funds from a wallet they control and receives settlement directly to a chosen address.",
  },
  {
    question: "Do I need KYC or an account to use the swap flow?",
    answer:
      "The product positioning here is account-light and route-first. The live builder focuses on creating the shift, giving deposit instructions, and showing the settlement lifecycle.",
  },
  {
    question: "What is the difference between variable rate and fixed quote?",
    answer:
      "Variable rate stays live until the deposit arrives. Fixed quote locks the route for a short window and requires the exact deposit amount shown on the shift.",
  },
  {
    question: "What happens if I send less than the minimum?",
    answer:
      "The live minimum on the route matters. Deposits below the allowed range can fail to settle normally and may require provider-side handling.",
  },
  {
    question: "How long does a swap usually take?",
    answer:
      "Timing depends on deposit detection, blockchain confirmations, route processing, and the destination network used for settlement.",
  },
  {
    question: "Why does the selected network matter so much?",
    answer:
      "Stablecoins and other assets can exist on several chains. The destination wallet and network must match the exact route chosen in the builder.",
  },
];

function getRouteNetworkBadge(networkLabel: string) {
  const match = networkLabel.match(
    /TRC20|ERC20|BEP20|Base|Arbitrum|Polygon|Solana|Bitcoin/i,
  );

  return match ? match[0].toUpperCase() : null;
}

function getHomepageRouteSummary(route: PairPageSpec) {
  switch (route.slug) {
    case "usdt-trc20-to-btc":
      return "Fee-first stablecoin route from Tron into native BTC settlement.";
    case "usdt-erc20-to-btc":
      return "Compatibility-first stablecoin route when the funds already sit in an ERC20 wallet.";
    case "usdt-bep20-to-btc":
      return "Alternative EVM-style stablecoin path into BTC with lower transfer cost than Ethereum.";
    case "usdc-base-to-eth":
      return "Base-native stablecoin route into ETH when the route starts from a lower-cost L2 rail.";
    default:
      return route.useCase;
  }
}

function RouteTokenMark({
  coin,
  network,
  label,
}: {
  coin: string;
  network: string;
  label: string;
}) {
  const badge = getRouteNetworkBadge(label);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <CryptoIcon
          alt={`${coin} icon`}
          className="rounded-full"
          size={18}
          sources={getCoinIconSources(coin)}
        />
        {badge ? (
          <span className="theme-card-elevated absolute -bottom-1 -right-1 inline-flex h-[11px] w-[11px] items-center justify-center rounded-full border border-white/10">
            <CryptoIcon
              alt={`${network} network icon`}
              className="rounded-full"
              size={7}
              sources={getNetworkIconSources(network)}
            />
          </span>
        ) : null}
      </span>
      <span>{label}</span>
    </span>
  );
}


export function HomePage() {
  const launchRoutes = getPairLaunchSpecs(5);

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1520px] px-4 py-5 md:px-6 lg:px-8">
        <SiteHeader ctaHref="/#swap-builder" />

        <section className="theme-panel relative overflow-hidden rounded-[34px] px-5 py-6 md:px-7 md:py-7 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_26%)]" />

          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.72fr)] xl:items-start">
            <div className="mx-auto max-w-4xl text-center">
              <p className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.34em]">
                Non-custodial crypto swap
              </p>
              <h1 className="theme-text-main mt-3 max-w-5xl text-[clamp(2.55rem,5vw,5rem)] font-semibold leading-[0.92] tracking-tight">
                Instant crypto swaps with live routes and dedicated tracking.
              </h1>
              <p className="theme-text-muted mx-auto mt-3 max-w-3xl text-[15px] leading-7 md:text-[16px]">
                Swap across supported tokens and networks with variable-rate and
                fixed-quote flows, then follow the shift from deposit to
                settlement on its own status page.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {COVERAGE_SNAPSHOT.map((item) => (
                <div
                  key={item.label}
                  className="theme-card rounded-[22px] px-4 py-3"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="theme-text-main text-[2rem] font-semibold leading-none">
                      {item.value}
                    </span>
                    <span className="theme-accent-amber mt-2 font-mono text-[11px] uppercase tracking-[0.26em]">
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="swap-builder" className="relative mt-4">
            <SwapExperience embedded />
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="theme-panel rounded-[30px] px-5 py-5 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="max-w-3xl">
                <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
                  Why ZyroShift
                </p>
                <h2 className="theme-text-main mt-3 text-[clamp(1.85rem,3.1vw,2.7rem)] font-semibold leading-tight tracking-tight">
                  Built to convert first, then scale cleanly into routes,
                  tokens, and networks.
                </h2>
              </div>
              <p className="theme-text-muted max-w-3xl text-sm leading-6">
                The homepage leads with the live swap builder, while the rest of
                the site expands into structured pair pages, token hubs, and
                network context behind the main conversion flow.
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {TRUST_POINTS.map((point) => (
                <div
                  key={point.title}
                  className="theme-card rounded-[22px] px-4 py-4"
                >
                  <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
                    {point.title}
                  </p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            id="supported-assets"
            className="theme-panel rounded-[30px] px-5 py-5 md:px-6"
          >
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Supported assets snapshot
            </p>
            <h2 className="theme-text-main mt-3 text-[clamp(1.7rem,2.6vw,2.35rem)] font-semibold leading-tight tracking-tight">
              Core tokens, major networks, and room to scale into long-tail
              pair pages.
            </h2>
            <p className="theme-text-muted mt-3 text-sm leading-6">
              The launch set is built around BTC, ETH, SOL, BNB, USDT, and USDC
              routes first, then expands into more network-aware pages where
              user intent and address confusion justify dedicated coverage.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUPPORTED_TOKENS.map((token) => (
                <Link
                  key={token}
                  href={`/tokens/${token.toLowerCase()}`}
                  className="theme-chip rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em]"
                >
                  {token}
                </Link>
              ))}
            </div>

            <div className="theme-info-panel mt-5 rounded-[20px] px-4 py-4">
              <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
                Live coverage note
              </p>
              <p className="theme-text-muted mt-2 text-sm leading-6">
                Rates, limits, and route availability stay provider-driven. The
                builder and shift page remain the source of truth for live
                minimums, maximums, and exact settlement behavior.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          <div
            id="popular-routes"
            className="theme-panel rounded-[30px] px-5 py-5 md:px-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
                  Popular routes
                </p>
                <h2 className="theme-text-main mt-3 text-[clamp(1.7rem,2.7vw,2.4rem)] font-semibold leading-tight tracking-tight">
                  Launch routes with strong transactional intent.
                </h2>
              </div>
              <Link
                href="/swap"
                className="theme-outline-button inline-flex items-center rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] transition hover:-translate-y-0.5"
              >
                Open builder page
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {launchRoutes.map((route) => (
                <Link
                  key={route.slug}
                  href={`/swap/${route.slug}`}
                  className="theme-card group rounded-[22px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <p className="theme-text-main flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em]">
                    <RouteTokenMark
                      coin={route.builderPreset.fromCoin}
                      label={`${route.fromLabel}${getRouteNetworkBadge(route.fromNetworkLabel) ? ` ${getRouteNetworkBadge(route.fromNetworkLabel)}` : ""}`}
                      network={route.builderPreset.fromNetwork}
                    />
                    <span>→</span>
                    <RouteTokenMark
                      coin={route.builderPreset.toCoin}
                      label={`${route.toLabel}${getRouteNetworkBadge(route.toNetworkLabel) ? ` ${getRouteNetworkBadge(route.toNetworkLabel)}` : ""}`}
                      network={route.builderPreset.toNetwork}
                    />
                  </p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {getHomepageRouteSummary(route)}
                  </p>
                  <p className="theme-accent-amber mt-3 font-mono text-[10px] uppercase tracking-[0.24em]">
                    Open route
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div
            id="popular-networks"
            className="theme-panel rounded-[30px] px-5 py-5 md:px-6"
          >
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Popular networks
            </p>
            <h2 className="theme-text-main mt-3 text-[clamp(1.7rem,2.7vw,2.4rem)] font-semibold leading-tight tracking-tight">
              Networks that matter because fees, address formats, and user
              intent are not all the same.
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {POPULAR_NETWORKS.map((network) => (
                <Link
                  key={network.name}
                  href={`/networks/${network.slug}`}
                  className="theme-card rounded-[20px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
                >
                  <p className="theme-text-main inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em]">
                    <CryptoIcon
                      alt={`${network.name} network icon`}
                      className="rounded-full"
                      size={16}
                      sources={getNetworkIconSources(network.slug)}
                    />
                    <span>{network.name}</span>
                  </p>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {network.note}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="theme-panel mt-6 rounded-[30px] px-5 py-5 md:px-6"
        >
          <div className="max-w-3xl">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              How it works
            </p>
            <h2 className="theme-text-main mt-3 text-[clamp(1.8rem,3vw,2.7rem)] font-semibold leading-tight tracking-tight">
              A route-first flow from pair selection to final settlement.
            </h2>
            <p className="theme-text-muted mt-3 text-sm leading-6 md:text-[15px]">
              The homepage is built to send users straight into the live builder,
              but every swap still follows a consistent operational flow that is
              easy to understand and track.
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="theme-card rounded-[22px] px-4 py-4">
                <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
                  Step {step.step}
                </p>
                <h3 className="theme-text-main mt-3 text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div id="status-flow" className="theme-panel rounded-[30px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Status and trust
            </p>
            <h2 className="theme-text-main mt-3 text-[clamp(1.75rem,2.8vw,2.45rem)] font-semibold leading-tight tracking-tight">
              A dedicated shift page keeps the transaction state readable after
              the order is created.
            </h2>
            <p className="theme-text-muted mt-3 text-sm leading-6 md:text-[15px]">
              Once the shift exists, the site moves out of builder mode and into
              a single-purpose status page. That page handles deposit address,
              QR, allowed range, live state changes, transaction hashes, and the
              final settlement result.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="theme-card rounded-[22px] px-4 py-4">
                <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
                  Live minimum and maximum
                </p>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  Deposit limits stay visible where users actually need them,
                  right before funds are sent.
                </p>
              </div>
              <div className="theme-card rounded-[22px] px-4 py-4">
                <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
                  Wait, received, processing, completed
                </p>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  The lifecycle is explicit, so users do not need to guess where
                  a swap stands after the deposit leaves their wallet.
                </p>
              </div>
            </div>
          </div>

          <div id="faq" className="theme-panel rounded-[30px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Homepage FAQ
            </p>
            <h2 className="theme-text-main mt-3 text-[clamp(1.75rem,2.8vw,2.45rem)] font-semibold leading-tight tracking-tight">
              Core questions users ask before sending funds.
            </h2>

            <div className="mt-5 grid gap-3">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question} className="theme-card rounded-[22px] px-4 py-4">
                  <h3 className="theme-text-main text-base font-semibold">
                    {item.question}
                  </h3>
                  <p className="theme-text-muted mt-2 text-sm leading-6">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
