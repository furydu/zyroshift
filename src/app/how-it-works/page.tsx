import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";
import Link from "next/link";

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Choose the route",
    body: "Select the asset and network you send, then choose the asset and network you want to receive so the route is explicit before funds move.",
  },
  {
    step: "02",
    title: "Set the destination",
    body: "Enter the receiving wallet address that matches the destination asset and network, then review the route before creating the shift.",
  },
  {
    step: "03",
    title: "Create and fund the shift",
    body: "Open the live route, review the quote mode, and send funds to the deposit address shown on the shift page.",
  },
  {
    step: "04",
    title: "Track to settlement",
    body: "Follow the shift through waiting, received, processing, and completed states until the destination transfer lands in your wallet.",
  },
];

const SAFETY_POINTS = [
  "Always match the deposit network to the route exactly before sending funds.",
  "If you use a fixed quote, send the exact deposit amount shown on the shift page.",
  "Treat the shift page as the source of truth for the deposit address, minimums, and live status.",
  "Wait for source-chain confirmations before treating a route as delayed.",
];

const FAQ_ITEMS = [
  {
    question: "Do I need an account to use the swap flow?",
    answer:
      "The product flow is route-first. You choose the pair, create the shift, send from your wallet, and follow the status page without relying on an exchange-style account dashboard.",
  },
  {
    question: "What is the difference between variable rate and fixed quote?",
    answer:
      "Variable rate follows the live market route until the deposit arrives. Fixed quote locks the route for a short window and requires the exact deposit amount shown on the order.",
  },
  {
    question: "Where do I track the status after creating the route?",
    answer:
      "Each route opens its own shift page with deposit instructions, transaction progress, and settlement updates. You can also revisit that flow from the Track Order page with the shift ID.",
  },
  {
    question: "What causes the most common route problems?",
    answer:
      "The most common issues come from sending on the wrong network, sending below the live minimum, or sending a fixed quote amount that does not match the locked route.",
  },
];

export const metadata: Metadata = {
  title: "How It Works | ZyroShift",
  description:
    "Understand the route-first swap flow from pair selection to deposit, tracking, and final settlement on ZyroShift.",
  alternates: {
    canonical: "https://zyroshift.com/how-it-works",
  },
};

export default function HowItWorksPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader activeKey="how" ctaHref="/swap" breadcrumbs={[{ label: "How it Works" }]} />

        <section className="theme-panel rounded-[32px] px-5 py-6 md:px-7 md:py-7">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            How it works
          </p>
          <h1 className="theme-text-main mx-auto mt-3 max-w-4xl text-center text-[clamp(2.2rem,4.6vw,4.9rem)] font-semibold leading-[0.95] tracking-tight">
            A route-first swap flow from builder to settlement.
          </h1>
          <p className="theme-text-muted mx-auto mt-4 max-w-3xl text-center text-sm leading-7 md:text-[15px]">
            ZyroShift is built to move users from pair selection into a live route, then into a single-purpose shift page that handles deposit instructions, progress, and settlement tracking.
          </p>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div
                key={step.step}
                className="theme-card rounded-[22px] px-4 py-4"
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(180deg, rgba(8,145,178,0.14), rgba(255,255,255,0.01))"
                      : index === 1
                        ? "linear-gradient(180deg, rgba(6,182,212,0.14), rgba(255,255,255,0.01))"
                        : index === 2
                          ? "linear-gradient(180deg, rgba(14,165,233,0.14), rgba(255,255,255,0.01))"
                          : "linear-gradient(180deg, rgba(34,197,94,0.14), rgba(255,255,255,0.01))",
                }}
              >
                <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
                  Step {step.step}
                </p>
                <h2 className="theme-text-main mt-3 text-lg font-semibold">
                  {step.title}
                </h2>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
          <div className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
              What to verify before sending
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              Crypto swap routes are operational pages, not just marketing pages. The route, network, and deposit instructions must be treated as exact before funds leave the wallet.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {SAFETY_POINTS.map((point) => (
                <div key={point} className="theme-card rounded-[20px] px-4 py-4 text-sm leading-6">
                  <span className="theme-text-main">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              After the route is created
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              The builder hands off to the shift page. That page becomes the source of truth for deposit address, accepted amount range, live progress, and final settlement.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/swap"
                className="theme-accent-cta inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
              >
                Start swap
              </Link>
              <Link
                href="/track-order"
                className="theme-chip inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                Track order
              </Link>
            </div>
          </aside>
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
            FAQ
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {FAQ_ITEMS.map((faq) => (
              <div key={faq.question} className="theme-card rounded-[20px] px-4 py-4">
                <p className="theme-text-main text-base font-semibold">{faq.question}</p>
                <p className="theme-text-muted mt-3 text-sm leading-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}

