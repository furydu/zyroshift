import { cache } from "react";

import { getTokenCatalogEntries, getTokenCatalogEntry } from "@/lib/pairs/classify";
import { getTokenHubData } from "@/lib/hubs";

type SideShiftGraphqlError = {
  message: string;
};

type SideShiftGraphqlResponse<T> = {
  data?: T;
  errors?: SideShiftGraphqlError[];
};

type SideShiftDepositMethod = {
  id: string;
  asset: {
    id: string;
    name: string;
    percentageChange24h: string | null;
  };
  nativeMethod: {
    network: string;
  };
  enabled: boolean;
  paused: boolean;
};

type MarketDirectoryEntry = {
  symbol: string;
  providerSymbol: string;
  name: string;
  percentageChange24h: number | null;
  liveNetworks: string[];
};

export type PricePageData = {
  token: string;
  tokenLabel: string;
  tokenName: string;
  categoryLabel: string;
  swapHref: string;
  tokenHubHref: string;
  livePriceUsd: number | null;
  change24h: number | null;
  lastUpdatedIso: string;
  supportedNetworkCount: number;
  supportedNetworkLabels: string[];
  liveNetworkCount: number | null;
  featuredRoutes: Array<{
    slug: string;
    label: string;
    href: string;
    summary: string;
    fromToken: string;
    fromLabel: string;
    fromNetworkId: string;
    toToken: string;
    toLabel: string;
    toNetworkId: string;
  }>;
  relatedTokens: Array<{
    symbol: string;
    name: string;
    href: string;
  }>;
  networkBreakdown: Array<{
    id: string;
    label: string;
    href: string;
    useCase: string;
    useWhen: string[];
    badges: string[];
  }>;
  summaryParagraphs: string[];
  whyUsePoints: string[];
  seoTitle: string;
  seoDescription: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export type PriceDirectoryCard = {
  symbol: string;
  name: string;
  href: string;
  categoryLabel: string;
  supportedNetworkCount: number;
  previewPriceUsd: number | null;
  previewChange24h: number | null;
};

const SIDESHIFT_GRAPHQL_URL = "https://sideshift.ai/graphql";
export const PRICE_DIRECTORY_FEATURED_LIMIT = 18;

const PRICE_QUERY = `
  query ($base: String!, $quote: String!) {
    price(base: $base, quote: $quote)
  }
`;

const DEPOSIT_METHODS_QUERY = `
  query {
    depositMethods {
      id
      asset {
        id
        name
        percentageChange24h
      }
      nativeMethod {
        network
      }
      enabled
      paused
    }
  }
`;

const CATEGORY_LABELS: Record<string, string> = {
  stable: "Stable asset",
  btc: "Bitcoin-linked asset",
  layer1: "Layer 1 asset",
  layer2: "Layer 2 asset",
  defi: "DeFi asset",
  meme: "Meme asset",
  exchange: "Exchange-linked asset",
  gaming: "Gaming asset",
  other: "Multi-route asset",
};

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function sortDirectoryEntries() {
  return getTokenCatalogEntries().slice().sort((left, right) => {
    const priorityGap =
      (PRIORITY_WEIGHT[right.priority] || 0) - (PRIORITY_WEIGHT[left.priority] || 0);
    if (priorityGap !== 0) {
      return priorityGap;
    }

    const networkGap = right.networkCount - left.networkCount;
    if (networkGap !== 0) {
      return networkGap;
    }

    return left.symbol.localeCompare(right.symbol, "en");
  });
}

async function requestSideShiftGraphql<T>(
  query: string,
  variables?: Record<string, string>,
): Promise<T> {
  const response = await fetch(SIDESHIFT_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`Price provider request failed with ${response.status}.`);
  }

  const payload =
    (await response.json()) as SideShiftGraphqlResponse<T>;

  if (!payload.data) {
    const message = payload.errors?.[0]?.message || "Unknown provider error.";
    throw new Error(message);
  }

  return payload.data;
}

