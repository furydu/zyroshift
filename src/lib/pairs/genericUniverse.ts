import { getAllAssets } from "@/lib/pairs/assets";
import { isFrozenGoldPairSlug } from "@/lib/pairs/goldSet";
import { parsePairSlug } from "@/lib/pairs/parsePairSlug";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";

type GenericTokenCapability = {
  symbol: string;
  depositReady: boolean;
  settleReady: boolean;
};

export type GenericPairUniverseItem = {
  slug: string;
  title: string;
  h1: string;
  score: number;
  priorityScore: number;
  tier: string;
  state: string;
  templateFamily: string;
  pairIntentType: string;
  fromToken: string;
  toToken: string;
  fromNetworkId: string;
  toNetworkId: string;
  reasons: string[];
};

export type GenericPairUniverseReport = {
  generatedAt: string;
  summary: {
    tokenCount: number;
    sourceReadyTokenCount: number;
    destinationReadyTokenCount: number;
    totalGenericPairSlugs: number;
    frozenGoldSlugExclusions: number;
    candidateGenericSlugs: number;
    renderableGenericPairs: number;
    unresolvedGenericPairs: number;
    indexReadyPairs: number;
    renderOnlyPairs: number;
  };
  countsByTemplateFamily: Record<string, number>;
  countsByIntent: Record<string, number>;
  countsByTier: Record<string, number>;
  countsByState: Record<string, number>;
  countsByLaunchBucket: Record<string, number>;
  launchInventory: {
    recommendedIndexNow: {
      targetCount: number;
      availableCount: number;
      sampleSlugs: string[];
    };
    recommendedIndexNext: {
      targetCount: number;
      availableCount: number;
      sampleSlugs: string[];
    };
    renderOnlyBacklog: {
      count: number;
      sampleSlugs: string[];
    };
  };
  samples: {
    topRenderablePairs: GenericPairUniverseItem[];
    unresolvedSlugs: string[];
    frozenGoldOverlap: string[];
  };
};

let cachedReport: GenericPairUniverseReport | null = null;
let cachedLaunchBuckets: Record<GenericLaunchBucket, GenericPairUniverseItem[]> | null = null;
let cachedBucketSummaries:
  | {
      countsByTier: Record<string, number>;
      countsByState: Record<string, number>;
      countsByLaunchBucket: Record<string, number>;
    }
  | null = null;

export type GenericLaunchBucket =
  | "recommendedIndexNow"
  | "recommendedIndexNext"
  | "renderOnlyBacklog";

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function sortSymbols(symbols: string[]) {
  return [...symbols].sort((a, b) => a.localeCompare(b, "en"));
}

function buildGenericPairSlug(fromToken: string, toToken: string) {
  return `${fromToken.trim().toLowerCase()}-to-${toToken.trim().toLowerCase()}`;
}

export function isGenericTokenPairSlug(slug: string) {
  const parsed = parsePairSlug(slug);

  return Boolean(parsed && !parsed.fromNetwork && !parsed.toNetwork);
}

export function getGenericTokenUniverseSymbols() {
  const symbols = getAllAssets().map((asset) => asset.coin.trim().toUpperCase());
  return sortSymbols([...new Set(symbols)]);
}

function getGenericTokenCapabilities() {
  return sortSymbols(
    getAllAssets().map((asset) => asset.coin.trim().toUpperCase()),
  ).map((symbol) => {
    const asset = getAllAssets().find(
      (candidate) => candidate.coin.trim().toUpperCase() === symbol,
    );

    return {
      symbol,
      depositReady: Boolean(asset?.networks.some((network) => network.depositEnabled)),
      settleReady: Boolean(asset?.networks.some((network) => network.settleEnabled)),
    } satisfies GenericTokenCapability;
  });
}

function getSourceReadySymbols(capabilities: GenericTokenCapability[]) {
  return capabilities.filter((item) => item.depositReady).map((item) => item.symbol);
}

function getDestinationReadySymbols(capabilities: GenericTokenCapability[]) {
  return capabilities.filter((item) => item.settleReady).map((item) => item.symbol);
}

