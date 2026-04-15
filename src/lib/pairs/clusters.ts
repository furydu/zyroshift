import {
  getPhaseOnePairInventory,
  type PairInventoryItem,
} from "@/lib/pairs/inventory";
import { getPairLaunchSlugSet } from "@/lib/pairs/launchSet";
import type { PairIndexState, PairIntentType, PairTemplateFamily } from "@/lib/pairs/types";

type PairClusterDefinition = {
  id: string;
  title: string;
  summary: string;
  templateFamilies: PairTemplateFamily[];
};

type PairClusterCount = {
  id: string;
  label: string;
  count: number;
};

export type PairClusterReportItem = {
  id: string;
  title: string;
  summary: string;
  templateFamilies: PairTemplateFamily[];
  totalRoutes: number;
  curatedRoutes: number;
  countsByState: Record<PairIndexState, number>;
  countsByIntent: Record<PairIntentType, number>;
  topRoutes: PairInventoryItem[];
  topSourceTokens: PairClusterCount[];
  topDestinationTokens: PairClusterCount[];
  topSourceNetworks: PairClusterCount[];
  topDestinationNetworks: PairClusterCount[];
};

export type PairClusterReport = {
  generatedAt: string;
  summary: {
    clusterCount: number;
    totalRoutesCovered: number;
    topIndexCluster: string | null;
    topNoindexCluster: string | null;
  };
  clusters: PairClusterReportItem[];
};

const CLUSTER_DEFINITIONS: PairClusterDefinition[] = [
  {
    id: "stable-to-btc",
    title: "Stablecoin to BTC routes",
    summary:
      "High-intent funding routes where stablecoins move into native Bitcoin, often with network-specific deposit behavior.",
    templateFamilies: ["stable_network_specific_to_btc", "stable_to_btc"],
  },
  {
    id: "btc-to-stable",
    title: "BTC to stable routes",
    summary:
      "Exit routes that move Bitcoin into stable settlement assets when volatility reduction matters more than on-chain ecosystem entry.",
    templateFamilies: ["btc_to_stable"],
  },
  {
    id: "btc-to-alt",
    title: "BTC to ecosystem-entry routes",
    summary:
      "Routes that move Bitcoin into another asset ecosystem such as ETH, SOL, or BNB for downstream chain activity.",
    templateFamilies: ["btc_to_alt"],
  },
  {
    id: "stable-to-alt",
    title: "Stablecoin to ecosystem-entry routes",
    summary:
      "Routes that deploy stable value into native ecosystem assets while keeping network compatibility explicit from the start.",
    templateFamilies: ["stable_to_alt"],
  },
  {
    id: "alt-to-btc",
    title: "Altcoin to BTC routes",
    summary:
      "Rotation routes that move non-BTC assets back into native Bitcoin as a destination asset.",
    templateFamilies: ["alt_to_btc"],
  },
  {
    id: "alt-to-stable",
    title: "Altcoin to stable routes",
    summary:
      "Value-preservation routes that land in stable assets after altcoin or meme-asset exposure.",
    templateFamilies: ["alt_to_stable"],
  },
  {
    id: "alt-to-alt",
    title: "Altcoin to altcoin routes",
    summary:
      "Cross-ecosystem switching routes where the user is changing chain context or rebalancing between volatile assets.",
    templateFamilies: ["alt_to_alt"],
  },
];

function sortCounts(a: PairClusterCount, b: PairClusterCount) {
  return b.count - a.count || a.label.localeCompare(b.label, "en");
}

function sortRoutes(a: PairInventoryItem, b: PairInventoryItem) {
  const stateOrder: Record<PairIndexState, number> = {
    index: 0,
    noindex: 1,
    skip: 2,
  };

  const stateDiff = stateOrder[a.state] - stateOrder[b.state];
  if (stateDiff !== 0) {
    return stateDiff;
  }

  const curatedDiff = Number(b.curated) - Number(a.curated);
  if (curatedDiff !== 0) {
    return curatedDiff;
  }

  const scoreDiff = b.score - a.score;
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return b.priorityScore - a.priorityScore;
}