function parseNumber(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNetworkLabels(labels: string[]) {
  return labels.join(", ");
}

export const getPriceMarketDirectory = cache(async () => {
  const data = await requestSideShiftGraphql<{
    depositMethods: SideShiftDepositMethod[];
  }>(DEPOSIT_METHODS_QUERY);

  const byAsset = new Map<string, MarketDirectoryEntry>();

  for (const method of data.depositMethods) {
    const symbol = method.asset.id.trim().toUpperCase();
    const current = byAsset.get(symbol);
    const currentNetworks = new Set(current?.liveNetworks || []);

    if (method.enabled && !method.paused) {
      currentNetworks.add(method.nativeMethod.network);
    }

    byAsset.set(symbol, {
      symbol,
      providerSymbol: method.asset.id.trim(),
      name: method.asset.name,
      percentageChange24h: parseNumber(method.asset.percentageChange24h),
      liveNetworks: [...currentNetworks].sort((a, b) => a.localeCompare(b, "en")),
    });
  }

  return byAsset;
});

async function fetchLiveTokenPriceUsd(symbol: string) {
  try {
    const data = await requestSideShiftGraphql<{ price: string | null }>(PRICE_QUERY, {
      base: symbol.trim(),
      quote: "USD",
    });

    return parseNumber(data.price);
  } catch {
    return null;
  }
}

export const getLiveTokenPriceUsd = cache(async (symbol: string) =>
  fetchLiveTokenPriceUsd(symbol),
);

function buildPriceFaqs(
  tokenName: string,
  tokenLabel: string,
  supportedNetworkCount: number,
  supportedNetworkLabels: string[],
) {
  return [
    {
      question: `What does ${tokenLabel} price today mean on ZyroShift?`,
      answer: `${tokenName} price today is the current market reference shown in USD for support and research use. It helps users orient around the asset before they decide whether to hold, route, or open a swap.`,
    },
    {
      question: `How many networks support ${tokenLabel} on ZyroShift?`,
      answer: `${tokenLabel} is currently supported across ${supportedNetworkCount} network${supportedNetworkCount === 1 ? "" : "s"} on ZyroShift: ${formatNetworkLabels(supportedNetworkLabels)}.`,
    },
    {
      question: `Why can the ${tokenLabel} market price differ from a swap quote?`,
      answer: `A market price is a broad reference. A live swap quote depends on route availability, asset pair, chosen network, amount, provider spread, and current execution conditions.`,
    },
    {
      question: `Can I swap ${tokenLabel} directly from this page?`,
      answer: `This page is designed as a price-intent landing page first. The swap action stays secondary, so users can review the asset context and then continue into the live ZyroShift flow when they are ready.`,
    },
  ];
}

export async function getPricePageData(token: string): Promise<PricePageData | null> {
  const hub = getTokenHubData(token);

  if (!hub) {
    return null;
  }

  const [marketDirectory, livePriceUsd] = await Promise.all([
    getPriceMarketDirectory(),
    getPriceMarketDirectory().then(async (directory) => {
      const marketEntry = directory.get(hub.tokenLabel.toUpperCase());
      return getLiveTokenPriceUsd(marketEntry?.providerSymbol || hub.tokenLabel);
    }),
  ]);

  const market = marketDirectory.get(hub.tokenLabel.toUpperCase()) || null;
  const supportedNetworkLabels = hub.networkBreakdown.map((network) => network.label);
  const faqs = buildPriceFaqs(
    hub.tokenName,
    hub.tokenLabel,
    hub.networkCount,
    supportedNetworkLabels,
  );
  const seoTitle = `${hub.tokenLabel} Price Today | ${hub.tokenName} Price, Networks & Swap on ZyroShift`;
  const seoDescription = `Track the live ${hub.tokenName} (${hub.tokenLabel}) price in USD, the 24h move, and how many networks ${hub.tokenLabel} is supported on through ZyroShift before you open a live swap.`;

  return {
    token: hub.token,
    tokenLabel: hub.tokenLabel,
    tokenName: hub.tokenName,
    categoryLabel: CATEGORY_LABELS[hub.category] || CATEGORY_LABELS.other,
    swapHref: hub.swapHref,
    tokenHubHref: `/tokens/${hub.token}`,
    livePriceUsd,
    change24h: market?.percentageChange24h ?? null,
    lastUpdatedIso: new Date().toISOString(),
    supportedNetworkCount: hub.networkCount,
    supportedNetworkLabels,
    liveNetworkCount: market?.liveNetworks.length ?? null,
    featuredRoutes: hub.featuredRoutes.slice(0, 4).map((route) => ({
      slug: route.slug,
      label: route.h1.replace(/^Swap\s+/i, ""),
      href: `/swap/${route.slug}`,
      summary: route.useCase,
      fromToken: route.builderPreset.fromCoin,
      fromLabel: route.fromLabel,
      fromNetworkId: route.builderPreset.fromNetwork,
      toToken: route.builderPreset.toCoin,
      toLabel: route.toLabel,
      toNetworkId: route.builderPreset.toNetwork,
    })),
    relatedTokens: hub.relatedTokens.slice(0, 6).map((entry) => ({
      symbol: entry.symbol,
      name: entry.name,
      href: `/prices/${entry.symbol.toLowerCase()}`,
    })),
    networkBreakdown: hub.networkBreakdown,
    summaryParagraphs: hub.summaryParagraphs.slice(0, 2),
    whyUsePoints: [
      `Review ${hub.tokenLabel} market context before a live route decision.`,
      `See how broad ${hub.tokenLabel} support is across ZyroShift networks.`,
      `Move from price research into a live swap without switching intent.`,
    ],
    seoTitle,
    seoDescription,
    faqs,
  };
}

export async function getPriceDirectoryCards(): Promise<PriceDirectoryCard[]> {
  const marketDirectory = await getPriceMarketDirectory();
  const entries = sortDirectoryEntries();
  const featuredEntries = entries.slice(0, PRICE_DIRECTORY_FEATURED_LIMIT);

  const pricePairs = await Promise.all(
    featuredEntries.map(async (entry) => {
      const market = marketDirectory.get(entry.symbol.toUpperCase());
      const price = await getLiveTokenPriceUsd(
        market?.providerSymbol || entry.symbol,
      );
      return [entry.symbol, price] as const;
    }),
  );

  const priceMap = new Map(pricePairs);

  return entries.map((entry) => {
    const catalogEntry = getTokenCatalogEntry(entry.symbol);
    const market = marketDirectory.get(entry.symbol) || null;

    return {
      symbol: catalogEntry.symbol,
      name: catalogEntry.name,
      href: `/prices/${catalogEntry.symbol.toLowerCase()}`,
      categoryLabel: CATEGORY_LABELS[catalogEntry.category] || CATEGORY_LABELS.other,
      supportedNetworkCount: catalogEntry.networkCount,
      previewPriceUsd: priceMap.get(catalogEntry.symbol) ?? null,
      previewChange24h: market?.percentageChange24h ?? null,
    };
  });
}
