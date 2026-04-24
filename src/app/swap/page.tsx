import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SwapPageExperience } from "@/components/swap/SwapPageExperience";
import { getPairClusterDirectoryCards } from "@/lib/pairs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swap | Crypto Swap MVP",
  description: "Create a variable-rate crypto swap order and track settlement.",
};

export const dynamic = "force-static";

export default function SwapPage() {
  const routeFamilies = getPairClusterDirectoryCards();

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader activeKey="swap" ctaHref="#swap-builder" />

        <div id="swap-builder">
          <SwapPageExperience />
        </div>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
          <div className="max-w-3xl">
            <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
              Browse by route goal
            </p>
            <p className="theme-text-muted mt-3 text-sm leading-7 md:text-[15px]">
              Use these pages when you want to compare a type of swap before
              choosing one exact pair. They group common goals, such as
              stablecoins into Bitcoin or Bitcoin into another ecosystem.
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
                  {item.totalRoutes} total routes | {item.indexRoutes} featured now |{" "}
                  {item.noindexRoutes} more in this family
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
