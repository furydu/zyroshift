import { getNetworkHubStaticParams, getTokenHubStaticParams } from "@/lib/hubs";
import {
  getFrozenGoldPairSetSummary,
  getFrozenGoldPairSitemapEntries,
} from "@/lib/pairs";
import type { MetadataRoute } from "next";

const SITE_URL = "https://zyroshift.com";

type PublishStaticRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

const PHASE_ONE_STATIC_ROUTES: PublishStaticRoute[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/swap", changeFrequency: "daily", priority: 0.95 },
  { path: "/tokens", changeFrequency: "weekly", priority: 0.9 },
  { path: "/networks", changeFrequency: "weekly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "weekly", priority: 0.82 },
  { path: "/track-order", changeFrequency: "weekly", priority: 0.72 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.46 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.46 },
];

function buildEntry(
  path: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export function getPhaseOneStaticSitemapEntries(): MetadataRoute.Sitemap {
  return PHASE_ONE_STATIC_ROUTES.map((route) =>
    buildEntry(route.path, route.changeFrequency, route.priority),
  );
}

export function getTokenHubSitemapEntries(): MetadataRoute.Sitemap {
  return getTokenHubStaticParams().map(({ token }) =>
    buildEntry(`/tokens/${token}`, "weekly", 0.76),
  );
}

export function getNetworkHubSitemapEntries(): MetadataRoute.Sitemap {
  return getNetworkHubStaticParams().map(({ network }) =>
    buildEntry(`/networks/${network}`, "weekly", 0.74),
  );
}

export function getPhaseOneSitemapEntries(): MetadataRoute.Sitemap {
  return [
    ...getPhaseOneStaticSitemapEntries(),
    ...getFrozenGoldPairSitemapEntries(),
    ...getTokenHubSitemapEntries(),
    ...getNetworkHubSitemapEntries(),
  ];
}

export function getPhaseOnePublishSummary() {
  const pairSummary = getFrozenGoldPairSetSummary();
  const tokenHubCount = getTokenHubStaticParams().length;
  const networkHubCount = getNetworkHubStaticParams().length;
  const staticPageCount = PHASE_ONE_STATIC_ROUTES.length;

  return {
    phase: "phase-1",
    publishPolicy: {
      pairPages: "launch-set only",
      tokenPages: "full publish",
      networkPages: "full publish",
      utilityPages: {
        index: ["/how-it-works", "/track-order"],
        noindex: ["/shift/[id]"],
      },
      excludedFromSitemap: ["/api/*", "/shift/[id]", "/swap/{family}"],
    },
    counts: {
      pairPages: pairSummary.pairCount,
      tokenPages: tokenHubCount,
      networkPages: networkHubCount,
      staticPages: staticPageCount,
      totalIndexablePages:
        pairSummary.pairCount +
        tokenHubCount +
        networkHubCount +
        staticPageCount,
    },
  };
}
