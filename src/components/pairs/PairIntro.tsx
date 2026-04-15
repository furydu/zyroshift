import { PairHeroAssetJump } from "@/components/pairs/PairHeroAssetJump";
import type { PairHeroBadge, PairPageSpec } from "@/lib/pairs/types";

function badgeClassName(tone: PairHeroBadge["tone"]) {
  if (tone === "warning") {
    return "theme-pill-warning";
  }

  if (tone === "success") {
    return "theme-pill-success";
  }

  return "theme-pill-info";
}

export function PairIntro({
  spec,
  badges,
}: {
  spec: PairPageSpec;
  badges: PairHeroBadge[];
}) {
  const heroRouteLabel = spec.h1.replace(/^Swap\s+/i, "");
  const [fromRouteLabel, toRouteLabel] =
    heroRouteLabel.split(/\s+to\s+/i).length === 2
      ? heroRouteLabel.split(/\s+to\s+/i)
      : [spec.fromLabel, spec.toLabel];

  return (
    <section className="theme-panel relative overflow-hidden rounded-[34px] px-5 py-6 md:px-7 md:py-7 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_28%)]" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-start">
        <div className="mx-auto max-w-4xl text-center">
          <p className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.34em]">
            Pair route
          </p>
          <div className="mt-3 grid items-center gap-3 md:grid-cols-[92px_minmax(0,1fr)_92px]">
            <PairHeroAssetJump
              coin={spec.builderPreset.fromCoin}
              networkId={spec.builderPreset.fromNetwork}
              routeLabel={fromRouteLabel}
              side="left"
              tokenLabel={spec.fromLabel}
            />

            <h1 className="theme-text-main font-semibold leading-[0.94] tracking-tight">
              <span className="block text-[clamp(2.9rem,5.8vw,5.05rem)]">SWAP</span>
              <span className="mt-1 block text-[clamp(1.6rem,3vw,2.55rem)]">
                {heroRouteLabel}
              </span>
            </h1>

            <PairHeroAssetJump
              coin={spec.builderPreset.toCoin}
              networkId={spec.builderPreset.toNetwork}
              routeLabel={toRouteLabel}
              side="right"
              tokenLabel={spec.toLabel}
            />
          </div>
          <p className="theme-text-muted mx-auto mt-4 max-w-3xl text-[15px] leading-7 md:text-[16px]">
            {spec.intro}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:flex-nowrap sm:gap-2.5">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`${badgeClassName(badge.tone)} whitespace-nowrap rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em]`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#pair-builder"
              className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#1ed9ff,#55b7ff)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-[#04121b] transition hover:-translate-y-0.5"
            >
              Start swap
            </a>
          </div>
        </div>

        <div className="theme-card-strong rounded-[24px] p-4">
          <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.28em]">
            Pair intent
          </p>
          <p className="theme-text-main mt-3 text-lg font-semibold leading-8">
            {spec.useCase}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="theme-card rounded-[18px] px-4 py-4">
              <p className="theme-text-soft text-center font-mono text-[10px] uppercase tracking-[0.22em]">
                Send
              </p>
              <p className="theme-text-main mt-2 text-center text-[1.12rem] font-semibold leading-7">
                {spec.fromLabel} on {spec.fromNetworkLabel}
              </p>
            </div>
            <div className="theme-card rounded-[18px] px-4 py-4">
              <p className="theme-text-soft text-center font-mono text-[10px] uppercase tracking-[0.22em]">
                Receive
              </p>
              <p className="theme-text-main mt-2 text-center text-[1.12rem] font-semibold leading-7">
                {spec.toLabel} on {spec.toNetworkLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
