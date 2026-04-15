"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function normalizeShiftId(rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return "";
  }

  const directMatch = value.match(/\/shift\/([^/?#]+)/i);
  if (directMatch?.[1]) {
    return directMatch[1];
  }

  const withoutQuery = value.split("?")[0]?.split("#")[0] || value;
  const parts = withoutQuery
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.at(-1) || value;
}

export function TrackOrderLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const shiftId = normalizeShiftId(value);

    if (!shiftId) {
      setError("Paste your shift ID first.");
      return;
    }

    setError("");
    router.push(`/shift/${encodeURIComponent(shiftId)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="theme-card rounded-[24px] p-3 md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder="Paste shift ID or a full /shift/... link"
            className="theme-card-strong theme-text-main min-h-[58px] flex-1 rounded-[18px] border border-[var(--border-strong)] px-4 text-base outline-none transition placeholder:text-[var(--soft-text)] focus:border-[var(--accent-cyan-border)] focus:shadow-[0_0_0_1px_var(--accent-cyan-border),0_0_26px_var(--accent-cyan-soft)]"
            aria-label="Shift ID"
          />
          <button
            type="submit"
            className="theme-accent-cta inline-flex min-h-[58px] items-center justify-center rounded-[18px] px-6 font-mono text-[12px] font-semibold uppercase tracking-[0.26em] transition hover:-translate-y-0.5"
          >
            Track status
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="theme-text-soft text-sm leading-6">
            You can paste the shift ID from your confirmation screen or from any
            `/shift/...` link.
          </p>
          <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.18em]">
            Example: `e9d7...`
          </p>
        </div>

        {error ? (
          <p className="mt-3 rounded-[14px] border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
