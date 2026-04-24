import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isGuideRenderEnabled, getGuideListingSpecs } from "@/lib/guides";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swap Guides | ZyroShift",
  description:
    "Step-by-step educational guides that support ZyroShift swap routes.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function GuidesHubPage() {
  if (!isGuideRenderEnabled()) {
    notFound();
  }

  const guides = getGuideListingSpecs();

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader
          activeKey="how"
          ctaHref="/swap"
          ctaLabel="Start Swap"
          breadcrumbs={[{ label: "Guides" }]}
        />

        <section className="theme-panel rounded-[34px] px-5 py-6 md:px-7 md:py-7 lg:px-8 lg:py-8">
          <p className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.34em]">
            Swap guides
          </p>
          <h1 className="theme-text-main mt-4 text-[clamp(2.25rem,4vw,4rem)] font-semibold leading-[0.98] tracking-tight">
            Educational route guides that support live ZyroShift swaps.
          </h1>
          <p className="theme-text-muted mt-4 max-w-3xl text-[15px] leading-7">
            This layer is intentionally narrow in phase 1. Each guide is meant to
            explain one exact route clearly, then hand the user back to the live
            transactional page for execution.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={guide.guideHref}
              className="theme-panel rounded-[28px] px-5 py-5 transition hover:-translate-y-0.5 md:px-6"
            >
              <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
                Sample guide
              </p>
              <h2 className="theme-text-main mt-3 text-[1.45rem] font-semibold tracking-tight">
                {guide.h1}
              </h2>
              <p className="theme-text-muted mt-3 text-sm leading-7">
                {guide.description}
              </p>
              <p className="theme-accent-cyan mt-4 font-mono text-[11px] uppercase tracking-[0.24em]">
                Open guide
              </p>
            </Link>
          ))}
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
