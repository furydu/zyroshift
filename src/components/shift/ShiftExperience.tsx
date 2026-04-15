"use client";

import { CancelOrderModal } from "@/components/shift/CancelOrderModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLiveNow } from "@/hooks/use-live-now";
import { networkToLabel } from "@/lib/sideshift/transformers";
import type {
  AsyncStatus,
  CancelOrderApiResponse,
  OrderApiResponse,
  ShiftOrderView,
  TimelineStep,
} from "@/lib/sideshift/types";
import {
  formatCountdown,
  formatTimestamp,
  formatTokenAmount,
  shortenAddress,
} from "@/lib/utils";
import Link from "next/link";
import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";

type RemoteState<T> = {
  status: AsyncStatus;
  data?: T;
  error?: string;
};

type DetailRowProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

type StepTileProps = {
  step: TimelineStep;
  index: number;
  order: ShiftOrderView;
};

async function fetchJson<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Request failed.");
  }

  return payload as T;
}

function heroTitle(order: ShiftOrderView) {
  if (order.terminalKind === "success") {
    return "Shift completed";
  }

  if (order.terminalKind === "expired") {
    return "Shift expired";
  }

  if (order.terminalKind === "refund") {
    return "Refund path started";
  }

  if (order.currentStep === "processing") {
    return "Processing your shift";
  }

  if (order.currentStep === "received") {
    return "Deposit detected";
  }

  return `Waiting for you to send ${order.depositCoin}`;
}

function heroDescription(order: ShiftOrderView) {
  if (order.rateMode === "fixed" && !order.isTerminal) {
    return `Send exactly ${formatTokenAmount(order.depositAmount)} ${order.depositCoin} before the quote expires.`;
  }

  if (order.rateMode === "variable" && !order.isTerminal) {
    return `Send between ${formatTokenAmount(order.depositMin)} and ${formatTokenAmount(order.depositMax)} ${order.depositCoin}.`;
  }

  return order.providerStatusDetail;
}

function isWaitingState(order: ShiftOrderView) {
  return !order.isTerminal && order.currentStep === "waiting";
}

function getStatusOrb(order: ShiftOrderView) {
  if (order.terminalKind === "success") {
    return {
      label: "DONE",
      caption: "Finalized",
      ringClassName:
        "border-emerald-300 shadow-[0_0_32px_rgba(74,222,128,0.18)]",
      pillClassName: "theme-pill-success",
    };
  }

  if (order.currentStep === "processing") {
    return {
      label: "SWAP",
      caption: "Routing settlement",
      ringClassName: "border-cyan-300",
      pillClassName: "theme-pill-info",
    };
  }

  if (order.currentStep === "received") {
    return {
      label: "RECV",
      caption: "Confirming deposit",
      ringClassName: "border-sky-300",
      pillClassName: "theme-pill-sky",
    };
  }

  if (order.terminalKind === "expired" || order.terminalKind === "refund") {
    return {
      label: "HOLD",
      caption: "Needs attention",
      ringClassName: "border-amber-300",
      pillClassName: "theme-pill-warning",
    };
  }

  return {
    label: "WAIT",
    caption: "Awaiting inbound transfer",
    ringClassName:
      "border-[var(--accent-cyan)] shadow-[0_0_26px_var(--accent-cyan-soft)]",
    pillClassName: "theme-pill-info",
  };
}

function DetailRow({ label, value, valueClassName }: DetailRowProps) {
  return (
    <div className="theme-card-strong overflow-hidden rounded-[18px] px-4 py-3.5">
      <p className="theme-text-soft text-sm">{label}</p>
      <div
        className={`theme-text-main mt-1.5 break-words text-[clamp(1.05rem,2vw,1.7rem)] font-semibold leading-[1.3] ${
          valueClassName || ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StepTile({ step, index, order }: StepTileProps) {
  const isCompletedTerminal =
    step.key === "completed" && order.terminalKind === "success";
  const isCurrent = step.state === "current";
  const isComplete = step.state === "complete" || isCompletedTerminal;

  const wrapperClassName = isCompletedTerminal
      ? "theme-success-panel"
    : isCurrent
      ? "border-[var(--accent-cyan-border)] bg-[var(--accent-cyan-soft)]"
      : isComplete
        ? "border-[var(--accent-cyan-border)] bg-[var(--accent-cyan-soft)]"
        : "theme-card-strong";

  const badgeClassName = isCompletedTerminal
    ? "border-[var(--accent-emerald-border)] bg-[var(--accent-emerald)] [color:var(--on-accent)]"
    : isCurrent
      ? "animate-pulse border-[var(--accent-cyan-border)] bg-[var(--accent-cyan-soft)] text-[var(--accent-cyan)]"
      : isComplete
      ? "border-[var(--accent-cyan-border)] bg-[var(--accent-cyan)] [color:var(--on-accent)]"
        : "border-[var(--border-color)] text-[var(--soft-text)]";

  return (
    <div className={`rounded-[18px] border px-4 py-3.5 ${wrapperClassName}`}>
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${badgeClassName}`}
        >
          {index + 1}
        </div>
        <div className="min-w-0">
          <p className="theme-text-main text-sm font-semibold">{step.label}</p>
          <p className="theme-text-muted mt-1 text-xs leading-6">{step.description}</p>
        </div>
      </div>
    </div>
  );
}

