import {
  formatAssetNetworkLabel,
  getCanonicalNetworkSlug,
  getSupportedAssetNetworks,
} from "@/lib/pairs/assets";
import { getTokenCatalogEntry } from "@/lib/pairs/classify";
import type { TokenCatalogEntry, TokenPriority } from "@/lib/pairs/types";

export type StableNetworkExpansionStableSymbol = "USDT" | "USDC";

export type StableNetworkExpansionFamily =
  | "usdt-network-to-btc"
  | "btc-to-usdt-network"
  | "usdt-network-to-topcoin"
  | "topcoin-to-usdt-network"
  | "usdt-network-to-usdt-network"
  | "usdc-network-to-btc"
  | "btc-to-usdc-network"
  | "usdc-network-to-topcoin"
  | "topcoin-to-usdc-network"
  | "usdc-network-to-usdc-network"
  | "usdt-network-to-usdc-network"
  | "usdc-network-to-usdt-network";

export type StableNetworkExpansionItem = {
  slug: string;
  family: StableNetworkExpansionFamily;
  stableSymbol: StableNetworkExpansionStableSymbol | "cross-stable";
  title: string;
  h1: string;
  score: number;
  priorityScore: number;
  fromToken: string;
  toToken: string;
  fromLabel: string;
  toLabel: string;
  fromNetworkId: string;
  toNetworkId: string;
  fromNetworkLabel: string;
  toNetworkLabel: string;
  moneyHref: string;
};

type StableNetworkDefinition = {
  stableSymbol: StableNetworkExpansionStableSymbol;
  networkId: string;
  networkLabel: string;
  canonicalSlug: string;
};

const STABLE_NETWORK_EXPANSION_TOP_TOKENS = [
  "ETH",
  "SOL",
  "BNB",
  "TON",
  "XRP",
  "ADA",
  "TRX",
  "AVAX",
  "ARB",
  "OP",
  "SUI",
  "LTC",
  "BCH",
  "DOGE",
  "APT",
  "POL",
  "NEAR",
  "INJ",
  "ATOM",
  "HBAR",
] as const;

const STABLE_NETWORK_EXPANSION_FAMILY_ORDER: StableNetworkExpansionFamily[] = [
  "usdt-network-to-btc",
  "btc-to-usdt-network",
  "usdt-network-to-topcoin",
  "topcoin-to-usdt-network",
  "usdt-network-to-usdt-network",
  "usdc-network-to-btc",
  "btc-to-usdc-network",
  "usdc-network-to-topcoin",
  "topcoin-to-usdc-network",
  "usdc-network-to-usdc-network",
  "usdt-network-to-usdc-network",
  "usdc-network-to-usdt-network",
];

const EXPECTED_STABLE_NETWORK_EXPANSION_COUNT = 1472;

let cachedItems: StableNetworkExpansionItem[] | null = null;
let cachedSlugSet: Set<string> | null = null;
let cachedTopTokens: TokenCatalogEntry[] | null = null;

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function getFamilyOrder(family: StableNetworkExpansionFamily) {
  const index = STABLE_NETWORK_EXPANSION_FAMILY_ORDER.indexOf(family);
  return index >= 0 ? index : 99;
}

function sortExpansionItems(
  a: StableNetworkExpansionItem,
  b: StableNetworkExpansionItem,
) {
  const familyDiff = getFamilyOrder(a.family) - getFamilyOrder(b.family);
  if (familyDiff !== 0) {
    return familyDiff;
  }

  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  const priorityDiff = b.priorityScore - a.priorityScore;
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return a.slug.localeCompare(b.slug, "en");
}

function buildStableSide(symbol: string, networkId: string) {
  return `${symbol.toLowerCase()}-${getCanonicalNetworkSlug(networkId)}`;
}

function getPriorityWeight(priority: TokenPriority) {
  switch (priority) {
    case "high":
      return 28;
    case "medium":
      return 20;
    default:
      return 12;
  }
}

