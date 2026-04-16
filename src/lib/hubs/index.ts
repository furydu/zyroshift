import {
  getAssetBySymbol,
  getAllAssets,
  getCanonicalNetworkSlug,
  hasSpecificAssetNetworkPreference,
  normalizeAssetNetworkSlug,
  pickPreferredAssetNetwork,
} from "@/lib/pairs/assets";
import {
  getTokenCatalogEntries,
  getTokenCatalogEntry,
} from "@/lib/pairs/classify";
import { getPairPageSpecs } from "@/lib/pairs/registry";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";
import type {
  PairIntentType,
  PairPageFaq,
  PairPageSpec,
  TokenCatalogEntry,
  TokenCategory,
  TokenPriority,
} from "@/lib/pairs/types";
import type { SwapAssetOption, SwapNetworkOption } from "@/lib/sideshift/types";

type HubIntentStat = {
  key: PairIntentType;
  label: string;
  count: number;
  description: string;
};

type TokenHubRouteCard = {
  slug: string;
  label: string;
  summary: string;
  intentKey: PairIntentType;
  intentLabel: string;
  href: string;
  indexable: boolean;
  fromToken: string;
  fromLabel: string;
  fromNetworkId: string;
  toToken: string;
  toLabel: string;
  toNetworkId: string;
};

type TokenHubRouteGroup = {
  key: string;
  title: string;
  description: string;
  routes: TokenHubRouteCard[];
};

type TokenHubNetworkBreakdown = {
  id: string;
  label: string;
  href: string;
  useCase: string;
  useWhen: string[];
  badges: string[];
};

type NetworkCharacteristicCard = {
  label: string;
  value: string;
  description: string;
};

type NetworkQuickFact = {
  label: string;
  value: string;
};

type NetworkCoverageSummary = {
  assetCount: number;
  depositAssetCount: number;
  settleAssetCount: number;
};

type NetworkHubAssetCard = {
  symbol: string;
  name: string;
  href: string;
  summary: string;
};

type NetworkRouteClusterLink = {
  title: string;
  href: string;
  description: string;
};

type NetworkComparisonCard = {
  network: string;
  label: string;
  href: string;
  summary: string;
};

type TokenHubData = {
  token: string;
  tokenLabel: string;
  tokenName: string;
  swapHref: string;
  category: TokenCategory;
  priority: TokenPriority;
  heroTitle: string;
  heroDescription: string;
  networkCount: number;
  networkLabels: string[];
  depositEnabledNetworkCount: number;
  settleEnabledNetworkCount: number;
  hasMemoRoutes: boolean;
  featuredRoutes: PairPageSpec[];
  sendRoutes: PairPageSpec[];
  receiveRoutes: PairPageSpec[];
  sendRouteGroups: TokenHubRouteGroup[];
  receiveRouteGroups: TokenHubRouteGroup[];
  intentStats: HubIntentStat[];
  summaryHeading: string;
  summaryParagraphs: string[];
  seoEntryHeading: string;
  seoEntryParagraph: string;
  whyUseHeading: string;
  whyUsePoints: string[];
  networkBreakdown: TokenHubNetworkBreakdown[];
  topIntegrationTokens: TokenCatalogEntry[];
  relatedTokens: TokenCatalogEntry[];
  moreRouteCards: TokenHubRouteCard[];
  faqs: PairPageFaq[];
};

type NetworkHubData = {
  network: string;
  networkLabel: string;
  swapHref: string;
  heroTitle: string;
  heroDescription: string;
  assetCount: number;
  depositAssetCount: number;
  settleAssetCount: number;
  routeCount: number;
  narrativeHeading: string;
  narrativeParagraphs: string[];
  useGuidanceHeading: string;
  useGuidancePoints: string[];
  quickFacts: NetworkQuickFact[];
  characteristicsHeading: string;
  characteristics: NetworkCharacteristicCard[];
  topAssets: NetworkHubAssetCard[];
  routes: PairPageSpec[];
  sourceRoutes: TokenHubRouteCard[];
  destinationRoutes: TokenHubRouteCard[];
  routeClusters: NetworkRouteClusterLink[];
  intentStats: HubIntentStat[];
  riskHeading: string;
  riskNotes: string[];
  comparisonHeading: string;
  comparisons: NetworkComparisonCard[];
  relatedTokens: TokenCatalogEntry[];
  relatedNetworks: NetworkComparisonCard[];
  faqs: PairPageFaq[];
};

type DirectoryStat = {
  label: string;
  value: string;
};

type DirectoryLinkCard = {
  title: string;
  href: string;
  summary: string;
  meta?: string;
  networkId?: string;
};

type DirectoryCategoryCard = {
  id: string;
  label: string;
  count: number;
  description: string;
  examples: string[];
};

type DirectorySection = {
  id: string;
  title: string;
  description: string;
  items: DirectoryLinkCard[];
};

type TokenDirectoryData = {
  heroTitle: string;
  heroDescription: string;
  stats: DirectoryStat[];
  narrativeHeading: string;
  narrativeParagraphs: string[];
  guidanceHeading: string;
  guidancePoints: string[];
  categoryCards: DirectoryCategoryCard[];
  featuredTokens: DirectoryLinkCard[];
  sections: DirectorySection[];
  routePatternCards: DirectoryLinkCard[];
  relatedNetworks: DirectoryLinkCard[];
};

type NetworkDirectoryData = {
  heroTitle: string;
  heroDescription: string;
  stats: DirectoryStat[];
  narrativeHeading: string;
  narrativeParagraphs: string[];
  guidanceHeading: string;
  guidancePoints: string[];
  familyCards: DirectoryCategoryCard[];
  featuredNetworks: DirectoryLinkCard[];
  sections: DirectorySection[];
  routePatternCards: DirectoryLinkCard[];
  relatedTokens: DirectoryLinkCard[];
};

const TOKEN_CATALOG = getTokenCatalogEntries().sort((a, b) =>
  a.symbol.localeCompare(b.symbol, "en"),
);
const ALL_ASSETS = getAllAssets();
const CURATED_PAIR_SPECS = getPairPageSpecs();

const PRIORITY_WEIGHT: Record<TokenPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const HUB_ANCHOR_SYMBOLS = [
  "BTC",
  "USDT",
  "ETH",
  "USDC",
  "SOL",
  "BNB",
  "TON",
  "XRP",
  "ADA",
  "DOGE",
] as const;

const HUB_INTENT_LABELS: Record<PairIntentType, string> = {
  btc_to_stable: "Bitcoin into stablecoins",
  btc_to_alt: "Bitcoin into other ecosystems",
  btc_to_meme: "Bitcoin into meme assets",
  btc_to_topcoin: "Bitcoin into ecosystem assets",
  stable_to_btc: "Stablecoins into Bitcoin",
  stable_to_alt: "Stablecoins into other ecosystems",
  stable_to_topcoin: "Stablecoins into ecosystem assets",
  stable_to_meme: "Stablecoins into meme assets",
  alt_to_btc: "Altcoins into Bitcoin",
  alt_to_stable: "Altcoins into stablecoins",
  alt_to_alt: "Between ecosystem assets",
  topcoin_to_btc: "Ecosystem assets into Bitcoin",
  topcoin_to_stable: "Ecosystem assets into stablecoins",
  topcoin_to_topcoin: "Between ecosystem assets",
  meme_to_stable: "Meme assets into stablecoins",
  meme_to_btc: "Meme assets into Bitcoin",
  wrapped_btc_to_btc: "Wrapped Bitcoin into Bitcoin",
  btc_to_wrapped_btc: "Bitcoin into wrapped Bitcoin",
  other: "Other supported route types",
};

const TOKEN_CATEGORY_META: Record<
  TokenCategory,
  { id: string; label: string; description: string }
> = {
  btc: {
    id: "bitcoin-and-core-assets",
    label: "Bitcoin and core assets",
    description:
      "Core destination assets and high-trust routes used for settlement, rotation, and store-of-value flows.",
  },
  stable: {
    id: "stablecoins",
    label: "Stablecoins",
    description:
      "Funding and landing assets used when users want stable value, network choice, and fast portfolio rotation.",
  },
  layer1: {
    id: "layer-1-assets",
    label: "Layer 1 assets",
    description:
      "Major ecosystem-entry assets used when users move capital into a chain's native environment and wallet flow.",
  },
  layer2: {
    id: "layer-2-assets",
    label: "Layer 2 assets",
    description:
      "Lower-cost ecosystem assets that stay close to EVM compatibility while changing transfer economics.",
  },
  defi: {
    id: "defi-assets",
    label: "DeFi assets",
    description:
      "Assets tied to trading, lending, and app-native usage when the destination matters as much as the route.",
  },
  exchange: {
    id: "exchange-assets",
    label: "Exchange ecosystem assets",
    description:
      "Assets connected to exchange-led ecosystems and routing paths where brand, chain, and wallet familiarity overlap.",
  },
  gaming: {
    id: "gaming-assets",
    label: "Gaming assets",
    description:
      "Ecosystem assets used when routes end inside gaming or metaverse-native wallets and app environments.",
  },
  meme: {
    id: "meme-assets",
    label: "Meme assets",
    description:
      "Higher-volatility assets used in speculative flows, quick rotations, and take-profit exits into BTC or stablecoins.",
  },
  other: {
    id: "other-assets",
    label: "Other assets",
    description:
      "Long-tail assets that still appear in supported routes when wallet compatibility and network fit matter.",
  },
};

const FEATURED_NETWORK_ORDER = [
  "ethereum",
  "tron",
  "bitcoin",
  "bsc",
  "solana",
  "base",
  "arbitrum",
  "optimism",
] as const;

const FEATURED_TOKEN_ORDER = [
  "BTC",
  "USDT",
  "ETH",
  "USDC",
  "SOL",
  "BNB",
  "TON",
  "XRP",
] as const;

function normalizeId(value: string) {
  return value.trim().toLowerCase();
}

function getPreferredSwapSourceSymbols(networkId: string) {
  switch (normalizeId(networkId)) {
    case "bitcoin":
      return ["BTC", "USDT", "USDC"];
    case "ethereum":
      return ["ETH", "USDT", "USDC"];
    case "tron":
      return ["TRX", "USDT", "USDC"];
    case "bsc":
      return ["BNB", "USDT", "USDC"];
    case "solana":
      return ["SOL", "USDT", "USDC"];
    case "base":
    case "arbitrum":
    case "optimism":
      return ["ETH", "USDC", "USDT"];
    case "polygon":
      return ["POL", "MATIC", "USDC", "USDT"];
    case "avax":
      return ["AVAX", "USDT", "USDC"];
    case "ton":
      return ["TON", "USDT"];
    case "ripple":
      return ["XRP", "USDT"];
    case "cardano":
      return ["ADA", "USDT"];
    case "litecoin":
      return ["LTC", "USDT"];
    case "doge":
      return ["DOGE", "USDT"];
    case "liquid":
      return ["BTC", "USDT"];
    default:
      return [];
  }
}

function getNetworkSwapHref(networkId: string, topAssets: TokenCatalogEntry[]) {
  const candidates = [
    ...getPreferredSwapSourceSymbols(networkId),
    ...topAssets.map((entry) => entry.symbol),
  ];
  const seen = new Set<string>();

  for (const symbol of candidates) {
    const normalizedSymbol = symbol.trim().toUpperCase();
    if (!normalizedSymbol || seen.has(normalizedSymbol)) {
      continue;
    }

    seen.add(normalizedSymbol);

    const asset = getAssetBySymbol(normalizedSymbol);
    if (!asset) {
      continue;
    }

    const preferredNetwork = pickPreferredAssetNetwork(asset, networkId, "deposit");
    if (!preferredNetwork) {
      continue;
    }

    const params = new URLSearchParams({
      fromCoin: asset.coin,
      fromNetwork: preferredNetwork.id,
    });

    return `/swap?${params.toString()}`;
  }

  return "/swap";
}

function buildAssetMap() {
  return new Map(
    ALL_ASSETS.map((asset) => [asset.coin.trim().toUpperCase(), asset]),
  );
}

const ASSET_MAP = buildAssetMap();

function buildNetworkMap() {
  const map = new Map<string, { label: string; assets: SwapAssetOption[] }>();

  for (const asset of ALL_ASSETS) {
    for (const network of asset.networks) {
      const normalizedId = normalizeId(network.id);
      const current = map.get(normalizedId);

      if (current) {
        current.assets.push(asset);
      } else {
        map.set(normalizedId, {
          label: network.label,
          assets: [asset],
        });
      }
    }
  }

  return map;
}

