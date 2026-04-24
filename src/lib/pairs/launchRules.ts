import { getAssetBySymbol, pickPreferredAssetNetwork } from "@/lib/pairs/assets";
import { getTokenCatalogEntries } from "@/lib/pairs/classify";
import { type PairInventoryItem } from "@/lib/pairs/inventory";
import { parsePairSlug } from "@/lib/pairs/parsePairSlug";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";
import type { PairTemplateFamily, TokenCatalogEntry, TokenPriority } from "@/lib/pairs/types";

export type PairLaunchClusterId =
  | "stable-to-btc"
  | "btc-to-stable"
  | "btc-to-alt"
  | "stable-to-alt"
  | "stable-to-stable"
  | "alt-to-btc"
  | "alt-to-stable"
  | "alt-to-alt";

export type PairLaunchClusterRule = {
  id: PairLaunchClusterId;
  quota: number;
  overrideSlugs: string[];
  preferredTokens: string[];
  candidate: (item: PairInventoryItem) => boolean;
  preferenceScore: (item: PairInventoryItem) => number;
  diversityKey: (item: PairInventoryItem) => string;
  secondaryDiversityKey?: (item: PairInventoryItem) => string;
  bucketKey?: (item: PairInventoryItem) => string;
  bucketLimit?: number;
};

const PRIORITY_RANK: Record<TokenPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};
const CLASSIFICATION_SOURCE_RANK = {
  manual_override: 3,
  rule: 2,
  fallback: 1,
} as const;
type ClassificationSourceRankKey = keyof typeof CLASSIFICATION_SOURCE_RANK;
const CURATED_STABLE_FALLBACKS = ["USDT", "USDC", "DAI"];
const CURATED_ALT_FALLBACKS = ["ETH", "SOL", "BNB", "TON", "XRP", "ADA", "TRX", "AVAX", "ARB", "OP"];
const TRUSTED_STABLE_ROUTE_NETWORKS = new Set([
  "tron",
  "ethereum",
  "bsc",
  "base",
  "arbitrum",
  "polygon",
  "solana",
  "optimism",
]);
const STABLE_SOURCE_NETWORK_SCORE: Record<string, number> = {
  ethereum: 6,
  base: 6,
  tron: 6,
  arbitrum: 5,
  polygon: 5,
  solana: 5,
  optimism: 4,
  bsc: 3,
};

export const LAUNCH_CLUSTER_PRIORITY: PairLaunchClusterId[] = [
  "stable-to-btc",
  "btc-to-stable",
  "btc-to-alt",
  "stable-to-alt",
  "stable-to-stable",
  "alt-to-btc",
  "alt-to-stable",
  "alt-to-alt",
];

const TEMPLATE_FAMILY_TO_CLUSTER: Record<
  Exclude<PairTemplateFamily, "other">,
  PairLaunchClusterId
> = {
  stable_network_specific_to_btc: "stable-to-btc",
  stable_to_btc: "stable-to-btc",
  btc_to_stable: "btc-to-stable",
  btc_to_alt: "btc-to-alt",
  btc_to_topcoin: "btc-to-alt",
  btc_to_meme: "btc-to-alt",
  stable_to_alt: "stable-to-alt",
  stable_to_stable: "stable-to-stable",
  stable_to_topcoin: "stable-to-alt",
  stable_to_meme: "stable-to-alt",
  alt_to_btc: "alt-to-btc",
  topcoin_to_btc: "alt-to-btc",
  meme_to_btc: "alt-to-btc",
  wrapped_btc_to_btc: "alt-to-btc",
  alt_to_stable: "alt-to-stable",
  topcoin_to_stable: "alt-to-stable",
  meme_to_stable: "alt-to-stable",
  alt_to_alt: "alt-to-alt",
  topcoin_to_topcoin: "alt-to-alt",
  btc_to_wrapped_btc: "alt-to-alt",
};

function isWrappedBitcoinSymbol(symbol: string) {
  const normalized = symbol.trim().toUpperCase();
  return normalized !== "BTC" && normalized.includes("BTC");
}

function isDerivativeAsset(entry: TokenCatalogEntry) {
  const normalizedName = entry.name.trim().toLowerCase();
  return /(wrapped|staked|beacon)/i.test(entry.name) || normalizedName.startsWith("liquid staked ");
}

function getClassificationSourceRank(source?: string) {
  if (source === "manual_override" || source === "rule" || source === "fallback") {
    return CLASSIFICATION_SOURCE_RANK[source as ClassificationSourceRankKey];
  }

  return CLASSIFICATION_SOURCE_RANK.fallback;
}

