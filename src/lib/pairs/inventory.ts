import {
  getAllAssets,
  getAssetBySymbol,
  getCanonicalNetworkSlug,
} from "@/lib/pairs/assets";
import { getTokenCatalogEntries } from "@/lib/pairs/classify";
import { getPairPageSpecs } from "@/lib/pairs/registry";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";
import type { PairIndexState, PairPageSpec, TokenCatalogEntry } from "@/lib/pairs/types";

export type PairInventoryItem = {
  requestedSlug: string;
  slug: string;
  curated: boolean;
  state: PairIndexState;
  readyForIndex: boolean;
  renderReady: boolean;
  launchRequested: boolean;
  score: number;
  priorityScore: number;
  templateFamily: PairPageSpec["templateFamily"];
  pairIntentType: PairPageSpec["pairIntentType"];
  fromToken: string;
  fromLabel: string;
  toToken: string;
  toLabel: string;
  fromNetworkId: string;
  fromNetworkLabel: string;
  toNetworkId: string;
  toNetworkLabel: string;
  reasons: string[];
};

export type PairUniverseSummary = {
  tokenCount: number;
  curatedPairCount: number;
  genericTokenPairCount: number;
  depositEnabledAssetNetworks: number;
  settleEnabledAssetNetworks: number;
  fullyQualifiedPairCount: number;
  phaseOneSeedTokenCount: number;
  candidateSlugCount: number;
  resolvedUniquePairs: number;
};

type PairPhaseOneInventory = {
  seedTokenCount: number;
  candidateSlugCount: number;
  resolvedUniquePairs: number;
  countsByState: Record<PairIndexState, number>;
  countsByTemplateFamily: Record<string, number>;
  countsByIntent: Record<string, number>;
  items: PairInventoryItem[];
};

export type PairInfrastructureReport = {
  generatedAt: string;
  universe: PairUniverseSummary;
  phaseOne: {
    countsByState: Record<PairIndexState, number>;
    countsByTemplateFamily: Record<string, number>;
    countsByIntent: Record<string, number>;
    indexCandidates: PairInventoryItem[];
    noindexCandidates: PairInventoryItem[];
    skippedSample: PairInventoryItem[];
  };
};

const PHASE_ONE_CATEGORY_ALLOWLIST = new Set(["btc", "stable", "layer1", "exchange"]);

let cachedReport: PairInfrastructureReport | null = null;
let cachedPhaseOneInventory: PairPhaseOneInventory | null = null;

function normalizeSlugValue(value: string) {
  return value.trim().toLowerCase();
}

function sortInventoryItems(a: PairInventoryItem, b: PairInventoryItem) {
  const stateOrder: Record<PairIndexState, number> = {
    index: 0,
    noindex: 1,
    skip: 2,
  };

  const stateDiff = stateOrder[a.state] - stateOrder[b.state];
  if (stateDiff !== 0) {
    return stateDiff;
  }

  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return b.priorityScore - a.priorityScore;
}

function isPhaseOneSeedToken(entry: TokenCatalogEntry) {
  return (
    entry.priority === "high" ||
    (entry.priority === "medium" &&
      PHASE_ONE_CATEGORY_ALLOWLIST.has(entry.category))
  );
}

function buildNetworkAwarePairSlugs(symbols: string[]) {
  const slugs = new Set<string>();

  for (const fromSymbol of symbols) {
    const fromAsset = getAssetBySymbol(fromSymbol);
    if (!fromAsset) {
      continue;
    }

    const depositNetworks = fromAsset.networks.filter((network) => network.depositEnabled);

    for (const toSymbol of symbols) {
      if (fromSymbol === toSymbol) {
        continue;
      }

      const toAsset = getAssetBySymbol(toSymbol);
      if (!toAsset) {
        continue;
      }

      const settleNetworks = toAsset.networks.filter((network) => network.settleEnabled);
      const genericSlug = `${normalizeSlugValue(fromSymbol)}-to-${normalizeSlugValue(toSymbol)}`;

      slugs.add(genericSlug);

      if (fromAsset.networks.length > 1) {
        for (const fromNetwork of depositNetworks) {
          slugs.add(
            `${normalizeSlugValue(fromSymbol)}-${getCanonicalNetworkSlug(
              fromNetwork.id,
            )}-to-${normalizeSlugValue(toSymbol)}`,
          );
        }
      }

      if (toAsset.networks.length > 1) {
        for (const toNetwork of settleNetworks) {
          slugs.add(
            `${normalizeSlugValue(fromSymbol)}-to-${normalizeSlugValue(
              toSymbol,
            )}-${getCanonicalNetworkSlug(toNetwork.id)}`,
          );
        }
      }

      if (fromAsset.networks.length > 1 && toAsset.networks.length > 1) {
        for (const fromNetwork of depositNetworks) {
          for (const toNetwork of settleNetworks) {
            slugs.add(
              `${normalizeSlugValue(fromSymbol)}-${getCanonicalNetworkSlug(
                fromNetwork.id,
              )}-to-${normalizeSlugValue(toSymbol)}-${getCanonicalNetworkSlug(
                toNetwork.id,
              )}`,
            );
          }
        }
      }
    }
  }

  return slugs;
}

