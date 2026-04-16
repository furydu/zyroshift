import rawCoins from "../../../data/raw/sideshift-coins.json";
import type { CoinsApiResponse } from "@/lib/sideshift/types";
import type { SwapAssetOption, SwapNetworkOption } from "@/lib/sideshift/types";

const coinsPayload = rawCoins as CoinsApiResponse;
const ASSETS = coinsPayload.assets || [];

const ASSET_MAP = new Map(
  ASSETS.map((asset) => [asset.coin.trim().toUpperCase(), asset]),
);

const MANUAL_NETWORK_ALIAS_TO_ID: Record<string, string> = {
  arb: "arbitrum",
  arbitrum: "arbitrum",
  avax: "avax",
  avalanche: "avax",
  base: "base",
  bep20: "bsc",
  bitcoin: "bitcoin",
  btc: "bitcoin",
  bnbsmartchain: "bsc",
  "bnb-smart-chain": "bsc",
  bsc: "bsc",
  cardano: "cardano",
  cosmos: "cosmos",
  doge: "doge",
  dogecoin: "doge",
  erc20: "ethereum",
  eth: "ethereum",
  ethereum: "ethereum",
  liquid: "liquid",
  litecoin: "litecoin",
  ltc: "litecoin",
  op: "optimism",
  optimism: "optimism",
  polygon: "polygon",
  ripple: "ripple",
  sol: "solana",
  solana: "solana",
  ton: "ton",
  tron: "tron",
  trc20: "tron",
};

const SPECIAL_NETWORK_LABELS: Record<string, string> = {
  bsc: "BNB Chain (BEP20)",
  ethereum: "Ethereum (ERC20)",
  tron: "Tron (TRC20)",
};

const TOKEN_NETWORK_PREFERENCE: Record<string, string[]> = {
  BTC: ["bitcoin", "liquid"],
  ETH: ["ethereum", "base", "arbitrum", "optimism"],
  USDT: ["tron", "ethereum", "bsc", "solana", "ton", "avax", "optimism"],
  USDC: ["ethereum", "base", "arbitrum", "optimism", "solana", "polygon", "bsc"],
  BNB: ["bsc"],
  SOL: ["solana"],
  XRP: ["ripple"],
  ADA: ["cardano"],
  DOGE: ["doge"],
  LTC: ["litecoin"],
  BCH: ["bitcoincash"],
  AVAX: ["avax"],
  TON: ["ton"],
  TRX: ["tron"],
  ARB: ["arbitrum"],
  OP: ["optimism"],
};

const GENERIC_NETWORK_PREFERENCE = [
  "bitcoin",
  "ethereum",
  "tron",
  "solana",
  "base",
  "arbitrum",
  "bsc",
  "optimism",
  "polygon",
  "avax",
  "ton",
  "ripple",
  "cardano",
  "litecoin",
  "doge",
];

