import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TrackOrderLookup } from "@/components/track/TrackOrderLookup";
import type { Metadata } from "next";
import Link from "next/link";

const STATUS_STAGES = [
  {
    title: "Awaiting deposit",
    summary: "The route is created and waiting for your inbound transfer.",
  },
  {
    title: "Confirming",
    summary: "The deposit was detected and the source network is confirming it.",
  },
  {
    title: "Exchanging",
    summary: "The route is moving funds through the provider and preparing settlement.",
  },
  {
    title: "Settling",
    summary: "The destination asset is being sent to the wallet you entered.",
  },
  {
    title: "Completed",
    summary: "The route finished and the payout transaction should be visible on-chain.",
  },
];

const HELP_POINTS = [
  "Make sure the deposit network matches the route exactly before sending funds.",
  "If you used a fixed quote, send the exact amount shown on the shift page.",
  "Wait for source-chain confirmations before treating a route as stalled.",
  "Keep your shift ID and deposit transaction hash ready if you need help.",
];

const SUPPORT_CHECKLIST = [
  "Shift ID",
  "Deposit transaction hash",
  "The network you sent from",
  "The receiving wallet address",
];

export const metadata: Metadata = {
  title: "Track Order | ZyroShift",
  description:
    "Track your shift status, review deposit progress, and open the live settlement page with your shift ID.",
  alternates: {
    canonical: "https://zyroshift.com/track-order",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TrackOrderPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader activeKey="status" ctaHref="/swap" />

        <section className="theme-panel rounded-[32px] px-5 py-6 md:px-7 md:py-7">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Track order
          </p>
          <h1 className="theme-text-main mx-auto mt-3 max-w-4xl text-center text-[clamp(2.2rem,4.6vw,4.9rem)] font-semibold leading-[0.95] tracking-tight">
            Track your swap status
          </h1>
          <p className="theme-text-muted mx-auto mt-4 max-w-3xl text-center text-sm leading-7 md:text-[15px]">
            Enter your shift ID to open the live status page with deposit
            progress, route updates, and settlement details.
          </p>

          <div className="mx-auto mt-6 max-w-4xl">
            <TrackOrderLookup />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/swap"
              className="theme-chip inline-flex min-h-[40px] items-center rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
            >
              Start a new swap
            </Link>
            <span className="theme-text-soft text-sm">
              Already on a shift page? You can paste the full URL here too.
            </span>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Status flow
            </p>
            <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-7 md:text-[15px]">
              Every route moves through the same status stages. The live shift
              page shows which step is active and what still needs attention.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {STATUS_STAGES.map((stage, index) => (
                <div
                  key={stage.title}
                  className="theme-card rounded-[18px] px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="theme-chip inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold">
                      {index + 1}
                    </div>
                    <p className="theme-text-main text-sm font-semibold">
                      {stage.title}
                    </p>
                  </div>
                  <p className="theme-text-muted mt-3 text-sm leading-6">
                    {stage.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              If something looks wrong
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              Most route issues come from the deposit side. Before treating a
              route as stuck, check these items against your shift page.
            </p>

            <ul className="mt-4 grid gap-3">
              {HELP_POINTS.map((point) => (
                <li
                  key={point}
                  className="theme-card rounded-[18px] px-4 py-3 text-sm leading-6"
                >
                  <span className="theme-text-main">{point}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              Keep these ready
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              If a route needs a closer review, having these details ready will
              make the next step much easier.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {SUPPORT_CHECKLIST.map((item) => (
                <div
                  key={item}
                  className="theme-card rounded-[18px] px-4 py-3 text-sm font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Need a fresh route instead?
            </p>
            <h2 className="theme-text-main mt-3 text-2xl font-semibold tracking-tight md:text-[2rem]">
              Open a new swap if the old one no longer fits.
            </h2>
            <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-7 md:text-[15px]">
              Track the current order first, then start a new route only if you
              still need to move funds with a different pair, network, or rate
              mode.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/swap"
                className="theme-accent-cta inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
              >
                Start swap
              </Link>
              <Link
                href="/"
                className="theme-chip inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                Back to homepage
              </Link>
            </div>
          </section>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