function buildInventoryItem(
  spec: PairPageSpec,
  requestedSlug: string,
  curatedSlugs: Set<string>,
): PairInventoryItem {
  return {
    requestedSlug,
    slug: spec.slug,
    curated: curatedSlugs.has(spec.slug),
    state: spec.indexability.state,
    readyForIndex: spec.indexability.readyForIndex,
    renderReady: spec.indexability.renderReady,
    launchRequested: spec.indexability.launchRequested,
    score: spec.indexability.breakdown.total,
    priorityScore: spec.priorityScore,
    templateFamily: spec.templateFamily,
    pairIntentType: spec.pairIntentType,
    fromToken: spec.builderPreset.fromCoin,
    fromLabel: spec.fromLabel,
    toToken: spec.builderPreset.toCoin,
    toLabel: spec.toLabel,
    fromNetworkId: spec.builderPreset.fromNetwork,
    fromNetworkLabel: spec.fromNetworkLabel,
    toNetworkId: spec.builderPreset.toNetwork,
    toNetworkLabel: spec.toNetworkLabel,
    reasons: spec.indexability.reasons,
  };
}

function buildPhaseOneInventory(): PairPhaseOneInventory {
  const curatedSpecs = getPairPageSpecs();
  const curatedSlugs = new Set(curatedSpecs.map((spec) => spec.slug));
  const seedTokens = getTokenCatalogEntries()
    .filter(isPhaseOneSeedToken)
    .map((entry) => entry.symbol)
    .sort((a, b) => a.localeCompare(b, "en"));

  const candidateSlugs = buildNetworkAwarePairSlugs(seedTokens);
  const resolved = new Map<string, PairInventoryItem>();

  for (const requestedSlug of candidateSlugs) {
    const spec = resolvePairPageSpec(requestedSlug);

    if (!spec) {
      continue;
    }

    if (!resolved.has(spec.slug)) {
      resolved.set(spec.slug, buildInventoryItem(spec, requestedSlug, curatedSlugs));
    }
  }

  const items = [...resolved.values()].sort(sortInventoryItems);
  const countsByState: Record<PairIndexState, number> = {
    index: 0,
    noindex: 0,
    skip: 0,
  };
  const countsByTemplateFamily: Record<string, number> = {};
  const countsByIntent: Record<string, number> = {};

  for (const item of items) {
    countsByState[item.state] += 1;
    countsByTemplateFamily[item.templateFamily] =
      (countsByTemplateFamily[item.templateFamily] || 0) + 1;
    countsByIntent[item.pairIntentType] =
      (countsByIntent[item.pairIntentType] || 0) + 1;
  }

  return {
    seedTokenCount: seedTokens.length,
    candidateSlugCount: candidateSlugs.size,
    resolvedUniquePairs: items.length,
    countsByState,
    countsByTemplateFamily,
    countsByIntent,
    items,
  };
}

function getUniverseSummary(phaseOne: PairPhaseOneInventory): PairUniverseSummary {
  const assets = getAllAssets();
  const tokenCount = assets.length;
  const depositEnabledAssetNetworks = assets.reduce(
    (total, asset) =>
      total + asset.networks.filter((network) => network.depositEnabled).length,
    0,
  );
  const settleEnabledAssetNetworks = assets.reduce(
    (total, asset) =>
      total + asset.networks.filter((network) => network.settleEnabled).length,
    0,
  );

  let fullyQualifiedPairCount = 0;
  for (const fromAsset of assets) {
    const depositNetworks = fromAsset.networks.filter((network) => network.depositEnabled);

    for (const toAsset of assets) {
      const settleNetworks = toAsset.networks.filter((network) => network.settleEnabled);

      for (const fromNetwork of depositNetworks) {
        for (const toNetwork of settleNetworks) {
          if (
            fromAsset.coin.trim().toUpperCase() === toAsset.coin.trim().toUpperCase() &&
            fromNetwork.id.trim().toLowerCase() === toNetwork.id.trim().toLowerCase()
          ) {
            continue;
          }

          fullyQualifiedPairCount += 1;
        }
      }
    }
  }

  return {
    tokenCount,
    curatedPairCount: getPairPageSpecs().length,
    genericTokenPairCount: tokenCount * (tokenCount - 1),
    depositEnabledAssetNetworks,
    settleEnabledAssetNetworks,
    fullyQualifiedPairCount,
    phaseOneSeedTokenCount: phaseOne.seedTokenCount,
    candidateSlugCount: phaseOne.candidateSlugCount,
    resolvedUniquePairs: phaseOne.resolvedUniquePairs,
  };
}

export function getPhaseOnePairInventory(): PairPhaseOneInventory {
  if (cachedPhaseOneInventory) {
    return cachedPhaseOneInventory;
  }

  cachedPhaseOneInventory = buildPhaseOneInventory();
  return cachedPhaseOneInventory;
}

export function getPairInfrastructureReport(): PairInfrastructureReport {
  if (cachedReport) {
    return cachedReport;
  }

  const phaseOne = getPhaseOnePairInventory();
  cachedReport = {
    generatedAt: new Date().toISOString(),
    universe: getUniverseSummary(phaseOne),
    phaseOne: {
      countsByState: phaseOne.countsByState,
      countsByTemplateFamily: phaseOne.countsByTemplateFamily,
      countsByIntent: phaseOne.countsByIntent,
      indexCandidates: phaseOne.items.filter((item) => item.state === "index").slice(0, 80),
      noindexCandidates: phaseOne.items.filter((item) => item.state === "noindex").slice(0, 120),
      skippedSample: phaseOne.items.filter((item) => item.state === "skip").slice(0, 40),
    },
  };

  return cachedReport;
}
