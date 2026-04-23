import { BrandWordmark } from "@/components/layout/BrandWordmark";
import { getPairLaunchSpecs } from "@/lib/pairs";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/site/contact";
import Link from "next/link";

export function SiteFooter() {
  const routeSamples = getPairLaunchSpecs(4);

  return (
    <footer className="theme-panel mt-6 rounded-[30px] px-5 py-5 md:px-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.66fr)_minmax(0,0.72fr)_minmax(0,0.72fr)] lg:gap-5">
        <div className="max-w-[340px]">
          <div>
            <BrandWordmark
              iconClassName="h-4 w-4 shrink-0"
              textClassName="theme-text-main font-mono text-[11px] uppercase tracking-[0.32em]"
            />
          </div>
          <p className="theme-text-muted mt-3 text-sm leading-6">
            Non-custodial crypto swap flows with live quotes, network-aware
            routing, and a dedicated status page from deposit to settlement.
          </p>
        </div>

        <div>
          <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
            Product
          </p>
          <div className="mt-3 grid gap-2">
            <Link
              href="/swap"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              Swap Builder
            </Link>
            <Link
              href="/how-it-works"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              How it Works
            </Link>
            <Link
              href="/track-order"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              Track Order
            </Link>
            <Link
              href="/#popular-routes"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              Popular Routes
            </Link>
            <Link
              href="/terms"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        <div>
          <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
            Explore
          </p>
          <div className="mt-3 grid gap-2">
            <Link
              href="/tokens"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              All Tokens
            </Link>
            <Link
              href="/networks"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              All Networks
            </Link>
            <Link
              href="/tokens/btc"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              BTC Token
            </Link>
            <Link
              href="/tokens/usdt"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              USDT Token
            </Link>
            <Link
              href="/networks/ethereum"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              Ethereum Network
            </Link>
            <Link
              href="/networks/tron"
              className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
            >
              Tron Network
            </Link>
          </div>
        </div>

        <div>
          <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
            Top Routes
          </p>
          <div className="mt-3 grid gap-2">
            {routeSamples.map((route) => (
              <Link
                key={route.slug}
                href={`/swap/${route.slug}`}
                className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
              >
                {route.h1.replace(/^Swap\s+/i, "")}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border-soft)] pt-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.84fr)] lg:items-end lg:gap-6">
          <div>
            <p className="theme-text-soft text-xs leading-6">
              Rates, minimums, maximums, and route availability depend on live
              provider support and selected networks. Always verify the exact
              deposit instructions on the shift page before sending funds.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              <span className="theme-text-soft">ZyroShift Copyright 2026</span>
              <Link
                href="/terms"
                className="theme-text-soft transition hover:text-[var(--foreground)]"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="theme-text-soft transition hover:text-[var(--foreground)]"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          <div className="theme-card rounded-[22px] border border-[rgba(246,179,66,0.28)] px-4 py-4 lg:justify-self-end">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(246,179,66,0.34)] bg-[rgba(246,179,66,0.08)] text-[#f6b342]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
                  Support inbox
                </p>
                <p className="theme-text-muted mt-2 text-sm leading-6">
                  Need help with a route, deposit instruction, or settlement
                  status? Email the ZyroShift support desk directly.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={SUPPORT_MAILTO}
                    className="theme-accent-cta inline-flex min-h-[42px] items-center justify-center rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition hover:-translate-y-0.5"
                  >
                    Email support
                  </a>
                  <a
                    href={SUPPORT_MAILTO}
                    className="theme-text-muted text-sm transition hover:text-[var(--foreground)]"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
