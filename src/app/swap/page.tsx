import { SiteFooter } from "@/components/layout/SiteFooter";
import { RecentShiftsPanel } from "@/components/swap/RecentShiftsPanel";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SwapExperience } from "@/components/swap/SwapExperience";
import { getPairClusterDirectoryCards } from "@/lib/pairs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swap | Crypto Swap MVP",
  description: "Create a variable-rate crypto swap order and track settlement.",
};

export default function SwapPage() {
  const routeFamilies = getPairClusterDirectoryCards();

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader activeKey="swap" ctaHref="#swap-builder" />

        <div id="swap-builder">
          <SwapExperience showThemeToggle={false} />
        </div>

        <RecentShiftsPanel limit={8} />

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-3xl">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Route families
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              These internal parent pages group routes by intent family instead of by one pair only. Use them to review which families are strongest before deciding what should eventually be published more broadly.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {routeFamilies.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="theme-card block rounded-[18px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
              >
                <p className="theme-text-main text-base font-semibold">
                  {item.title}
                </p>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  {item.summary}
                </p>
                <p className="theme-text-soft mt-3 font-mono text-[10px] uppercase tracking-[0.18em]">
                  {item.totalRoutes} routes · {item.indexRoutes} launch-ready · {item.noindexRoutes} render-only
                </p>
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
