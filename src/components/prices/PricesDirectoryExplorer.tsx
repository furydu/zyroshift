"use client";

import { TokenNameWithIcon } from "@/components/hubs/TokenNameWithIcon";
import type { PriceDirectoryCard } from "@/lib/prices/provider";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

type PricesDirectoryExplorerProps = {
  cards: PriceDirectoryCard[];
  featuredCount: number;
};

function formatUsdCompact(value: number | null) {
  if (value === null) {
    return "Open price page";
  }

  const hasCents = value < 1000;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Search to open";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function PricesDirectoryExplorer({
  cards,
  featuredCount,
}: PricesDirectoryExplorerProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredCards = useMemo(() => {
    if (!deferredQuery) {
      return cards;
    }

    return cards.filter((card) => {
      const haystack = `${card.symbol} ${card.name}`.toLowerCase();
      return haystack.includes(deferredQuery);
    });
  }, [cards, deferredQuery]);

  const isSearching = deferredQuery.length > 0;
  const visibleCards = isSearching
    ? filteredCards
    : showAll
      ? cards
      : cards.slice(0, featuredCount);

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-elevated)]/45 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="theme-text-main text-sm font-semibold">
            {isSearching
              ? `${filteredCards.length} match${
                  filteredCards.length === 1 ? "" : "es"
                } for "${query.trim()}"`
              : `Showing ${showAll ? cards.length : featuredCount} of ${cards.length} supported price pages`}
          </p>
          <p className="theme-text-muted mt-1 text-sm leading-6">
            Search by token symbol or name, or expand the full directory to
            inspect every supported asset in this price-page system.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="price-directory-search">
            Search token prices
          </label>
          <input
            id="price-directory-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ETH, Bitcoin, USDT..."
            className="theme-card min-h-[44px] min-w-[250px] rounded-full px-4 text-sm outline-none transition placeholder:text-[var(--foreground-muted)] focus:border-[var(--border-strong)]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="theme-outline-button inline-flex min-h-[44px] items-center rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
            >
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            className="theme-outline-button inline-flex min-h-[44px] items-center rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition hover:-translate-y-0.5"
          >
            {showAll ? "Featured Only" : `Show All ${cards.length}`}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleCards.map((card) => (
          <Link
            key={card.symbol}
            href={card.href}
            className="theme-card block rounded-[22px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
          >
            <div className="flex items-start justify-between gap-3">
              <TokenNameWithIcon
                symbol={card.symbol}
                label={card.name}
                className="max-w-[70%]"
                textClassName="theme-text-main text-base font-semibold"
              />
              <span className="theme-chip rounded-full px-3 py-2 text-[11px]">
                {card.supportedNetworkCount} networks
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                  Market price
                </p>
                <p className="theme-text-main mt-2 text-[1.45rem] font-semibold tracking-tight">
                  {formatUsdCompact(card.previewPriceUsd)}
                </p>
              </div>
              <div className="text-right">
                <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                  24h
                </p>
                <p className="mt-2 text-sm font-semibold text-cyan-200">
                  {formatPercent(card.previewChange24h)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="theme-text-muted text-sm">
                {card.categoryLabel}
              </span>
              <span className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                Open page
              </span>
            </div>
          </Link>
        ))}
      </div>

      {isSearching && filteredCards.length === 0 ? (
        <div className="theme-card mt-6 rounded-[22px] px-4 py-5">
          <p className="theme-text-main text-base font-semibold">
            No token matched that search.
          </p>
          <p className="theme-text-muted mt-2 text-sm leading-6">
            Try symbol, full token name, or clear the query to browse the full
            directory.
          </p>
        </div>
      ) : null}
    </>
  );
}
