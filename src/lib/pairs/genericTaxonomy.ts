import networkTaxonomyJson from "../../../data/seo/network-taxonomy.json";
import tokenTaxonomyJson from "../../../data/seo/token-taxonomy.json";
import { getAssetBySymbol, pickPreferredAssetNetwork } from "@/lib/pairs/assets";
import { getTokenCatalogEntries, getTokenCatalogEntry } from "@/lib/pairs/classify";
import type {
  DestinationModifier,
  NetworkModifier,
  NetworkTrait,
  PairIntentType,
  SeoTokenRole,
  SourceModifier,
  TokenCatalogEntry,
} from "@/lib/pairs/types";

type TokenTaxonomyConfig = {
  roleByCategory: Record<string, SeoTokenRole>;
  topcoinSymbols: string[];
  memeSymbols: string[];
  wrappedBtcSymbols: string[];
  roleOverrides: Record<string, SeoTokenRole>;
};

type NetworkTaxonomyDefaults = {
  railType: string;
  feeTier: string;
  speedTier: string;
  traits: NetworkTrait[];
  bestFor: string[];
};

type NetworkTaxonomyConfig = {
  defaults: NetworkTaxonomyDefaults;
  networks: Record<string, Partial<NetworkTaxonomyDefaults>>;
};

export type GenericTokenProfile = TokenCatalogEntry & {
  seoRole: SeoTokenRole;
  depositReady: boolean;
  settleReady: boolean;
  canonicalSendNetwork: string | null;
  canonicalReceiveNetwork: string | null;
};

export type GenericNetworkProfile = {
  id: string;
  railType: string;
  feeTier: string;
  speedTier: string;
  traits: NetworkTrait[];
  bestFor: string[];
};

const tokenTaxonomy = tokenTaxonomyJson as TokenTaxonomyConfig;
const networkTaxonomy = networkTaxonomyJson as NetworkTaxonomyConfig;

const topcoinSymbols = new Set(tokenTaxonomy.topcoinSymbols.map((symbol) => symbol.trim().toUpperCase()));
const memeSymbols = new Set(tokenTaxonomy.memeSymbols.map((symbol) => symbol.trim().toUpperCase()));
const wrappedBtcSymbols = new Set(tokenTaxonomy.wrappedBtcSymbols.map((symbol) => symbol.trim().toUpperCase()));

const tokenProfileCache = new Map<string, GenericTokenProfile>();

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function normalizeNetworkId(networkId: string) {
  return networkId.trim().toLowerCase();
}

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}

function deriveSeoRole(entry: TokenCatalogEntry): SeoTokenRole {
  const symbol = normalizeSymbol(entry.symbol);
  const override = tokenTaxonomy.roleOverrides[symbol];

  if (override) {
    return override;
  }

  if (wrappedBtcSymbols.has(symbol)) {
    return "wrapped_btc";
  }

  if (topcoinSymbols.has(symbol)) {
    return "topcoin";
  }

  if (memeSymbols.has(symbol)) {
    return "meme";
  }

  if (entry.category === "btc") {
    return "btc";
  }

  if (entry.category === "stable") {
    return "stable";
  }

  return tokenTaxonomy.roleByCategory[entry.category] || "other";
}

export function getGenericTokenProfile(symbol: string): GenericTokenProfile {
  const normalized = normalizeSymbol(symbol);
  const cached = tokenProfileCache.get(normalized);

  if (cached) {
    return cached;
  }

  const entry = getTokenCatalogEntry(normalized);
  const asset = getAssetBySymbol(normalized);
  const canonicalSendNetwork = asset
    ? pickPreferredAssetNetwork(asset, null, "deposit")?.id || null
    : null;
  const canonicalReceiveNetwork = asset
    ? pickPreferredAssetNetwork(asset, null, "settle")?.id || null
    : null;

  const profile: GenericTokenProfile = {
    ...entry,
    seoRole: deriveSeoRole(entry),
    depositReady: entry.depositEnabledNetworkCount > 0,
    settleReady: entry.settleEnabledNetworkCount > 0,
    canonicalSendNetwork,
    canonicalReceiveNetwork,
  };

  tokenProfileCache.set(normalized, profile);
  return profile;
}

function sortProfiles(a: GenericTokenProfile, b: GenericTokenProfile) {
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  const roleOrder = {
    btc: 0,
    stable: 1,
    topcoin: 2,
    wrapped_btc: 3,
    meme: 4,
    other: 5,
  } as const;
  const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const roleDiff = roleOrder[a.seoRole] - roleOrder[b.seoRole];
  if (roleDiff !== 0) {
    return roleDiff;
  }

  return a.symbol.localeCompare(b.symbol, "en");
}

function getAllGenericTokenProfiles() {
  return uniqueValues(
    getTokenCatalogEntries().map((entry) => normalizeSymbol(entry.symbol)),
  )
    .map((symbol) => getGenericTokenProfile(symbol))
    .sort(sortProfiles);
}

