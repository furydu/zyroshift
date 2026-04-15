import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";
import { getPairPageSpecs } from "@/lib/pairs/registry";
import type { PairPageSpec } from "@/lib/pairs/types";

function normalizeId(value: string) {
  return value.trim().toLowerCase();
}

function uniqueBySlug(routes: PairPageSpec[]) {
  const seen = new Set<string>();
  return routes.filter((route) => {
    if (seen.has(route.slug)) {
      return false;
    }
    seen.add(route.slug);
    return true;
  });
}

export function getRelatedRouteSpecs(spec: PairPageSpec, limit = 5) {
  const explicit = (spec.relatedSlugs || [])
    .map((slug) => resolvePairPageSpec(slug))
    .filter((route): route is PairPageSpec => Boolean(route));

  const fallback = getPairPageSpecs()
    .filter((candidate) => candidate.slug !== spec.slug)
    .map((candidate) => {
      const sameSource =
        normalizeId(candidate.fromLabel) === normalizeId(spec.fromLabel);
      const sameTarget =
        normalizeId(candidate.toLabel) === normalizeId(spec.toLabel);
      const reverseDirection =
        normalizeId(candidate.fromLabel) === normalizeId(spec.toLabel) &&
        normalizeId(candidate.toLabel) === normalizeId(spec.fromLabel);
      const samePairIntent = candidate.pairIntentType === spec.pairIntentType;

      let score = 0;

      if (reverseDirection) {
        score += 100;
      }
      if (sameSource) {
        score += 35;
      }
      if (sameTarget) {
        score += 25;
      }
      if (samePairIntent) {
        score += 10;
      }

      return {
        candidate,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.candidate);

  return uniqueBySlug([...explicit, ...fallback]).slice(0, limit);
}

export function getReverseRouteSpec(spec: PairPageSpec) {
  return resolvePairPageSpec(
    `${normalizeId(spec.toLabel)}-to-${normalizeId(spec.fromLabel)}`,
  );
}
