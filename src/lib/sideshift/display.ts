import type { CSSProperties } from "react";

const SIDESHIFT_ICON_BASE_URL = "https://sideshift.ai/api/v2/coins/icon";
const FALLBACK_ICON_BASE_URL =
  "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master";

const NETWORK_SYMBOL_MAP: Record<string, string> = {
  bitcoin: "btc",
  bitcoincash: "bch",
  cardano: "ada",
  doge: "doge",
  ethereum: "eth",
  arbitrum: "arb",
  optimism: "op",
  polygon: "matic",
  avax: "avax",
  avalanche: "avax",
  bsc: "bnb",
  base: "eth",
  litecoin: "ltc",
  liquid: "btc",
  solana: "sol",
  sui: "sui",
  ton: "ton",
  tron: "trx",
};

const NETWORK_TINTS = [
  {
    dark: {
      tagBg: "rgba(56, 189, 248, 0.1)",
      tagBorder: "rgba(125, 211, 252, 0.28)",
      tagText: "#d7f2ff",
      pillBg: "rgba(56, 189, 248, 0.18)",
      pillBorder: "rgba(125, 211, 252, 0.36)",
      pillText: "#d7f2ff",
    },
    light: {
      tagBg: "rgba(56, 189, 248, 0.07)",
      tagBorder: "rgba(14, 116, 144, 0.18)",
      tagText: "#0f6778",
      pillBg: "rgba(56, 189, 248, 0.14)",
      pillBorder: "rgba(14, 116, 144, 0.22)",
      pillText: "#0f6778",
    },
  },
  {
    dark: {
      tagBg: "rgba(52, 211, 153, 0.1)",
      tagBorder: "rgba(110, 231, 183, 0.28)",
      tagText: "#d8fff0",
      pillBg: "rgba(52, 211, 153, 0.18)",
      pillBorder: "rgba(110, 231, 183, 0.34)",
      pillText: "#d8fff0",
    },
    light: {
      tagBg: "rgba(16, 185, 129, 0.07)",
      tagBorder: "rgba(4, 120, 87, 0.18)",
      tagText: "#0c6a4d",
      pillBg: "rgba(16, 185, 129, 0.14)",
      pillBorder: "rgba(4, 120, 87, 0.22)",
      pillText: "#0c6a4d",
    },
  },
  {
    dark: {
      tagBg: "rgba(251, 191, 36, 0.1)",
      tagBorder: "rgba(252, 211, 77, 0.28)",
      tagText: "#fff4c6",
      pillBg: "rgba(251, 191, 36, 0.18)",
      pillBorder: "rgba(252, 211, 77, 0.34)",
      pillText: "#fff4c6",
    },
    light: {
      tagBg: "rgba(245, 158, 11, 0.07)",
      tagBorder: "rgba(180, 83, 9, 0.18)",
      tagText: "#915d06",
      pillBg: "rgba(245, 158, 11, 0.14)",
      pillBorder: "rgba(180, 83, 9, 0.22)",
      pillText: "#915d06",
    },
  },
  {
    dark: {
      tagBg: "rgba(244, 114, 182, 0.1)",
      tagBorder: "rgba(249, 168, 212, 0.26)",
      tagText: "#ffdced",
      pillBg: "rgba(244, 114, 182, 0.18)",
      pillBorder: "rgba(249, 168, 212, 0.32)",
      pillText: "#ffdced",
    },
    light: {
      tagBg: "rgba(236, 72, 153, 0.07)",
      tagBorder: "rgba(190, 24, 93, 0.16)",
      tagText: "#a71857",
      pillBg: "rgba(236, 72, 153, 0.14)",
      pillBorder: "rgba(190, 24, 93, 0.22)",
      pillText: "#a71857",
    },
  },
  {
    dark: {
      tagBg: "rgba(168, 85, 247, 0.1)",
      tagBorder: "rgba(196, 181, 253, 0.28)",
      tagText: "#ede3ff",
      pillBg: "rgba(168, 85, 247, 0.18)",
      pillBorder: "rgba(196, 181, 253, 0.34)",
      pillText: "#ede3ff",
    },
    light: {
      tagBg: "rgba(139, 92, 246, 0.07)",
      tagBorder: "rgba(109, 40, 217, 0.18)",
      tagText: "#6b33c7",
      pillBg: "rgba(139, 92, 246, 0.14)",
      pillBorder: "rgba(109, 40, 217, 0.22)",
      pillText: "#6b33c7",
    },
  },
  {
    dark: {
      tagBg: "rgba(59, 130, 246, 0.1)",
      tagBorder: "rgba(147, 197, 253, 0.28)",
      tagText: "#ddeeff",
      pillBg: "rgba(59, 130, 246, 0.18)",
      pillBorder: "rgba(147, 197, 253, 0.34)",
      pillText: "#ddeeff",
    },
    light: {
      tagBg: "rgba(59, 130, 246, 0.07)",
      tagBorder: "rgba(29, 78, 216, 0.18)",
      tagText: "#2154b7",
      pillBg: "rgba(59, 130, 246, 0.14)",
      pillBorder: "rgba(29, 78, 216, 0.22)",
      pillText: "#2154b7",
    },
  },
  {
    dark: {
      tagBg: "rgba(249, 115, 22, 0.1)",
      tagBorder: "rgba(253, 186, 116, 0.28)",
      tagText: "#ffead6",
      pillBg: "rgba(249, 115, 22, 0.18)",
      pillBorder: "rgba(253, 186, 116, 0.34)",
      pillText: "#ffead6",
    },
    light: {
      tagBg: "rgba(249, 115, 22, 0.07)",
      tagBorder: "rgba(194, 65, 12, 0.18)",
      tagText: "#9a4b13",
      pillBg: "rgba(249, 115, 22, 0.14)",
      pillBorder: "rgba(194, 65, 12, 0.22)",
      pillText: "#9a4b13",
    },
  },
];

