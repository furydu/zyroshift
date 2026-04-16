import { getPhaseOnePairInventory, type PairInventoryItem } from "@/lib/pairs/inventory";
import {
  getPairLaunchClusterId,
  getPairLaunchClusterRule,
  LAUNCH_CLUSTER_PRIORITY,
  type PairLaunchClusterId,
} from "@/lib/pairs/launchRules";
import { getPairPageSpecs } from "@/lib/pairs/registry";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";
import type { PairPageSpec } from "@/lib/pairs/types";

export type { PairLaunchClusterId } from "@/lib/pairs/launchRules";

export type PairLaunchScope = "curated" | "family-expansion";

export type PairLaunchSetItem = {
  slug: string;
  title: string;
  h1: string;
  templateFamily: PairPageSpec["templateFamily"];
  pairIntentType: PairPageSpec["pairIntentType"];
  score: number;
  priorityScore: number;
  fromLabel: string;
  toLabel: string;
  fromNetworkLabel: string;
  toNetworkLabel: string;
  reasons: string[];
  scope: PairLaunchScope;
  clusterId: PairLaunchClusterId | null;
};

const SITE_URL = "https://zyroshift.com";

let cachedExpandedLaunch:
  | {
      selectedSlugs: Set<string>;
      launchScopes: Map<string, PairLaunchScope>;
    }
  | null = null;

