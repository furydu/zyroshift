import {
  getStableNetworkExpansionItems,
  getStableNetworkExpansionSummary,
} from "@/lib/pairs/stableNetworkExpansion";
import { getStableNetworkRolloutStatus } from "@/lib/pairs/stableNetworkRollout";
import { buildXmlSitemap, buildXmlSitemapIndex } from "@/lib/site/genericPublish";

const SITE_URL = "https://zyroshift.com";

export function getStableNetworkSitemapEntries() {
  return getStableNetworkExpansionItems().map((item) => ({
    url: `${SITE_URL}${item.moneyHref}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.64,
  }));
}

export function getStableNetworkSitemapIndexUrls() {
  const rollout = getStableNetworkRolloutStatus();

  if (rollout.mode !== "full") {
    return [];
  }

  return [`${SITE_URL}/stable-network-sitemap-full.xml`];
}

export function getStableNetworkPublishSummary() {
  const summary = getStableNetworkExpansionSummary();
  const rollout = getStableNetworkRolloutStatus();

  return {
    phase: "stable-network-expansion",
    rolloutPolicy: {
      urlLayer: "/swap/[stable-network]-to-[target]",
      rolloutMode: rollout.mode,
      previewSafe: rollout.previewSafe,
      sitemapIndex: `${SITE_URL}/stable-network-sitemap-index.xml`,
      sitemapFull: `${SITE_URL}/stable-network-sitemap-full.xml`,
    },
    counts: summary,
  };
}

export { buildXmlSitemap, buildXmlSitemapIndex };
