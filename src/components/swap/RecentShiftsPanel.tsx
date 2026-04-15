"use client";

import { CryptoIcon } from "@/components/swap/CryptoIcon";
import { networkToLabel } from "@/lib/sideshift/transformers";
import type {
  AsyncStatus,
  RecentShiftsApiResponse,
  SideShiftRecentShift,
} from "@/lib/sideshift/types";
import { getCoinIconSources } from "@/lib/sideshift/display";
import { formatTokenAmount } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type RemoteState = {
  status: AsyncStatus;
  data?: RecentShiftsApiResponse;
  error?: string;
};

async function fetchJson<T>(input: string) {
  const response = await fetch(input, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | T
    | null;

  if (!response.ok) {
    throw new Error(
      (payload as { error?: { message?: string } } | null)?.error?.message ||
        "Request failed.",
    );
  }

  return payload as T;
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "--";
  }

  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 30) {
    return "just now";
  }

  if (absSeconds < 3600) {
    return formatter.format(Math.round(diffSeconds / 60), "minute");
  }

  if (absSeconds < 86_400) {
    return formatter.format(Math.round(diffSeconds / 3600), "hour");
  }

  return formatter.format(Math.round(diffSeconds / 86_400), "day");
}

function getAmountLabel(value: string | null) {
  if (!value) {
    return "Hidden";
  }

  return formatTokenAmount(value, 8);
}

function ShiftCell({
  amount,
  coin,
  network,
}: {
  amount: string | null;
  coin: string;
  network: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="theme-card-strong flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10">
        <CryptoIcon
          alt={`${coin} icon`}
          className="rounded-full"
          size={26}
          sources={getCoinIconSources(coin, network)}
        />
      </div>

      <div className="min-w-0">
        <p className="theme-text-main truncate font-mono text-[1.05rem] tracking-[0.02em]">
          {getAmountLabel(amount)}
        </p>
        <p className="theme-text-soft truncate text-[11px] uppercase tracking-[0.24em]">
          {coin} on {networkToLabel(network)}
        </p>
      </div>
    </div>
  );
}

function RecentShiftRow({ shift }: { shift: SideShiftRecentShift }) {
  return (
    <div className="theme-card grid gap-4 rounded-[24px] px-4 py-4 md:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)_136px] md:items-center md:px-5">
      <ShiftCell
        amount={shift.depositAmount}
        coin={shift.depositCoin}
        network={shift.depositNetwork}
      />

      <div className="theme-text-main hidden text-center text-3xl md:block">→</div>

      <ShiftCell
        amount={shift.settleAmount}
        coin={shift.settleCoin}
        network={shift.settleNetwork}
      />

      <div className="theme-text-muted font-mono text-sm uppercase tracking-[0.18em] md:text-right">
        {formatRelativeTime(shift.createdAt)}
      </div>
    </div>
  );
}

export function RecentShiftsPanel({ limit = 8 }: { limit?: number }) {
  const [state, setState] = useState<RemoteState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const payload = await fetchJson<RecentShiftsApiResponse>(
          `/api/recent-shifts?limit=${limit}`,
        );

        if (!cancelled) {
          setState({
            status: "success",
            data: payload,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unable to load recent shifts.",
          });
        }
      }
    }

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [limit]);

  const shifts = useMemo(
    () =>
      [...(state.data?.shifts ?? [])].sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();

        if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
          return 0;
        }

        return rightTime - leftTime;
      }),
    [state.data?.shifts],
  );
  const feedLabel = useMemo(() => {
    if (!state.data) {
      return null;
    }

    return state.data.mockMode ? "Mock feed" : "Live feed";
  }, [state.data]);

  return (
    <section className="theme-panel mt-8 rounded-[30px] px-5 py-7 md:px-7 md:py-8">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-color)] pb-5">
          <div>
            <p className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.35em]">
              Activity
            </p>
            <h2 className="theme-text-main mt-3 font-mono text-[clamp(2.15rem,4vw,3.75rem)] uppercase tracking-[0.1em]">
              Recent Shifts
            </h2>
          </div>

          {feedLabel ? (
            <span className="theme-chip rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em]">
              {feedLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-6 hidden grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)_136px] gap-4 px-5 md:grid">
          <p className="theme-text-soft font-mono text-xs uppercase tracking-[0.32em]">
            From
          </p>
          <span />
          <p className="theme-text-soft font-mono text-xs uppercase tracking-[0.32em]">
            To
          </p>
          <p className="theme-text-soft text-right font-mono text-xs uppercase tracking-[0.32em]">
            Time
          </p>
        </div>

        {state.status === "error" ? (
          <p className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {state.error}
          </p>
        ) : null}

        {state.status === "loading" ? (
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`recent-shift-skeleton-${index + 1}`}
                className="theme-card h-[88px] animate-pulse rounded-[24px]"
              />
            ))}
          </div>
        ) : null}

        {state.status === "success" && shifts.length > 0 ? (
          <div className="mt-4 grid gap-3 md:mt-5">
            {shifts.map((shift) => (
              <RecentShiftRow
                key={`${shift.createdAt}:${shift.depositCoin}:${shift.settleCoin}:${shift.depositAmount ?? "hidden"}`}
                shift={shift}
              />
            ))}
          </div>
        ) : null}

        {state.status === "success" && shifts.length === 0 ? (
          <p className="theme-text-muted mt-6 rounded-[24px] border border-[var(--border-color)] px-5 py-4 text-sm">
            No completed shifts are available right now.
          </p>
        ) : null}
      </div>
    </section>
  );
}