export function getGenericTokenPairSlugs() {
  const capabilities = getGenericTokenCapabilities();
  const fromSymbols = getSourceReadySymbols(capabilities);
  const toSymbols = getDestinationReadySymbols(capabilities);
  const slugs: string[] = [];

  for (const fromToken of fromSymbols) {
    for (const toToken of toSymbols) {
      if (fromToken === toToken) {
        continue;
      }

      slugs.push(buildGenericPairSlug(fromToken, toToken));
    }
  }

  return slugs;
}

function sortRenderableItems(a: GenericPairUniverseItem, b: GenericPairUniverseItem) {
  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return b.priorityScore - a.priorityScore;
}

function sortByTierThenScore(a: GenericPairUniverseItem, b: GenericPairUniverseItem) {
  const tierOrder = { A: 0, B: 1, C: 2, D: 3 } as const;
  const tierDiff =
    (tierOrder[a.tier as keyof typeof tierOrder] ?? 9) -
    (tierOrder[b.tier as keyof typeof tierOrder] ?? 9);

  if (tierDiff !== 0) {
    return tierDiff;
  }

  return sortRenderableItems(a, b);
}

function buildReport() {
  const capabilities = getGenericTokenCapabilities();
  const sourceReadySymbols = getSourceReadySymbols(capabilities);
  const destinationReadySymbols = getDestinationReadySymbols(capabilities);
  const genericSlugs = getGenericTokenPairSlugs();
  const frozenGoldOverlap = genericSlugs.filter((slug) => isFrozenGoldPairSlug(slug));
  const candidateSlugs = genericSlugs.filter((slug) => !isFrozenGoldPairSlug(slug));
  const renderablePairs: GenericPairUniverseItem[] = [];
  const unresolvedSlugs: string[] = [];
  const countsByTemplateFamily: Record<string, number> = {};
  const countsByIntent: Record<string, number> = {};
  const countsByTier: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  const countsByState: Record<string, number> = { index: 0, noindex: 0, skip: 0 };
  const countsByLaunchBucket: Record<string, number> = {
    recommendedIndexNow: 0,
    recommendedIndexNext: 0,
    renderOnlyBacklog: 0,
  };

  for (const slug of candidateSlugs) {
    const spec = resolvePairPageSpec(slug);

    if (!spec) {
      unresolvedSlugs.push(slug);
      continue;
    }

    countsByTemplateFamily[spec.templateFamily] =
      (countsByTemplateFamily[spec.templateFamily] || 0) + 1;
    countsByIntent[spec.pairIntentType] = (countsByIntent[spec.pairIntentType] || 0) + 1;
    const tier = spec.indexability.tier || "D";
    countsByTier[tier] = (countsByTier[tier] || 0) + 1;
    countsByState[spec.indexability.state] = (countsByState[spec.indexability.state] || 0) + 1;

    renderablePairs.push({
      slug: spec.slug,
      title: spec.title,
      h1: spec.h1,
      score: spec.indexability.breakdown.total,
      priorityScore: spec.priorityScore,
      tier,
      state: spec.indexability.state,
      templateFamily: spec.templateFamily,
      pairIntentType: spec.pairIntentType,
      fromToken: spec.builderPreset.fromCoin,
      toToken: spec.builderPreset.toCoin,
      fromNetworkId: spec.builderPreset.fromNetwork,
      toNetworkId: spec.builderPreset.toNetwork,
      reasons: spec.indexability.reasons,
    });
  }

  const indexReadyPairs = renderablePairs
    .filter((item) => item.tier === "A" || item.tier === "B")
    .sort(sortByTierThenScore);
  const recommendedIndexNowPairs = indexReadyPairs.slice(0, 5000);
  const recommendedIndexNowSet = new Set(recommendedIndexNowPairs.map((item) => item.slug));
  const indexNextPairs = renderablePairs
    .filter(
      (item) =>
        !recommendedIndexNowSet.has(item.slug) &&
        (item.tier === "B" || item.tier === "C"),
    )
    .sort(sortByTierThenScore);
  const recommendedIndexNextPairs = indexNextPairs.slice(0, 10000);
  const recommendedIndexNextSet = new Set(recommendedIndexNextPairs.map((item) => item.slug));
  const renderOnlyPairs = renderablePairs
    .filter(
      (item) =>
        !recommendedIndexNowSet.has(item.slug) &&
        !recommendedIndexNextSet.has(item.slug),
    )
    .sort(sortRenderableItems);
  countsByLaunchBucket.recommendedIndexNow = recommendedIndexNowPairs.length;
  countsByLaunchBucket.recommendedIndexNext = recommendedIndexNextPairs.length;
  countsByLaunchBucket.renderOnlyBacklog = renderOnlyPairs.length;

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      tokenCount: capabilities.length,
      sourceReadyTokenCount: sourceReadySymbols.length,
      destinationReadyTokenCount: destinationReadySymbols.length,
      totalGenericPairSlugs: genericSlugs.length,
      frozenGoldSlugExclusions: frozenGoldOverlap.length,
      candidateGenericSlugs: candidateSlugs.length,
      renderableGenericPairs: renderablePairs.length,
      unresolvedGenericPairs: unresolvedSlugs.length,
      indexReadyPairs: indexReadyPairs.length,
      renderOnlyPairs: renderOnlyPairs.length,
    },
    countsByTemplateFamily,
    countsByIntent,
    countsByTier,
    countsByState,
    countsByLaunchBucket,
    launchInventory: {
      recommendedIndexNow: {
        targetCount: 5000,
        availableCount: recommendedIndexNowPairs.length,
        sampleSlugs: recommendedIndexNowPairs.slice(0, 40).map((item) => item.slug),
      },
      recommendedIndexNext: {
        targetCount: 10000,
        availableCount: recommendedIndexNextPairs.length,
        sampleSlugs: recommendedIndexNextPairs.slice(0, 40).map((item) => item.slug),
      },
      renderOnlyBacklog: {
        count: renderOnlyPairs.length,
        sampleSlugs: renderOnlyPairs.slice(0, 40).map((item) => item.slug),
      },
    },
    samples: {
      topRenderablePairs: [...renderablePairs].sort(sortRenderableItems).slice(0, 40),
      unresolvedSlugs: unresolvedSlugs.slice(0, 40),
      frozenGoldOverlap: frozenGoldOverlap.slice(0, 40).map(normalizeSlug),
    },
  } satisfies GenericPairUniverseReport;

  cachedLaunchBuckets = {
    recommendedIndexNow: recommendedIndexNowPairs,
    recommendedIndexNext: recommendedIndexNextPairs,
    renderOnlyBacklog: renderOnlyPairs,
  };
  cachedBucketSummaries = {
    countsByTier,
    countsByState,
    countsByLaunchBucket,
  };

  return report;
}

