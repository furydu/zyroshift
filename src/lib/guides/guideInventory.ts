import {
  getGenericLaunchBucketItems,
  resolvePairPageSpec,
  type GenericLaunchBucket,
} from "@/lib/pairs";

export type GuideSupportTargetBucket = Extract<
  GenericLaunchBucket,
  "recommendedIndexNow" | "recommendedIndexNext"
>;

export type GuideSupportTargetItem = {
  slug: string;
  title: string;
  h1: string;
  score: number;
  priorityScore: number;
  fromLabel: string;
  toLabel: string;
  fromNetworkLabel: string;
  toNetworkLabel: string;
  moneyHref: string;
  guideHref: string;
  bucket: GuideSupportTargetBucket;
};

const GUIDE_SUPPORT_BUCKETS: GuideSupportTargetBucket[] = [
  "recommendedIndexNow",
  "recommendedIndexNext",
];

export const GUIDE_WAVE_ONE_LIMIT = 500;

let cachedGuideSupportItems: GuideSupportTargetItem[] | null = null;
let cachedGuideSupportSlugSet: Set<string> | null = null;

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function getBucketOrder(bucket: GuideSupportTargetBucket) {
  return bucket === "recommendedIndexNow" ? 0 : 1;
}

function sortGuideSupportItems(a: GuideSupportTargetItem, b: GuideSupportTargetItem) {
  const bucketDiff = getBucketOrder(a.bucket) - getBucketOrder(b.bucket);
  if (bucketDiff !== 0) {
    return bucketDiff;
  }

  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return b.priorityScore - a.priorityScore;
}

function buildGuideSupportItems() {
  const deduped = new Map<string, GuideSupportTargetItem>();

  for (const bucket of GUIDE_SUPPORT_BUCKETS) {
    const bucketItems = getGenericLaunchBucketItems(bucket);

    for (const item of bucketItems) {
      const spec = resolvePairPageSpec(item.slug);

      if (!spec) {
        continue;
      }

      const normalizedSlug = normalizeSlug(spec.slug);

      if (deduped.has(normalizedSlug)) {
        continue;
      }

      deduped.set(normalizedSlug, {
        slug: normalizedSlug,
        title: spec.title,
        h1: spec.h1,
        score: spec.indexability.breakdown.total,
        priorityScore: spec.priorityScore,
        fromLabel: spec.fromLabel,
        toLabel: spec.toLabel,
        fromNetworkLabel: spec.fromNetworkLabel,
        toNetworkLabel: spec.toNetworkLabel,
        moneyHref: `/swap/${spec.slug}`,
        guideHref: `/guides/${spec.slug}`,
        bucket,
      });
    }
  }

  return [...deduped.values()].sort(sortGuideSupportItems);
}

function ensureGuideSupportCache() {
  if (!cachedGuideSupportItems || !cachedGuideSupportSlugSet) {
    cachedGuideSupportItems = buildGuideSupportItems();
    cachedGuideSupportSlugSet = new Set(
      cachedGuideSupportItems.map((item) => normalizeSlug(item.slug)),
    );
  }
}

export function getGuideSupportTargetItems(limit?: number) {
  ensureGuideSupportCache();
  const items = cachedGuideSupportItems || [];

  if (typeof limit === "number" && limit > 0) {
    return items.slice(0, limit);
  }

  return [...items];
}

export function getGuideSupportSlugSet() {
  ensureGuideSupportCache();
  return new Set(cachedGuideSupportSlugSet || []);
}

export function isGuideSupportSlug(slug: string) {
  return getGuideSupportSlugSet().has(normalizeSlug(slug));
}

export function getGuidePublishBatch(limit = GUIDE_WAVE_ONE_LIMIT) {
  return getGuideSupportTargetItems(limit);
}

export function getGuideSupportSummary() {
  const items = getGuideSupportTargetItems();
  const countsByBucket: Record<GuideSupportTargetBucket, number> = {
    recommendedIndexNow: 0,
    recommendedIndexNext: 0,
  };

  for (const item of items) {
    countsByBucket[item.bucket] += 1;
  }

  return {
    supportTargetPairCount: items.length,
    countsByBucket,
    waveOneLimit: GUIDE_WAVE_ONE_LIMIT,
    waveOneCount: Math.min(GUIDE_WAVE_ONE_LIMIT, items.length),
  };
}