function getFamilyWeight(family: StableNetworkExpansionFamily) {
  switch (family) {
    case "usdt-network-to-btc":
    case "btc-to-usdt-network":
    case "usdc-network-to-btc":
    case "btc-to-usdc-network":
      return 70;
    case "usdt-network-to-topcoin":
    case "topcoin-to-usdt-network":
    case "usdc-network-to-topcoin":
    case "topcoin-to-usdc-network":
      return 62;
    case "usdt-network-to-usdc-network":
    case "usdc-network-to-usdt-network":
      return 60;
    case "usdt-network-to-usdt-network":
    case "usdc-network-to-usdc-network":
      return 54;
    default:
      return 40;
  }
}

function getPreferredTokenNetworkLabel(symbol: string, direction: "deposit" | "settle") {
  const networks = getSupportedAssetNetworks(symbol, direction);
  const preferred = networks[0];

  if (!preferred) {
    throw new Error(
      `Stable-network expansion could not find a preferred ${direction} network for ${symbol}.`,
    );
  }

  return {
    networkId: preferred.id.trim().toLowerCase(),
    networkLabel: formatAssetNetworkLabel(preferred, false),
  };
}

function getRouteSideDisplay(
  token: string,
  networkLabel: string,
  explicitNetwork: boolean,
) {
  return explicitNetwork ? `${token} on ${networkLabel}` : token;
}

function buildItemPriorityScore(
  family: StableNetworkExpansionFamily,
  fromToken: string,
  toToken: string,
) {
  return (
    getFamilyWeight(family) +
    getPriorityWeight(getTokenCatalogEntry(fromToken).priority) +
    getPriorityWeight(getTokenCatalogEntry(toToken).priority)
  );
}

function toExpansionItem(
  params: {
    slug: string;
    family: StableNetworkExpansionFamily;
    stableSymbol: StableNetworkExpansionStableSymbol | "cross-stable";
    fromToken: string;
    toToken: string;
    fromNetworkId: string;
    toNetworkId: string;
    fromNetworkLabel: string;
    toNetworkLabel: string;
    fromExplicitNetwork: boolean;
    toExplicitNetwork: boolean;
  },
): StableNetworkExpansionItem {
  const fromDisplay = getRouteSideDisplay(
    params.fromToken,
    params.fromNetworkLabel,
    params.fromExplicitNetwork,
  );
  const toDisplay = getRouteSideDisplay(
    params.toToken,
    params.toNetworkLabel,
    params.toExplicitNetwork,
  );
  const priorityScore = buildItemPriorityScore(
    params.family,
    params.fromToken,
    params.toToken,
  );

  return {
    slug: params.slug,
    family: params.family,
    stableSymbol: params.stableSymbol,
    title: `Swap ${fromDisplay} to ${toDisplay} | Stable network route`,
    h1: `Swap ${fromDisplay} to ${toDisplay}`,
    score: priorityScore,
    priorityScore,
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromLabel: params.fromToken,
    toLabel: params.toToken,
    fromNetworkId: params.fromNetworkId,
    toNetworkId: params.toNetworkId,
    fromNetworkLabel: params.fromNetworkLabel,
    toNetworkLabel: params.toNetworkLabel,
    moneyHref: `/swap/${params.slug}`,
  };
}

function buildStableNetworkDefinitions(
  stableSymbol: StableNetworkExpansionStableSymbol,
) {
  const direction = "deposit";
  const stableNetworks = getSupportedAssetNetworks(stableSymbol, direction);

  if (!stableNetworks.length) {
    throw new Error(
      `Stable-network expansion could not find supported networks for ${stableSymbol}.`,
    );
  }

  return stableNetworks.map((network) => ({
    stableSymbol,
    networkId: network.id.trim().toLowerCase(),
    networkLabel: formatAssetNetworkLabel(network, true),
    canonicalSlug: buildStableSide(stableSymbol, network.id.trim().toLowerCase()),
  })) satisfies StableNetworkDefinition[];
}

function ensureTopTokens() {
  if (!cachedTopTokens) {
    cachedTopTokens = STABLE_NETWORK_EXPANSION_TOP_TOKENS.map((symbol) => {
      const entry = getTokenCatalogEntry(symbol);

      if (entry.symbol !== symbol) {
        throw new Error(
          `Stable-network expansion top token "${symbol}" is missing from the token catalog.`,
        );
      }

      return entry;
    });
  }

  return cachedTopTokens;
}

