import { CryptoIcon } from "@/components/swap/CryptoIcon";
import {
  getCoinIconSources,
  getNetworkIconSources,
} from "@/lib/sideshift/display";

function normalizeLabel(value: string) {
  return value.trim().toLowerCase();
}

function hasExplicitNetwork(routeLabel: string, tokenLabel: string) {
  return normalizeLabel(routeLabel) !== normalizeLabel(tokenLabel);
}

export function PairHeroAssetJump({
  coin,
  networkId,
  routeLabel,
  tokenLabel,
  side,
}: {
  coin: string;
  networkId?: string;
  routeLabel: string;
  tokenLabel: string;
  side: "left" | "right";
}) {
  const showNetworkOverlay = Boolean(
    networkId && hasExplicitNetwork(routeLabel, tokenLabel),
  );

  return (
    <a
      href="#pair-builder"
      aria-label={`Jump to swap builder for ${routeLabel}`}
      className={`theme-card-strong hidden h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[28px] border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_22px_44px_rgba(22,192,242,0.18)] md:inline-flex ${
        side === "left" ? "justify-self-start" : "justify-self-end"
      }`}
    >
      <span className="relative inline-flex h-[62px] w-[62px] items-center justify-center">
        <span className="theme-card-elevated inline-flex h-full w-full items-center justify-center rounded-full border border-white/10">
          <CryptoIcon
            alt={`${coin} icon`}
            className="rounded-full"
            size={44}
            sources={getCoinIconSources(
              coin,
              showNetworkOverlay ? networkId : undefined,
            )}
          />
        </span>

        {showNetworkOverlay && networkId ? (
          <span className="theme-card-elevated absolute -bottom-1 -right-1 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/12 shadow-[0_6px_14px_rgba(0,0,0,0.22)]">
            <CryptoIcon
              alt={`${networkId} icon`}
              className="rounded-full"
              size={13}
              sources={getNetworkIconSources(networkId)}
            />
          </span>
        ) : null}
      </span>
    </a>
  );
}
