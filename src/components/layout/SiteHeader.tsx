import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";

type HeaderNavKey =
  | "swap"
  | "tokens"
  | "networks"
  | "how"
  | "status";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const HEADER_NAV = [
  { key: "swap" as const, label: "Swap", href: "/swap" },
  { key: "tokens" as const, label: "Tokens", href: "/tokens" },
  { key: "networks" as const, label: "Networks", href: "/networks" },
  { key: "how" as const, label: "How it Works", href: "/how-it-works" },
  { key: "status" as const, label: "Track Order", href: "/track-order" },
];

export function SiteHeader({
  activeKey,
  ctaHref = "/swap",
  ctaLabel = "Start Swap",
  breadcrumbs,
}: {
  activeKey?: HeaderNavKey;
  ctaHref?: string;
  ctaLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <>
      <ThemeToggle />

      <header className="mb-5 pr-16 lg:pr-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="theme-text-main font-mono text-sm uppercase tracking-[0.36em]"
          >
            ZyroShift
          </Link>

          <nav className="hidden flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] lg:flex">
            {HEADER_NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-full border border-transparent px-3 py-2 transition ${
                  activeKey === item.key
                    ? "text-white border border-[var(--accent-cyan-border)] bg-[var(--accent-cyan-soft)] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                    : "text-white/90 hover:border hover:border-[var(--accent-cyan-border)] hover:bg-[var(--accent-cyan-soft)] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href={ctaHref}
            className="theme-accent-cta inline-flex min-h-[42px] items-center rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] transition hover:-translate-y-0.5"
          >
            {ctaLabel}
          </Link>
        </div>

        {breadcrumbs?.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em]">
            {breadcrumbs.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center gap-2.5">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="theme-text-soft transition hover:text-[var(--foreground)]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="theme-text-main">{item.label}</span>
                )}
                {index < breadcrumbs.length - 1 ? (
                  <span className="theme-text-soft">&gt;</span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </header>
    </>
  );
}