export function getGenericPairUniverseReport() {
  if (cachedReport) {
    return cachedReport;
  }

  cachedReport = buildReport();
  return cachedReport;
}

function ensureGenericUniverseCache() {
  if (!cachedReport || !cachedLaunchBuckets || !cachedBucketSummaries) {
    cachedReport = buildReport();
  }
}

export function getGenericLaunchBucketItems(
  bucket: GenericLaunchBucket,
  limit?: number,
) {
  ensureGenericUniverseCache();
  const items = cachedLaunchBuckets?.[bucket] || [];

  if (typeof limit === "number" && limit > 0) {
    return items.slice(0, limit);
  }

  return [...items];
}

export function getGenericLaunchBucketSlugs(
  bucket: GenericLaunchBucket,
  limit?: number,
) {
  return getGenericLaunchBucketItems(bucket, limit).map((item) => item.slug);
}

export function getGenericLaunchBucketSlugSet(bucket: GenericLaunchBucket) {
  return new Set(getGenericLaunchBucketSlugs(bucket));
}

export function getGenericRolloutCounts() {
  ensureGenericUniverseCache();

  return {
    countsByTier: { ...(cachedBucketSummaries?.countsByTier || {}) },
    countsByState: { ...(cachedBucketSummaries?.countsByState || {}) },
    countsByLaunchBucket: {
      ...(cachedBucketSummaries?.countsByLaunchBucket || {}),
    },
  };
}
