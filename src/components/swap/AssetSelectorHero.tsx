"use client";

import {
  getCoinIconSources,
  getNetworkIconSources,
  getNetworkTintStyle,
} from "@/lib/sideshift/display";
import type { SwapAssetOption, SwapNetworkOption } from "@/lib/sideshift/types";
import { CryptoIcon } from "./CryptoIcon";

type AssetSelectorHeroProps = {
  accentClassName: string;
  asset?: SwapAssetOption;
  label: string;
  network?: SwapNetworkOption;
  networkOptions: SwapNetworkOption[];
  onNetworkChange: (networkId: string) => void;
  onOpenAssetPicker: () => void;
};

export function AssetSelectorHero({
  accentClassName,
  asset,
  label,
  network,
  networkOptions,
  onNetworkChange,
  onOpenAssetPicker,
}: AssetSelectorHeroProps) {
  const networkTint = getNetworkTintStyle(network?.id || asset?.coin || "default");
  const networkLabel = network?.label || "Select network";
  const isLongNetworkLabel = networkLabel.length > 12;

  return (
    <div className="theme-card-strong rounded-[18px] p-3 md:rounded-[22px] md:p-5">
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.24em] md:text-xs md:tracking-[0.28em] ${accentClassName}`}
      >
        {label}
      </p>

      <div className="zyro-asset-selector-row mt-3 flex items-center gap-3 md:mt-4 md:grid md:grid-cols-[112px_minmax(0,1fr)]">
        <div className="shrink-0 md:mx-auto">
          <div className="relative h-16 w-16 md:h-[104px] md:w-[104px]">
            <div className="theme-card flex h-full w-full items-center justify-center rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
              <CryptoIcon
                alt={`${asset?.coin || "generic"} coin icon`}
                className="zyro-asset-coin-icon"
                key={`coin-${asset?.coin || "generic"}`}
                size={78}
                sources={getCoinIconSources(asset?.coin || "generic")}
              />
            </div>

            <div className="theme-card-elevated absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full shadow-[0_12px_24px_rgba(0,0,0,0.14)] md:h-10 md:w-10">
              <CryptoIcon
                alt={`${network?.label || "network"} icon`}
                className="zyro-asset-network-icon"
                key={`network-${network?.id || asset?.coin || "generic"}`}
                size={24}
                sources={getNetworkIconSources(network?.id || asset?.coin || "generic")}
              />
            </div>
          </div>
        </div>

        <div className="zyro-asset-selector-copy min-w-0 space-y-2 md:flex md:flex-col md:items-center md:justify-center md:space-y-2.5">
          <button
            type="button"
            onClick={onOpenAssetPicker}
            className="theme-card zyro-asset-selector-button relative flex w-full items-center justify-start rounded-[14px] px-3 py-2.5 text-left transition hover:border-cyan-300/35 hover:bg-cyan-400/5 md:max-w-[370px] md:justify-center md:rounded-[18px] md:px-5 md:py-3 md:text-center"
          >
            <div className="min-w-0">
              <p className="theme-text-main truncate text-[1.15rem] font-semibold leading-none md:text-[1.5rem]">
                {asset?.coin || "Choose coin"}
              </p>
              <p className="theme-text-muted mt-1 truncate text-xs md:mt-1.5 md:text-sm">
                {asset?.name || "Search by symbol or token name"}
              </p>
            </div>
          </button>

          <div className="zyro-network-selector-wrap relative flex justify-start md:justify-center">
            <div className="pointer-events-none inline-flex max-w-full flex-nowrap items-center justify-start gap-1.5 md:justify-center">
              <span
                className="theme-network-tag inline-flex min-h-8 shrink-0 items-center rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] md:min-h-[38px] md:px-2.5 md:py-1.5 md:text-[10px] md:tracking-[0.16em]"
                style={networkTint}
              >
                Network
              </span>

              <span
                className="theme-network-pill inline-flex min-h-8 min-w-0 max-w-[min(100%,180px)] items-center gap-1.5 rounded-full border px-2 py-1 md:min-h-[38px] md:max-w-[min(100%,260px)] md:px-2.5 md:py-1.5"
                style={networkTint}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10 md:h-6 md:w-6">
                  <CryptoIcon
                    alt={`${networkLabel || "network"} icon`}
                    className="zyro-asset-pill-icon"
                    key={`pill-network-${network?.id || asset?.coin || "generic"}`}
                    size={16}
                    sources={getNetworkIconSources(network?.id || asset?.coin || "generic")}
                  />
                </span>
                <span
                  className={`min-w-0 truncate font-medium ${
                    isLongNetworkLabel
                      ? "text-[11px] md:text-[13px]"
                      : "text-xs md:text-sm"
                  }`}
                >
                  {networkLabel}
                </span>
              </span>
            </div>

            <select
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(event) => onNetworkChange(event.target.value)}
              value={network?.id || ""}
            >
              {networkOptions.length === 0 ? (
                <option value="">No network available</option>
              ) : null}

              {networkOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