function buildItems() {
  const items: StableNetworkExpansionItem[] = [];
  const seen = new Set<string>();
  const topTokens = ensureTopTokens().map((entry) => entry.symbol);
  const usdtNetworks = buildStableNetworkDefinitions("USDT");
  const usdcNetworks = buildStableNetworkDefinitions("USDC");

  const pushItem = (
    params: {
      slug: string;
      family: StableNetworkExpansionFamily;
      stableSymbol: StableNetworkExpansionStableSymbol | "cross-stable";
      fromToken: string;
      toToken: string;
      fromNetworkId: string;
      toNetworkId: string;
      fromNetworkLabel: string;
      toNetworkLabel: string;
      fromExplicitNetwork: boolean;
      toExplicitNetwork: boolean;
    },
  ) => {
    const normalizedSlug = normalizeSlug(params.slug);

    if (seen.has(normalizedSlug)) {
      return;
    }

    seen.add(normalizedSlug);
    items.push(
      toExpansionItem({
        ...params,
        slug: normalizedSlug,
      }),
    );
  };

  for (const stableNetwork of usdtNetworks) {
    const btcSource = getPreferredTokenNetworkLabel("BTC", "deposit");
    const btcDestination = getPreferredTokenNetworkLabel("BTC", "settle");

    pushItem({
      slug: `${stableNetwork.canonicalSlug}-to-btc`,
      family: "usdt-network-to-btc",
      stableSymbol: "USDT",
      fromToken: "USDT",
      toToken: "BTC",
      fromNetworkId: stableNetwork.networkId,
      toNetworkId: btcDestination.networkId,
      fromNetworkLabel: stableNetwork.networkLabel,
      toNetworkLabel: btcDestination.networkLabel,
      fromExplicitNetwork: true,
      toExplicitNetwork: false,
    });
    pushItem({
      slug: `btc-to-${stableNetwork.canonicalSlug}`,
      family: "btc-to-usdt-network",
      stableSymbol: "USDT",
      fromToken: "BTC",
      toToken: "USDT",
      fromNetworkId: btcSource.networkId,
      toNetworkId: stableNetwork.networkId,
      fromNetworkLabel: btcSource.networkLabel,
      toNetworkLabel: stableNetwork.networkLabel,
      fromExplicitNetwork: false,
      toExplicitNetwork: true,
    });

    for (const topToken of topTokens) {
      const topTokenSource = getPreferredTokenNetworkLabel(topToken, "deposit");
      const topTokenDestination = getPreferredTokenNetworkLabel(topToken, "settle");

      pushItem({
        slug: `${stableNetwork.canonicalSlug}-to-${topToken.toLowerCase()}`,
        family: "usdt-network-to-topcoin",
        stableSymbol: "USDT",
        fromToken: "USDT",
        toToken: topToken,
        fromNetworkId: stableNetwork.networkId,
        toNetworkId: topTokenDestination.networkId,
        fromNetworkLabel: stableNetwork.networkLabel,
        toNetworkLabel: topTokenDestination.networkLabel,
        fromExplicitNetwork: true,
        toExplicitNetwork: false,
      });
      pushItem({
        slug: `${topToken.toLowerCase()}-to-${stableNetwork.canonicalSlug}`,
        family: "topcoin-to-usdt-network",
        stableSymbol: "USDT",
        fromToken: topToken,
        toToken: "USDT",
        fromNetworkId: topTokenSource.networkId,
        toNetworkId: stableNetwork.networkId,
        fromNetworkLabel: topTokenSource.networkLabel,
        toNetworkLabel: stableNetwork.networkLabel,
        fromExplicitNetwork: false,
        toExplicitNetwork: true,
      });
    }

    for (const targetNetwork of usdtNetworks) {
      if (stableNetwork.networkId === targetNetwork.networkId) {
        continue;
      }

      pushItem({
        slug: `${stableNetwork.canonicalSlug}-to-${targetNetwork.canonicalSlug}`,
        family: "usdt-network-to-usdt-network",
        stableSymbol: "USDT",
        fromToken: "USDT",
        toToken: "USDT",
        fromNetworkId: stableNetwork.networkId,
        toNetworkId: targetNetwork.networkId,
        fromNetworkLabel: stableNetwork.networkLabel,
        toNetworkLabel: targetNetwork.networkLabel,
        fromExplicitNetwork: true,
        toExplicitNetwork: true,
      });
    }
  }

  for (const stableNetwork of usdcNetworks) {
    const btcSource = getPreferredTokenNetworkLabel("BTC", "deposit");
    const btcDestination = getPreferredTokenNetworkLabel("BTC", "settle");

    pushItem({
      slug: `${stableNetwork.canonicalSlug}-to-btc`,
      family: "usdc-network-to-btc",
      stableSymbol: "USDC",
      fromToken: "USDC",
      toToken: "BTC",
      fromNetworkId: stableNetwork.networkId,
      toNetworkId: btcDestination.networkId,
      fromNetworkLabel: stableNetwork.networkLabel,
      toNetworkLabel: btcDestination.networkLabel,
      fromExplicitNetwork: true,
      toExplicitNetwork: false,
    });
    pushItem({
      slug: `btc-to-${stableNetwork.canonicalSlug}`,
      family: "btc-to-usdc-network",
      stableSymbol: "USDC",
      fromToken: "BTC",
      toToken: "USDC",
      fromNetworkId: btcSource.networkId,
      toNetworkId: stableNetwork.networkId,
      fromNetworkLabel: btcSource.networkLabel,
      toNetworkLabel: stableNetwork.networkLabel,
      fromExplicitNetwork: false,
      toExplicitNetwork: true,
    });

    for (const topToken of topTokens) {
      const topTokenSource = getPreferredTokenNetworkLabel(topToken, "deposit");
      const topTokenDestination = getPreferredTokenNetworkLabel(topToken, "settle");

      pushItem({
        slug: `${stableNetwork.canonicalSlug}-to-${topToken.toLowerCase()}`,
        family: "usdc-network-to-topcoin",
        stableSymbol: "USDC",
        fromToken: "USDC",
        toToken: topToken,
        fromNetworkId: stableNetwork.networkId,
        toNetworkId: topTokenDestination.networkId,
        fromNetworkLabel: stableNetwork.networkLabel,
        toNetworkLabel: topTokenDestination.networkLabel,
        fromExplicitNetwork: true,
        toExplicitNetwork: false,
      });
      pushItem({
        slug: `${topToken.toLowerCase()}-to-${stableNetwork.canonicalSlug}`,
        family: "topcoin-to-usdc-network",
        stableSymbol: "USDC",
        fromToken: topToken,
        toToken: "USDC",
        fromNetworkId: topTokenSource.networkId,
        toNetworkId: stableNetwork.networkId,
        fromNetworkLabel: topTokenSource.networkLabel,
        toNetworkLabel: stableNetwork.networkLabel,
        fromExplicitNetwork: false,
        toExplicitNetwork: true,
      });
    }

    for (const targetNetwork of usdcNetworks) {
      if (stableNetwork.networkId === targetNetwork.networkId) {
        continue;
      }

      pushItem({
        slug: `${stableNetwork.canonicalSlug}-to-${targetNetwork.canonicalSlug}`,
        family: "usdc-network-to-usdc-network",
        stableSymbol: "USDC",
        fromToken: "USDC",
        toToken: "USDC",
        fromNetworkId: stableNetwork.networkId,
        toNetworkId: targetNetwork.networkId,
        fromNetworkLabel: stableNetwork.networkLabel,
        toNetworkLabel: targetNetwork.networkLabel,
        fromExplicitNetwork: true,
        toExplicitNetwork: true,
      });
    }
  }

  for (const usdtNetwork of usdtNetworks) {
    for (const usdcNetwork of usdcNetworks) {
      pushItem({
        slug: `${usdtNetwork.canonicalSlug}-to-${usdcNetwork.canonicalSlug}`,
        family: "usdt-network-to-usdc-network",
        stableSymbol: "cross-stable",
        fromToken: "USDT",
        toToken: "USDC",
        fromNetworkId: usdtNetwork.networkId,
        toNetworkId: usdcNetwork.networkId,
        fromNetworkLabel: usdtNetwork.networkLabel,
        toNetworkLabel: usdcNetwork.networkLabel,
        fromExplicitNetwork: true,
        toExplicitNetwork: true,
      });
      pushItem({
        slug: `${usdcNetwork.canonicalSlug}-to-${usdtNetwork.canonicalSlug}`,
        family: "usdc-network-to-usdt-network",
        stableSymbol: "cross-stable",
        fromToken: "USDC",
        toToken: "USDT",
        fromNetworkId: usdcNetwork.networkId,
        toNetworkId: usdtNetwork.networkId,
        fromNetworkLabel: usdcNetwork.networkLabel,
        toNetworkLabel: usdtNetwork.networkLabel,
        fromExplicitNetwork: true,
        toExplicitNetwork: true,
      });
    }
  }

  const sortedItems = items.sort(sortExpansionItems);

  if (sortedItems.length !== EXPECTED_STABLE_NETWORK_EXPANSION_COUNT) {
    throw new Error(
      `Stable-network expansion expected ${EXPECTED_STABLE_NETWORK_EXPANSION_COUNT} pages but built ${sortedItems.length}.`,
    );
  }

  return sortedItems;
}

