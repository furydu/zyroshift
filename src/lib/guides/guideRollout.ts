import {
  getGuidePublishBatch,
  getGuideSupportSlugSet,
  getGuideSupportSummary,
} from "@/lib/guides/guideInventory";

export type GuideRenderMode = "off" | "on";
export type GuideRolloutMode = "off" | "wave-1" | "support-full";

const GUIDE_RENDER_ENV = "GUIDE_RENDER_MODE";
const GUIDE_ROLLOUT_ENV = "GUIDE_ROLLOUT_MODE";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function normalizeRenderMode(value: string | undefined): GuideRenderMode | null {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "on") {
    return "on";
  }

  if (normalized === "off") {
    return "off";
  }

  return null;
}

function normalizeRolloutMode(value: string | undefined): GuideRolloutMode {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "wave-1" || normalized === "wave_1") {
    return "wave-1";
  }

  if (normalized === "support-full" || normalized === "support_full") {
    return "support-full";
  }

  return "off";
}

export function isPreviewSafeGuideEnvironment() {
  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();

  if (!vercelEnv) {
    return false;
  }

  return vercelEnv !== "production";
}

export function getGuideRenderMode(): GuideRenderMode {
  const explicitMode = normalizeRenderMode(process.env[GUIDE_RENDER_ENV]);

  if (explicitMode) {
    return explicitMode;
  }

  const vercelEnv = process.env.VERCEL_ENV?.trim().toLowerCase();

  if (vercelEnv === "production") {
    return "off";
  }

  return "on";
}

export function isGuideRenderEnabled() {
  return getGuideRenderMode() === "on";
}

export function getGuideRolloutMode(): GuideRolloutMode {
  if (isPreviewSafeGuideEnvironment()) {
    return "off";
  }

  return normalizeRolloutMode(process.env[GUIDE_ROLLOUT_ENV]);
}

export function isGuideIndexLaunchSlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const rolloutMode = getGuideRolloutMode();

  if (rolloutMode === "wave-1") {
    return getGuidePublishBatch().some((item) => item.slug === normalizedSlug);
  }

  if (rolloutMode === "support-full") {
    return getGuideSupportSlugSet().has(normalizedSlug);
  }

  return false;
}

export function getGuideRolloutStatus() {
  const supportSummary = getGuideSupportSummary();

  return {
    renderMode: getGuideRenderMode(),
    renderEnabled: isGuideRenderEnabled(),
    renderEnvVar: GUIDE_RENDER_ENV,
    rolloutMode: getGuideRolloutMode(),
    rolloutEnvVar: GUIDE_ROLLOUT_ENV,
    previewSafe: isPreviewSafeGuideEnvironment(),
    supportTargetPairCount: supportSummary.supportTargetPairCount,
    countsByBucket: supportSummary.countsByBucket,
    waveOneCount: supportSummary.waveOneCount,
  };
}
