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
    <div className="theme-card-strong overflow-hidden rounded-[16px] px-3 py-2.5 md:rounded-[18px] md:px-4 md:py-3.5">
      <p className="theme-text-soft text-xs md:text-sm">{label}</p>
      <div
        className={`theme-text-main mt-1 break-words text-base font-semibold leading-[1.3] md:mt-1.5 md:text-[clamp(1.05rem,2vw,1.7rem)] ${
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
    <div className={`rounded-[16px] border px-3 py-2.5 md:rounded-[18px] md:px-4 md:py-3.5 ${wrapperClassName}`}>
      <div className="flex items-start gap-2.5 md:gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold md:h-9 md:w-9 md:text-sm ${badgeClassName}`}
        >
          {index + 1}
        </div>
        <div className="min-w-0">
          <p className="theme-text-main text-sm font-semibold">{step.label}</p>
          <p className="theme-text-muted mt-1 text-xs leading-5 md:leading-6">{step.description}</p>
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

  function renderStatusDetails() {
    if (!order) {
      return null;
    }

    return (
      <>
        <div className="theme-card-strong mt-3 rounded-[18px] p-3 md:mt-4 md:rounded-[20px] md:p-4">
          <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.2em] md:text-xs md:tracking-[0.24em]">
            Current step
          </p>
          <div className="mt-2.5 grid gap-2 md:mt-3 md:gap-3 sm:grid-cols-2">
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

        <div className="mt-3 grid gap-2 md:gap-3 md:grid-cols-2">
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
      </>
    );
  }

  function renderOrderOutcome() {
    if (!order || (order.terminalKind !== "expired" && order.terminalKind !== "refund")) {
      return null;
    }

    return (
      <div className="theme-warning-panel rounded-[20px] p-3 md:rounded-[24px] md:p-5">
        <p className="theme-accent-amber font-mono text-[10px] uppercase tracking-[0.22em] md:text-xs md:tracking-[0.28em]">
          Order outcome
        </p>
        <p className="theme-accent-amber mt-2 text-base font-semibold md:mt-3 md:text-lg">
          {order.terminalKind === "expired"
            ? "The shift expired before a valid deposit settled."
            : "The shift moved into a refund state."}
        </p>
        {order.issue ? <p className="theme-accent-amber mt-3 text-sm">{order.issue}</p> : null}
      </div>
    );
  }

  function renderShiftActions() {
    if (!order) {
      return null;
    }

    return (
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
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-3 py-4 md:px-6 md:py-7 lg:px-8">
      <div className="mb-3 flex items-start justify-between gap-3 md:mb-4">
        <div className="zyro-shift-step-stack min-w-0">
          <Link
            href="/swap"
            className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.3em]"
          >
            Back to /swap
          </Link>
          <div className="theme-text-soft zyro-shift-breadcrumb flex flex-wrap items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em]">
            <span>Step 1: Choose pair</span>
            <span className="zyro-shift-step-separator">&gt;</span>
            <span
              className={
                activeBreadcrumbStep === 2
                  ? "theme-text-main zyro-shift-active-step"
                  : ""
              }
            >
              Step 2: Send {order?.depositCoin || "asset"}
            </span>
            <span className="zyro-shift-step-separator">&gt;</span>
            <span className={activeBreadcrumbStep === 3 ? "theme-text-main" : ""}>
              Step 3: Receive {order?.settleCoin || "asset"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
          <span className="zyro-shift-theme-toggle">
            <ThemeToggle />
          </span>
          {order && statusOrb ? (
            <div className="theme-card-strong zyro-shift-mobile-status-orb rounded-[16px] px-2.5 py-2">
              <div className="flex flex-col items-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  {!order.isTerminal ? (
                    <div
                      className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${statusOrb.ringClassName}`}
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 rounded-full border-2 ${statusOrb.ringClassName}`}
                    />
                  )}
                  <div className="absolute inset-3 rounded-full border border-[var(--border-color)]" />
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-[10px] uppercase tracking-[0.16em] ${statusOrb.pillClassName}`}
                  >
                    {statusOrb.label}
                  </div>
                </div>
                <p
                  className={`mt-1.5 max-w-[8rem] text-center text-[10px] leading-4 ${
                    isCompleted ? "theme-accent-emerald" : "theme-text-muted"
                  }`}
                >
                  {statusOrb.caption}
                </p>
              </div>
            </div>
          ) : null}
          {order ? (
            <div className="theme-chip zyro-shift-status-chip rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.22em]">
              {order.providerStatusLabel}
            </div>
          ) : null}
        </div>
      </div>

      {orderState.status === "loading" && !order ? (
        <section className="theme-panel rounded-[24px] p-6 text-center md:rounded-[30px] md:p-10">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin md:h-20 md:w-20" />
          <h1 className="theme-text-main mt-5 text-2xl font-semibold md:mt-6 md:text-3xl">
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
        <section className="theme-panel rounded-[24px] p-3 md:rounded-[30px] md:p-6">
          <div className="zyro-shift-flow-grid">
            {isCompleted ? (
              <div className="theme-panel-strong zyro-shift-deposit-panel rounded-[20px] p-3 md:rounded-[24px] md:p-4">
                <p className="theme-accent-emerald font-mono text-[10px] uppercase tracking-[0.22em] md:text-xs md:tracking-[0.28em]">
                  Result
                </p>
                <h2 className="theme-text-main mt-2 text-xl font-semibold md:text-2xl">
                  You received {order.settleCoin}
                </h2>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  The shift is complete. This panel replaces the deposit details
                  after settlement.
                </p>

                <div className="mt-3 grid gap-2 md:mt-4 md:gap-3">
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
              <div className="theme-panel-strong zyro-shift-deposit-panel rounded-[20px] p-3 md:rounded-[24px] md:p-4">
                <div>
                  <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em] md:text-xs md:tracking-[0.28em]">
                    Deposit
                  </p>
                  <h2 className="theme-text-main mt-1.5 text-[1.35rem] font-semibold leading-[1.15] md:mt-2 md:text-[1.9rem]">
                    {order.depositCoin} on {networkToLabel(order.depositNetwork)}
                  </h2>
                </div>

                <div className="theme-card-strong mt-3 rounded-[16px] px-2.5 py-2.5 md:rounded-[18px] md:px-3 md:py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_76px] items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_92px]">
                    <div className="theme-card-elevated theme-text-main break-all rounded-[12px] px-2.5 py-2 font-mono text-[12px] leading-5 md:rounded-[14px] md:px-3 md:py-2.5 md:text-sm md:leading-6">
                      {order.depositAddress}
                    </div>
                    <div className="theme-card-elevated flex items-center justify-center rounded-[12px] px-1.5 py-2 md:rounded-[14px]">
                      <button
                        type="button"
                        onClick={() => handleCopy(order.depositAddress)}
                        className="theme-outline-button min-h-9 w-full rounded-[10px] px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <p className="theme-text-soft mt-2 text-center text-[10px] uppercase tracking-[0.14em] md:text-xs md:tracking-[0.16em]">
                    <span className="block">Copy the address</span>
                    <span className="mt-1 block">or scan the QR code.</span>
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-center rounded-[18px] bg-white p-3 md:rounded-[22px] md:p-4">
                  <QRCodeSVG
                    value={order.depositAddress || order.id}
                    size={164}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    includeMargin
                    className="rounded-xl md:hidden"
                  />
                  <QRCodeSVG
                    value={order.depositAddress || order.id}
                    size={196}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    includeMargin
                    className="hidden rounded-xl md:block"
                  />
                </div>

                <div className="mt-3 grid gap-2 md:mt-4 md:gap-3">
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

            <div className="zyro-shift-status-panel space-y-3 md:space-y-4">
              <div className="theme-panel-strong rounded-[20px] p-3 md:rounded-[24px] md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.22em] md:text-xs md:tracking-[0.28em]">
                    Live status
                  </p>
                  {showFixedCountdown ? (
                    <p className="theme-accent-cyan font-mono text-xs tracking-[0.18em] md:text-sm md:tracking-[0.22em]">
                      {countdownLabel}
                    </p>
                  ) : null}
                </div>

                <div className="mt-2.5 grid gap-3 md:mt-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                  <div className="min-w-0 md:pr-2">
                    <h1 className="theme-text-main text-[1.45rem] font-semibold leading-[1.08] tracking-tight md:text-[clamp(2.2rem,4vw,3.45rem)] md:leading-[1.05]">
                      {heroTitle(order)}
                    </h1>
                    <p className="theme-text-muted mt-2 max-w-3xl text-sm leading-6 md:mt-3 md:text-base md:leading-7">
                      {heroDescription(order)}
                    </p>
                    <div className="theme-chip mt-2.5 inline-flex w-fit max-w-full items-center whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] md:mt-3 md:max-w-none md:px-4 md:py-2 md:text-xs md:tracking-[0.22em]">
                      {`Order: ${order.id}`}
                    </div>
                  </div>

                  <div className="theme-card-strong zyro-shift-status-orb-panel justify-self-start rounded-[18px] px-3 py-3 md:rounded-[20px] md:px-4 md:py-4 lg:justify-self-end">
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
                        {!order.isTerminal ? (
                          <div
                            className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${statusOrb?.ringClassName}`}
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 rounded-full border-2 ${statusOrb?.ringClassName}`}
                          />
                        )}
                        <div className="absolute inset-3.5 rounded-full border border-[var(--border-color)] md:inset-4" />
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs uppercase tracking-[0.2em] md:h-12 md:w-12 md:text-sm md:tracking-[0.24em] ${statusOrb?.pillClassName}`}
                        >
                          {statusOrb?.label}
                        </div>
                      </div>
                      <p
                        className={`mt-2 text-center text-xs leading-5 md:mt-3 md:text-sm md:leading-6 ${
                          isCompleted ? "theme-accent-emerald" : "theme-text-muted"
                        }`}
                      >
                        {statusOrb?.caption}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="zyro-shift-desktop-status-details">
                  {renderStatusDetails()}
                </div>
              </div>

              <div className="zyro-shift-desktop-status-details space-y-4">
                {renderOrderOutcome()}
                {renderShiftActions()}
              </div>
            </div>

            <div className="zyro-shift-mobile-detail-panel space-y-3">
              <div className="theme-panel-strong rounded-[20px] p-3">
                {renderStatusDetails()}
              </div>
              {renderOrderOutcome()}
              {renderShiftActions()}
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
