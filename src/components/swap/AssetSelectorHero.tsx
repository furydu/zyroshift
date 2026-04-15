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
    <div className="theme-card-strong rounded-[22px] p-4 md:p-5">
      <p className={`font-mono text-xs uppercase tracking-[0.28em] ${accentClassName}`}>
        {label}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
        <div className="mx-auto">
          <div className="relative h-[104px] w-[104px]">
            <div className="theme-card flex h-full w-full items-center justify-center rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
              <CryptoIcon
                alt={`${asset?.coin || "generic"} coin icon`}
                key={`coin-${asset?.coin || "generic"}`}
                size={78}
                sources={getCoinIconSources(asset?.coin || "generic")}
              />
            </div>

            <div className="theme-card-elevated absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full shadow-[0_12px_24px_rgba(0,0,0,0.14)]">
              <CryptoIcon
                alt={`${network?.label || "network"} icon`}
                key={`network-${network?.id || asset?.coin || "generic"}`}
                size={24}
                sources={getNetworkIconSources(network?.id || asset?.coin || "generic")}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-2.5 sm:flex sm:flex-col sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={onOpenAssetPicker}
            className="theme-card relative flex w-full items-center justify-center rounded-[18px] px-5 py-3 text-center transition hover:border-cyan-300/35 hover:bg-cyan-400/5 sm:max-w-[370px]"
          >
            <div className="min-w-0">
              <p className="theme-text-main truncate text-[1.5rem] font-semibold leading-none">
                {asset?.coin || "Choose coin"}
              </p>
              <p className="theme-text-muted mt-1.5 truncate text-sm">
                {asset?.name || "Search by symbol or token name"}
              </p>
            </div>
          </button>

          <div className="relative flex justify-center">
            <div className="pointer-events-none inline-flex max-w-full flex-nowrap items-center justify-center gap-1.5">
              <span
                className="theme-network-tag inline-flex min-h-[38px] shrink-0 items-center rounded-full border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]"
                style={networkTint}
              >
                Network
              </span>

              <span
                className="theme-network-pill inline-flex min-h-[38px] min-w-0 max-w-[min(100%,260px)] items-center gap-1.5 rounded-full border px-2.5 py-1.5"
                style={networkTint}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/10">
                  <CryptoIcon
                    alt={`${networkLabel || "network"} icon`}
                    key={`pill-network-${network?.id || asset?.coin || "generic"}`}
                    size={16}
                    sources={getNetworkIconSources(network?.id || asset?.coin || "generic")}
                  />
                </span>
                <span
                  className={`min-w-0 truncate font-medium ${
                    isLongNetworkLabel ? "text-[13px]" : "text-sm"
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
