import { PairDisclaimer } from "@/components/pairs/PairDisclaimer";
import { PairExploreLinks } from "@/components/pairs/PairExploreLinks";
import { PairFaq } from "@/components/pairs/PairFaq";
import { PairHowItWorks } from "@/components/pairs/PairHowItWorks";
import { PairIntro } from "@/components/pairs/PairIntro";
import { PairNotes } from "@/components/pairs/PairNotes";
import { PairRelatedRoutes } from "@/components/pairs/PairRelatedRoutes";
import { PairRouteInfo } from "@/components/pairs/PairRouteInfo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SwapExperience } from "@/components/swap/SwapExperience";
import { isGuideRenderEnabled, resolveGuidePageSpec } from "@/lib/guides";
import {
  getPairDisclaimerItems,
  getPairExploreLinks,
  getPairHeroBadges,
  getPairRouteHighlights,
  getRelatedRouteSpecs,
  type PairPageSpec,
} from "@/lib/pairs";
import { getPairPageSchemas } from "@/lib/seo/schema";
import Link from "next/link";

export function PairPage({ spec }: { spec: PairPageSpec }) {
  const badges = getPairHeroBadges(spec);
  const routeHighlights = getPairRouteHighlights(spec);
  const relatedRoutes = getRelatedRouteSpecs(spec);
  const exploreLinks = getPairExploreLinks(spec);
  const disclaimerItems = getPairDisclaimerItems(spec);
  const schemas = getPairPageSchemas(spec);
  const guideSpec = isGuideRenderEnabled() ? resolveGuidePageSpec(spec.slug) : null;

  return (
    <main
      className="relative overflow-hidden"
      data-template-family={spec.templateFamily}
    >
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
        {schemas.map((schema, index) => (
          <script
            key={`${spec.slug}-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        <SiteHeader
          activeKey="swap"
          ctaHref="/swap"
          breadcrumbs={[
            { label: "Swap", href: "/swap" },
            { label: spec.h1 },
          ]}
        />

        <PairIntro spec={spec} badges={badges} />

        <section id="pair-builder" className="mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-center gap-4 text-center">
            <div className="mx-auto">
              <p className="theme-accent-amber font-mono text-xs uppercase tracking-[0.32em]">
                Live swap card
              </p>
              <h2 className="theme-text-main mt-2 text-[clamp(2rem,3vw,3rem)] font-semibold tracking-tight">
                Swap {spec.fromLabel} to {spec.toLabel} with the route prefilled.
              </h2>
            </div>
          </div>

          <SwapExperience embedded preset={spec.builderPreset} />
        </section>

        <PairRouteInfo items={routeHighlights} />

        {guideSpec ? (
          <section className="mt-6">
            <Link
              href={guideSpec.guideHref}
              className="theme-panel block rounded-[28px] px-5 py-5 transition hover:-translate-y-0.5 md:px-6"
            >
              <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
                Step-by-step guide
              </p>
              <h2 className="theme-text-main mt-3 text-[1.45rem] font-semibold tracking-tight">
                Need a walkthrough before using the live route?
              </h2>
              <p className="theme-text-muted mt-3 max-w-3xl text-sm leading-7">
                Read the dedicated guide for {guideSpec.fromToken} to{" "}
                {guideSpec.toToken} first, then come back here to execute the
                exact swap with the live builder.
              </p>
              <p className="theme-accent-amber mt-4 font-mono text-[11px] uppercase tracking-[0.24em]">
                Open guide
              </p>
            </Link>
          </section>
        ) : null}

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <PairHowItWorks steps={spec.howItWorks} />
          <PairNotes notes={spec.networkNotes} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
          <PairRelatedRoutes spec={spec} routes={relatedRoutes} />
          <PairExploreLinks links={exploreLinks} />
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