function sortLaunchInventory(a: PairInventoryItem, b: PairInventoryItem) {
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

function sortLaunchPairs(a: PairPageSpec, b: PairPageSpec) {
  const scoreDiff = b.indexability.breakdown.total - a.indexability.breakdown.total;
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return b.priorityScore - a.priorityScore;
}

function applyOptionalLimit<T>(items: T[], limit?: number) {
  if (typeof limit !== "number" || limit <= 0) {
    return items;
  }

  return items.slice(0, limit);
}

function selectClusterOverrides(
  clusterId: PairLaunchClusterId,
  items: PairInventoryItem[],
  selectedSlugs: Set<string>,
  targetCount: number,
) {
  const rule = getPairLaunchClusterRule(clusterId);
  const itemMap = new Map(items.map((item) => [item.slug, item]));
  const picked: PairInventoryItem[] = [];

  for (const slug of rule.overrideSlugs) {
    if (picked.length >= targetCount) {
      break;
    }

    if (selectedSlugs.has(slug)) {
      continue;
    }

    const item = itemMap.get(slug);

    if (!item || !rule.candidate(item) || item.state === "skip") {
      continue;
    }

    picked.push(item);
  }

  return picked;
}

function selectDiverseClusterCandidates(
  clusterId: PairLaunchClusterId,
  items: PairInventoryItem[],
  selectedSlugs: Set<string>,
  targetCount: number,
) {
  const rule = getPairLaunchClusterRule(clusterId);
  const ordered = [...items]
    .filter((item) => rule.candidate(item))
    .sort((a, b) => {
      const preferenceDiff = rule.preferenceScore(b) - rule.preferenceScore(a);

      if (preferenceDiff !== 0) {
        return preferenceDiff;
      }

      return sortLaunchInventory(a, b);
    });
  const picked: PairInventoryItem[] = [];
  const seenKeys = new Set(
    items
      .filter((item) => selectedSlugs.has(item.slug))
      .map((item) => rule.diversityKey(item)),
  );
  const seenSecondaryKeys = new Set(
    rule.secondaryDiversityKey
      ? items
          .filter((item) => selectedSlugs.has(item.slug))
          .map((item) => rule.secondaryDiversityKey?.(item))
          .filter((key): key is string => Boolean(key))
      : [],
  );
  const bucketCounts = new Map<string, number>();

  if (rule.bucketKey && rule.bucketLimit) {
    for (const item of items.filter((candidate) => selectedSlugs.has(candidate.slug))) {
      const key = rule.bucketKey(item);
      bucketCounts.set(key, (bucketCounts.get(key) || 0) + 1);
    }
  }

  for (const item of ordered) {
    if (picked.length >= targetCount) {
      break;
    }

    if (selectedSlugs.has(item.slug)) {
      continue;
    }

    const key = rule.diversityKey(item);
    if (seenKeys.has(key)) {
      continue;
    }

    if (rule.bucketKey && rule.bucketLimit) {
      const bucketKey = rule.bucketKey(item);
      if ((bucketCounts.get(bucketKey) || 0) >= rule.bucketLimit) {
        continue;
      }
      bucketCounts.set(bucketKey, (bucketCounts.get(bucketKey) || 0) + 1);
    }

    picked.push(item);
    seenKeys.add(key);
    if (rule.secondaryDiversityKey) {
      seenSecondaryKeys.add(rule.secondaryDiversityKey(item));
    }
  }

  for (const item of ordered) {
    if (picked.length >= targetCount) {
      break;
    }

    if (selectedSlugs.has(item.slug)) {
      continue;
    }

    if (picked.some((candidate) => candidate.slug === item.slug)) {
      continue;
    }

    if (rule.secondaryDiversityKey) {
      const secondaryKey = rule.secondaryDiversityKey(item);
      if (seenSecondaryKeys.has(secondaryKey)) {
        continue;
      }
      seenSecondaryKeys.add(secondaryKey);
    }

    if (rule.bucketKey && rule.bucketLimit) {
      const bucketKey = rule.bucketKey(item);
      if ((bucketCounts.get(bucketKey) || 0) >= rule.bucketLimit) {
        continue;
      }
      bucketCounts.set(bucketKey, (bucketCounts.get(bucketKey) || 0) + 1);
    }

    picked.push(item);
  }

  return picked;
}

function buildExpandedLaunchInventory() {
  const useCache = process.env.NODE_ENV === "production";

  if (useCache && cachedExpandedLaunch) {
    return cachedExpandedLaunch;
  }

  const inventory = getPhaseOnePairInventory().items;
  const curatedSpecs = getPairPageSpecs().filter(
    (spec) => spec.indexability.state === "index",
  );
  const selectedSlugs = new Set(curatedSpecs.map((spec) => spec.slug));
  const launchScopes = new Map<string, PairLaunchScope>();

  for (const slug of selectedSlugs) {
    launchScopes.set(slug, "curated");
  }

  for (const clusterId of LAUNCH_CLUSTER_PRIORITY) {
    const rule = getPairLaunchClusterRule(clusterId);
    const clusterItems = inventory.filter(
      (item) => getPairLaunchClusterId(item.templateFamily) === clusterId,
    );
    const alreadySelectedInCluster = clusterItems.filter((item) =>
      selectedSlugs.has(item.slug),
    ).length;
    const remaining = Math.max(0, rule.quota - alreadySelectedInCluster);

    if (remaining === 0) {
      continue;
    }

    const overrideAdditions = selectClusterOverrides(
      clusterId,
      clusterItems,
      selectedSlugs,
      remaining,
    );

    for (const item of overrideAdditions) {
      selectedSlugs.add(item.slug);
      launchScopes.set(item.slug, "family-expansion");
    }

    const remainingAfterOverrides = Math.max(0, remaining - overrideAdditions.length);

    if (remainingAfterOverrides === 0) {
      continue;
    }

    const additions = selectDiverseClusterCandidates(
      clusterId,
      clusterItems,
      selectedSlugs,
      remainingAfterOverrides,
    );

    for (const item of additions) {
      selectedSlugs.add(item.slug);
      launchScopes.set(item.slug, "family-expansion");
    }
  }

  const result = {
    selectedSlugs,
    launchScopes,
  };

  if (useCache) {
    cachedExpandedLaunch = result;
  }

  return result;
}

export function getPairLaunchSlugSet() {
  return buildExpandedLaunchInventory().selectedSlugs;
}

export function isPairLaunchSlug(slug: string) {
  return getPairLaunchSlugSet().has(slug.trim().toLowerCase());
}

function getLaunchSpecs(limit?: number) {
  const { selectedSlugs } = buildExpandedLaunchInventory();

  const specs = [...selectedSlugs]
    .map((slug) => resolvePairPageSpec(slug))
    .filter((spec): spec is PairPageSpec => Boolean(spec))
    .sort(sortLaunchPairs);

  return applyOptionalLimit(specs, limit);
}

export function getPairLaunchSet(limit?: number): PairLaunchSetItem[] {
  const { launchScopes } = buildExpandedLaunchInventory();

  return getLaunchSpecs(limit).map((spec) => ({
    slug: spec.slug,
    title: spec.title,
    h1: spec.h1,
    templateFamily: spec.templateFamily,
    pairIntentType: spec.pairIntentType,
    score: spec.indexability.breakdown.total,
    priorityScore: spec.priorityScore,
    fromLabel: spec.fromLabel,
    toLabel: spec.toLabel,
    fromNetworkLabel: spec.fromNetworkLabel,
    toNetworkLabel: spec.toNetworkLabel,
    reasons: spec.indexability.reasons,
    scope: launchScopes.get(spec.slug) || "family-expansion",
    clusterId: getPairLaunchClusterId(spec.templateFamily),
  }));
}

export function getPairLaunchExpansionSuggestions(limit = 40) {
  const { selectedSlugs } = buildExpandedLaunchInventory();
  const inventory = getPhaseOnePairInventory().items;

  return LAUNCH_CLUSTER_PRIORITY.flatMap((clusterId) => {
    const rule = getPairLaunchClusterRule(clusterId);

    return inventory
      .filter(
        (item) =>
          getPairLaunchClusterId(item.templateFamily) === clusterId &&
          !selectedSlugs.has(item.slug) &&
          rule.candidate(item),
      )
      .sort((a, b) => {
        const preferenceDiff = rule.preferenceScore(b) - rule.preferenceScore(a);

        if (preferenceDiff !== 0) {
          return preferenceDiff;
        }

        return sortLaunchInventory(a, b);
      });
  }).slice(0, limit);
}

export function getPairLaunchSetSummary() {
  const inventory = getPhaseOnePairInventory().items;
  const { selectedSlugs, launchScopes } = buildExpandedLaunchInventory();
  const curatedLaunchPairs = [...launchScopes.values()].filter(
    (scope) => scope === "curated",
  ).length;
  const familyExpansionPairs = [...launchScopes.values()].filter(
    (scope) => scope === "family-expansion",
  ).length;

  return {
    totalCuratedPairs: getPairPageSpecs().length,
    launchReadyPairs: selectedSlugs.size,
    curatedLaunchPairs,
    familyExpansionPairs,
    renderOnlyPairs: inventory.filter(
      (item) => item.renderReady && !selectedSlugs.has(item.slug),
    ).length,
    skippedPairs: inventory.filter((item) => item.state === "skip").length,
  };
}

export function getPairLaunchSpecs(limit?: number): PairPageSpec[] {
  return getLaunchSpecs(limit);
}

export function getPairLaunchStaticParams(limit?: number) {
  return getPairLaunchSpecs(limit).map((spec) => ({
    pair: spec.slug,
  }));
}

export function getPairLaunchSitemapEntries(limit?: number) {
  return getPairLaunchSpecs(limit).map((spec) => ({
    url: `${SITE_URL}/swap/${spec.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