function buildPreferredTokenList(
  predicate: (entry: TokenCatalogEntry) => boolean,
  includeSymbols: string[],
  limit: number,
) {
  const includeSet = new Set(includeSymbols.map((symbol) => symbol.trim().toUpperCase()));

  return getTokenCatalogEntries()
    .filter((entry) => predicate(entry) || includeSet.has(entry.symbol))
    .sort((a, b) => {
      const includeDiff = Number(includeSet.has(b.symbol)) - Number(includeSet.has(a.symbol));
      if (includeDiff !== 0) {
        return includeDiff;
      }

      const priorityDiff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const sourceDiff =
        getClassificationSourceRank(b.classificationSource) -
        getClassificationSourceRank(a.classificationSource);
      if (sourceDiff !== 0) {
        return sourceDiff;
      }

      const networkDiff = b.networkCount - a.networkCount;
      if (networkDiff !== 0) {
        return networkDiff;
      }

      return a.symbol.localeCompare(b.symbol, "en");
    })
    .slice(0, limit)
    .map((entry) => entry.symbol);
}

const STABLE_LAUNCH_PREFERRED_TOKENS = buildPreferredTokenList(
  (entry) =>
    entry.category === "stable" &&
    (entry.priority === "high" || (entry.priority === "medium" && entry.networkCount >= 2)),
  CURATED_STABLE_FALLBACKS,
  6,
);
const ALT_LAUNCH_PREFERRED_TOKENS = buildPreferredTokenList(
  (entry) =>
    ["layer1", "layer2", "exchange"].includes(entry.category) &&
    entry.priority !== "low" &&
    !isWrappedBitcoinSymbol(entry.symbol) &&
    !isDerivativeAsset(entry),
  CURATED_ALT_FALLBACKS,
  24,
);
const STABLE_LAUNCH_PREFERRED_TOKEN_SET = new Set(STABLE_LAUNCH_PREFERRED_TOKENS);
const ALT_LAUNCH_PREFERRED_TOKEN_SET = new Set(ALT_LAUNCH_PREFERRED_TOKENS);

function isPreferredStableToken(symbol: string) {
  return STABLE_LAUNCH_PREFERRED_TOKEN_SET.has(symbol.trim().toUpperCase());
}

function isPreferredAltToken(symbol: string) {
  return ALT_LAUNCH_PREFERRED_TOKEN_SET.has(symbol.trim().toUpperCase());
}

function isPreferredSettlementNetwork(token: string, networkId: string) {
  const asset = getAssetBySymbol(token);
  if (!asset) {
    return false;
  }

  const preferred = pickPreferredAssetNetwork(asset, null, "settle");
  return Boolean(preferred && preferred.id.trim().toLowerCase() === networkId);
}

function buildPairSideSlug(token: string, network: string | null) {
  return network ? `${token.toLowerCase()}-${network}` : token.toLowerCase();
}

function hasRedundantExplicitDestination(item: PairInventoryItem) {
  const parsed = parsePairSlug(item.slug);

  if (!parsed?.toNetwork) {
    return false;
  }

  const simplerSlug = `${buildPairSideSlug(
    parsed.fromToken,
    parsed.fromNetwork,
  )}-to-${parsed.toToken.toLowerCase()}`;
  const simplerSpec = resolvePairPageSpec(simplerSlug);

  return Boolean(
    simplerSpec &&
      simplerSpec.slug !== item.slug &&
      simplerSpec.builderPreset.fromCoin === item.fromToken &&
      simplerSpec.builderPreset.toCoin === item.toToken &&
      simplerSpec.builderPreset.fromNetwork === item.fromNetworkId &&
      simplerSpec.builderPreset.toNetwork === item.toNetworkId,
  );
}

function hasRedundantExplicitSource(
  clusterId: PairLaunchClusterId,
  item: PairInventoryItem,
) {
  if (
    clusterId === "stable-to-btc" ||
    clusterId === "stable-to-alt" ||
    clusterId === "stable-to-stable"
  ) {
    return false;
  }

  const parsed = parsePairSlug(item.slug);

  if (!parsed?.fromNetwork) {
    return false;
  }

  const simplerSlug = `${parsed.fromToken.toLowerCase()}-to-${buildPairSideSlug(
    parsed.toToken,
    parsed.toNetwork,
  )}`;
  const simplerSpec = resolvePairPageSpec(simplerSlug);

  return Boolean(
    simplerSpec &&
      simplerSpec.slug !== item.slug &&
      simplerSpec.builderPreset.fromCoin === item.fromToken &&
      simplerSpec.builderPreset.toCoin === item.toToken &&
      simplerSpec.builderPreset.fromNetwork === item.fromNetworkId &&
      simplerSpec.builderPreset.toNetwork === item.toNetworkId,
  );
}

function passesSharedGuardrails(
  clusterId: PairLaunchClusterId,
  item: PairInventoryItem,
) {
  if (!item.readyForIndex) {
    return false;
  }

  if (hasRedundantExplicitDestination(item)) {
    return false;
  }

  if (hasRedundantExplicitSource(clusterId, item)) {
    return false;
  }

  return true;
}

