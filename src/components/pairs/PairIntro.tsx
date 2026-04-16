import { PairHeroAssetJump } from "@/components/pairs/PairHeroAssetJump";
import { CryptoIcon } from "@/components/swap/CryptoIcon";
import {
  formatAssetNetworkLabel,
  getSupportedAssetNetworks,
} from "@/lib/pairs/assets";
import { isFrozenGoldSnapshotSlug } from "@/lib/pairs/frozenGoldSnapshot";
import { getNetworkIconSources } from "@/lib/sideshift/display";
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

function GenericSourceNetworkNote({ spec }: { spec: PairPageSpec }) {
  const supportedNetworks = getSupportedAssetNetworks(
    spec.builderPreset.fromCoin,
    "deposit",
  );

  if (!supportedNetworks.length) {
    return null;
  }

  const presetNetworkId = spec.builderPreset.fromNetwork.trim().toLowerCase();
  const orderedNetworks = [
    ...supportedNetworks.filter(
      (network) => network.id.trim().toLowerCase() === presetNetworkId,
    ),
    ...supportedNetworks.filter(
      (network) => network.id.trim().toLowerCase() !== presetNetworkId,
    ),
  ];
  const visibleNetworks = orderedNetworks.slice(0, 6);
  const hiddenCount = Math.max(orderedNetworks.length - visibleNetworks.length, 0);
  const noteText =
    orderedNetworks.length > 1
      ? `Route note: this page is prefilled with ${spec.fromLabel} on ${spec.fromNetworkLabel}, while ${spec.fromLabel} is currently supported across ${orderedNetworks.length} send networks on ZyroShift.`
      : `Route note: this asset is currently supported through a single send network, so the preset shown here reflects the only available source rail: ${spec.fromNetworkLabel}.`;

  return (
    <div className="mt-3">
      <p className="mx-auto max-w-3xl text-[12px] leading-6 text-amber-200/90 md:text-[13px]">
        {noteText}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {visibleNetworks.map((network) => {
          const networkId = network.id.trim().toLowerCase();
          const isPreset = networkId === presetNetworkId;

          return (
            <span
              key={network.id}
              aria-label={formatAssetNetworkLabel(network, true)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-[0_10px_24px_rgba(0,0,0,0.14)] ${
                isPreset
                  ? "theme-card-elevated border-amber-300/55 ring-1 ring-amber-300/35"
                  : "theme-card border-[var(--border-soft)]"
              }`}
              title={formatAssetNetworkLabel(network, true)}
            >
              <CryptoIcon
                alt={`${network.label} network icon`}
                className="rounded-full"
                size={18}
                sources={getNetworkIconSources(networkId)}
              />
            </span>
          );
        })}
        {hiddenCount > 0 ? (
          <span className="inline-flex min-h-[32px] items-center rounded-full border border-amber-300/25 bg-amber-300/10 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100/90">
            +{hiddenCount} more
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function PairIntro({
  spec,
  badges,
}: {
  spec: PairPageSpec;
  badges: PairHeroBadge[];
}) {
  const isGenericRoute = !isFrozenGoldSnapshotSlug(spec.slug);
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
            {isGenericRoute ? "Route overview" : "Pair route"}
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

          {isGenericRoute ? <GenericSourceNetworkNote spec={spec} /> : null}
        </div>

        <div className="theme-card-strong rounded-[24px] p-4">
          <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.28em]">
            {isGenericRoute ? "Route profile" : "Pair intent"}
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
