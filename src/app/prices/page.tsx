import { PricesDirectoryExplorer } from "@/components/prices/PricesDirectoryExplorer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getPriceDirectoryCards,
  PRICE_DIRECTORY_FEATURED_LIMIT,
} from "@/lib/prices/provider";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Crypto Prices Today | ZyroShift",
  description:
    "Preview a dedicated token price system for ZyroShift with live USD pricing, 24h movement, and network support context before a user enters the swap flow.",
  alternates: {
    canonical: "https://zyroshift.com/prices",
  },
};

export default async function PricesDirectoryPage() {
  const cards = await getPriceDirectoryCards();
  const quickLinks = ["btc", "eth", "sol", "usdt", "avax", "cbbtc"];

  return (
    <main className="relative overflow-hidden">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_28%),linear-gradient(180deg,rgba(5,10,20,0.98),rgba(3,7,15,0.96))]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />
        <div className="relative mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
          <SiteHeader
            ctaHref="/swap"
            ctaLabel="Start Swap"
            breadcrumbs={[{ label: "Prices" }]}
          />

          <section className="grid gap-8 pb-12 pt-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-end lg:pb-16">
            <div className="max-w-4xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-cyan-200/90">
                Price System Preview
              </p>
              <h1 className="mt-4 max-w-4xl text-[clamp(3.1rem,8vw,7.2rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                TOKEN PRICE TODAY
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300 md:text-[17px]">
                A dedicated support layer built for ads and price intent first.
                Users land on a live token price view, see network support on
                ZyroShift, then move into swap only when the intent is ready.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/prices/eth"
                  className="inline-flex min-h-[48px] items-center rounded-full bg-[linear-gradient(135deg,#67e8f9,#fcd34d)] px-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:-translate-y-0.5"
                >
                  Open ETH sample
                </Link>
                <Link
                  href="/tokens/eth"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-white/14 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/86 transition hover:border-cyan-200/40 hover:text-white"
                >
                  Compare token hub
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  Quick price URLs
                </span>
                {quickLinks.map((token) => (
                  <Link
                    key={token}
                    href={`/prices/${token}`}
                    className="inline-flex min-h-[36px] items-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/86 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:text-white"
                  >
                    /prices/{token}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">
                  System role
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  Ads-first support pages
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Price intent stays primary. Swap stays present, but secondary.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-slate-400">
                  Scope
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  205 supported assets
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Built to scale from a preview route into a full publishable
                  price family without changing swap code.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <section className="theme-panel rounded-[30px] px-5 py-5 md:px-6">
          <div className="max-w-3xl">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Directory preview
            </p>
            <h2 className="theme-text-main mt-3 text-[clamp(2rem,3vw,3.1rem)] font-semibold tracking-tight">
              Live-ready tokens for the first impression
            </h2>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              This index keeps the landing tight: one price-oriented family, one
              clear user intent, and a direct handoff into ZyroShift once the
              user has enough context.
            </p>
          </div>
          <PricesDirectoryExplorer
            cards={cards}
            featuredCount={PRICE_DIRECTORY_FEATURED_LIMIT}
          />
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