function normalizeIconSymbol(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildSideShiftIconPath(value: string) {
  return `${SIDESHIFT_ICON_BASE_URL}/${value}`;
}

function resolveNetworkCoin(networkId: string) {
  return normalizeIconSymbol(NETWORK_SYMBOL_MAP[networkId] || networkId);
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getCoinIconSources(coin: string, networkId?: string) {
  const symbol = normalizeIconSymbol(coin);
  const networkSymbol = networkId ? normalizeIconSymbol(networkId) : "";

  return [
    networkSymbol
      ? buildSideShiftIconPath(`${symbol}-${networkSymbol}`)
      : buildSideShiftIconPath(symbol),
    buildSideShiftIconPath(symbol),
    `${FALLBACK_ICON_BASE_URL}/128/color/${symbol}.png`,
    `${FALLBACK_ICON_BASE_URL}/32/color/${symbol}.png`,
    `${FALLBACK_ICON_BASE_URL}/32/color/generic.png`,
  ];
}

export function getNetworkIconSources(networkId: string) {
  const symbol = resolveNetworkCoin(networkId);
  const normalizedNetworkId = normalizeIconSymbol(networkId);

  return [
    buildSideShiftIconPath(`${symbol}-${normalizedNetworkId}`),
    buildSideShiftIconPath(symbol),
    `${FALLBACK_ICON_BASE_URL}/32/color/${symbol}.png`,
    `${FALLBACK_ICON_BASE_URL}/32/color/generic.png`,
  ];
}

export function getNetworkTintStyle(networkId: string): CSSProperties {
  const tint = NETWORK_TINTS[hashString(networkId) % NETWORK_TINTS.length];

  return {
    ["--network-tag-bg-dark" as string]: tint.dark.tagBg,
    ["--network-tag-border-dark" as string]: tint.dark.tagBorder,
    ["--network-tag-fg-dark" as string]: tint.dark.tagText,
    ["--network-pill-bg-dark" as string]: tint.dark.pillBg,
    ["--network-pill-border-dark" as string]: tint.dark.pillBorder,
    ["--network-pill-fg-dark" as string]: tint.dark.pillText,
    ["--network-tag-bg-light" as string]: tint.light.tagBg,
    ["--network-tag-border-light" as string]: tint.light.tagBorder,
    ["--network-tag-fg-light" as string]: tint.light.tagText,
    ["--network-pill-bg-light" as string]: tint.light.pillBg,
    ["--network-pill-border-light" as string]: tint.light.pillBorder,
    ["--network-pill-fg-light" as string]: tint.light.pillText,
  };
}

export function getAssetSearchScore(
  query: string,
  coin: string,
  name: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }

  const normalizedCoin = coin.toLowerCase();
  const normalizedName = name.toLowerCase();

  if (normalizedCoin === normalizedQuery) {
    return 100;
  }

  if (normalizedCoin.startsWith(normalizedQuery)) {
    return 80;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 60;
  }

  if (normalizedCoin.includes(normalizedQuery)) {
    return 40;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 20;
  }

  return -1;
}
