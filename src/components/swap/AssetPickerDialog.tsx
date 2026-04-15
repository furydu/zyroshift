"use client";

import { getAssetSearchScore, getCoinIconSources } from "@/lib/sideshift/display";
import type { SwapAssetOption } from "@/lib/sideshift/types";
import { useEffect, useRef, useState } from "react";
import { CryptoIcon } from "./CryptoIcon";

type AssetPickerDialogProps = {
  assets: SwapAssetOption[];
  description: string;
  open: boolean;
  selectedCoin: string;
  title: string;
  onClose: () => void;
  onSelect: (coin: string) => void;
};

export function AssetPickerDialog({
  assets,
  description,
  open,
  selectedCoin,
  title,
  onClose,
  onSelect,
}: AssetPickerDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const rankedAssets = assets
    .map((asset) => ({
      asset,
      score: query ? getAssetSearchScore(query, asset.coin, asset.name) : 0,
    }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.asset.coin.localeCompare(right.asset.coin);
    });

  return (
    <div className="theme-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 backdrop-blur">
      <div className="theme-panel w-full max-w-3xl rounded-[28px] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.24)] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.32em]">
              Coin Search
            </p>
            <h2 className="theme-text-main mt-2 text-2xl font-semibold">{title}</h2>
            <p className="theme-text-muted mt-2 max-w-2xl text-sm leading-6">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-outline-button rounded-full px-4 py-2 text-sm transition"
          >
            Close
          </button>
        </div>

        <div className="theme-card mt-5 rounded-[22px] p-3">
          <input
            ref={inputRef}
            className="theme-input h-12 w-full rounded-[16px] px-4 text-base outline-none transition focus:border-cyan-400/70"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by symbol or token name"
            value={query}
          />
        </div>

        <div className="theme-card-strong mt-4 max-h-[60vh] overflow-y-auto rounded-[22px] p-2">
          {rankedAssets.length === 0 ? (
            <div className="theme-text-soft rounded-[18px] border border-dashed border-[var(--border-color)] px-4 py-8 text-center text-sm">
              No coins matched that search.
            </div>
          ) : (
            <div className="grid gap-2">
              {rankedAssets.map(({ asset }) => (
                <button
                  key={asset.coin}
                  type="button"
                  onClick={() => {
                    onSelect(asset.coin);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-4 rounded-[18px] border px-4 py-3 text-left transition ${
                    asset.coin === selectedCoin
                      ? "theme-info-panel"
                      : "theme-card hover:border-[var(--border-strong)] hover:bg-cyan-400/5"
                  }`}
                >
                  <div className="theme-card flex h-14 w-14 shrink-0 items-center justify-center rounded-full">
                    <CryptoIcon
                      alt={`${asset.coin} icon`}
                      size={40}
                      sources={getCoinIconSources(asset.coin)}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="theme-text-main text-lg font-semibold">{asset.coin}</p>
                    <p className="theme-text-muted truncate text-sm">{asset.name}</p>
                  </div>

                  <div className="theme-text-soft hidden text-right text-xs md:block">
                    <p>{asset.networks.length} networks</p>
                    <p className="mt-1 truncate">
                      {asset.networks
                        .slice(0, 3)
                        .map((network) => network.label)
                        .join(" · ")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
