import {
  getStableNetworkExpansionSlugSet,
  getStableNetworkExpansionSummary,
} from "@/lib/pairs/stableNetworkExpansion";

export type StableNetworkPairRolloutMode = "off" | "full";

const STABLE_NETWORK_ROLLOUT_ENV = "STABLE_NETWORK_PAIR_ROLLOUT_MODE";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function normalizeMode(value: string | undefined): StableNetworkPairRolloutMode {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "full") {
    return "full";
  }

  return "off";
}

export function isPreviewSafeStableNetworkEnvironment() {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();

  if (!vercelEnv) {
    return false;
  }

  return vercelEnv !== "production";
}

export function getStableNetworkPairRolloutMode(): StableNetworkPairRolloutMode {
  if (isPreviewSafeStableNetworkEnvironment()) {
    return "off";
  }

  return normalizeMode(process.env[STABLE_NETWORK_ROLLOUT_ENV]);
}

export function isStableNetworkPairIndexLaunchSlug(slug: string) {
  if (getStableNetworkPairRolloutMode() !== "full") {
    return false;
  }

  return getStableNetworkExpansionSlugSet().has(normalizeSlug(slug));
}

export function getStableNetworkRolloutStatus() {
  const summary = getStableNetworkExpansionSummary();

  return {
    mode: getStableNetworkPairRolloutMode(),
    envVar: STABLE_NETWORK_ROLLOUT_ENV,
    previewSafe: isPreviewSafeStableNetworkEnvironment(),
    totalPages: summary.totalPages,
    stableNetworkCounts: summary.stableNetworkCounts,
    topTokenCount: summary.topTokenCount,
  };
}
