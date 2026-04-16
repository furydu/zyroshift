import {
  getFrozenGoldSnapshotMetadata,
  getFrozenGoldSnapshotSlugSet,
  getFrozenGoldSnapshotSlugs,
  isFrozenGoldSnapshotSlug,
} from "@/lib/pairs/frozenGoldSnapshot";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";
import type { PairPageSpec } from "@/lib/pairs/types";

const SITE_URL = "https://zyroshift.com";

let cachedSpecs: PairPageSpec[] | null = null;

export function getFrozenGoldPairSlugs() {
  return getFrozenGoldSnapshotSlugs();
}

export function getFrozenGoldPairSlugSet() {
  return getFrozenGoldSnapshotSlugSet();
}

export function isFrozenGoldPairSlug(slug: string) {
  return isFrozenGoldSnapshotSlug(slug);
}

export function getFrozenGoldPairSpecs() {
  if (cachedSpecs) {
    return cachedSpecs;
  }

  const missingSlugs: string[] = [];
  const specs = getFrozenGoldPairSlugs()
    .map((slug) => {
      const spec = resolvePairPageSpec(slug);

      if (!spec) {
        missingSlugs.push(slug);
        return null;
      }

      return spec;
    })
    .filter((spec): spec is PairPageSpec => Boolean(spec));

  if (missingSlugs.length > 0) {
    throw new Error(
      `Frozen gold pair snapshot drifted. Missing slugs: ${missingSlugs.join(", ")}`,
    );
  }

  cachedSpecs = specs;
  return cachedSpecs;
}

export function getFrozenGoldPairStaticParams() {
  return getFrozenGoldPairSpecs().map((spec) => ({
    pair: spec.slug,
  }));
}

export function getFrozenGoldPairSitemapEntries() {
  return getFrozenGoldPairSpecs().map((spec) => ({
    url: `${SITE_URL}/swap/${spec.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

export function getFrozenGoldPairSetSummary() {
  const specs = getFrozenGoldPairSpecs();
  const snapshot = getFrozenGoldSnapshotMetadata();

  return {
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    pairCount: specs.length,
    snapshotPairCount: snapshot.pairCount,
  };
}