function getPreferredTokenScore(
  preferredTokens: string[],
  token: string,
) {
  const index = preferredTokens.indexOf(token);

  if (index < 0) {
    return 0;
  }

  return preferredTokens.length - index;
}

function getStableSourceNetworkScore(networkId: string) {
  return STABLE_SOURCE_NETWORK_SCORE[networkId] || 0;
}

function createClusterRule(
  rule: PairLaunchClusterRule,
): PairLaunchClusterRule {
  return rule;
}

const CLUSTER_RULES: Record<PairLaunchClusterId, PairLaunchClusterRule> = {
  "stable-to-btc": createClusterRule({
    id: "stable-to-btc",
    quota: 27,
    overrideSlugs: [],
    preferredTokens: STABLE_LAUNCH_PREFERRED_TOKENS,
    candidate: (item) =>
      passesSharedGuardrails("stable-to-btc", item) &&
      isPreferredStableToken(item.fromToken) &&
      item.toToken === "BTC" &&
      item.toNetworkId === "bitcoin" &&
      !isWrappedBitcoinSymbol(item.toToken),
    preferenceScore: (item) =>
      getPreferredTokenScore(STABLE_LAUNCH_PREFERRED_TOKENS, item.fromToken) +
      getStableSourceNetworkScore(item.fromNetworkId) +
      (item.curated ? 100 : 0),
    diversityKey: (item) => `${item.fromToken}-${item.fromNetworkId}`,
  }),
  "btc-to-stable": createClusterRule({
    id: "btc-to-stable",
    quota: 14,
    overrideSlugs: [
      "btc-to-dai",
      "btc-to-usdc-base",
      "btc-to-usdc-arbitrum",
      "btc-to-usdt-erc20",
    ],
    preferredTokens: STABLE_LAUNCH_PREFERRED_TOKENS,
    candidate: (item) =>
      passesSharedGuardrails("btc-to-stable", item) &&
      item.fromToken === "BTC" &&
      item.fromNetworkId === "bitcoin" &&
      !isWrappedBitcoinSymbol(item.fromToken) &&
      isPreferredStableToken(item.toToken) &&
      TRUSTED_STABLE_ROUTE_NETWORKS.has(item.toNetworkId),
    preferenceScore: (item) =>
      getPreferredTokenScore(STABLE_LAUNCH_PREFERRED_TOKENS, item.toToken) +
      getStableSourceNetworkScore(item.toNetworkId) +
      (isPreferredSettlementNetwork(item.toToken, item.toNetworkId) ? 3 : 0) +
      (item.curated ? 100 : 0),
    diversityKey: (item) => item.toToken,
    secondaryDiversityKey: (item) => `${item.toToken}-${item.toNetworkId}`,
    bucketKey: (item) => item.toToken,
    bucketLimit: 7,
  }),
  "btc-to-alt": createClusterRule({
    id: "btc-to-alt",
    quota: 22,
    overrideSlugs: ["btc-to-ton", "btc-to-xrp", "btc-to-ada", "btc-to-avax", "btc-to-trx"],
    preferredTokens: ALT_LAUNCH_PREFERRED_TOKENS,
    candidate: (item) =>
      passesSharedGuardrails("btc-to-alt", item) &&
      item.fromToken === "BTC" &&
      item.fromNetworkId === "bitcoin" &&
      !isWrappedBitcoinSymbol(item.fromToken) &&
      !isWrappedBitcoinSymbol(item.toToken) &&
      isPreferredSettlementNetwork(item.toToken, item.toNetworkId) &&
      isPreferredAltToken(item.toToken),
    preferenceScore: (item) =>
      getPreferredTokenScore(ALT_LAUNCH_PREFERRED_TOKENS, item.toToken) +
      (item.curated ? 100 : 0),
    diversityKey: (item) => item.toToken,
  }),
  "stable-to-alt": createClusterRule({
    id: "stable-to-alt",
    quota: 26,
    overrideSlugs: [],
    preferredTokens: ALT_LAUNCH_PREFERRED_TOKENS,
    candidate: (item) =>
      passesSharedGuardrails("stable-to-alt", item) &&
      isPreferredStableToken(item.fromToken) &&
      TRUSTED_STABLE_ROUTE_NETWORKS.has(item.fromNetworkId) &&
      !isWrappedBitcoinSymbol(item.toToken) &&
      isPreferredSettlementNetwork(item.toToken, item.toNetworkId) &&
      isPreferredAltToken(item.toToken),
    preferenceScore: (item) =>
      getPreferredTokenScore(ALT_LAUNCH_PREFERRED_TOKENS, item.toToken) +
      getPreferredTokenScore(STABLE_LAUNCH_PREFERRED_TOKENS, item.fromToken) +
      getStableSourceNetworkScore(item.fromNetworkId) +
      (item.curated ? 100 : 0),
    diversityKey: (item) => item.toToken,
    secondaryDiversityKey: (item) => `${item.fromToken}-${item.toToken}`,
    bucketKey: (item) => item.fromNetworkId,
    bucketLimit: 4,
  }),
  "stable-to-stable": createClusterRule({
    id: "stable-to-stable",
    quota: 12,
    overrideSlugs: [],
    preferredTokens: STABLE_LAUNCH_PREFERRED_TOKENS,
    candidate: (item) =>
      passesSharedGuardrails("stable-to-stable", item) &&
      isPreferredStableToken(item.fromToken) &&
      isPreferredStableToken(item.toToken) &&
      TRUSTED_STABLE_ROUTE_NETWORKS.has(item.fromNetworkId) &&
      TRUSTED_STABLE_ROUTE_NETWORKS.has(item.toNetworkId) &&
      item.fromNetworkId !== item.toNetworkId,
    preferenceScore: (item) =>
      getPreferredTokenScore(STABLE_LAUNCH_PREFERRED_TOKENS, item.fromToken) +
      getPreferredTokenScore(STABLE_LAUNCH_PREFERRED_TOKENS, item.toToken) +
      getStableSourceNetworkScore(item.fromNetworkId) +
      getStableSourceNetworkScore(item.toNetworkId) +
      (item.curated ? 100 : 0),
    diversityKey: (item) => `${item.fromToken}-${item.toToken}`,
    secondaryDiversityKey: (item) => `${item.fromNetworkId}-${item.toNetworkId}`,
    bucketKey: (item) => item.fromToken,
    bucketLimit: 6,
  }),
  "alt-to-btc": createClusterRule({
    id: "alt-to-btc",
    quota: 14,
    overrideSlugs: ["trx-to-btc", "xrp-to-btc", "ton-to-btc", "ada-to-btc"],
    preferredTokens: ALT_LAUNCH_PREFERRED_TOKENS,
    candidate: (item) =>
      passesSharedGuardrails("alt-to-btc", item) &&
      !isWrappedBitcoinSymbol(item.fromToken) &&
      isPreferredAltToken(item.fromToken) &&
      item.toToken === "BTC" &&
      item.toNetworkId === "bitcoin",
    preferenceScore: (item) =>
      getPreferredTokenScore(ALT_LAUNCH_PREFERRED_TOKENS, item.fromToken) +
      (item.curated ? 100 : 0),
    diversityKey: (item) => item.fromToken,
  }),
  "alt-to-stable": createClusterRule({
    id: "alt-to-stable",
    quota: 23,
    overrideSlugs: [],
    preferredTokens: ALT_LAUNCH_PREFERRED_TOKENS,
    candidate: (item) =>
      passesSharedGuardrails("alt-to-stable", item) &&
      !isWrappedBitcoinSymbol(item.fromToken) &&
      isPreferredAltToken(item.fromToken) &&
      isPreferredStableToken(item.toToken) &&
      isPreferredSettlementNetwork(item.toToken, item.toNetworkId),
    preferenceScore: (item) =>
      getPreferredTokenScore(ALT_LAUNCH_PREFERRED_TOKENS, item.fromToken) +
      getPreferredTokenScore(STABLE_LAUNCH_PREFERRED_TOKENS, item.toToken) +
      (["USDT", "USDC"].includes(item.toToken) ? 3 : 0) +
      (item.curated ? 100 : 0),
    diversityKey: (item) => item.fromToken,
    secondaryDiversityKey: (item) => `${item.fromToken}-${item.toToken}`,
  }),
  "alt-to-alt": createClusterRule({
    id: "alt-to-alt",
    quota: 6,
    overrideSlugs: [],
    preferredTokens: [],
    candidate: (item) =>
      passesSharedGuardrails("alt-to-alt", item) &&
      !isWrappedBitcoinSymbol(item.fromToken) &&
      !isWrappedBitcoinSymbol(item.toToken) &&
      isPreferredSettlementNetwork(item.toToken, item.toNetworkId),
    preferenceScore: (item) => (item.curated ? 100 : 0),
    diversityKey: (item) => `${item.fromToken}-${item.toToken}`,
  }),
};

export function getPairLaunchClusterId(
  templateFamily: PairTemplateFamily,
): PairLaunchClusterId | null {
  if (templateFamily === "other") {
    return null;
  }

  return TEMPLATE_FAMILY_TO_CLUSTER[templateFamily];
}

export function getPairLaunchClusterRule(clusterId: PairLaunchClusterId) {
  return CLUSTER_RULES[clusterId];
}

export function getPairLaunchClusterRules() {
  return LAUNCH_CLUSTER_PRIORITY.map((clusterId) => CLUSTER_RULES[clusterId]);
}
