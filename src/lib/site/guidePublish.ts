import {
  getGuidePublishBatch,
  getGuideSupportSummary,
  getGuideSupportTargetItems,
} from "@/lib/guides/guideInventory";
import { getGuideRolloutStatus } from "@/lib/guides/guideRollout";
import { buildXmlSitemap, buildXmlSitemapIndex } from "@/lib/site/genericPublish";

const SITE_URL = "https://zyroshift.com";

export type GuideSitemapKey = "wave-1" | "support-full";

type GuideSitemapRouteConfig = {
  key: GuideSitemapKey;
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
};

const GUIDE_SITEMAP_ROUTES: GuideSitemapRouteConfig[] = [
  {
    key: "wave-1",
    path: "/guide-sitemap-wave-1.xml",
    priority: 0.62,
    changeFrequency: "weekly",
  },
  {
    key: "support-full",
    path: "/guide-sitemap-support.xml",
    priority: 0.56,
    changeFrequency: "monthly",
  },
];

function getActiveGuideSitemapKeys(): GuideSitemapKey[] {
  const rolloutMode = getGuideRolloutStatus().rolloutMode;

  if (rolloutMode === "support-full") {
    return ["support-full"];
  }

  return ["wave-1"];
}

export function getGuideSitemapRouteConfig(key: GuideSitemapKey) {
  return GUIDE_SITEMAP_ROUTES.find((route) => route.key === key);
}

export function getGuideSitemapIndexRoutes() {
  const activeKeys = new Set(getActiveGuideSitemapKeys());

  return GUIDE_SITEMAP_ROUTES.filter((route) => activeKeys.has(route.key));
}

export function getGuideSitemapEntries(key: GuideSitemapKey) {
  const config = getGuideSitemapRouteConfig(key);

  if (!config) {
    return [];
  }

  const items =
    key === "wave-1" ? getGuidePublishBatch() : getGuideSupportTargetItems();

  return items.map((item) => ({
    url: `${SITE_URL}${item.guideHref}`,
    lastModified: new Date().toISOString(),
    changeFrequency: config.changeFrequency,
    priority: config.priority,
  }));
}

export function getGuideSitemapIndexUrls() {
  return getGuideSitemapIndexRoutes().map((route) => `${SITE_URL}${route.path}`);
}

export function getGuidePublishSummary() {
  const supportSummary = getGuideSupportSummary();
  const rollout = getGuideRolloutStatus();

  return {
    phase: "phase-2-guides",
    rolloutPolicy: {
      urlLayer: "/guides/[from]-to-[to]",
      renderMode: rollout.renderMode,
      renderEnabled: rollout.renderEnabled,
      currentRolloutMode: rollout.rolloutMode,
      previewSafe: rollout.previewSafe,
      sitemapIndex: `${SITE_URL}/guide-sitemap-index.xml`,
      activeSitemapRoutes: getGuideSitemapIndexRoutes().map((route) => ({
        key: route.key,
        url: `${SITE_URL}${route.path}`,
        count:
          route.key === "wave-1"
            ? supportSummary.waveOneCount
            : supportSummary.supportTargetPairCount,
      })),
      manualExpansionRoute: `${SITE_URL}/guide-sitemap-support.xml`,
    },
    counts: {
      supportTargetPairCount: supportSummary.supportTargetPairCount,
      countsByBucket: supportSummary.countsByBucket,
      waveOneCount: supportSummary.waveOneCount,
    },
  };
}

export { buildXmlSitemap, buildXmlSitemapIndex };
