import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { GuideHero } from "@/components/guides/GuideHero";
import { GuideStepGallery } from "@/components/guides/GuideStepGallery";
import { PairDisclaimer } from "@/components/pairs/PairDisclaimer";
import { PairFaq } from "@/components/pairs/PairFaq";
import { PairRelatedRoutes } from "@/components/pairs/PairRelatedRoutes";
import { getPairDisclaimerItems } from "@/lib/pairs";
import type { GuidePageSpec } from "@/lib/guides/types";

function SimpleListSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: string[];
}) {
  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
        {eyebrow}
      </p>
      <h2 className="theme-text-main mt-3 text-[1.45rem] font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="theme-card rounded-[20px] px-4 py-4">
            <p className="theme-text-muted text-sm leading-7">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SnapshotSection({ spec }: { spec: GuidePageSpec }) {
  return (
    <section className="theme-panel mt-6 rounded-[28px] px-5 py-4 md:px-6 md:py-5">
      <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
        Pair snapshot
      </p>
      <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
        {spec.snapshotItems.map((item) => (
          <div
            key={item.label}
            className="theme-card rounded-[18px] px-4 py-3.5"
          >
            <div className="grid gap-1.5 md:grid-cols-[148px_minmax(0,1fr)] md:gap-3">
              <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em] leading-5">
                {item.label}
              </p>
              <p className="theme-text-main font-mono text-[13px] font-semibold leading-[1.55] tracking-[-0.01em] md:text-[14px]">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RateModesSection({ spec }: { spec: GuidePageSpec }) {
  return (
    <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
        Choose the rate mode first
      </p>
      <h2 className="theme-text-main mt-3 text-[1.45rem] font-semibold tracking-tight">
        Variable Rate and Fixed Rate change what the user must do next.
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {spec.rateModeCards.map((card) => (
          <article
            key={card.title}
            className="theme-card rounded-[22px] px-4 py-4"
          >
            <h3
              className="inline-flex rounded-[12px] px-3 py-1.5 font-mono text-[1.15rem] font-bold tracking-[-0.03em] text-[#08111c]"
              style={{
                background:
                  card.title === "Variable Rate"
                    ? "linear-gradient(135deg, rgba(15,76,123,0.95) 0%, rgba(18,112,173,0.95) 55%, rgba(29,157,224,0.92) 100%)"
                    : "linear-gradient(135deg, rgba(128,83,2,0.95) 0%, rgba(178,116,8,0.95) 55%, rgba(215,157,18,0.92) 100%)",
              }}
            >
              {card.title}
            </h3>
            <p className="theme-text-muted mt-2 text-sm leading-7">
              {card.summary}
            </p>
            <div className="mt-4 grid gap-2">
              {card.bullets.map((item) => (
                <div
                  key={item}
                  className="theme-card-strong rounded-[16px] px-3 py-3"
                >
                  <p className="theme-text-muted text-sm leading-6">{item}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MistakesSection({ spec }: { spec: GuidePageSpec }) {
  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-amber font-mono text-[11px] uppercase tracking-[0.28em]">
        Common mistakes to avoid
      </p>
      <div className="mt-4 grid gap-3">
        {spec.mistakes.map((item) => (
          <div key={item.title} className="theme-card rounded-[20px] px-4 py-4">
            <h2 className="theme-text-main text-base font-semibold">
              {item.title}
            </h2>
            <p className="theme-text-muted mt-2 text-sm leading-7">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GuidePage({ spec }: { spec: GuidePageSpec }) {
  const disclaimerItems = getPairDisclaimerItems(spec.swapSpec);

  return (
    <main className="relative overflow-hidden" data-template-family="guide">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
        <SiteHeader
          activeKey="how"
          ctaHref={spec.moneyHref}
          ctaLabel={`Swap ${spec.fromToken} to ${spec.toToken}`}
          breadcrumbs={[
            { label: "Guides", href: "/guides" },
            { label: spec.h1 },
          ]}
        />

        <GuideHero spec={spec} />
        <RateModesSection spec={spec} />
        <GuideStepGallery spec={spec} />
        <SnapshotSection spec={spec} />

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SimpleListSection
            eyebrow={`Why users swap ${spec.fromToken} to ${spec.toToken}`}
            items={spec.reasons}
            title={`Why users swap ${spec.fromToken} to ${spec.toToken}`}
          />
          <SimpleListSection
            eyebrow="Fees and timing"
            items={spec.feeAndTimingPoints}
            title={`Fees and transaction time for ${spec.fromToken} to ${spec.toToken}`}
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SimpleListSection
            eyebrow="Network compatibility"
            items={spec.networkCompatibilityPoints}
            title="Network compatibility checks before you send funds"
          />
          <MistakesSection spec={spec} />
        </section>

        <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 text-center md:px-6">
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Ready to act on the live route?
          </p>
          <h2 className="theme-text-main mt-3 text-[1.45rem] font-semibold tracking-tight">
            Open the exact {spec.fromToken} to {spec.toToken} swap page.
          </h2>
          <p className="theme-text-muted mx-auto mt-3 max-w-3xl text-sm leading-7">
            This guide explains the process. The live builder and the created shift
            page remain the operational source of truth for rates, deposit rules,
            and final execution details.
          </p>
          <div className="mt-5">
            <Link
              href={spec.moneyHref}
              className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#1ed9ff,#55b7ff)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-[#04121b] transition hover:-translate-y-0.5"
            >
              Swap {spec.fromToken} to {spec.toToken} now
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <PairRelatedRoutes
            spec={spec.swapSpec}
            routes={spec.relatedRoutes}
            forceIconLabels
          />
        </section>

        <section className="mt-6">
          <PairFaq faqs={spec.faqs} />
        </section>

        <PairDisclaimer items={disclaimerItems} />
        <SiteFooter />
      </div>
    </main>
  );
}
