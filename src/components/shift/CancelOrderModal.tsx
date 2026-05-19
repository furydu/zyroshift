"use client";

import { formatCountdown } from "@/lib/utils";

interface CancelOrderModalProps {
  open: boolean;
  canCancelNow: boolean;
  msUntilCancelable: number;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error?: string;
}

export function CancelOrderModal({
  open,
  canCancelNow,
  msUntilCancelable,
  onClose,
  onConfirm,
  loading,
  error,
}: CancelOrderModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="theme-backdrop fixed inset-0 z-50 flex items-center justify-center px-3 backdrop-blur-sm md:px-4">
      <div className="theme-panel w-full max-w-2xl rounded-[22px] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.22)] md:rounded-[28px] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.24em] md:text-xs md:tracking-[0.3em]">
              Cancel Order
            </p>
            <h3 className="theme-text-main mt-2 text-xl font-semibold md:mt-3 md:text-3xl">
              Are you sure you want to cancel this shift?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="theme-outline-button rounded-full px-4 py-2 transition"
          >
            Close
          </button>
        </div>

        <p className="theme-text-muted mt-4 max-w-2xl text-sm leading-6 md:mt-5 md:leading-7">
          Cancelling expires the shift. Any deposit sent afterwards may fail to
          settle and may instead be refunded, depending on the provider state.
        </p>

        <div className="theme-warning-panel mt-4 rounded-[18px] p-3 md:mt-5 md:rounded-[22px] md:p-4">
          <p className="theme-accent-amber font-mono text-[10px] uppercase tracking-[0.2em] md:text-xs md:tracking-[0.24em]">
            Cancellation window
          </p>
          <p className="theme-accent-amber mt-2 text-base font-semibold md:mt-3 md:text-lg">
            {canCancelNow
              ? "This shift can be cancelled now."
              : `This shift can be cancelled in ${formatCountdown(msUntilCancelable)}.`}
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-6">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canCancelNow || loading}
            className="h-12 rounded-2xl bg-gradient-to-r from-rose-300 via-orange-300 to-amber-300 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 transition hover:from-rose-200 hover:via-orange-200 hover:to-amber-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:bg-none disabled:text-slate-500 md:h-14 md:text-sm md:tracking-[0.26em]"
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="theme-outline-button h-12 rounded-2xl font-mono text-xs font-semibold uppercase tracking-[0.22em] transition md:h-14 md:text-sm md:tracking-[0.26em]"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
