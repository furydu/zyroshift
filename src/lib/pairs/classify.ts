import tokenCatalogJson from "../../../data/tokens/tokens.json";
import type {
  NetworkModifier,
  PairClassification,
  PairIntentType,
  PairPageSeed,
  TokenCatalogEntry,
  TokenCategory,
  PairTemplateFamily,
} from "@/lib/pairs/types";

const TOKEN_CATALOG = tokenCatalogJson as Record<string, TokenCatalogEntry>;

const LOW_FEE_NETWORKS = new Set(["tron", "solana", "bsc", "polygon"]);
const L2_NETWORKS = new Set(["base", "arbitrum", "optimism"]);
const MEMO_TOKENS = new Set(["XRP", "XLM", "EOS", "TON"]);
const NETWORK_VARIANT_PATTERN = /(TRC20|ERC20|BEP20|Base|Arbitrum|Polygon)/i;

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function uniqueModifiers(modifiers: NetworkModifier[]) {
  return [...new Set(modifiers)];
}

function isStable(category: TokenCategory) {
  return category === "stable";
}

function isMeme(category: TokenCategory) {
  return category === "meme";
}

function isBtc(category: TokenCategory) {
  return category === "btc";
}

function getAltFamily(category: TokenCategory) {
  return !isStable(category) && !isBtc(category) && !isMeme(category);
}

export function getTokenCatalogEntry(symbol: string): TokenCatalogEntry {
  const normalized = normalizeSymbol(symbol);

  return (
    TOKEN_CATALOG[normalized] || {
      symbol: normalized,
      name: normalized,
      category: "other",
      priority: "low",
      networks: [],
      networkLabels: [],
      networkCount: 0,
      hasMemoRoutes: false,
      depositEnabledNetworkCount: 0,
      settleEnabledNetworkCount: 0,
      classificationSource: "fallback",
      classificationReason: "not_in_catalog",
      prioritySource: "fallback",
      priorityReason: "not_in_catalog",
    }
  );
}

export function getTokenCatalogEntries() {
  return Object.values(TOKEN_CATALOG);
}

export function getTokenCategory(symbol: string): TokenCategory {
  return getTokenCatalogEntry(symbol).category;
}

export function getPairIntentType(
  fromCategory: TokenCategory,
  toCategory: TokenCategory,
): PairIntentType {
  if (fromCategory === "btc" && toCategory === "stable") {
    return "btc_to_stable";
  }

  if (fromCategory === "btc" && toCategory === "meme") {
    return "btc_to_meme";
  }

  if (fromCategory === "btc") {
    return "btc_to_alt";
  }

  if (fromCategory === "stable" && toCategory === "btc") {
    return "stable_to_btc";
  }

  if (fromCategory === "stable" && toCategory !== "stable") {
    return "stable_to_alt";
  }

  if (fromCategory === "meme" && toCategory === "stable") {
    return "meme_to_stable";
  }

  if (fromCategory === "meme" && toCategory === "btc") {
    return "meme_to_btc";
  }

  if (toCategory === "btc" && getAltFamily(fromCategory)) {
    return "alt_to_btc";
  }

  if (toCategory === "stable" && (getAltFamily(fromCategory) || fromCategory === "meme")) {
    return "alt_to_stable";
  }

  if (getAltFamily(fromCategory) && (getAltFamily(toCategory) || toCategory === "meme")) {
    return "alt_to_alt";
  }

  return "other";
}