function ensureCache() {
  if (!cachedItems || !cachedSlugSet) {
    cachedItems = buildItems();
    cachedSlugSet = new Set(cachedItems.map((item) => normalizeSlug(item.slug)));
  }
}

export function getStableNetworkExpansionTopTokens() {
  return [...ensureTopTokens()];
}

export function getStableNetworkExpansionItems(
  limit?: number,
  family?: StableNetworkExpansionFamily,
) {
  ensureCache();

  const items =
    typeof family === "string"
      ? (cachedItems || []).filter((item) => item.family === family)
      : [...(cachedItems || [])];

  if (typeof limit === "number" && limit > 0) {
    return items.slice(0, limit);
  }

  return items;
}

export function getStableNetworkExpansionStaticParams(limit?: number) {
  return getStableNetworkExpansionItems(limit).map((item) => ({
    pair: item.slug,
  }));
}

export function getStableNetworkExpansionSlugSet() {
  ensureCache();
  return new Set(cachedSlugSet || []);
}

export function isStableNetworkExpansionSlug(slug: string) {
  return getStableNetworkExpansionSlugSet().has(normalizeSlug(slug));
}

export function getStableNetworkExpansionSummary() {
  const items = getStableNetworkExpansionItems();
  const countsByFamily = STABLE_NETWORK_EXPANSION_FAMILY_ORDER.reduce<
    Record<StableNetworkExpansionFamily, number>
  >(
    (acc, family) => {
      acc[family] = 0;
      return acc;
    },
    {
      "usdt-network-to-btc": 0,
      "btc-to-usdt-network": 0,
      "usdt-network-to-topcoin": 0,
      "topcoin-to-usdt-network": 0,
      "usdt-network-to-usdt-network": 0,
      "usdc-network-to-btc": 0,
      "btc-to-usdc-network": 0,
      "usdc-network-to-topcoin": 0,
      "topcoin-to-usdc-network": 0,
      "usdc-network-to-usdc-network": 0,
      "usdt-network-to-usdc-network": 0,
      "usdc-network-to-usdt-network": 0,
    },
  );

  for (const item of items) {
    countsByFamily[item.family] += 1;
  }

  return {
    totalPages: items.length,
    stableNetworkCounts: {
      USDT: buildStableNetworkDefinitions("USDT").length,
      USDC: buildStableNetworkDefinitions("USDC").length,
    },
    topTokenCount: STABLE_NETWORK_EXPANSION_TOP_TOKENS.length,
    topTokens: STABLE_NETWORK_EXPANSION_TOP_TOKENS,
    countsByFamily,
  };
}
