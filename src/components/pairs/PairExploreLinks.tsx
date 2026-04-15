import type { PairExploreLink } from "@/lib/pairs/types";
import Link from "next/link";

export function PairExploreLinks({ links }: { links: PairExploreLink[] }) {
  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-accent-cyan text-center font-mono text-[11px] uppercase tracking-[0.28em]">
        Explore tokens and networks
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="theme-card rounded-[20px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
          >
            <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.22em]">
              {link.label}
            </p>
            <p className="theme-text-muted mt-2 text-sm leading-6">
              {link.detail}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