export function getNetworkModifiers(seed: PairPageSeed): NetworkModifier[] {
  const modifiers: NetworkModifier[] = [];
  const fromNetwork = seed.builderPreset.fromNetwork.trim().toLowerCase();
  const toNetwork = seed.builderPreset.toNetwork.trim().toLowerCase();
  const fromCategory = seed.classification?.fromCategory || getTokenCategory(seed.fromLabel);
  const toCategory = seed.classification?.toCategory || getTokenCategory(seed.toLabel);

  if (fromNetwork === toNetwork) {
    modifiers.push("same_chain");
  } else {
    modifiers.push("cross_chain");
  }

  if (
    NETWORK_VARIANT_PATTERN.test(seed.fromNetworkLabel) ||
    NETWORK_VARIANT_PATTERN.test(seed.toNetworkLabel)
  ) {
    modifiers.push("network_variant");
  }

  if (fromNetwork === "bitcoin" || toNetwork === "bitcoin" || fromCategory === "btc" || toCategory === "btc") {
    modifiers.push("bitcoin_confirmation_sensitive");
  }

  if (
    isStable(fromCategory) ||
    isStable(toCategory) ||
    /USDT|USDC|DAI/i.test(seed.fromLabel) ||
    /USDT|USDC|DAI/i.test(seed.toLabel)
  ) {
    modifiers.push("stablecoin_network_sensitive");
  }

  if (LOW_FEE_NETWORKS.has(fromNetwork)) {
    modifiers.push("low_fee_route");
  }

  if (L2_NETWORKS.has(fromNetwork)) {
    modifiers.push("l2_exit");
  }

  if (
    ["bitcoin", "ethereum", "tron", "solana", "bsc", "base", "arbitrum", "polygon"].includes(
      toNetwork,
    ) ||
    ["BTC", "ETH", "SOL", "BNB", "USDT", "USDC"].includes(normalizeSymbol(seed.toLabel))
  ) {
    modifiers.push("address_format_sensitive");
  }

  if (MEMO_TOKENS.has(normalizeSymbol(seed.fromLabel)) || MEMO_TOKENS.has(normalizeSymbol(seed.toLabel))) {
    modifiers.push("memo_warning");
  }

  if (modifiers.length === 0) {
    modifiers.push("none");
  }

  return uniqueModifiers(modifiers);
}

export function getPairTemplateFamily(
  seed: PairPageSeed,
  pairIntentType: PairIntentType,
  networkModifiers: NetworkModifier[],
): PairTemplateFamily {
  if (
    pairIntentType === "stable_to_btc" &&
    (networkModifiers.includes("network_variant") ||
      networkModifiers.includes("stablecoin_network_sensitive"))
  ) {
    return "stable_network_specific_to_btc";
  }

  if (pairIntentType === "stable_to_btc") {
    return "stable_to_btc";
  }

  if (pairIntentType === "btc_to_stable") {
    return "btc_to_stable";
  }

  if (pairIntentType === "stable_to_alt") {
    return "stable_to_alt";
  }

  if (pairIntentType === "btc_to_alt" || pairIntentType === "btc_to_meme") {
    return "btc_to_alt";
  }

  if (pairIntentType === "alt_to_btc" || pairIntentType === "meme_to_btc") {
    return "alt_to_btc";
  }

  if (
    pairIntentType === "alt_to_stable" ||
    pairIntentType === "meme_to_stable"
  ) {
    return "alt_to_stable";
  }

  if (pairIntentType === "alt_to_alt") {
    return "alt_to_alt";
  }

  if (
    seed.classification?.templateFamily &&
    seed.classification.templateFamily !== "other"
  ) {
    return seed.classification.templateFamily;
  }

  return "other";
}

export function classifyPairSeed(seed: PairPageSeed): PairClassification {
  const fromCategory = seed.classification?.fromCategory || getTokenCategory(seed.fromLabel);
  const toCategory = seed.classification?.toCategory || getTokenCategory(seed.toLabel);
  const pairIntentType =
    seed.classification?.pairIntentType || getPairIntentType(fromCategory, toCategory);
  const networkModifiers =
    seed.classification?.networkModifiers || getNetworkModifiers(seed);
  const templateFamily =
    seed.classification?.templateFamily ||
    getPairTemplateFamily(seed, pairIntentType, networkModifiers);

  return {
    fromCategory,
    toCategory,
    pairIntentType,
    templateFamily,
    networkModifiers: uniqueModifiers(networkModifiers),
  };
}