export function getGenericSourceTokenProfiles() {
  return getAllGenericTokenProfiles().filter((profile) => profile.depositReady);
}

export function getGenericDestinationTokenProfiles() {
  return getAllGenericTokenProfiles().filter((profile) => profile.settleReady);
}

export function getGenericPairFamily(
  fromRole: SeoTokenRole,
  toRole: SeoTokenRole,
): PairIntentType {
  if (fromRole === "wrapped_btc" && toRole === "btc") {
    return "wrapped_btc_to_btc";
  }

  if (fromRole === "btc" && toRole === "wrapped_btc") {
    return "btc_to_wrapped_btc";
  }

  if (fromRole === "btc" && toRole === "stable") {
    return "btc_to_stable";
  }

  if (fromRole === "stable" && toRole === "btc") {
    return "stable_to_btc";
  }

  if (fromRole === "btc" && toRole === "meme") {
    return "btc_to_meme";
  }

  if (fromRole === "meme" && toRole === "btc") {
    return "meme_to_btc";
  }

  if (fromRole === "stable" && toRole === "meme") {
    return "stable_to_meme";
  }

  if (fromRole === "meme" && toRole === "stable") {
    return "meme_to_stable";
  }

  if (fromRole === "btc" && toRole === "topcoin") {
    return "btc_to_topcoin";
  }

  if (fromRole === "topcoin" && toRole === "btc") {
    return "topcoin_to_btc";
  }

  if (fromRole === "stable" && toRole === "topcoin") {
    return "stable_to_topcoin";
  }

  if (fromRole === "topcoin" && toRole === "stable") {
    return "topcoin_to_stable";
  }

  if (fromRole === "topcoin" && toRole === "topcoin") {
    return "topcoin_to_topcoin";
  }

  return "other";
}

export function getSourceModifier(role: SeoTokenRole): SourceModifier {
  switch (role) {
    case "stable":
      return "stable_source";
    case "btc":
      return "btc_source";
    case "topcoin":
      return "topcoin_source";
    case "meme":
      return "meme_source";
    case "wrapped_btc":
      return "wrapped_btc_source";
    default:
      return "other_source";
  }
}

export function getDestinationModifier(role: SeoTokenRole): DestinationModifier {
  switch (role) {
    case "btc":
      return "btc_destination";
    case "stable":
      return "stable_destination";
    case "topcoin":
      return "ecosystem_destination";
    case "meme":
      return "meme_destination";
    case "wrapped_btc":
      return "wrapped_btc_destination";
    default:
      return "other_destination";
  }
}

export function getGenericNetworkProfile(networkId: string): GenericNetworkProfile {
  const normalized = normalizeNetworkId(networkId);
  const override = networkTaxonomy.networks[normalized] || {};

  return {
    id: normalized,
    railType: override.railType || networkTaxonomy.defaults.railType,
    feeTier: override.feeTier || networkTaxonomy.defaults.feeTier,
    speedTier: override.speedTier || networkTaxonomy.defaults.speedTier,
    traits: uniqueValues([
      ...(networkTaxonomy.defaults.traits || []),
      ...(override.traits || []),
    ]),
    bestFor: uniqueValues([
      ...(networkTaxonomy.defaults.bestFor || []),
      ...(override.bestFor || []),
    ]),
  };
}

export function getGenericNetworkTraits(fromNetworkId: string, toNetworkId: string) {
  return uniqueValues([
    ...getGenericNetworkProfile(fromNetworkId).traits,
    ...getGenericNetworkProfile(toNetworkId).traits,
  ]);
}

export function getLegacyNetworkModifiers(
  fromNetworkId: string,
  toNetworkId: string,
  networkTraits: NetworkTrait[],
): NetworkModifier[] {
  const modifiers: NetworkModifier[] = [];

  if (normalizeNetworkId(fromNetworkId) === normalizeNetworkId(toNetworkId)) {
    modifiers.push("same_chain");
  } else {
    modifiers.push("cross_chain");
  }

  for (const trait of networkTraits) {
    modifiers.push(trait);
  }

  if (networkTraits.includes("memo_sensitive")) {
    modifiers.push("memo_warning");
  }

  if (networkTraits.includes("confirmation_sensitive")) {
    modifiers.push("bitcoin_confirmation_sensitive");
  }

  if (networkTraits.includes("wallet_format_sensitive")) {
    modifiers.push("address_format_sensitive");
  }

  if (networkTraits.includes("fee_first")) {
    modifiers.push("low_fee_route");
  }

  return uniqueValues(modifiers);
}

export function getRoleMatchPenalty(fromRole: SeoTokenRole, toRole: SeoTokenRole) {
  return fromRole === toRole ? 1 : 0;
}
