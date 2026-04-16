import {
  getGenericLaunchBucketSlugSet,
  type GenericLaunchBucket,
} from "@/lib/pairs/genericUniverse";

export type GenericPairRenderMode = "off" | "on";
export type GenericPairRolloutMode =
  | "off"
  | "index-now"
  | "index-now-and-next";

const GENERIC_RENDER_ENV = "GENERIC_PAIR_RENDER_MODE";
const GENERIC_ROLLOUT_ENV = "GENERIC_PAIR_ROLLOUT_MODE";

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function normalizeMode(value: string | undefined): GenericPairRolloutMode {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "index-now") {
    return "index-now";
  }

  if (
    normalized === "index-now-and-next" ||
    normalized === "index_now_and_next"
  ) {
    return "index-now-and-next";
  }

  return "off";
}

function normalizeRenderMode(value: string | undefined): GenericPairRenderMode | null {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "on") {
    return "on";
  }

  if (normalized === "off") {
    return "off";
  }

  return null;
}

export function isPreviewSafeGenericEnvironment() {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();

  if (!vercelEnv) {
    return false;
  }

  return vercelEnv !== "production";
}

export function getGenericPairRenderMode(): GenericPairRenderMode {
  const explicitMode = normalizeRenderMode(process.env[GENERIC_RENDER_ENV]);

  if (explicitMode) {
    return explicitMode;
  }

  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();

  if (vercelEnv === "production") {
    return "off";
  }

  return "on";
}

export function isGenericPairRenderEnabled() {
  return getGenericPairRenderMode() === "on";
}

export function getGenericPairRolloutMode(): GenericPairRolloutMode {
  if (isPreviewSafeGenericEnvironment()) {
    return "off";
  }

  return normalizeMode(process.env[GENERIC_ROLLOUT_ENV]);
}

export function getGenericIndexedBuckets(): GenericLaunchBucket[] {
  const mode = getGenericPairRolloutMode();

  if (mode === "index-now") {
    return ["recommendedIndexNow"];
  }

  if (mode === "index-now-and-next") {
    return ["recommendedIndexNow", "recommendedIndexNext"];
  }

  return [];
}

export function isGenericPairIndexLaunchSlug(slug: string) {
  const normalized = normalizeSlug(slug);

  return getGenericIndexedBuckets().some((bucket) =>
    getGenericLaunchBucketSlugSet(bucket).has(normalized),
  );
}

export function getGenericRolloutStatus() {
  const renderMode = getGenericPairRenderMode();
  const mode = getGenericPairRolloutMode();
  const activeBuckets = getGenericIndexedBuckets();

  return {
    renderMode,
    renderEnabled: renderMode === "on",
    renderEnvVar: GENERIC_RENDER_ENV,
    mode,
    envVar: GENERIC_ROLLOUT_ENV,
    previewSafe: isPreviewSafeGenericEnvironment(),
    activeBuckets,
  };
}