export function ShiftExperience({ orderId }: { orderId: string }) {
  const [orderState, setOrderState] = useState<RemoteState<OrderApiResponse>>({
    status: "loading",
  });
  const [cancelState, setCancelState] = useState<RemoteState<CancelOrderApiResponse>>({
    status: "idle",
  });
  const [cancelOpen, setCancelOpen] = useState(false);

  const order = orderState.data?.order;
  const now = useLiveNow(Boolean(order));
  const activeNow = now || (order ? new Date(order.createdAt).getTime() : 0);
  const countdownMs =
    order && activeNow
      ? Math.max(new Date(order.expiresAt).getTime() - activeNow, 0)
      : 0;
  const countdownLabel = order ? formatCountdown(countdownMs) : "--:--";
  const cancelAvailableAt = order
    ? new Date(order.createdAt).getTime() + 5 * 60 * 1000
    : 0;
  const msUntilCancelable =
    order && activeNow ? Math.max(cancelAvailableAt - activeNow, 0) : 0;
  const pollOrderId = order?.id;
  const shouldPoll = order ? !order.isTerminal : false;
  const canCancelNow = order
    ? !order.isTerminal && msUntilCancelable <= 0 && isWaitingState(order)
    : false;
  const statusOrb = order ? getStatusOrb(order) : null;
  const isCompleted = order?.terminalKind === "success";
  const showFixedCountdown =
    order?.rateMode === "fixed" && !order.isTerminal;
  const activeBreadcrumbStep = isCompleted ? 3 : 2;

  const refreshOrder = useEffectEvent(async () => {
    try {
      const payload = await fetchJson<OrderApiResponse>(
        `/api/order-status?id=${orderId}`,
      );

      setOrderState({
        status: "success",
        data: payload,
      });
    } catch (error) {
      setOrderState((current) => ({
        status: current.data ? "success" : "error",
        data: current.data,
        error:
          error instanceof Error
            ? error.message
            : "Unable to refresh the shift status.",
      }));
    }
  });

  useEffect(() => {
    void refreshOrder();
  }, [orderId]);

  useEffect(() => {
    if (!shouldPoll) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshOrder();
    }, 7000);

    return () => window.clearInterval(timer);
  }, [pollOrderId, shouldPoll]);

  async function handleCopy(value?: string | null) {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  }

  async function handleCancelOrder() {
    if (!order) {
      return;
    }

    setCancelState({ status: "loading" });

    try {
      await fetchJson<CancelOrderApiResponse>("/api/cancel-order", {
        method: "POST",
        body: JSON.stringify({ orderId: order.id }),
      });

      const payload = await fetchJson<OrderApiResponse>(
        `/api/order-status?id=${order.id}`,
      );

      setCancelOpen(false);
      setCancelState({ status: "success" });
      setOrderState({
        status: "success",
        data: payload,
      });
    } catch (error) {
      setCancelState({
        status: "error",
        error:
          error instanceof Error ? error.message : "Unable to cancel the order.",
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-7 md:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2.5">
          <Link
            href="/swap"
            className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.3em]"
          >
            Back to /swap
          </Link>
          <div className="theme-text-soft flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em]">
            <span>Step 1: Choose pair</span>
            <span>&gt;</span>
            <span className={activeBreadcrumbStep === 2 ? "theme-text-main" : ""}>
              Step 2: Send {order?.depositCoin || "asset"}
            </span>
            <span>&gt;</span>
            <span className={activeBreadcrumbStep === 3 ? "theme-text-main" : ""}>
              Step 3: Receive {order?.settleCoin || "asset"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          {order ? (
            <div className="theme-chip rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.22em]">
              {order.providerStatusLabel}
            </div>
          ) : null}
        </div>
      </div>

      {orderState.status === "loading" && !order ? (
        <section className="theme-panel rounded-[30px] p-10 text-center">
          <div className="mx-auto h-20 w-20 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin" />
          <h1 className="theme-text-main mt-6 text-3xl font-semibold">
            Loading shift details...
          </h1>
        </section>
      ) : null}

      {orderState.error && !order ? (
        <section className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100">
          {orderState.error}
        </section>
      ) : null}

      {order ? (
        <section className="theme-panel rounded-[30px] p-5 md:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            {isCompleted ? (
              <div className="theme-panel-strong rounded-[24px] p-4">
                <p className="theme-accent-emerald font-mono text-xs uppercase tracking-[0.28em]">
                  Result
                </p>
                <h2 className="theme-text-main mt-2 text-2xl font-semibold">
                  You received {order.settleCoin}
                </h2>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  The shift is complete. This panel replaces the deposit details
                  after settlement.
                </p>

                <div className="mt-4 grid gap-3">
                  <DetailRow
                    label="Amount received"
                    value={`${formatTokenAmount(order.settleAmount)} ${order.settleCoin}`}
                  />
                  <DetailRow
                    label="Effective rate"
                    value={`${formatTokenAmount(order.rate)} ${order.settleCoin} / ${order.depositCoin}`}
                  />
                  <DetailRow
                    label="Deposit received"
                    value={formatTimestamp(order.depositReceivedAt)}
                    valueClassName="text-xl"
                  />
                  <DetailRow
                    label="Completed"
                    value={formatTimestamp(order.updatedAt)}
                    valueClassName="text-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="theme-panel-strong rounded-[24px] p-4">
                <div>
                  <p className="theme-text-soft font-mono text-xs uppercase tracking-[0.28em]">
                    Deposit
                  </p>
                  <h2 className="theme-text-main mt-2 text-[1.9rem] font-semibold leading-[1.15]">
                    {order.depositCoin} on {networkToLabel(order.depositNetwork)}
                  </h2>
                </div>

                <div className="theme-card-strong mt-3 rounded-[18px] px-3 py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_92px] items-stretch gap-2">
                    <div className="theme-card-elevated theme-text-main break-all rounded-[14px] px-3 py-2.5 font-mono text-[13px] leading-6 md:text-sm">
                      {order.depositAddress}
                    </div>
                    <div className="theme-card-elevated flex items-center justify-center rounded-[14px] px-1.5 py-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(order.depositAddress)}
                        className="theme-outline-button w-full rounded-[10px] px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <p className="theme-text-soft mt-2 text-center text-xs uppercase tracking-[0.16em]">
                    <span className="block">Copy the address</span>
                    <span className="mt-1 block">or scan the QR code.</span>
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-center rounded-[22px] bg-white p-4">
                  <QRCodeSVG
                    value={order.depositAddress || order.id}
                    size={196}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    includeMargin
                    className="rounded-xl"
                  />
                </div>

                <div className="mt-4 grid gap-3">
                  {order.rateMode === "fixed" ? (
                    <>
                      <DetailRow
                        label="Send exactly"
                        value={`${formatTokenAmount(order.depositAmount)} ${order.depositCoin}`}
                      />
                      <DetailRow
                        label="Rate"
                        value={`1 ${order.depositCoin} = ${formatTokenAmount(order.rate)} ${order.settleCoin}`}
                      />
                      <DetailRow
                        label={`Your ${order.settleCoin} receiving address`}
                        value={order.settleAddress}
                        valueClassName="break-all font-mono text-sm leading-7"
                      />
                      <DetailRow
                        label="Deposit window"
                        value={formatTimestamp(order.expiresAt)}
                        valueClassName="text-xl"
                      />
                    </>
                  ) : (
                    <>
                      <DetailRow
                        label="Minimum"
                        value={`${formatTokenAmount(order.depositMin)} ${order.depositCoin}`}
                      />
                      <DetailRow
                        label="Maximum"
                        value={`${formatTokenAmount(order.depositMax)} ${order.depositCoin}`}
                      />
                      <DetailRow
                        label="Rate"
                        value={`1 ${order.depositCoin} ~ ${formatTokenAmount(order.rate)} ${order.settleCoin}`}
                      />
                      <DetailRow
                        label={`Your ${order.settleCoin} receiving address`}
                        value={order.settleAddress}
                        valueClassName="break-all font-mono text-sm leading-7"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="theme-panel-strong rounded-[24px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="theme-text-soft font-mono text-xs uppercase tracking-[0.28em]">
                    Live status
                  </p>
                  {showFixedCountdown ? (
                    <p className="theme-accent-cyan font-mono text-sm tracking-[0.22em]">
                      {countdownLabel}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                  <div className="min-w-0 pr-2">
                    <h1 className="theme-text-main text-[clamp(2.2rem,4vw,3.45rem)] font-semibold leading-[1.05] tracking-tight">
                      {heroTitle(order)}
                    </h1>
                    <p className="theme-text-muted mt-3 max-w-3xl text-base leading-7">
                      {heroDescription(order)}
                    </p>
                    <div className="theme-chip mt-3 inline-flex w-fit max-w-none items-center whitespace-nowrap rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] md:text-xs md:tracking-[0.22em]">
                      {`Order: ${order.id}`}
                    </div>
                  </div>

                  <div className="theme-card-strong justify-self-start rounded-[20px] px-4 py-4 lg:justify-self-end">
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-24 w-24 items-center justify-center">
                        {!order.isTerminal ? (
                          <div
                            className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${statusOrb?.ringClassName}`}
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 rounded-full border-2 ${statusOrb?.ringClassName}`}
                          />
                        )}
                        <div className="absolute inset-4 rounded-full border border-[var(--border-color)]" />
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full font-mono text-sm uppercase tracking-[0.24em] ${statusOrb?.pillClassName}`}
                        >
                          {statusOrb?.label}
                        </div>
                      </div>
                      <p
                        className={`mt-3 text-center text-sm leading-6 ${
                          isCompleted ? "theme-accent-emerald" : "theme-text-muted"
                        }`}
                      >
                        {statusOrb?.caption}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="theme-card-strong mt-4 rounded-[20px] p-4">
                  <p className="theme-text-soft font-mono text-xs uppercase tracking-[0.24em]">
                    Current step
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {order.timeline.map((step, index) => (
                      <StepTile
                        key={step.key}
                        step={step}
                        index={index}
                        order={order}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <DetailRow
                    label="Created"
                    value={formatTimestamp(order.createdAt)}
                    valueClassName="text-xl"
                  />
                  <DetailRow
                    label="Updated"
                    value={formatTimestamp(order.updatedAt)}
                    valueClassName="text-xl"
                  />
                  <DetailRow
                    label="Deposit tx"
                    value={shortenAddress(order.depositHash)}
                    valueClassName="font-mono text-lg"
                  />
                  <DetailRow
                    label="Settle tx"
                    value={shortenAddress(order.settleHash)}
                    valueClassName="font-mono text-lg"
                  />
                </div>
              </div>

              {(order.terminalKind === "expired" || order.terminalKind === "refund") && (
                <div className="theme-warning-panel rounded-[24px] p-5">
                  <p className="theme-accent-amber font-mono text-xs uppercase tracking-[0.28em]">
                    Order outcome
                  </p>
                  <p className="theme-accent-amber mt-3 text-lg font-semibold">
                    {order.terminalKind === "expired"
                      ? "The shift expired before a valid deposit settled."
                      : "The shift moved into a refund state."}
                  </p>
                  {order.issue ? <p className="theme-accent-amber mt-3 text-sm">{order.issue}</p> : null}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/swap"
                  className="theme-outline-button rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.24em] transition"
                >
                  Start new shift
                </Link>

                {isWaitingState(order) ? (
                  <button
                    type="button"
                    onClick={() => setCancelOpen(true)}
                    className="theme-outline-button rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.24em] transition"
                  >
                    Cancel order
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {orderState.error ? (
            <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {orderState.error}
            </p>
          ) : null}
        </section>
      ) : null}

      <CancelOrderModal
        open={cancelOpen}
        canCancelNow={canCancelNow}
        msUntilCancelable={msUntilCancelable}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelOrder}
        loading={cancelState.status === "loading"}
        error={cancelState.error}
      />
    </div>
  );
}
