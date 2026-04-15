import {
  getRelatedRouteSummary,
  getReverseRouteSpec,
} from "@/lib/pairs";
import type { PairPageSpec } from "@/lib/pairs/types";
import Link from "next/link";

export function PairRelatedRoutes({
  spec,
  routes,
}: {
  spec: PairPageSpec;
  routes: PairPageSpec[];
}) {
  const reverseRoute = getReverseRouteSpec(spec);
  const routeCards = routes.filter((route) => route.slug !== reverseRoute?.slug);

  return (
    <section className="theme-panel rounded-[28px] px-5 py-5 md:px-6">
      <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.28em]">
        Related routes
      </p>
      {reverseRoute ? (
        <Link
          href={`/swap/${reverseRoute.slug}`}
          className="theme-card-strong mt-4 block rounded-[22px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
        >
          <p className="theme-accent-cyan font-mono text-[10px] uppercase tracking-[0.24em]">
            Reverse route
          </p>
          <p className="theme-text-main mt-2 text-lg font-semibold">
            Looking for the reverse path? Swap{" "}
            {reverseRoute.h1.replace(/^Swap\s+/i, "")}
          </p>
          <p className="theme-text-muted mt-2 text-sm leading-6">
            Move in the opposite direction while keeping the same pair context
            available from a dedicated route page.
          </p>
        </Link>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {routeCards.map((route) => (
          <Link
            key={route.slug}
            href={`/swap/${route.slug}`}
            className="theme-card rounded-[20px] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
          >
            <p className="theme-text-main font-mono text-[11px] uppercase tracking-[0.24em]">
              {route.h1.replace(/^Swap\s+/i, "")}
            </p>
            <p className="theme-text-muted mt-2 text-sm leading-6">
              {getRelatedRouteSummary(spec, route)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
