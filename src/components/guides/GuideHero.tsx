import Link from "next/link";

import { CryptoIcon } from "@/components/swap/CryptoIcon";
import type { GuidePageSpec } from "@/lib/guides/types";
import { getNetworkIconSources } from "@/lib/sideshift/display";

function TokenNetworkCard({
  token,
  tokenIconSources,
  roleLabel,
  networks,
  currentNetworkId,
  currentNetworkLabel,
  contextLabel,
}: {
  token: string;
  tokenIconSources: string[];
  roleLabel: string;
  networks: GuidePageSpec["supportedSourceNetworks"];
  currentNetworkId: string;
  currentNetworkLabel: string;
  contextLabel: "send" | "receive";
}) {
  const hasMultipleNetworks = networks.length > 1;
  const showIconOnly = networks.length > 4;

  return (
    <div className="theme-card rounded-[20px] px-4 py-4">
      <div className="flex items-start gap-4">
        <div className="min-w-[108px]">
          <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
            {roleLabel}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <CryptoIcon
              alt={`${token} icon`}
              className="rounded-full"
              size={22}
              sources={tokenIconSources}
            />
            <p className="theme-text-main text-[1.02rem] font-semibold">
              {token}
            </p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="theme-text-main text-[13px] font-semibold leading-5">
            {hasMultipleNetworks
              ? `${token} currently supports ${networks.length} ${contextLabel === "send" ? "send" : "settlement"} networks on ZyroShift.`
              : `${token} currently has one supported ${contextLabel} network only: ${currentNetworkLabel}.`}
          </p>

          <p className="theme-text-muted mt-1.5 text-[12px] leading-5">
            {hasMultipleNetworks
              ? contextLabel === "send"
                ? "Choose the source network that matches where you are sending from."
                : "Choose the destination network that matches your receiving wallet."
              : contextLabel === "send"
                ? "The source network stays preselected because there is only one available send rail."
                : "The destination network stays fixed because there is only one available settlement rail."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {networks.map((network) => {
          const active = network.id === currentNetworkId;

          return (
            <span
              key={network.id}
              title={network.label}
              aria-label={network.label}
              className={`inline-flex items-center gap-2 rounded-full border ${
                showIconOnly ? "px-2.5 py-2" : "px-3 py-2"
              } ${
                active
                  ? "theme-card-elevated border-amber-300/50"
                  : "theme-card border-[var(--border-soft)]"
              }`}
            >
              <CryptoIcon
                alt={`${network.label} icon`}
                className="rounded-full"
                size={18}
                sources={getNetworkIconSources(network.id)}
              />
              {!showIconOnly ? (
                <span className="theme-text-main font-mono text-[10px] uppercase tracking-[0.2em]">
                  {network.label}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function GuideHero({ spec }: { spec: GuidePageSpec }) {
  const introSplitMarker = " On ZyroShift,";
  const hasSplitIntro = spec.intro.includes(introSplitMarker);
  const introLead = hasSplitIntro
    ? spec.intro.split(introSplitMarker)[0]
    : spec.intro;
  const introContext = hasSplitIntro
    ? `On ZyroShift,${spec.intro.split(introSplitMarker)[1] ?? ""}`.trim()
    : null;

  return (
    <section className="theme-panel relative overflow-hidden rounded-[34px] px-5 pt-5 pb-7 md:px-7 md:pt-6 md:pb-8 lg:px-8 lg:pt-7 lg:pb-9">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_28%)]" />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.38fr)_minmax(240px,0.62fr)] lg:items-start">
        <div className="mx-auto max-w-[64rem] text-center lg:text-left">
          <div className="translate-y-4 md:translate-y-5">
            <p className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.34em]">
              Step-by-step guide
            </p>

            <div className="mt-3 flex items-center justify-center gap-4 lg:justify-start">
              <div className="theme-card-strong flex items-center gap-3 rounded-full px-4 py-3">
                <CryptoIcon
                  alt={`${spec.fromToken} icon`}
                  className="rounded-full"
                  size={28}
                  sources={spec.fromIconSources}
                />
                <span className="theme-text-main font-mono text-[13px] uppercase tracking-[0.2em]">
                  {spec.fromToken}
                </span>
              </div>

              <span className="theme-text-soft font-mono text-[12px] uppercase tracking-[0.28em]">
                to
              </span>

              <div className="theme-card-strong flex items-center gap-3 rounded-full px-4 py-3">
                <CryptoIcon
                  alt={`${spec.toToken} icon`}
                  className="rounded-full"
                  size={28}
                  sources={spec.toIconSources}
                />
                <span className="theme-text-main font-mono text-[13px] uppercase tracking-[0.2em]">
                  {spec.toToken}
                </span>
              </div>
            </div>
          </div>

          <h1
            className="theme-text-main mt-4 max-w-none font-extrabold md:whitespace-nowrap"
            style={{
              fontSize: "clamp(44px, 5.2vw, 64px)",
              lineHeight: 0.92,
              fontWeight: 850,
              letterSpacing: "-0.075em",
            }}
          >
            <span className="inline-block">{spec.h1}</span>
          </h1>
          <div className="mt-3 max-w-[56rem] space-y-2">
            <p className="theme-text-main font-mono text-[16px] font-semibold leading-[1.45] tracking-[-0.02em] md:text-[17px]">
              {introLead}
            </p>
            {introContext ? (
              <p className="theme-text-main font-mono text-[16px] font-semibold leading-[1.45] tracking-[-0.02em] md:text-[17px]">
                {introContext}
              </p>
            ) : null}
          </div>

          <div className="mt-5 mb-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href={spec.moneyHref}
              className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#1ed9ff,#55b7ff)] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#04121b] transition hover:-translate-y-0.5"
            >
              Swap {spec.fromToken} to {spec.toToken} now
            </Link>
          </div>
        </div>

        <div className="theme-card-strong rounded-[24px] p-4">
          <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.28em]">
            Network options
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <TokenNetworkCard
              token={spec.fromToken}
              tokenIconSources={spec.fromIconSources}
              roleLabel="You send"
              networks={spec.supportedSourceNetworks}
              currentNetworkId={spec.fromNetworkId}
              currentNetworkLabel={spec.fromNetworkLabel}
              contextLabel="send"
            />
            <TokenNetworkCard
              token={spec.toToken}
              tokenIconSources={spec.toIconSources}
              roleLabel="You receive"
              networks={spec.supportedDestinationNetworks}
              currentNetworkId={spec.toNetworkId}
              currentNetworkLabel={spec.toNetworkLabel}
              contextLabel="receive"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
