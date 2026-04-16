import goldPairSlugsSnapshot from "../../../data/seo/gold-pair-slugs.json";

type GoldPairSlugsSnapshot = {
  generatedAt: string;
  source: string;
  pairCount: number;
  slugs: string[];
};

const snapshot = goldPairSlugsSnapshot as GoldPairSlugsSnapshot;

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

const FROZEN_GOLD_SNAPSHOT_SLUGS = snapshot.slugs.map(normalizeSlug);
const FROZEN_GOLD_SNAPSHOT_SLUG_SET = new Set(FROZEN_GOLD_SNAPSHOT_SLUGS);

export function getFrozenGoldSnapshotMetadata() {
  return {
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    pairCount: snapshot.pairCount,
  };
}

export function getFrozenGoldSnapshotSlugs() {
  return [...FROZEN_GOLD_SNAPSHOT_SLUGS];
}

export function getFrozenGoldSnapshotSlugSet() {
  return FROZEN_GOLD_SNAPSHOT_SLUG_SET;
}

export function isFrozenGoldSnapshotSlug(slug: string) {
  return FROZEN_GOLD_SNAPSHOT_SLUG_SET.has(normalizeSlug(slug));
}
