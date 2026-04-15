import { CryptoIcon } from "@/components/swap/CryptoIcon";
import {
  getCoinIconSources,
  getNetworkIconSources,
} from "@/lib/sideshift/display";

type RouteLabelWithIconsProps = {
  fromToken: string;
  fromLabel: string;
  fromNetworkId?: string;
  toToken: string;
  toLabel: string;
  toNetworkId?: string;
  className?: string;
  endpointTextClassName?: string;
  arrowClassName?: string;
  iconSize?: number;
  endpointIconBoxClassName?: string;
  overlayIconSize?: number;
  overlayIconBoxClassName?: string;
};

function normalizeLabel(value: string) {
  return value.trim().toLowerCase();
}

function shouldShowNetworkOverlay(label: string, token: string, networkId?: string) {
  return Boolean(networkId && normalizeLabel(label) !== normalizeLabel(token));
}

function RouteEndpoint({
  token,
  label,
  networkId,
  textClassName,
  iconSize,
  iconBoxClassName,
  overlayIconSize,
  overlayIconBoxClassName,
}: {
  token: string;
  label: string;
  networkId?: string;
  textClassName: string;
  iconSize: number;
  iconBoxClassName: string;
  overlayIconSize: number;
  overlayIconBoxClassName: string;
}) {
  const showNetworkOverlay = shouldShowNetworkOverlay(label, token, networkId);

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span
        className={`theme-card-elevated relative inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] ${iconBoxClassName}`}
      >
        <CryptoIcon
          alt={`${label} icon`}
          className="rounded-full"
          size={iconSize}
          sources={getCoinIconSources(token)}
        />
        {showNetworkOverlay && networkId ? (
          <span
            className={`theme-card-elevated absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full border border-[var(--border-soft)] shadow-[0_6px_14px_rgba(0,0,0,0.2)] ${overlayIconBoxClassName}`}
          >
            <CryptoIcon
              alt={`${networkId} network icon`}
              className="rounded-full"
              size={overlayIconSize}
              sources={getNetworkIconSources(networkId)}
            />
          </span>
        ) : null}
      </span>
      <span className={`${textClassName} min-w-0 truncate`}>{label}</span>
    </span>
  );
}

export function RouteLabelWithIcons({
  fromToken,
  fromLabel,
  fromNetworkId,
  toToken,
  toLabel,
  toNetworkId,
  className = "",
  endpointTextClassName = "theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]",
  arrowClassName = "theme-text-soft font-mono text-[11px] uppercase tracking-[0.24em]",
  iconSize = 16,
  endpointIconBoxClassName = "h-6 w-6",
  overlayIconSize = 8,
  overlayIconBoxClassName = "h-3.5 w-3.5",
}: RouteLabelWithIconsProps) {
  return (
    <span className={`inline-flex min-w-0 flex-wrap items-center gap-2 ${className}`}>
      <RouteEndpoint
        iconBoxClassName={endpointIconBoxClassName}
        iconSize={iconSize}
        label={fromLabel}
        networkId={fromNetworkId}
        overlayIconBoxClassName={overlayIconBoxClassName}
        overlayIconSize={overlayIconSize}
        textClassName={endpointTextClassName}
        token={fromToken}
      />
      <span aria-hidden="true" className={arrowClassName}>
        {"\u2192"}
      </span>
      <RouteEndpoint
        iconBoxClassName={endpointIconBoxClassName}
        iconSize={iconSize}
        label={toLabel}
        networkId={toNetworkId}
        overlayIconBoxClassName={overlayIconBoxClassName}
        overlayIconSize={overlayIconSize}
        textClassName={endpointTextClassName}
        token={toToken}
      />
    </span>
  );
}