export type AssetRouteDirection = "deposit" | "settle";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function slugifyNetworkAlias(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildNetworkAliasMap() {
  const aliases = new Map<string, string>();

  for (const [alias, id] of Object.entries(MANUAL_NETWORK_ALIAS_TO_ID)) {
    aliases.set(alias, id);
  }

  for (const asset of ASSETS) {
    for (const network of asset.networks) {
      const normalizedId = network.id.trim().toLowerCase();
      const normalizedLabel = network.label.trim().toLowerCase();
      const labelSlug = slugifyNetworkAlias(network.label);
      const compactLabel = normalizedLabel.replace(/[^a-z0-9]/g, "");

      aliases.set(normalizedId, normalizedId);
      aliases.set(normalizedLabel, normalizedId);

      if (labelSlug) {
        aliases.set(labelSlug, normalizedId);
      }

      if (compactLabel) {
        aliases.set(compactLabel, normalizedId);
      }
    }
  }

  return aliases;
}

const NETWORK_ALIAS_MAP = buildNetworkAliasMap();

export function normalizeAssetNetworkSlug(network: string | null | undefined) {
  const value = (network || "").trim().toLowerCase();
  if (!value) {
    return null;
  }

  const slug = slugifyNetworkAlias(value);
  return NETWORK_ALIAS_MAP.get(value) || NETWORK_ALIAS_MAP.get(slug) || value;
}

export function getCanonicalNetworkSlug(networkId: string) {
  const normalizedId = networkId.trim().toLowerCase();

  switch (normalizedId) {
    case "ethereum":
      return "erc20";
    case "tron":
      return "trc20";
    case "bsc":
      return "bep20";
    default:
      return normalizedId;
  }
}

function networkMatchesDirection(
  network: SwapNetworkOption,
  direction?: AssetRouteDirection,
) {
  if (!direction) {
    return true;
  }

  if (direction === "deposit") {
    return network.depositEnabled;
  }

  return network.settleEnabled;
}

function getNetworkRank(symbol: string, networkId: string) {
  const specificPreference = TOKEN_NETWORK_PREFERENCE[symbol];

  if (specificPreference) {
    const index = specificPreference.indexOf(networkId);
    if (index >= 0) {
      return index;
    }
  }

  const genericIndex = GENERIC_NETWORK_PREFERENCE.indexOf(networkId);
  if (genericIndex >= 0) {
    return specificPreference ? specificPreference.length + genericIndex : genericIndex;
  }

  return 999;
}

export function hasSpecificAssetNetworkPreference(symbol: string) {
  return Boolean(TOKEN_NETWORK_PREFERENCE[normalizeSymbol(symbol)]?.length);
}

export function getAssetBySymbol(symbol: string): SwapAssetOption | null {
  return ASSET_MAP.get(normalizeSymbol(symbol)) || null;
}

export function getAssetNetworkOption(
  asset: SwapAssetOption,
  networkId: string,
  direction?: AssetRouteDirection,
): SwapNetworkOption | null {
  const normalized = normalizeAssetNetworkSlug(networkId);
  if (!normalized) {
    return null;
  }

  return (
    asset.networks.find(
      (network) =>
        network.id.trim().toLowerCase() === normalized &&
        networkMatchesDirection(network, direction),
    ) || null
  );
}

export function pickPreferredAssetNetwork(
  asset: SwapAssetOption,
  requestedNetworkId?: string | null,
  direction?: AssetRouteDirection,
): SwapNetworkOption | null {
  const explicit = normalizeAssetNetworkSlug(requestedNetworkId);

  if (explicit) {
    return getAssetNetworkOption(asset, explicit, direction);
  }

  const symbol = normalizeSymbol(asset.coin);
  const supportedNetworks = asset.networks.filter((network) =>
    networkMatchesDirection(network, direction),
  );

  return [...supportedNetworks].sort((a, b) => {
    const rankDiff =
      getNetworkRank(symbol, a.id.trim().toLowerCase()) -
      getNetworkRank(symbol, b.id.trim().toLowerCase());

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return a.label.localeCompare(b.label, "en");
  })[0] || null;
}

export function getSupportedAssetNetworks(
  symbol: string,
  direction?: AssetRouteDirection,
) {
  const asset = getAssetBySymbol(symbol);

  if (!asset) {
    return [];
  }

  const normalizedSymbol = normalizeSymbol(asset.coin);

  return [...asset.networks]
    .filter((network) => networkMatchesDirection(network, direction))
    .sort((a, b) => {
      const rankDiff =
        getNetworkRank(normalizedSymbol, a.id.trim().toLowerCase()) -
        getNetworkRank(normalizedSymbol, b.id.trim().toLowerCase());

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return a.label.localeCompare(b.label, "en");
    });
}

export function formatAssetNetworkLabel(
  network: SwapNetworkOption,
  explicitVariant: boolean,
) {
  const normalizedId = network.id.trim().toLowerCase();
  if (explicitVariant && SPECIAL_NETWORK_LABELS[normalizedId]) {
    return SPECIAL_NETWORK_LABELS[normalizedId];
  }
  return network.label;
}

export function getAllAssets() {
  return ASSETS;
}

export function getKnownAssetSymbols() {
  return [...ASSET_MAP.keys()];
}