function countLabels(
  items: Array<{ id: string; label: string }>,
  limit = 6,
) {
  const counts = new Map<string, PairClusterCount>();

  for (const item of items) {
    const current = counts.get(item.id);

    if (current) {
      current.count += 1;
    } else {
      counts.set(item.id, {
        id: item.id,
        label: item.label,
        count: 1,
      });
    }
  }

  return [...counts.values()]
    .sort(sortCounts)
    .slice(0, limit);
}

function countIntents(items: PairInventoryItem[]) {
  const counts = {
    btc_to_stable: 0,
    btc_to_alt: 0,
    btc_to_meme: 0,
    stable_to_btc: 0,
    stable_to_alt: 0,
    alt_to_btc: 0,
    alt_to_stable: 0,
    alt_to_alt: 0,
    meme_to_stable: 0,
    meme_to_btc: 0,
    other: 0,
  } satisfies Record<PairIntentType, number>;

  for (const item of items) {
    counts[item.pairIntentType] += 1;
  }

  return counts;
}

function buildClusterItem(
  definition: PairClusterDefinition,
  items: PairInventoryItem[],
): PairClusterReportItem {
  const launchSlugs = getPairLaunchSlugSet();
  const countsByState: Record<PairIndexState, number> = {
    index: 0,
    noindex: 0,
    skip: 0,
  };

  for (const item of items) {
    if (item.state === "skip") {
      countsByState.skip += 1;
      continue;
    }

    if (launchSlugs.has(item.slug)) {
      countsByState.index += 1;
    } else {
      countsByState.noindex += 1;
    }
  }

  return {
    id: definition.id,
    title: definition.title,
    summary: definition.summary,
    templateFamilies: definition.templateFamilies,
    totalRoutes: items.length,
    curatedRoutes: items.filter((item) => item.curated).length,
    countsByState,
    countsByIntent: countIntents(items),
    topRoutes: [...items].sort(sortRoutes).slice(0, 16),
    topSourceTokens: countLabels(
      items.map((item) => ({
        id: item.fromToken.toLowerCase(),
        label: item.fromLabel,
      })),
    ),
    topDestinationTokens: countLabels(
      items.map((item) => ({
        id: item.toToken.toLowerCase(),
        label: item.toLabel,
      })),
    ),
    topSourceNetworks: countLabels(
      items.map((item) => ({
        id: item.fromNetworkId.toLowerCase(),
        label: item.fromNetworkLabel,
      })),
    ),
    topDestinationNetworks: countLabels(
      items.map((item) => ({
        id: item.toNetworkId.toLowerCase(),
        label: item.toNetworkLabel,
      })),
    ),
  };
}

export function getPairClusterReport(): PairClusterReport {
  const inventory = getPhaseOnePairInventory();
  const clusters = CLUSTER_DEFINITIONS.map((definition) =>
    buildClusterItem(
      definition,
      inventory.items.filter((item) =>
        definition.templateFamilies.includes(item.templateFamily),
      ),
    ),
  ).filter((cluster) => cluster.totalRoutes > 0);

  const sortedByIndex = [...clusters].sort(
    (a, b) => b.countsByState.index - a.countsByState.index,
  );
  const sortedByNoindex = [...clusters].sort(
    (a, b) => b.countsByState.noindex - a.countsByState.noindex,
  );

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      clusterCount: clusters.length,
      totalRoutesCovered: clusters.reduce((sum, cluster) => sum + cluster.totalRoutes, 0),
      topIndexCluster: sortedByIndex[0]?.id || null,
      topNoindexCluster: sortedByNoindex[0]?.id || null,
    },
    clusters,
  };
}

export function getPairClusterDefinitions() {
  return CLUSTER_DEFINITIONS.map((definition) => ({ ...definition }));
}
