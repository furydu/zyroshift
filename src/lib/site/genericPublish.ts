import {
  getGenericLaunchBucketItems,
  getGenericPairUniverseReport,
  getGenericRolloutCounts,
  type GenericLaunchBucket,
} from "@/lib/pairs";
import { getGenericRolloutStatus } from "@/lib/pairs/genericRollout";

const SITE_URL = "https://zyroshift.com";

type GenericSitemapRouteConfig = {
  bucket: Extract<GenericLaunchBucket, "recommendedIndexNow" | "recommendedIndexNext">;
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
};

const GENERIC_SITEMAP_ROUTES: GenericSitemapRouteConfig[] = [
  {
    bucket: "recommendedIndexNow",
    path: "/generic-sitemap-index-now.xml",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  {
    bucket: "recommendedIndexNext",
    path: "/generic-sitemap-index-next.xml",
    priority: 0.58,
    changeFrequency: "monthly",
  },
];

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function getGenericSitemapBucketConfig(
  bucket: Extract<GenericLaunchBucket, "recommendedIndexNow" | "recommendedIndexNext">,
) {
  return GENERIC_SITEMAP_ROUTES.find((route) => route.bucket === bucket);
}

export function getGenericSitemapIndexRoutes() {
  return [...GENERIC_SITEMAP_ROUTES];
}

export function getGenericSitemapEntries(
  bucket: Extract<GenericLaunchBucket, "recommendedIndexNow" | "recommendedIndexNext">,
) {
  const config = getGenericSitemapBucketConfig(bucket);

  if (!config) {
    return [];
  }

  return getGenericLaunchBucketItems(bucket).map((item) => ({
    url: `${SITE_URL}/swap/${item.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: config.changeFrequency,
    priority: config.priority,
  }));
}

export function buildXmlSitemap(
  entries: Array<{
    url: string;
    lastModified?: string;
    changeFrequency?: string;
    priority?: number;
  }>,
) {
  const body = entries
    .map((entry) => {
      const fields = [
        `<loc>${escapeXml(entry.url)}</loc>`,
        entry.lastModified ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>` : "",
        entry.changeFrequency
          ? `<changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`
          : "",
        typeof entry.priority === "number" ? `<priority>${entry.priority}</priority>` : "",
      ]
        .filter(Boolean)
        .join("");

      return `<url>${fields}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function buildXmlSitemapIndex(urls: string[]) {
  const body = urls
    .map(
      (url) =>
        `<sitemap><loc>${escapeXml(url)}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export function getGenericSitemapIndexUrls() {
  return getGenericSitemapIndexRoutes().map((route) => `${SITE_URL}${route.path}`);
}

export function getGenericPublishSummary() {
  const report = getGenericPairUniverseReport();
  const rollout = getGenericRolloutStatus();
  const counts = getGenericRolloutCounts();

  return {
    phase: "phase-2-generic",
    rolloutPolicy: {
      urlLayer: "/swap/[from]-to-[to]",
      renderStrategy: "render full generic universe",
      currentRenderMode: rollout.renderMode,
      renderEnabled: rollout.renderEnabled,
      indexStrategy: "index by launch buckets only",
      previewBehavior: "generic layer stays noindex on preview deployments",
      currentRolloutMode: rollout.mode,
      previewSafe: rollout.previewSafe,
      activeBuckets: rollout.activeBuckets,
      rootSitemapBehavior: "phase-1 sitemap remains canonical until generic rollout is enabled",
      genericSitemapIndex: `${SITE_URL}/generic-sitemap-index.xml`,
      genericSitemapRoutes: getGenericSitemapIndexRoutes().map((route) => ({
        bucket: route.bucket,
        url: `${SITE_URL}${route.path}`,
        count: report.launchInventory[route.bucket].availableCount,
      })),
    },
    counts: {
      renderableGenericPairs: report.summary.renderableGenericPairs,
      indexReadyPairs: report.summary.indexReadyPairs,
      renderOnlyPairs: report.summary.renderOnlyPairs,
      countsByTier: counts.countsByTier,
      countsByState: counts.countsByState,
      countsByLaunchBucket: counts.countsByLaunchBucket,
    },
    launchInventory: report.launchInventory,
  };
}
