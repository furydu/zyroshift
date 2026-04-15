import { BrandWordmark } from "@/components/layout/BrandWordmark";
import { getPairLaunchSpecs } from "@/lib/pairs";
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
        <p className="theme-text-soft text-xs leading-6">
          Rates, minimums, maximums, and route availability depend on live
          provider support and selected networks. Always verify the exact
          deposit instructions on the shift page before sending funds.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span className="theme-text-soft">ZyroShift © 2026</span>
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
    </footer>
  );
}
