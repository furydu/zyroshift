import { CryptoIcon } from "@/components/swap/CryptoIcon";
import { getNetworkIconSources } from "@/lib/sideshift/display";

type NetworkNameWithIconProps = {
  networkId: string;
  label: string;
  iconSize?: number;
  iconBoxClassName?: string;
  textClassName?: string;
  className?: string;
};

export function NetworkNameWithIcon({
  networkId,
  label,
  iconSize = 18,
  iconBoxClassName = "h-8 w-8",
  textClassName = "theme-text-main text-lg font-semibold",
  className = "",
}: NetworkNameWithIconProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <span className={`${textClassName} truncate`}>{label}</span>
      <span
        className={`theme-card-elevated inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] ${iconBoxClassName}`}
      >
        <CryptoIcon
          alt={`${label} network icon`}
          size={iconSize}
          sources={getNetworkIconSources(networkId)}
        />
      </span>
    </span>
  );
}