const NETWORK_MAP = buildNetworkMap();

function getTokenCategoryLabel(category: TokenCategory) {
  switch (category) {
    case "btc":
      return "Bitcoin-native asset";
    case "stable":
      return "Stablecoin";
    case "layer1":
      return "Layer 1 asset";
    case "layer2":
      return "Layer 2 asset";
    case "meme":
      return "Meme asset";
    case "defi":
      return "DeFi asset";
    case "exchange":
      return "Exchange ecosystem asset";
    case "gaming":
      return "Gaming asset";
    default:
      return "General crypto asset";
  }
}

function getPriorityLabel(priority: TokenPriority) {
  switch (priority) {
    case "high":
      return "High-priority route asset";
    case "medium":
      return "Mid-priority route asset";
    default:
      return "Long-tail route asset";
  }
}

function buildRouteSlugSide(
  asset: SwapAssetOption,
  network: SwapNetworkOption,
  forceNetworkSlug = false,
) {
  const base = normalizeId(asset.coin);
  const shouldIncludeNetwork = forceNetworkSlug || asset.networks.length > 1;

  if (!shouldIncludeNetwork) {
    return base;
  }

  return `${base}-${getCanonicalNetworkSlug(network.id)}`;
}

function resolvePreferredRouteSpec(input: {
  fromSymbol: string;
  toSymbol: string;
  forcedFromNetwork?: string | null;
  forcedToNetwork?: string | null;
}) {
  const fromAsset = ASSET_MAP.get(input.fromSymbol.trim().toUpperCase());
  const toAsset = ASSET_MAP.get(input.toSymbol.trim().toUpperCase());

  if (!fromAsset || !toAsset) {
    return null;
  }

  const fromNetwork = pickPreferredAssetNetwork(
    fromAsset,
    input.forcedFromNetwork,
    "deposit",
  );
  const toNetwork = pickPreferredAssetNetwork(
    toAsset,
    input.forcedToNetwork,
    "settle",
  );

  if (!fromNetwork || !toNetwork) {
    return null;
  }

  const slug = `${buildRouteSlugSide(
    fromAsset,
    fromNetwork,
    Boolean(input.forcedFromNetwork),
  )}-to-${buildRouteSlugSide(
    toAsset,
    toNetwork,
    Boolean(input.forcedToNetwork),
  )}`;

  return resolvePairPageSpec(slug);
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

function sortRoutes(routes: PairPageSpec[]) {
  return [...routes].sort((a, b) => {
    if (a.indexable !== b.indexable) {
      return Number(b.indexable) - Number(a.indexable);
    }

    if (a.priorityScore !== b.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    return a.h1.localeCompare(b.h1, "en");
  });
}

function getAnchorSymbolsForPriority(priority: TokenPriority) {
  switch (priority) {
    case "high":
      return [...HUB_ANCHOR_SYMBOLS];
    case "medium":
      return [...HUB_ANCHOR_SYMBOLS].slice(0, 7);
    default:
      return [...HUB_ANCHOR_SYMBOLS].slice(0, 4);
  }
}

function getIntentDescription(intent: PairIntentType, tokenLabel: string) {
  switch (intent) {
    case "stable_to_btc":
      return `Routes that move ${tokenLabel} into Bitcoin when users want a risk-off destination or a long-term BTC position.`;
    case "stable_to_alt":
    case "stable_to_topcoin":
      return `Routes that push ${tokenLabel} into another chain or app ecosystem without stopping in a custodial exchange account.`;
    case "stable_to_meme":
      return `Routes that use ${tokenLabel} as the funding asset before entering a higher-volatility meme destination.`;
    case "btc_to_stable":
      return `Routes that land Bitcoin value back into ${tokenLabel} when users want to reduce volatility or prepare another transfer.`;
    case "btc_to_alt":
    case "btc_to_topcoin":
      return `Routes that move BTC into another ecosystem when users need native settlement on the destination chain.`;
    case "btc_to_meme":
      return `Routes that move BTC into higher-volatility assets and need especially careful destination checks.`;
    case "alt_to_btc":
    case "topcoin_to_btc":
    case "wrapped_btc_to_btc":
      return `Routes that rotate a non-Bitcoin asset into BTC as a more conservative destination.`;
    case "alt_to_stable":
    case "topcoin_to_stable":
      return `Routes that exit a volatile asset into ${tokenLabel} for a more stable landing asset.`;
    case "alt_to_alt":
    case "topcoin_to_topcoin":
    case "btc_to_wrapped_btc":
      return `Routes that move between ecosystems without using ${tokenLabel} as a stable stop in the middle.`;
    case "meme_to_stable":
      return `Routes that use ${tokenLabel} as the stable destination after leaving a meme-driven position.`;
    case "meme_to_btc":
      return `Routes that rotate meme asset value into Bitcoin.`;
    default:
      return `Routes that include ${tokenLabel} in a network-aware non-custodial swap flow.`;
  }
}

function buildIntentStats(routes: PairPageSpec[], tokenLabel: string, limit = 4): HubIntentStat[] {
  const counts = new Map<PairIntentType, number>();

  for (const route of routes) {
    counts.set(route.pairIntentType, (counts.get(route.pairIntentType) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      count,
      label: HUB_INTENT_LABELS[key],
      description: getIntentDescription(key, tokenLabel),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function scoreTokenEntry(entry: TokenCatalogEntry) {
  return (
    PRIORITY_WEIGHT[entry.priority] * 100 +
    entry.networkCount * 5 +
    entry.depositEnabledNetworkCount +
    entry.settleEnabledNetworkCount
  );
}

function getAssetByToken(token: string) {
  return ASSET_MAP.get(token.trim().toUpperCase()) || null;
}

function getNetworkAngle(networkId: string) {
  switch (normalizeId(networkId)) {
    case "aptos":
      return "suited to Aptos-native wallets and routes where users want to stay inside the Aptos ecosystem";
    case "avax":
      return "useful when the route needs Avalanche wallet compatibility with a lower-cost feel than Ethereum mainnet";
    case "liquid":
      return "a Bitcoin-sidechain option for users already operating in the Liquid asset environment";
    case "tron":
      return "common for lower-fee transfers and fast stablecoin movement";
    case "ton":
      return "helpful when the next wallet or app is already TON-native";
    case "ethereum":
      return "used when ERC20 compatibility and DeFi wallet support matter most";
    case "bsc":
      return "a lower-cost EVM alternative with familiar wallet compatibility";
    case "solana":
      return "a fast settlement option for Solana-native flows";
    case "base":
      return "useful when funds need to move into the Base ecosystem";
    case "arbitrum":
      return "helpful when users want a lower-cost EVM route than Ethereum mainnet";
    case "optimism":
      return "an EVM-compatible L2 route built for lower-cost transfers";
    case "polygon":
      return "a lower-cost route for users already operating in Polygon wallets";
    case "bitcoin":
      return "native Bitcoin settlement with BTC address compatibility checks";
    default:
      return "one of the supported network rails for this asset";
  }
}

function getTokenHeroTitle(entry: TokenCatalogEntry) {
  if (entry.category === "stable") {
    return `Swap ${entry.symbol} across supported networks`;
  }

  return `Explore ${entry.symbol} swap routes`;
}

function getTokenSwapHref(entry: TokenCatalogEntry) {
  const asset = getAssetBySymbol(entry.symbol);
  if (!asset) {
    return `/swap?fromCoin=${encodeURIComponent(entry.symbol)}`;
  }

  const params = new URLSearchParams({
    fromCoin: asset.coin,
  });

  const shouldPinNetwork =
    asset.networks.length === 1 || hasSpecificAssetNetworkPreference(asset.coin);
  const preferredNetwork = shouldPinNetwork
    ? pickPreferredAssetNetwork(asset, undefined, "deposit")
    : null;

  if (preferredNetwork?.id) {
    params.set("fromNetwork", preferredNetwork.id);
  }

  return `/swap?${params.toString()}`;
}

function getTokenHeroDescription(entry: TokenCatalogEntry) {
  if (entry.category === "stable") {
    return `Convert ${entry.symbol} into BTC, ETH, and other assets using non-custodial, network-aware routes that start from the network you choose first.`;
  }

  if (entry.category === "btc") {
    return `Explore how ${entry.symbol} is used as both a destination asset and a funding asset across non-custodial swap routes with live network context.`;
  }

  return `Track how ${entry.symbol} appears across supported send and receive routes, with network-aware paths and non-custodial settlement flows.`;
}

function getTokenSummaryParagraphs(entry: TokenCatalogEntry) {
  if (entry.category === "stable") {
    return [
      `${entry.symbol} is commonly used as the bridge asset between volatile positions and the next destination chain. It appears in send routes when users want to move into BTC or another ecosystem, and in receive routes when they want to land in a more stable asset without using a custodial exchange account.`,
      `Because ${entry.symbol} is available across ${entry.networkCount} supported network${entry.networkCount === 1 ? "" : "s"}, the network choice changes cost, compatibility, and wallet expectations. That makes ${entry.symbol} one of the most important routing assets to explain clearly on a hub page.`,
    ];
  }

  if (entry.category === "btc") {
    return [
      `${entry.symbol} usually appears in swap routes as the destination for risk-off rotations or as the source asset when users want to deploy Bitcoin value into another ecosystem.`,
      `Bitcoin routes also carry their own timing and receiving-address considerations, so BTC hubs need to explain both route direction and settlement expectations clearly.`,
    ];
  }

  return [
    `${entry.symbol} appears in routes where users want to move into, out of, or across the ${getTokenCategoryLabel(entry.category).toLowerCase()} bucket without relying on a custodial exchange flow.`,
    `This hub surfaces the supported networks, the strongest send and receive routes, and the intent patterns that show how ${entry.symbol} is actually used inside the broader route graph.`,
  ];
}

function getTokenSeoEntryHeading(entry: TokenCatalogEntry) {
  return `${entry.symbol} route overview`;
}

function getTokenSeoEntryParagraph(entry: TokenCatalogEntry) {
  if (entry.category === "stable") {
    return `${entry.symbol} sits at the center of many swap paths because it can fund BTC routes, enter other ecosystems, or receive value back from more volatile assets without forcing users into a custodial exchange account. On a token hub like this one, the important difference is not just the asset name but the network rail behind it. ${entry.symbol} on Tron is often chosen for fee-first stablecoin transfers, ${entry.symbol} on Ethereum is usually chosen when ERC20 wallet compatibility matters, and ${entry.symbol} on BNB Chain works as a hybrid alternative for users who still want an EVM-style route at lower cost. That is why the routes, networks, and route-intent groupings on this page are separated instead of being treated like one generic ${entry.symbol} list.`;
  }

  if (entry.category === "btc") {
    return `${entry.symbol} hubs need more than a simple route list because Bitcoin can act as both the destination for risk-off rotations and the source asset for moving value into another ecosystem. The pair direction, the route intent, and the network context all change how that path should be described. This page groups the strongest send and receive routes so users can scan Bitcoin exits, ecosystem-entry routes, and stablecoin landings without reading duplicate route copy.`;
  }

  return `${entry.symbol} route pages are strongest when they explain why this asset appears in certain send and receive flows, which networks support it best, and which related routes users commonly choose next. This hub is designed to surface those patterns rather than show a flat list of links.`;
}

function getWhyUsePoints(entry: TokenCatalogEntry) {
  if (entry.category === "stable") {
    return [
      "Stable value when users want to enter or exit volatile positions.",
      "Multiple network options for balancing lower fees against wallet compatibility.",
      "Common funding asset for BTC routes and ecosystem-entry routes.",
      "Common landing asset when traders or treasury flows want to preserve value.",
    ];
  }

  if (entry.category === "btc") {
    return [
      "Native Bitcoin settlement for users who want direct BTC ownership.",
      "A common destination when rotating out of altcoins or stablecoins.",
      "A common source asset when moving long-term value into another ecosystem.",
      "Clear receiving-address rules that make route setup safer when explained well.",
    ];
  }

  return [
    `Direct access to ${entry.name} without a custodial exchange account.`,
    `Network-aware routing when wallet compatibility matters before sending funds.`,
    `A clearer view of which send and receive routes are strongest for ${entry.symbol}.`,
    `Internal links into related tokens, networks, and pair routes from the same asset family.`,
  ];
}

function getTokenHubRouteLabel(route: PairPageSpec) {
  return route.h1.replace(/^Swap\s+/i, "");
}

function getStableToBtcSendSummary(route: PairPageSpec) {
  switch (normalizeId(route.builderPreset.fromNetwork)) {
    case "tron":
      return `Use ${route.fromLabel} on Tron when the decision is fee-first: this rail is popular for lower-cost stable transfers that still need to land in native BTC.`;
    case "ethereum":
      return `Use ${route.fromLabel} on Ethereum when compatibility comes first, especially if the funds already sit in an ERC20 wallet or a DeFi-connected account before moving into BTC.`;
    case "bsc":
      return `Use ${route.fromLabel} on BNB Chain when you want a hybrid EVM route: cheaper than mainnet Ethereum but still familiar to wallets that already support EVM-style transfers.`;
    default:
      return `Move ${route.fromLabel} from ${route.fromNetworkLabel} into native BTC with live route limits and destination checks.`;
  }
}

function getStableReceiveSummary(route: PairPageSpec) {
  switch (normalizeId(route.builderPreset.toNetwork)) {
    case "tron":
      return `Receive ${route.toLabel} on Tron when lower-cost transfers and fast stablecoin movement matter most after the swap settles.`;
    case "ethereum":
      return `Receive ${route.toLabel} on Ethereum when ERC20 compatibility and DeFi wallet support matter more than minimizing transfer fees.`;
    case "bsc":
      return `Receive ${route.toLabel} on BNB Chain when you want a lower-cost EVM-compatible landing asset after the route settles.`;
    default:
      return `Receive ${route.toLabel} on ${route.toNetworkLabel} when that network best fits the wallet or app you plan to use next.`;
  }
}

function getGenericRouteSummary(
  entry: TokenCatalogEntry,
  route: PairPageSpec,
  direction: "send" | "receive",
) {
  if (entry.category === "stable") {
    if (direction === "send") {
      if (route.pairIntentType === "stable_to_btc") {
        return getStableToBtcSendSummary(route);
      }

      if (
        route.pairIntentType === "stable_to_alt" ||
        route.pairIntentType === "stable_to_topcoin"
      ) {
        return `Deploy ${entry.symbol} into ${route.toLabel} on ${route.toNetworkLabel} when you want to enter that ecosystem from stable value.`;
      }

      if (route.pairIntentType === "stable_to_meme") {
        return `Use ${entry.symbol} as the stable funding asset before rotating into ${route.toLabel} on ${route.toNetworkLabel}.`;
      }
    } else {
      if (route.pairIntentType === "btc_to_stable") {
        return `Land BTC value into ${entry.symbol} without leaving the wallet-native route flow. ${getStableReceiveSummary(route)}`;
      }

      if (
        route.pairIntentType === "alt_to_stable" ||
        route.pairIntentType === "topcoin_to_stable"
      ) {
        return `Exit ${route.fromLabel} into ${entry.symbol} on ${route.toNetworkLabel} when the goal is to preserve value after leaving a more volatile asset.`;
      }

      if (route.pairIntentType === "meme_to_stable") {
        return `Use ${entry.symbol} as the stable landing asset after moving out of ${route.fromLabel}.`;
      }
    }
  }

  if (entry.category === "btc") {
    if (direction === "send") {
      if (route.pairIntentType === "btc_to_stable") {
        return `Move BTC into ${route.toLabel} when the goal is to reduce volatility or prepare value for the next transfer.`;
      }

      return `Use BTC as the funding asset when the destination needs native ${route.toLabel} settlement on ${route.toNetworkLabel}.`;
    }

    if (route.pairIntentType === "stable_to_btc") {
      return `Use ${route.fromLabel} on ${route.fromNetworkLabel} when the goal is to land in native BTC without using a custodial exchange account.`;
    }

    return `Rotate ${route.fromLabel} into Bitcoin when the destination needs native BTC settlement and a more conservative landing asset.`;
  }

  if (
    direction === "send" &&
    (route.pairIntentType === "alt_to_stable" ||
      route.pairIntentType === "topcoin_to_stable")
  ) {
    return `Use ${entry.symbol} as the source asset when the route should end in a more stable landing asset.`;
  }

  if (
    direction === "send" &&
    (route.pairIntentType === "alt_to_btc" ||
      route.pairIntentType === "topcoin_to_btc" ||
      route.pairIntentType === "wrapped_btc_to_btc")
  ) {
    return `Rotate ${entry.symbol} into Bitcoin when the destination needs native BTC settlement.`;
  }

  if (
    direction === "receive" &&
    (route.pairIntentType === "btc_to_alt" ||
      route.pairIntentType === "btc_to_topcoin")
  ) {
    return `Receive ${entry.symbol} when the route starts in Bitcoin and needs native settlement in the ${entry.name} ecosystem.`;
  }

  return route.useCase;
}

function buildTokenHubRouteCard(
  route: PairPageSpec,
  entry: TokenCatalogEntry,
  direction: "send" | "receive",
): TokenHubRouteCard {
  return {
    slug: route.slug,
    label: getTokenHubRouteLabel(route),
    summary: getGenericRouteSummary(entry, route, direction),
    intentKey: route.pairIntentType,
    intentLabel: HUB_INTENT_LABELS[route.pairIntentType],
    href: `/swap/${route.slug}`,
    indexable: Boolean(route.indexable),
    fromToken: route.builderPreset.fromCoin,
    fromLabel: route.fromLabel,
    fromNetworkId: route.builderPreset.fromNetwork,
    toToken: route.builderPreset.toCoin,
    toLabel: route.toLabel,
    toNetworkId: route.builderPreset.toNetwork,
  };
}

function getRouteGroupKey(
  route: PairPageSpec,
  entry: TokenCatalogEntry,
  direction: "send" | "receive",
) {
  if (entry.category === "stable") {
    if (direction === "send") {
      return route.pairIntentType === "stable_to_btc"
        ? "stable_to_btc"
        : "stable_to_alt";
    }

    if (route.pairIntentType === "btc_to_stable") {
      return "btc_to_stable";
    }

    return "asset_to_stable";
  }

  return route.pairIntentType;
}

function getRouteGroupMeta(
  entry: TokenCatalogEntry,
  direction: "send" | "receive",
  groupKey: string,
) {
  if (entry.category === "stable") {
    if (groupKey === "stable_to_btc") {
      return {
        title: `Move ${entry.symbol} into Bitcoin`,
        description: `Use ${entry.symbol} as the starting asset when the real goal is a Bitcoin landing, not another stop in the middle.`,
      };
    }

    if (groupKey === "stable_to_alt") {
      return {
        title: `Use ${entry.symbol} to enter another ecosystem`,
        description: `These routes start from ${entry.symbol} and finish in another chain's native asset or wallet environment without leaving the non-custodial flow.`,
      };
    }

    if (groupKey === "btc_to_stable") {
      return {
        title: `Move Bitcoin into ${entry.symbol}`,
        description: `These routes use ${entry.symbol} as the stable landing asset after value leaves Bitcoin.`,
      };
    }

    return {
      title: `Land in ${entry.symbol}`,
      description: `These routes end in ${entry.symbol} after leaving a more volatile asset or another network environment.`,
    };
  }

  if (direction === "send" && groupKey === "btc_to_stable") {
    return {
      title: `Move ${entry.symbol} into stablecoins`,
      description: `These routes reduce volatility by moving ${entry.symbol} into a stable landing asset.`,
    };
  }

  if (direction === "send" && groupKey === "btc_to_alt") {
    return {
      title: `Use ${entry.symbol} in another ecosystem`,
      description: `These routes start from ${entry.symbol} and end where another chain or app ecosystem needs native settlement.`,
    };
  }

  return {
    title: HUB_INTENT_LABELS[groupKey as PairIntentType] || "Featured routes",
    description: getIntentDescription(groupKey as PairIntentType, entry.symbol),
  };
}

function getGroupOrder(groupKey: string) {
  const order: Record<string, number> = {
    stable_to_btc: 0,
    stable_to_alt: 1,
    btc_to_stable: 0,
    asset_to_stable: 1,
    alt_to_btc: 0,
    btc_to_alt: 1,
    alt_to_stable: 2,
    alt_to_alt: 3,
    other: 4,
  };

  return order[groupKey] ?? 99;
}

function buildRouteGroups(
  entry: TokenCatalogEntry,
  routes: PairPageSpec[],
  direction: "send" | "receive",
): TokenHubRouteGroup[] {
  const grouped = new Map<string, PairPageSpec[]>();

  for (const route of routes) {
    const groupKey = getRouteGroupKey(route, entry, direction);
    const current = grouped.get(groupKey) || [];
    current.push(route);
    grouped.set(groupKey, current);
  }

  return [...grouped.entries()]
    .sort((a, b) => {
      const keyOrder = getGroupOrder(a[0]) - getGroupOrder(b[0]);
      if (keyOrder !== 0) {
        return keyOrder;
      }

      return b[1].length - a[1].length;
    })
    .map(([groupKey, groupedRoutes]) => {
      const meta = getRouteGroupMeta(entry, direction, groupKey);

      return {
        key: groupKey,
        title: meta.title,
        description: meta.description,
        routes: sortRoutes(groupedRoutes)
          .slice(0, 3)
          .map((route) => buildTokenHubRouteCard(route, entry, direction)),
      };
    });
}

function buildNetworkBreakdown(entry: TokenCatalogEntry, asset: SwapAssetOption) {
  return asset.networks.map((network) => {
    const badges: string[] = [];
    let useWhen: string[] = [];

    if (network.depositEnabled) {
      badges.push("Send enabled");
    }

    if (network.settleEnabled) {
      badges.push("Receive enabled");
    }

    if (network.hasMemo) {
      badges.push("Memo sensitive");
    }

    switch (normalizeId(network.id)) {
      case "tron":
        useWhen = [
          "you want lower stablecoin transfer fees",
          "speed matters more than DeFi compatibility",
        ];
        break;
      case "aptos":
        useWhen = [
          "the receiving wallet is Aptos-native",
          "you want to keep funds inside the Aptos ecosystem",
        ];
        break;
      case "avax":
        useWhen = [
          "your wallet or next step is Avalanche-native",
          "you want an EVM-compatible route outside Ethereum mainnet",
        ];
        break;
      case "ethereum":
        useWhen = [
          "ERC20 wallet compatibility is required",
          "the route will connect to DeFi or EVM apps next",
        ];
        break;
      case "liquid":
        useWhen = [
          "the route needs Liquid wallet compatibility",
          "you are already operating in a Bitcoin-sidechain environment",
        ];
        break;
      case "bsc":
        useWhen = [
          "you want an EVM-style route at lower cost",
          "your wallet already supports BNB Chain assets",
        ];
        break;
      case "solana":
        useWhen = [
          "the destination or next app is Solana-native",
          "you want fast settlement on Solana wallets",
        ];
        break;
      case "base":
        useWhen = [
          "funds need to land in the Base ecosystem",
          "you want an L2 route with EVM wallet compatibility",
        ];
        break;
      case "optimism":
        useWhen = [
          "your next step is on Optimism",
          "you want an EVM-compatible L2 route with lower cost than mainnet",
        ];
        break;
      case "ton":
        useWhen = [
          "the destination wallet is TON-native",
          "you want to keep transfers inside the TON ecosystem",
        ];
        break;
      case "bitcoin":
        useWhen = [
          "the destination must be native BTC",
          "Bitcoin address compatibility matters more than app-specific routing",
        ];
        break;
      default:
        useWhen = [
          "this network matches the wallet you plan to use next",
          "the route needs this chain's address format or ecosystem compatibility",
        ];
        break;
    }

    return {
      id: normalizeId(network.id),
      label: network.label,
      href: `/networks/${getCanonicalNetworkSlug(network.id)}`,
      useCase: `${network.label} is ${getNetworkAngle(network.id)} for ${entry.symbol} routes.`,
      useWhen,
      badges,
    };
  });
}

function getRelatedTokenSymbols(entry: TokenCatalogEntry) {
  switch (entry.category) {
    case "stable":
      return ["BTC", "ETH", "USDC", "SOL", "BNB"];
    case "btc":
      return ["USDT", "USDC", "ETH", "SOL", "BNB"];
    case "layer1":
      return ["BTC", "USDT", "USDC", "ETH", "SOL", "BNB"];
    case "layer2":
      return ["ETH", "USDT", "USDC", "ARB", "OP", "BASE"];
    case "defi":
      return ["ETH", "USDT", "USDC", "BTC", "UNI", "AAVE"];
    case "meme":
      return ["USDT", "BTC", "DOGE", "SHIB", "PEPE"];
    default:
      return ["BTC", "USDT", "ETH", "USDC", "SOL"];
  }
}

function getRelatedTokens(entry: TokenCatalogEntry) {
  const seen = new Set<string>([entry.symbol]);

  return getRelatedTokenSymbols(entry)
    .map((symbol) => getTokenCatalogEntry(symbol))
    .filter((candidate) => {
      if (seen.has(candidate.symbol) || candidate.symbol === candidate.name) {
        return false;
      }

      seen.add(candidate.symbol);
      return true;
    })
    .slice(0, 5);
}

function buildMoreRouteCards(
  entry: TokenCatalogEntry,
  sendRoutes: PairPageSpec[],
): TokenHubRouteCard[] {
  const stableToBtc = sortRoutes(
    sendRoutes.filter((route) => route.pairIntentType === "stable_to_btc"),
  ).slice(0, 3);
  const stableToAlt = sortRoutes(
    sendRoutes.filter((route) => route.pairIntentType === "stable_to_alt"),
  ).slice(0, 3);
  const fallback = sortRoutes(sendRoutes).slice(0, 6);
  const picked = [...stableToBtc, ...stableToAlt, ...fallback];
  const seen = new Set<string>();

  return picked
    .filter((route) => {
      if (seen.has(route.slug)) {
        return false;
      }

      seen.add(route.slug);
      return true;
    })
    .slice(0, 6)
    .map((route) => buildTokenHubRouteCard(route, entry, "send"));
}

function buildTokenFaqs(entry: TokenCatalogEntry, asset: SwapAssetOption): PairPageFaq[] {
  if (entry.category === "stable") {
    const primaryNetwork = asset.networks[0]?.label || "the selected network";

    return [
      {
        question: `Why is ${entry.symbol} used in so many swap routes?`,
        answer: `${entry.symbol} is a common routing asset because it keeps value stable between send and receive legs while still letting the user choose the network that best fits cost and wallet compatibility.`,
      },
      {
        question: `Which ${entry.symbol} network is usually cheapest?`,
        answer: `That depends on the current route, but networks like Tron or BNB Chain are often chosen when transfer cost matters most. Ethereum is usually chosen when compatibility is more important than minimizing fees.`,
      },
      {
        question: `Which ${entry.symbol} network should I choose?`,
        answer: `Choose the ${entry.symbol} network that matches the wallet and ecosystem you actually plan to use next. On this hub, networks like ${primaryNetwork} and the other supported rails exist because cost, compatibility, and app support can differ a lot.`,
      },
      {
        question: `Can I swap ${entry.symbol} to BTC without KYC?`,
        answer: `The route itself is non-custodial and builder-led, so the main things to verify are the selected network, the live deposit range, and the BTC receiving address before funds are sent.`,
      },
      {
        question: `Can I send ${entry.symbol} from an exchange?`,
        answer: `Only if the exchange supports the exact network shown on the route page and lets you withdraw on that rail. If the exchange sends ${entry.symbol} on a different network than the deposit instructions, the route can fail to settle correctly.`,
      },
      {
        question: `What happens if I send ${entry.symbol} on the wrong network?`,
        answer: `If the deposit network does not match the instructions shown on the route page, the transfer can fail to settle correctly. That is why the send network and route-specific deposit instructions need to be checked before every swap.`,
      },
    ];
  }

  return [
    {
      question: `What role does ${entry.symbol} play in swap routes?`,
      answer: `${entry.symbol} can appear as a send asset, a receive asset, or both depending on whether users are entering its ecosystem, leaving it, or rotating through it as part of a broader route.`,
    },
    {
      question: `Do I need a dedicated ${entry.symbol} wallet before swapping?`,
      answer: `Yes. The destination wallet or address format still needs to match the selected receive network, so the receiving setup should be ready before the route is created.`,
    },
    {
      question: `How do network choices change ${entry.symbol} swaps?`,
      answer: `Network choice changes wallet compatibility, transfer cost, and sometimes memo requirements. That is why this hub highlights the supported network rails rather than treating every ${entry.symbol} route as interchangeable.`,
    },
    {
      question: `Can I use ${entry.symbol} in non-custodial swaps without creating an exchange account?`,
      answer: `That is the core idea of these routes: the builder sets the pair and network context first, then the shift page handles deposit instructions and status tracking without turning the flow into a custodial exchange workflow.`,
    },
  ];
}

export function getTokenHubStaticParams() {
  return TOKEN_CATALOG.map((entry) => ({
    token: normalizeId(entry.symbol),
  }));
}

export function getTokenHubData(token: string): TokenHubData | null {
  const entry = getTokenCatalogEntry(token);
  const asset = getAssetByToken(entry.symbol);

  if (!asset) {
    return null;
  }

  const anchors = getAnchorSymbolsForPriority(entry.priority).filter(
    (symbol) => symbol !== entry.symbol,
  );
  const curatedRoutes = CURATED_PAIR_SPECS.filter(
    (spec) =>
      normalizeId(spec.fromLabel) === normalizeId(entry.symbol) ||
      normalizeId(spec.toLabel) === normalizeId(entry.symbol),
  );
  const generatedRoutes = anchors.flatMap((anchor) => {
    const sendRoute = resolvePreferredRouteSpec({
      fromSymbol: entry.symbol,
      toSymbol: anchor,
    });
    const receiveRoute = resolvePreferredRouteSpec({
      fromSymbol: anchor,
      toSymbol: entry.symbol,
    });

    return [sendRoute, receiveRoute].filter(
      (route): route is PairPageSpec => Boolean(route),
    );
  });
  const featuredRoutes = sortRoutes(
    uniqueBySlug([...curatedRoutes, ...generatedRoutes]),
  );
  const sendRoutes = featuredRoutes.filter(
    (route) => normalizeId(route.fromLabel) === normalizeId(entry.symbol),
  );
  const receiveRoutes = featuredRoutes.filter(
    (route) => normalizeId(route.toLabel) === normalizeId(entry.symbol),
  );

  return {
    token: normalizeId(entry.symbol),
    tokenLabel: entry.symbol,
    tokenName: entry.name,
    swapHref: getTokenSwapHref(entry),
    category: entry.category,
    priority: entry.priority,
    heroTitle: getTokenHeroTitle(entry),
    heroDescription: getTokenHeroDescription(entry),
    networkCount: entry.networkCount,
    networkLabels: entry.networkLabels,
    depositEnabledNetworkCount: entry.depositEnabledNetworkCount,
    settleEnabledNetworkCount: entry.settleEnabledNetworkCount,
    hasMemoRoutes: entry.hasMemoRoutes,
    featuredRoutes: featuredRoutes.slice(0, 12),
    sendRoutes: sendRoutes.slice(0, 6),
    receiveRoutes: receiveRoutes.slice(0, 6),
    sendRouteGroups: buildRouteGroups(entry, sendRoutes.slice(0, 6), "send"),
    receiveRouteGroups: buildRouteGroups(entry, receiveRoutes.slice(0, 6), "receive"),
    intentStats: buildIntentStats(featuredRoutes, entry.symbol),
    summaryHeading: `What is ${entry.symbol} used for in swaps?`,
    summaryParagraphs: getTokenSummaryParagraphs(entry),
    seoEntryHeading: getTokenSeoEntryHeading(entry),
    seoEntryParagraph: getTokenSeoEntryParagraph(entry),
    whyUseHeading: `Why use ${entry.symbol} in swaps`,
    whyUsePoints: getWhyUsePoints(entry),
    networkBreakdown: buildNetworkBreakdown(entry, asset),
    topIntegrationTokens: getRelatedTokens(entry).slice(0, 4),
    relatedTokens: getRelatedTokens(entry),
    moreRouteCards: buildMoreRouteCards(entry, sendRoutes),
    faqs: buildTokenFaqs(entry, asset),
  };
}

function getNetworkHeroTitle(networkLabel: string) {
  return `Explore ${networkLabel} swap routes`;
}

function getNetworkHeroDescription(networkId: string, networkLabel: string) {
  switch (normalizeId(networkId)) {
    case "ethereum":
      return `See how ${networkLabel} appears across compatibility-first routes, ERC20 settlements, and wallet flows where DeFi access matters as much as the asset itself.`;
    case "tron":
      return `Track how ${networkLabel} appears across lower-cost stablecoin routes, fast transfer paths, and wallet flows where transfer efficiency matters most.`;
    case "bsc":
      return `Explore how ${networkLabel} works as a lower-cost EVM rail for routes that still need familiar wallet compatibility.`;
    case "solana":
      return `Review how ${networkLabel} routes behave when speed, Solana wallet support, and ecosystem-specific settlement matter.`;
    case "bitcoin":
      return `Understand how ${networkLabel} works as a native settlement rail, where confirmation timing and address accuracy shape the route more than app compatibility.`;
    default:
      return `Review the routes that start from or settle to ${networkLabel}, with network-aware context around compatibility, costs, and wallet expectations.`;
  }
}

function getNetworkNarrative(networkId: string, networkLabel: string) {
  switch (normalizeId(networkId)) {
    case "ethereum":
      return {
        heading: `What is ${networkLabel} used for in swap routes?`,
        paragraphs: [
          `${networkLabel} is the network most routes lean on when ERC20 compatibility matters. In swap context, it acts as the compatibility-first rail for wallets, DeFi apps, and token contracts that expect Ethereum-native settlement.`,
          `That makes ${networkLabel} useful when the destination asset is ERC20-based, when the receiving wallet already lives in the EVM ecosystem, or when the next step after the swap is a DeFi action. The tradeoff is that Ethereum usually asks users to accept higher and more variable fees than lower-cost alternatives like Tron or BNB Chain.`,
        ],
      };
    case "tron":
      return {
        heading: `What is ${networkLabel} used for in swap routes?`,
        paragraphs: [
          `${networkLabel} is commonly used as a fee-first transfer rail, especially for stablecoin routes. It appears in swap flows when users want a network that is widely supported for USDT-style movement without carrying Ethereum mainnet cost.`,
          `In practice, ${networkLabel} is chosen when transfer efficiency matters more than deep DeFi compatibility. That makes it strong for stablecoin funding and settlement, but less suitable than Ethereum when the next step depends on ERC20-native app support.`,
        ],
      };
    case "bsc":
      return {
        heading: `What is ${networkLabel} used for in swap routes?`,
        paragraphs: [
          `${networkLabel} acts as a lower-cost EVM alternative in swap routes. It is useful when the user still wants familiar wallet compatibility and address behavior, but does not want to rely on Ethereum mainnet for every transfer.`,
          `That makes ${networkLabel} a hybrid option: it keeps the EVM feel, works with many wallet setups, and can be useful for users moving between compatibility-first and cost-aware routes.`,
        ],
      };
    case "solana":
      return {
        heading: `What is ${networkLabel} used for in swap routes?`,
        paragraphs: [
          `${networkLabel} appears in routes where speed and ecosystem-native settlement matter. It is commonly used when the user wants to land in a Solana wallet or move into a Solana-based app environment after the swap settles.`,
          `Compared with EVM rails, ${networkLabel} usually represents a different wallet and address ecosystem, so its role in swaps is less about compatibility with Ethereum tooling and more about entering the Solana environment directly.`,
        ],
      };
    case "bitcoin":
      return {
        heading: `What is ${networkLabel} used for in swap routes?`,
        paragraphs: [
          `${networkLabel} is the native settlement rail for BTC routes. In swap context, it matters when the goal is to land in real Bitcoin rather than a wrapped or application-layer substitute.`,
          `Because Bitcoin route timing is shaped by confirmations and native address handling, this network is less about app compatibility and more about store-of-value settlement, address accuracy, and confirmation-aware execution.`,
        ],
      };
    default:
      return {
        heading: `What is ${networkLabel} used for in swap routes?`,
        paragraphs: [
          `${networkLabel} appears in routes where the network itself changes how the swap should be evaluated, especially around wallet compatibility, transfer expectations, and the type of ecosystem the user is entering or leaving.`,
          `On a hub page like this, the role of ${networkLabel} is to make those infrastructure choices explicit so users can decide whether this rail fits their wallet, next app, and cost tolerance before creating a route.`,
        ],
      };
    }
}

function getNetworkUseGuidance(networkId: string, networkLabel: string) {
  switch (normalizeId(networkId)) {
    case "ethereum":
      return {
        heading: `When should you use ${networkLabel} routes?`,
        points: [
          "when ERC20 compatibility is required",
          "when the next step is DeFi or EVM",
          "when the route needs ETH or ERC20",
          "when wallet fit matters more than fees",
        ],
      };
    case "tron":
      return {
        heading: `When should you use ${networkLabel} routes?`,
        points: [
          "when lower transfer cost matters more than DeFi integration",
          "when the route starts or ends with stablecoin movement",
          "when the wallet already supports TRC20 deposits and withdrawals",
          "when speed and transfer efficiency matter for the current move",
        ],
      };
    case "bsc":
      return {
        heading: `When should you use ${networkLabel} routes?`,
        points: [
          "when you want EVM-style wallet compatibility at lower cost",
          "when the route should stay familiar to users already in EVM wallets",
          "when Ethereum mainnet cost feels too heavy for the transfer",
          "when the next step still benefits from EVM address behavior",
        ],
      };
    case "solana":
      return {
        heading: `When should you use ${networkLabel} routes?`,
        points: [
          "when the destination wallet is Solana-native",
          "when the route is entering the Solana ecosystem directly",
          "when fast settlement is more important than EVM compatibility",
          "when the next app or custody setup expects Solana addresses",
        ],
      };
    case "bitcoin":
      return {
        heading: `When should you use ${networkLabel} routes?`,
        points: [
          "when the destination needs native BTC settlement",
          "when store-of-value positioning matters more than app compatibility",
          "when the receiving wallet is a Bitcoin wallet, not an EVM or Solana wallet",
          "when the route should finish on native Bitcoin rather than another ecosystem rail",
        ],
      };
    default:
      return {
        heading: `When should you use ${networkLabel} routes?`,
        points: [
          `when the receiving wallet expects ${networkLabel}`,
          "when network compatibility matters more than treating all routes as interchangeable",
          "when fees, confirmation timing, or address expectations differ enough to affect the decision",
          "when the next app or transfer step is tied to this network specifically",
        ],
      };
  }
}

function getCoverageMixValue({
  assetCount,
  depositAssetCount,
  settleAssetCount,
}: NetworkCoverageSummary) {
  if (
    assetCount > 0 &&
    depositAssetCount === assetCount &&
    settleAssetCount === assetCount
  ) {
    return "Full send + receive coverage";
  }

  if (depositAssetCount === settleAssetCount) {
    return "Balanced send + receive coverage";
  }

  if (depositAssetCount > settleAssetCount) {
    return "Send-heavy network coverage";
  }

  return "Receive-heavy network coverage";
}

function getNetworkQuickFacts(
  networkId: string,
  coverage: NetworkCoverageSummary,
): NetworkQuickFact[] {
  const coverageMix = getCoverageMixValue(coverage);

  switch (normalizeId(networkId)) {
    case "ethereum":
      return [
        { label: "Best for", value: "Compatibility-first routes" },
        { label: "Fee profile", value: "Higher / variable" },
        { label: "Coverage mix", value: coverageMix },
        { label: "Use when", value: "DeFi, ERC20, wallet compatibility" },
      ];
    case "tron":
      return [
        { label: "Best for", value: "Cost-first stable routes" },
        { label: "Fee profile", value: "Lower / transfer-first" },
        { label: "Coverage mix", value: coverageMix },
        { label: "Use when", value: "Stablecoin transfers, lower fees" },
      ];
    case "bsc":
      return [
        { label: "Best for", value: "Lower-cost EVM routes" },
        { label: "Fee profile", value: "Lower than mainnet" },
        { label: "Coverage mix", value: coverageMix },
        { label: "Use when", value: "EVM wallets, lower-cost transfers" },
      ];
    case "solana":
      return [
        { label: "Best for", value: "Fast ecosystem-entry routes" },
        { label: "Fee profile", value: "Lower / fast" },
        { label: "Coverage mix", value: coverageMix },
        { label: "Use when", value: "Solana wallets, fast settlement" },
      ];
    case "bitcoin":
      return [
        { label: "Best for", value: "Native BTC settlement" },
        { label: "Fee profile", value: "Confirmation-driven" },
        { label: "Coverage mix", value: coverageMix },
        { label: "Use when", value: "BTC destination, store-of-value routes" },
      ];
    default:
      return [
        { label: "Best for", value: "Network-aware routes" },
        { label: "Fee profile", value: "Route-dependent" },
        { label: "Coverage mix", value: coverageMix },
        { label: "Use when", value: "Wallet compatibility matters" },
      ];
  }
}

function getNetworkCharacteristics(networkId: string, networkLabel: string): NetworkCharacteristicCard[] {
  switch (normalizeId(networkId)) {
    case "ethereum":
      return [
        {
          label: "Fee profile",
          value: "Higher / variable",
          description: "Ethereum is usually chosen for compatibility, but that often comes with more variable network cost than lower-fee rails.",
        },
        {
          label: "Compatibility",
          value: "ERC20 + EVM",
          description: "The strongest reason to choose Ethereum is broad compatibility with ERC20 tokens, DeFi apps, and EVM wallet flows.",
        },
        {
          label: "Wallet fit",
          value: "Very broad",
          description: "Many wallets and custody setups already support Ethereum, so routes can feel more predictable from a tooling perspective.",
        },
        {
          label: "Best fit",
          value: "Compatibility-first",
          description: "Use Ethereum when the route needs broad ecosystem support more than fee minimization.",
        },
      ];
    case "tron":
      return [
        {
          label: "Fee profile",
          value: "Lower / transfer-first",
          description: "Tron is often chosen when the route should minimize stablecoin transfer cost.",
        },
        {
          label: "Compatibility",
          value: "TRC20-specific",
          description: "The network works well for TRC20 flows, but it is not the same compatibility story as Ethereum and ERC20.",
        },
        {
          label: "Wallet fit",
          value: "Stablecoin-heavy",
          description: "It fits wallets and exchanges that already support TRC20 deposits and withdrawals clearly.",
        },
        {
          label: "Best fit",
          value: "Cost-first stable routes",
          description: "Use Tron when the route centers on stablecoin movement and cost efficiency.",
        },
      ];
    case "bsc":
      return [
        {
          label: "Fee profile",
          value: "Lower-cost EVM",
          description: "BNB Chain often lands between Ethereum compatibility and lower transfer cost.",
        },
        {
          label: "Compatibility",
          value: "EVM-friendly",
          description: "It keeps familiar EVM-style wallet behavior while giving users a lower-cost option than Ethereum mainnet.",
        },
        {
          label: "Wallet fit",
          value: "Broad EVM wallets",
          description: "Wallets that already support EVM networks can usually handle this network more naturally than a non-EVM rail.",
        },
        {
          label: "Best fit",
          value: "Hybrid route",
          description: "Use BNB Chain when you want a balance between compatibility and cost.",
        },
      ];
    case "solana":
      return [
        {
          label: "Fee profile",
          value: "Lower / fast",
          description: "Solana is commonly chosen for a faster-feeling, lower-cost destination experience.",
        },
        {
          label: "Compatibility",
          value: "Solana-native",
          description: "Routes on this network work best when the wallet and next app already live inside the Solana ecosystem.",
        },
        {
          label: "Wallet fit",
          value: "Non-EVM",
          description: "Solana requires its own address and wallet expectations, so it should not be treated like an EVM rail.",
        },
        {
          label: "Best fit",
          value: "Ecosystem entry",
          description: "Use Solana when the destination needs to be a Solana wallet or application flow.",
        },
      ];
    case "bitcoin":
      return [
        {
          label: "Fee profile",
          value: "Confirmation-driven",
          description: "Bitcoin route timing depends more on confirmations and current chain conditions than on app compatibility.",
        },
        {
          label: "Compatibility",
          value: "Native BTC only",
          description: "This network is about real BTC settlement, not token-contract compatibility.",
        },
        {
          label: "Wallet fit",
          value: "Bitcoin wallet required",
          description: "The receiving setup must be a valid Bitcoin wallet or address format for the route to settle correctly.",
        },
        {
          label: "Best fit",
          value: "Store-of-value destination",
          description: "Use Bitcoin when the route should finish on native BTC rather than another app ecosystem.",
        },
      ];
    default:
      return [
        {
          label: "Fee profile",
          value: "Route-dependent",
          description: `${networkLabel} changes how network cost should be evaluated, so live route details still need to be checked before sending funds.`,
        },
        {
          label: "Compatibility",
          value: `${networkLabel}-specific`,
          description: `This network matters when the receiving wallet or next application expects ${networkLabel} specifically.`,
        },
        {
          label: "Wallet fit",
          value: "Network-aware",
          description: "The selected wallet and destination app still need to match the network rail shown on the route.",
        },
        {
          label: "Best fit",
          value: "Infrastructure-specific routes",
          description: `Use ${networkLabel} when network compatibility itself is part of the decision, not just the token.`,
        },
      ];
  }
}

function getNetworkTopAssetSummary(
  networkId: string,
  asset: TokenCatalogEntry,
): string {
  const normalizedNetwork = normalizeId(networkId);

  if (normalizedNetwork === "ethereum") {
    if (asset.symbol === "ETH") {
      return "Native asset for gas, wallet readiness, and direct ecosystem entry.";
    }
    if (asset.category === "stable" && asset.symbol === "USDC") {
      return "High-liquidity stable asset commonly used for DeFi-compatible settlement.";
    }
    if (asset.category === "stable") {
      return "Used for stable routing with broad ERC20 wallet support.";
    }
    if (asset.category === "defi") {
      return "Common for DeFi entry when the route stays inside ERC20-compatible apps.";
    }
    return "Common asset on Ethereum routes where ERC20 compatibility matters.";
  }

  if (normalizedNetwork === "tron") {
    if (asset.category === "stable") {
      return "Common for lower-cost stable routing and exchange transfer flows.";
    }
    return "Used on Tron routes when transfer efficiency matters more than DeFi compatibility.";
  }

  if (asset.category === "stable") {
    return "Used for stable routing across send and receive flows.";
  }
  if (asset.category === "btc") {
    return "Native store-of-value destination across high-intent routes.";
  }
  if (asset.category === "defi") {
    return "Common for app and DeFi-oriented ecosystem entry.";
  }
  if (asset.category === "layer1" || asset.category === "layer2") {
    return "High-liquidity asset used for ecosystem entry and rotation.";
  }
  return `Common asset on ${NETWORK_MAP.get(normalizedNetwork)?.label || normalizedNetwork} routes.`;
}

function buildNetworkTopAssetCards(
  networkId: string,
  topAssets: TokenCatalogEntry[],
): NetworkHubAssetCard[] {
  return topAssets.slice(0, 8).map((asset) => ({
    symbol: asset.symbol,
    name: asset.name,
    href: `/tokens/${asset.symbol.toLowerCase()}`,
    summary: getNetworkTopAssetSummary(networkId, asset),
  }));
}

function getNetworkRiskNotes(networkId: string, networkLabel: string) {
  switch (normalizeId(networkId)) {
    case "ethereum":
      return {
        heading: `What to check on ${networkLabel}`,
        notes: [
          "ERC20 settlement should not be confused with other chains that use different address and token standards.",
          "Gas cost can change quickly, so a compatibility-first decision on Ethereum is often a cost tradeoff rather than the cheapest path.",
          "Congestion can affect when the route becomes practical to send, especially if the user is trying to move quickly.",
          "Some assets on Ethereum are contract-based tokens, while ETH itself is native, so the receiving wallet still has to match the exact route asset.",
        ],
      };
    case "tron":
      return {
        heading: `What to check on ${networkLabel}`,
        notes: [
          "TRC20 routes should not be confused with ERC20 or BEP20 versions of the same stablecoin.",
          "Exchange withdrawals need to support the exact Tron rail shown on the route page, not just the token symbol.",
          "Lower cost makes Tron attractive, but the user should still verify the receiving wallet supports this network before sending.",
          "Routes that move out of Tron can still end in a very different destination ecosystem, so send and receive assumptions should not be mixed.",
        ],
      };
    case "bitcoin":
      return {
        heading: `What to check on ${networkLabel}`,
        notes: [
          "Bitcoin confirmation timing can shape the route more than the user expects, especially when market conditions are active.",
          "The destination must be a valid BTC address or wallet, not an address from a different chain that happens to hold BTC-related assets.",
          "Live route limits still matter because the final deposit amount has to remain valid after any source-network costs are accounted for.",
          "When Bitcoin is the destination, users should treat native settlement as the goal and verify the wallet before creating the route.",
        ],
      };
    default:
      return {
        heading: `What to check on ${networkLabel}`,
        notes: [
          `The selected wallet and the route network both need to match ${networkLabel}; token symbol alone is not enough.`,
          "Fees, compatibility, and address requirements can all change depending on whether the route starts on this network or settles to it.",
          "If the route comes from an exchange, the withdrawal rail still has to match the network shown on the swap page.",
          "Users should verify the route instructions again on the live builder and shift page before funds are sent.",
        ],
      };
  }
}

function getNetworkComparisonIds(networkId: string) {
  switch (normalizeId(networkId)) {
    case "ethereum":
      return ["tron", "bsc", "solana", "base"];
    case "tron":
      return ["ethereum", "bsc", "solana", "ton"];
    case "bsc":
      return ["ethereum", "tron", "base", "solana"];
    case "solana":
      return ["ethereum", "tron", "bsc", "base"];
    case "bitcoin":
      return ["ethereum", "tron", "liquid", "solana"];
    default:
      return ["ethereum", "tron", "bsc", "solana"];
  }
}

function getNetworkComparisonSummary(currentNetwork: string, comparisonNetwork: string) {
  const current = normalizeId(currentNetwork);
  const comparison = normalizeId(comparisonNetwork);

  if (current === "ethereum") {
    switch (comparison) {
      case "tron":
        return "Tron is usually cheaper for stable transfers, but it does not carry the same ERC20 and DeFi compatibility story as Ethereum.";
      case "bsc":
        return "BNB Chain is a cheaper EVM-style alternative when you still want familiar wallet behavior without Ethereum mainnet cost.";
      case "solana":
        return "Solana can feel faster, but it sits in a different wallet and app ecosystem than Ethereum.";
      case "base":
        return "Base keeps an EVM feel like Ethereum while often serving users who want an L2-oriented path.";
    }
  }

  if (current === "tron") {
    switch (comparison) {
      case "ethereum":
        return "Ethereum is usually chosen for compatibility and DeFi access, while Tron is often chosen for lower-cost stable transfers.";
      case "bsc":
        return "BNB Chain gives a more EVM-like experience, while Tron stays stronger as a fee-first stablecoin rail.";
      case "solana":
        return "Solana moves into a different wallet ecosystem, while Tron stays focused on practical transfer efficiency.";
      case "ton":
        return "TON is more ecosystem-specific, while Tron is more commonly used for mainstream stablecoin transfer flows.";
    }
  }

  if (current === "bitcoin") {
    switch (comparison) {
      case "ethereum":
        return "Ethereum is about app and token compatibility; Bitcoin is about native BTC settlement and confirmation-aware execution.";
      case "liquid":
        return "Liquid is closer to a Bitcoin-sidechain environment, while Bitcoin mainnet remains the native settlement rail.";
      case "tron":
        return "Tron is often chosen for lower-cost stablecoin movement, not for native store-of-value settlement like Bitcoin.";
      case "solana":
        return "Solana is ecosystem-entry oriented, while Bitcoin is chosen when the route should end on native BTC.";
    }
  }

  return `${NETWORK_MAP.get(comparison)?.label || comparisonNetwork} offers a different balance of cost, compatibility, and ecosystem fit than ${NETWORK_MAP.get(current)?.label || currentNetwork}.`;
}

function buildNetworkComparisons(networkId: string): NetworkComparisonCard[] {
  return getNetworkComparisonIds(networkId)
    .filter((candidate) => candidate !== normalizeId(networkId))
    .filter((candidate) => NETWORK_MAP.has(candidate))
    .map((candidate) => ({
      network: candidate,
      label: NETWORK_MAP.get(candidate)?.label || candidate,
      href: `/networks/${candidate}`,
      summary: getNetworkComparisonSummary(networkId, candidate),
    }))
    .slice(0, 4);
}

function getRelatedNetworkCards(networkId: string) {
  const seen = new Set<string>();

  return [...buildNetworkComparisons(networkId)]
    .filter((item) => {
      if (seen.has(item.network)) {
        return false;
      }

      seen.add(item.network);
      return true;
    })
    .slice(0, 4);
}

function getNetworkIntentDescription(intent: PairIntentType, networkLabel: string) {
  switch (intent) {
    case "stable_to_btc":
      return `Routes that start from or pass through ${networkLabel} while moving stablecoin value into Bitcoin.`;
    case "stable_to_alt":
      return `Routes that use ${networkLabel} as part of a stablecoin-to-ecosystem move into a destination asset.`;
    case "btc_to_stable":
      return `Routes that land Bitcoin value into a stable asset on or through ${networkLabel}.`;
    case "btc_to_alt":
      return `Routes that rotate Bitcoin into another ecosystem while ${networkLabel} shapes the send or receive side.`;
    case "alt_to_stable":
      return `Routes that use ${networkLabel} while exiting a volatile asset into a stable landing asset.`;
    case "alt_to_btc":
      return `Routes that use ${networkLabel} while rotating a non-BTC asset into native Bitcoin.`;
    case "alt_to_alt":
      return `Routes that move between ecosystems while ${networkLabel} controls compatibility on one side of the route.`;
    default:
      return `Routes where ${networkLabel} changes wallet compatibility, settlement expectations, or fee tradeoffs.`;
  }
}

function buildNetworkIntentStats(routes: PairPageSpec[], networkLabel: string, limit = 4): HubIntentStat[] {
  const counts = new Map<PairIntentType, number>();

  for (const route of routes) {
    counts.set(route.pairIntentType, (counts.get(route.pairIntentType) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      count,
      label: HUB_INTENT_LABELS[key],
      description: getNetworkIntentDescription(key, networkLabel),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getNetworkRouteSummary(
  networkId: string,
  route: PairPageSpec,
  direction: "source" | "destination",
) {
  const normalizedNetwork = normalizeId(networkId);
  const networkLabel = NETWORK_MAP.get(normalizedNetwork)?.label || route.fromNetworkLabel;

  if (normalizedNetwork === "ethereum") {
    if (direction === "source") {
      if (route.pairIntentType === "alt_to_stable") {
        if (route.toLabel === "USDC") {
          return "Use Ethereum when the goal is to land in a DeFi-friendly stablecoin that stays ERC20-compatible after the route settles.";
        }

        if (route.toLabel === "USDT") {
          return "Use Ethereum when the goal is to land in a stablecoin with broader cross-network liquidity while keeping ERC20 wallet compatibility on the send side.";
        }
      }

      if (route.pairIntentType === "stable_to_btc") {
        return "Start from Ethereum when the funds already sit in an ERC20 wallet and compatibility matters more than minimizing the cost before BTC settlement.";
      }

      if (route.pairIntentType === "alt_to_btc") {
        return "Start on Ethereum when rotating an ERC20-native position into BTC without breaking wallet compatibility at the send step.";
      }
    } else {
      if (route.toLabel === "ETH") {
        if (route.fromCategory === "btc") {
          return "Settle on Ethereum when Bitcoin value is entering the ETH ecosystem for gas, DeFi access, or ERC20-native activity.";
        }

        if (route.fromLabel === "USDT") {
          return "Settle on Ethereum when USDT liquidity is being deployed into native ETH for ERC20 wallets, gas, or DeFi use.";
        }

        if (route.fromLabel === "USDC") {
          return "Settle on Ethereum when USDC value is moving into native ETH inside an ERC20-compatible, DeFi-friendly environment.";
        }

        if (route.fromCategory === "stable") {
          return "Settle on Ethereum when stablecoin value is entering the ETH ecosystem for wallet compatibility, gas, or DeFi use.";
        }

        return "Settle on Ethereum when the destination needs native ETH for gas, DeFi access, or direct ERC20 ecosystem entry.";
      }

      if (route.toCategory === "stable") {
        if (route.toLabel === "USDC") {
          return "Receive USDC on Ethereum when the landing asset should stay ERC20-native and DeFi-compatible.";
        }

        if (route.toLabel === "USDT") {
          return "Receive USDT on Ethereum when the route should end in a stablecoin with broad wallet and liquidity coverage.";
        }
      }
    }
  }

  if (normalizedNetwork === "tron") {
    if (direction === "source" && route.pairIntentType === "stable_to_btc") {
      return "Start from Tron when the decision is cost-first and the route is moving stablecoin value into native BTC.";
    }

    if (direction === "destination" && route.toCategory === "stable") {
      return "Settle on Tron when the goal is a lower-cost stablecoin landing rail after the route completes.";
    }
  }

  if (normalizedNetwork === "bitcoin") {
    if (direction === "destination") {
      return "Settle on Bitcoin when the route must end in native BTC and the receiving wallet is built for Bitcoin addresses.";
    }

    return "Start from Bitcoin when the goal is to move native BTC into another asset without using a custodial exchange workflow.";
  }

  if (direction === "source") {
    switch (route.pairIntentType) {
      case "stable_to_btc":
        return `Start from ${networkLabel} when the funds already sit on this network and the goal is to land in native BTC without changing send-rail compatibility first.`;
      case "stable_to_alt":
        return `Use ${networkLabel} as the send rail when stablecoin value is moving into ${route.toLabel} on ${route.toNetworkLabel}.`;
      case "alt_to_stable":
      case "btc_to_stable":
      case "meme_to_stable":
        return `Start on ${networkLabel} when the route should exit into ${route.toLabel} as a more stable landing asset.`;
      case "alt_to_btc":
      case "meme_to_btc":
        return `Use ${networkLabel} as the send network when the route should finish in native BTC.`;
      default:
        return `Start on ${networkLabel} when the wallet already uses this network and the destination needs ${route.toLabel} settlement on ${route.toNetworkLabel}.`;
    }
  }

  if (route.toCategory === "stable") {
    return `Settle on ${networkLabel} when ${route.toLabel} should land on a wallet or app that expects this network.`;
  }

  return `Settle on ${networkLabel} when the destination wallet or next app expects ${route.toLabel} on this network.`;
}

function buildNetworkRouteCard(
  networkId: string,
  route: PairPageSpec,
  direction: "source" | "destination",
): TokenHubRouteCard {
  return {
    slug: route.slug,
    label: getTokenHubRouteLabel(route),
    summary: getNetworkRouteSummary(networkId, route, direction),
    intentKey: route.pairIntentType,
    intentLabel: HUB_INTENT_LABELS[route.pairIntentType],
    href: `/swap/${route.slug}`,
    indexable: Boolean(route.indexable),
    fromToken: route.builderPreset.fromCoin,
    fromLabel: route.fromLabel,
    fromNetworkId: route.builderPreset.fromNetwork,
    toToken: route.builderPreset.toCoin,
    toLabel: route.toLabel,
    toNetworkId: route.builderPreset.toNetwork,
  };
}

function buildNetworkRouteClusters(
  networkId: string,
  sourceRoutes: PairPageSpec[],
  destinationRoutes: PairPageSpec[],
): NetworkRouteClusterLink[] {
  const normalizedNetwork = normalizeId(networkId);
  const clusters: Array<NetworkRouteClusterLink | null> = [];

  const btcRoute =
    sourceRoutes.find((route) => route.toLabel === "BTC") ||
    destinationRoutes.find((route) => route.toLabel === "BTC");
  if (btcRoute) {
    clusters.push({
      title: `Explore ${NETWORK_MAP.get(normalizedNetwork)?.label || normalizedNetwork} -> BTC routes`,
      href: `/swap/${btcRoute.slug}`,
      description: "Routes that keep this network on the send or receive side while the destination still settles into native BTC.",
    });
  }

  const stableRoute =
    sourceRoutes.find((route) => route.toCategory === "stable") ||
    destinationRoutes.find((route) => route.toCategory === "stable");
  if (stableRoute) {
    clusters.push({
      title: `Explore ${NETWORK_MAP.get(normalizedNetwork)?.label || normalizedNetwork} -> stable routes`,
      href: `/swap/${stableRoute.slug}`,
      description: "Routes that use this network while landing in a stable asset for lower-volatility settlement.",
    });
  }

  if (normalizedNetwork === "ethereum") {
    const erc20Route =
      destinationRoutes.find(
        (route) => route.builderPreset.toNetwork === "ethereum",
      ) ||
      sourceRoutes.find((route) => route.builderPreset.fromNetwork === "ethereum");
    if (erc20Route) {
      clusters.push({
        title: "Explore ERC20-compatible routes",
        href: `/swap/${erc20Route.slug}`,
        description: "Representative routes where Ethereum wallet compatibility and ERC20 settlement matter more than minimum cost.",
      });
    }
  }

  const ecosystemRoute =
    destinationRoutes.find((route) => route.toCategory === "layer1" || route.toCategory === "defi") ||
    sourceRoutes.find((route) => route.pairIntentType === "stable_to_alt");
  if (ecosystemRoute) {
    clusters.push({
      title: `Explore ${NETWORK_MAP.get(normalizedNetwork)?.label || normalizedNetwork} ecosystem-entry routes`,
      href: `/swap/${ecosystemRoute.slug}`,
      description: "Routes that use this network while moving capital into another chain or app ecosystem.",
    });
  }

  const seen = new Set<string>();

  return clusters
    .filter((item): item is NetworkRouteClusterLink => Boolean(item))
    .filter((item) => {
      if (seen.has(item.href)) {
        return false;
      }

      seen.add(item.href);
      return true;
    })
    .slice(0, 4);
}

function getNetworkFaqs(networkId: string, networkLabel: string): PairPageFaq[] {
  switch (normalizeId(networkId)) {
    case "ethereum":
      return [
        {
          question: "Why use Ethereum instead of Tron?",
          answer: "Ethereum is usually chosen when ERC20 compatibility, DeFi wallet support, or EVM-native settlement matters more than minimizing fees. Tron is often chosen when stablecoin transfer cost comes first.",
        },
        {
          question: "Are Ethereum swap routes usually more expensive?",
          answer: "They can be. Ethereum routes are often selected for compatibility rather than minimum cost, so users should expect gas and congestion to matter more than on lower-fee rails.",
        },
        {
          question: "What does ERC20 compatibility mean in a swap route?",
          answer: "It means the receiving wallet, app, or token contract expects Ethereum-style token behavior. That is why Ethereum routes matter when the destination asset or next step lives inside the ERC20 ecosystem.",
        },
        {
          question: "Can I send from an exchange to an Ethereum route?",
          answer: "Only if the exchange can withdraw on the exact Ethereum rail shown on the route page. The withdrawal network has to match the route instructions, not just the token symbol.",
        },
      ];
    case "tron":
      return [
        {
          question: "Why use Tron instead of Ethereum?",
          answer: "Tron is often chosen when stablecoin transfer efficiency matters more than DeFi compatibility. Ethereum is stronger for ERC20 wallets and app integrations, while Tron is usually stronger for cost-first transfer flows.",
        },
        {
          question: "Are Tron routes mainly for stablecoins?",
          answer: "That is the most common pattern. Tron often appears in stablecoin-heavy routes because the network is widely used when transfer cost matters.",
        },
        {
          question: "Can I send from an exchange to a Tron route?",
          answer: "Only if the exchange can withdraw on the exact TRC20 rail shown on the route page. A token symbol match is not enough if the network is wrong.",
        },
        {
          question: "What is the biggest Tron route mistake?",
          answer: "Mixing TRC20 with ERC20 or BEP20 versions of the same stablecoin. The network rail has to match exactly before funds are sent.",
        },
      ];
    default:
      return [
        {
          question: `Why use ${networkLabel} routes instead of another network?`,
          answer: `${networkLabel} matters when the receiving wallet, cost profile, or next app makes this network a better fit than other supported rails.`,
        },
        {
          question: `Do ${networkLabel} routes change fees and compatibility?`,
          answer: `Yes. That is the core reason network hub pages exist: the network can change transfer cost, wallet expectations, and settlement behavior even when the token symbol stays the same.`,
        },
        {
          question: `Can I send from an exchange to a ${networkLabel} route?`,
          answer: `Only if the exchange supports the exact network shown on the route page. The withdrawal rail must match the route instructions exactly.`,
        },
        {
          question: `What should I verify before using a ${networkLabel} route?`,
          answer: `Check the live route details, make sure the wallet supports ${networkLabel}, and verify that the send and receive sides match the network shown before sending funds.`,
        },
      ];
  }
}

export function getNetworkHubStaticParams() {
  return [...NETWORK_MAP.keys()]
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((network) => ({ network }));
}

export function getNetworkHubData(network: string): NetworkHubData | null {
  const normalizedNetwork = normalizeAssetNetworkSlug(network);

  if (!normalizedNetwork) {
    return null;
  }

  const networkMeta = NETWORK_MAP.get(normalizedNetwork);
  if (!networkMeta) {
    return null;
  }

  const seenAssets = new Set<string>();
  const topAssets = networkMeta.assets
    .map((asset) => getTokenCatalogEntry(asset.coin))
    .filter((entry) => {
      if (seenAssets.has(entry.symbol)) {
        return false;
      }

      seenAssets.add(entry.symbol);
      return true;
    })
    .sort((a, b) => scoreTokenEntry(b) - scoreTokenEntry(a))
    .slice(0, 12);

  const topAssetSymbols = topAssets.map((entry) => entry.symbol);
  const curatedRoutes = CURATED_PAIR_SPECS.filter(
    (spec) =>
      normalizeId(spec.builderPreset.fromNetwork) === normalizedNetwork ||
      normalizeId(spec.builderPreset.toNetwork) === normalizedNetwork,
  );
  const generatedRoutes = topAssetSymbols.flatMap((symbol) => {
    const entry = getTokenCatalogEntry(symbol);
    const anchors = getAnchorSymbolsForPriority(entry.priority)
      .filter((anchor) => anchor !== symbol)
      .slice(0, 4);

    return anchors.flatMap((anchor) => {
      const sourceRoute = resolvePreferredRouteSpec({
        fromSymbol: symbol,
        toSymbol: anchor,
        forcedFromNetwork: normalizedNetwork,
      });
      const destinationRoute = resolvePreferredRouteSpec({
        fromSymbol: anchor,
        toSymbol: symbol,
        forcedToNetwork: normalizedNetwork,
      });

      return [sourceRoute, destinationRoute].filter(
        (route): route is PairPageSpec => Boolean(route),
      );
    });
  });

  const routes = sortRoutes(uniqueBySlug([...curatedRoutes, ...generatedRoutes]));
  const sourceRouteSpecs = routes.filter(
    (route) => normalizeId(route.builderPreset.fromNetwork) === normalizedNetwork,
  );
  const destinationRouteSpecs = routes.filter(
    (route) => normalizeId(route.builderPreset.toNetwork) === normalizedNetwork,
  );
  const assetCount = networkMeta.assets.length;
  const depositAssetCount = networkMeta.assets.filter((asset) =>
    asset.networks.some(
      (candidate) =>
        normalizeId(candidate.id) === normalizedNetwork &&
        candidate.depositEnabled,
    ),
  ).length;
  const settleAssetCount = networkMeta.assets.filter((asset) =>
    asset.networks.some(
      (candidate) =>
        normalizeId(candidate.id) === normalizedNetwork &&
        candidate.settleEnabled,
    ),
  ).length;
  const narrative = getNetworkNarrative(normalizedNetwork, networkMeta.label);
  const useGuidance = getNetworkUseGuidance(normalizedNetwork, networkMeta.label);
  const riskBlock = getNetworkRiskNotes(normalizedNetwork, networkMeta.label);
  const comparisons = buildNetworkComparisons(normalizedNetwork);

  return {
    network: normalizedNetwork,
    networkLabel: networkMeta.label,
    swapHref: getNetworkSwapHref(normalizedNetwork, topAssets),
    heroTitle: getNetworkHeroTitle(networkMeta.label),
    heroDescription: getNetworkHeroDescription(
      normalizedNetwork,
      networkMeta.label,
    ),
    assetCount,
    depositAssetCount,
    settleAssetCount,
    routeCount: routes.length,
    narrativeHeading: narrative.heading,
    narrativeParagraphs: narrative.paragraphs,
    useGuidanceHeading: useGuidance.heading,
    useGuidancePoints: useGuidance.points,
    quickFacts: getNetworkQuickFacts(normalizedNetwork, {
      assetCount,
      depositAssetCount,
      settleAssetCount,
    }),
    characteristicsHeading: `How ${networkMeta.label} changes a swap`,
    characteristics: getNetworkCharacteristics(
      normalizedNetwork,
      networkMeta.label,
    ),
    topAssets: buildNetworkTopAssetCards(normalizedNetwork, topAssets),
    routes: routes.slice(0, 12),
    sourceRoutes: sourceRouteSpecs
      .slice(0, 6)
      .map((route) => buildNetworkRouteCard(normalizedNetwork, route, "source")),
    destinationRoutes: destinationRouteSpecs
      .slice(0, 6)
      .map((route) =>
        buildNetworkRouteCard(normalizedNetwork, route, "destination"),
      ),
    routeClusters: buildNetworkRouteClusters(
      normalizedNetwork,
      sourceRouteSpecs,
      destinationRouteSpecs,
    ),
    intentStats: buildNetworkIntentStats(routes, networkMeta.label),
    riskHeading: riskBlock.heading,
    riskNotes: riskBlock.notes,
    comparisonHeading: `How ${networkMeta.label} compares with other networks`,
    comparisons,
    relatedTokens: topAssets.slice(0, 4),
    relatedNetworks: getRelatedNetworkCards(normalizedNetwork),
    faqs: getNetworkFaqs(normalizedNetwork, networkMeta.label),
  };
}

function buildTokenDirectoryCard(entry: TokenCatalogEntry): DirectoryLinkCard {
  return {
    title: entry.symbol,
    href: `/tokens/${normalizeId(entry.symbol)}`,
    summary:
      entry.category === "stable"
        ? `${entry.name} appears in funding, landing, and network-aware stable routes.`
        : entry.category === "btc"
          ? `${entry.name} acts as a core destination asset for high-intent settlement routes.`
          : entry.category === "layer1"
            ? `${entry.name} is commonly used when routes end in a chain's native ecosystem.`
            : entry.category === "layer2"
              ? `${entry.name} supports lower-cost ecosystem entry while keeping wallet expectations familiar.`
              : entry.category === "defi"
                ? `${entry.name} appears in DeFi-adjacent routes where app compatibility matters after settlement.`
                : entry.category === "meme"
                  ? `${entry.name} is used in higher-volatility routes and take-profit style rotations.`
                  : `${entry.name} appears in supported routes where network fit and wallet readiness still matter.`,
    meta: `${getTokenCategoryLabel(entry.category)} Â· ${entry.networkCount} network${
      entry.networkCount === 1 ? "" : "s"
    }`,
  };
}

function buildNetworkDirectoryCard(hub: NetworkHubData): DirectoryLinkCard {
  return {
    title: hub.networkLabel,
    href: `/networks/${hub.network}`,
    summary: hub.heroDescription,
    meta: `${hub.assetCount} assets · ${hub.routeCount} routes`,
    networkId: hub.network,
  };
}

function getTokensByCategory(category: TokenCategory) {
  return TOKEN_CATALOG.filter((entry) => entry.category === category).sort(
    (a, b) => scoreTokenEntry(b) - scoreTokenEntry(a),
  );
}

function getFeaturedTokenEntries() {
  const manual = FEATURED_TOKEN_ORDER.map((symbol) => getTokenCatalogEntry(symbol));
  const filler = TOKEN_CATALOG.filter(
    (entry) => !FEATURED_TOKEN_ORDER.includes(entry.symbol as (typeof FEATURED_TOKEN_ORDER)[number]),
  )
    .sort((a, b) => scoreTokenEntry(b) - scoreTokenEntry(a))
    .slice(0, 8);

  const seen = new Set<string>();

  return [...manual, ...filler].filter((entry) => {
    if (seen.has(entry.symbol)) {
      return false;
    }

    seen.add(entry.symbol);
    return true;
  }).slice(0, 8);
}

function getFeaturedNetworkHubs() {
  const manual = FEATURED_NETWORK_ORDER.map((network) => getNetworkHubData(network)).filter(
    (hub): hub is NetworkHubData => Boolean(hub),
  );
  const filler = getNetworkHubStaticParams()
    .map((item) => getNetworkHubData(item.network))
    .filter((hub): hub is NetworkHubData => Boolean(hub))
    .filter(
      (hub) =>
        !FEATURED_NETWORK_ORDER.includes(
          hub.network as (typeof FEATURED_NETWORK_ORDER)[number],
        ),
    )
    .sort((a, b) => b.routeCount - a.routeCount)
    .slice(0, 8);

  const seen = new Set<string>();

  return [...manual, ...filler].filter((hub) => {
    if (seen.has(hub.network)) {
      return false;
    }

    seen.add(hub.network);
    return true;
  }).slice(0, 8);
}

export function getTokenDirectoryData(): TokenDirectoryData {
  const featuredEntries = getFeaturedTokenEntries();
  const highPriorityCount = TOKEN_CATALOG.filter(
    (entry) => entry.priority === "high",
  ).length;
  const multiNetworkCount = TOKEN_CATALOG.filter(
    (entry) => entry.networkCount > 1,
  ).length;
  const memoSensitiveCount = TOKEN_CATALOG.filter(
    (entry) => entry.hasMemoRoutes,
  ).length;

  const categoryCards = (
    Object.keys(TOKEN_CATEGORY_META) as TokenCategory[]
  )
    .map((category) => {
      const entries = getTokensByCategory(category);
      if (!entries.length) {
        return null;
      }

      const meta = TOKEN_CATEGORY_META[category];
      return {
        id: meta.id,
        label: meta.label,
        count: entries.length,
        description: meta.description,
        examples: entries.slice(0, 3).map((entry) => entry.symbol),
      } satisfies DirectoryCategoryCard;
    })
    .filter((item): item is DirectoryCategoryCard => Boolean(item));

  const sections: DirectorySection[] = [
    {
      id: "stablecoins",
      title: "Stablecoins and routing assets",
      description:
        "Stablecoins are used when users want funding flexibility, cheaper network choice, or a stable landing asset after a volatile route.",
      items: getTokensByCategory("stable").slice(0, 6).map(buildTokenDirectoryCard),
    },
    {
      id: "bitcoin-and-core-assets",
      title: "Core settlement and destination assets",
      description:
        "These hubs matter when the route ends in BTC or another core asset that anchors higher-intent settlement and portfolio rotation.",
      items: [
        ...getTokensByCategory("btc"),
        ...getTokensByCategory("layer1").filter((entry) =>
          ["ETH", "SOL", "BNB", "TON"].includes(entry.symbol),
        ),
      ]
        .slice(0, 6)
        .map(buildTokenDirectoryCard),
    },
    {
      id: "ecosystem-assets",
      title: "Ecosystem entry and application assets",
      description:
        "These hubs help users enter chain ecosystems, app-native assets, and DeFi contexts where the destination wallet matters after settlement.",
      items: [
        ...getTokensByCategory("layer2"),
        ...getTokensByCategory("defi"),
        ...getTokensByCategory("exchange"),
      ]
        .slice(0, 6)
        .map(buildTokenDirectoryCard),
    },
    {
      id: "meme-and-long-tail-assets",
      title: "Higher-volatility and long-tail assets",
      description:
        "These hubs cover speculative assets and narrower route families where volatility and destination timing matter more than broad wallet support.",
      items: [
        ...getTokensByCategory("meme"),
        ...getTokensByCategory("gaming"),
        ...getTokensByCategory("other"),
      ]
        .slice(0, 6)
        .map(buildTokenDirectoryCard),
    },
  ].filter((section) => section.items.length > 0);

  const relatedNetworks = getFeaturedNetworkHubs().slice(0, 6).map((hub) => ({
    title: hub.networkLabel,
    href: `/networks/${hub.network}`,
    summary:
      hub.network === "tron"
        ? "Lower-cost stablecoin rail used when transfer efficiency matters."
        : hub.network === "ethereum"
          ? "Compatibility-first rail for ERC20 assets, wallets, and DeFi flows."
          : hub.network === "bitcoin"
            ? "Native settlement rail for BTC destinations and confirmation-aware routes."
            : hub.heroDescription,
    meta: `${hub.assetCount} assets`,
  }));

  return {
    heroTitle: "Explore supported crypto token hubs",
    heroDescription:
      "Browse the assets that anchor ZyroShift routes, from stablecoin funding rails to BTC settlement paths and ecosystem-entry tokens across supported networks.",
    stats: [
      { label: "Token hubs", value: String(TOKEN_CATALOG.length) },
      { label: "High-priority assets", value: String(highPriorityCount) },
      { label: "Multi-network assets", value: String(multiNetworkCount) },
      { label: "Memo-sensitive assets", value: String(memoSensitiveCount) },
    ],
    narrativeHeading: "How token hubs organize swap routes",
    narrativeParagraphs: [
      "A token hub explains how one asset appears across send routes, receive routes, and network-aware variations. Instead of treating every route as an isolated pair page, the hub shows what role that token plays across funding, settlement, and ecosystem-entry flows.",
      "That makes token hubs useful when you want to understand whether an asset is mainly used as a stable landing point, a BTC destination, a DeFi entry asset, or a network-sensitive funding token before you open a specific swap page.",
    ],
    guidanceHeading: "How to use token hubs",
    guidancePoints: [
      "Start with stablecoins when funding method and network cost matter first.",
      "Use BTC and core assets when the destination itself is the main decision.",
      "Check multi-network assets when wallet compatibility changes across chains.",
      "Use the hub before the pair page when you still need to decide the asset family.",
    ],
    categoryCards,
    featuredTokens: featuredEntries.map(buildTokenDirectoryCard),
    sections,
    routePatternCards: [
      {
        title: "Stable funding routes",
        href: "/tokens/usdt",
        summary:
          "Start with stablecoins when the first decision is network cost, funding method, or landing in a lower-volatility asset.",
      },
      {
        title: "BTC destination routes",
        href: "/tokens/btc",
        summary:
          "Use BTC hubs when the route is driven by store-of-value settlement and confirmation-aware execution.",
      },
      {
        title: "Ecosystem entry routes",
        href: "/tokens/eth",
        summary:
          "Review L1 and L2 hubs when the destination chain, wallet type, or application environment matters after settlement.",
      },
      {
        title: "Stable exit routes",
        href: "/tokens/usdc",
        summary:
          "Choose a stable landing hub when the goal is to reduce volatility after trading or cross-ecosystem movement.",
      },
    ],
    relatedNetworks,
  };
}

export function getNetworkDirectoryData(): NetworkDirectoryData {
  const featuredHubs = getFeaturedNetworkHubs();
  const allHubs = getNetworkHubStaticParams()
    .map((item) => getNetworkHubData(item.network))
    .filter((hub): hub is NetworkHubData => Boolean(hub));
  const uniqueAssetCount = new Set(
    ALL_ASSETS.map((asset) => normalizeId(asset.coin)),
  ).size;
  const sendReadyCount = allHubs.filter((hub) => hub.depositAssetCount > 0).length;
  const receiveReadyCount = allHubs.filter((hub) => hub.settleAssetCount > 0).length;
  const evmCount = allHubs.filter((hub) =>
    ["ethereum", "bsc", "base", "arbitrum", "optimism", "polygon"].includes(
      hub.network,
    ),
  ).length;

  const familyCards: DirectoryCategoryCard[] = [
    {
      id: "compatibility-first-networks",
      label: "Compatibility-focused networks",
      count: allHubs.filter((hub) =>
        ["ethereum", "bsc", "base", "arbitrum", "optimism", "polygon"].includes(
          hub.network,
        ),
      ).length,
      description:
        "EVM-compatible rails used when wallet fit, ERC20 settlement, and familiar address behavior matter more than lowest possible cost.",
      examples: ["Ethereum", "BNB Chain", "Base"],
    },
    {
      id: "lower-cost-transfer-rails",
      label: "Lower-cost transfer networks",
      count: allHubs.filter((hub) =>
        ["tron", "solana", "bsc", "ton", "polygon"].includes(hub.network),
      ).length,
      description:
        "Networks used when transfer efficiency and stablecoin movement matter more than deep Ethereum app compatibility.",
      examples: ["Tron", "Solana", "TON"],
    },
    {
      id: "native-settlement-rails",
      label: "Native settlement networks",
      count: allHubs.filter((hub) =>
        ["bitcoin", "liquid", "litecoin", "doge"].includes(hub.network),
      ).length,
      description:
        "Settlement-first networks where confirmations, native address handling, and destination accuracy shape the route.",
      examples: ["Bitcoin", "Liquid", "Litecoin"],
    },
    {
      id: "ecosystem-native-networks",
      label: "Ecosystem-native networks",
      count: allHubs.filter((hub) =>
        ["solana", "ton", "aptos", "sui", "cardano"].includes(hub.network),
      ).length,
      description:
        "Wallet- and ecosystem-specific rails used when the route ends inside a chain's native application environment.",
      examples: ["Solana", "TON", "Cardano"],
    },
  ].filter((card) => card.count > 0);

  const sections: DirectorySection[] = [
    {
      id: "major-network-hubs",
      title: "Major networks",
      description:
        "Start here when the route is mostly shaped by wallet compatibility, asset coverage, and route density across the largest supported rails.",
      items: featuredHubs.slice(0, 6).map(buildNetworkDirectoryCard),
    },
    {
      id: "compatibility-first-rails",
      title: "Networks for wallet compatibility",
      description:
        "These networks matter when ERC20 settlement, EVM wallet support, or DeFi adjacency decides the route more than raw fee savings.",
      items: allHubs
        .filter((hub) =>
          ["ethereum", "bsc", "base", "arbitrum", "optimism"].includes(
            hub.network,
          ),
        )
        .slice(0, 6)
        .map(buildNetworkDirectoryCard),
    },
    {
      id: "lower-cost-rails",
      title: "Networks for lower-cost transfers",
      description:
        "Use these hubs when transfer cost, stablecoin movement, and speed-sensitive funding flows matter first.",
      items: allHubs
        .filter((hub) =>
          ["tron", "solana", "bsc", "ton", "polygon"].includes(hub.network),
        )
        .slice(0, 6)
        .map(buildNetworkDirectoryCard),
    },
  ].filter((section) => section.items.length > 0);

  return {
    heroTitle: "Explore supported crypto swap networks",
    heroDescription:
      "Compare the network rails behind ZyroShift routes, from compatibility-first ERC20 paths to lower-cost stablecoin rails and native settlement networks.",
    stats: [
      { label: "Network hubs", value: String(allHubs.length) },
      { label: "Covered assets", value: String(uniqueAssetCount) },
      { label: "Send-ready networks", value: String(sendReadyCount) },
      { label: "Receive-ready networks", value: String(receiveReadyCount) },
      { label: "EVM-compatible rails", value: String(evmCount) },
      {
        label: "High-intent hubs",
        value: String(featuredHubs.length),
      },
    ],
    narrativeHeading: "How networks shape a swap",
    narrativeParagraphs: [
      "A network hub explains how a rail changes cost, wallet expectations, settlement behavior, and route suitability before you ever choose a pair page. That keeps the infrastructure decision visible instead of burying it behind token symbols alone.",
      "Use these hubs when the important question is not only which asset you want, but which network you should trust for funding, ERC20 compatibility, native settlement, or lower-cost stablecoin movement.",
    ],
    guidanceHeading: "How to choose a network",
    guidancePoints: [
      "Start with Ethereum-style hubs when ERC20 compatibility or DeFi access matters most.",
      "Use Tron and other lower-cost rails when transfer efficiency matters before app compatibility.",
      "Choose Bitcoin-style hubs when native settlement and confirmation timing define the route.",
      "Open the pair page after the network decision is clear enough to match your wallet setup.",
    ],
    familyCards,
    featuredNetworks: featuredHubs.map(buildNetworkDirectoryCard),
    sections,
    routePatternCards: [
      {
        title: "ERC20-compatible routes",
        href: "/networks/ethereum",
        summary:
          "Choose this path when the next wallet, app, or asset expects Ethereum-style settlement and address compatibility.",
      },
      {
        title: "Lower-cost stablecoin routes",
        href: "/networks/tron",
        summary:
          "Use these rails when stablecoin transfer cost and funding speed matter more than broad app compatibility.",
      },
      {
        title: "Native BTC settlement routes",
        href: "/networks/bitcoin",
        summary:
          "Open these hubs when the route ends in native BTC and confirmation-aware settlement is part of the decision.",
      },
      {
        title: "Alternative EVM routes",
        href: "/networks/bsc",
        summary:
          "Review these hubs when you want familiar EVM behavior without always relying on Ethereum mainnet cost.",
      },
    ],
    relatedTokens: getFeaturedTokenEntries().slice(0, 6).map(buildTokenDirectoryCard),
  };
}

export { getPriorityLabel, getTokenCategoryLabel };



