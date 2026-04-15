import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  deriveCategoryDecision,
  derivePriorityDecision,
  normalizeSymbol,
  normalizeName,
} from "./lib/token-classification-rules.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const rawPath = path.join(projectRoot, "data", "raw", "sideshift-coins.json");
const tmpPath = path.join(projectRoot, "tmp_api_coins.json");
const overridesPath = path.join(projectRoot, "data", "tokens", "manual-overrides.json");
const outputPath = path.join(projectRoot, "data", "tokens", "tokens.json");
const summaryPath = path.join(projectRoot, "data", "tokens", "catalog-summary.json");
const unknownReportPath = path.join(projectRoot, "data", "tokens", "unknown-report.json");

const DEFAULT_SOURCE_URL = "http://localhost:3000/api/coins";

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "en"));
}

function compactObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );
}

function incrementCount(counts, key) {
  counts[key] = (counts[key] || 0) + 1;
}

async function readJson(filePath) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function loadRawCoinsResponse() {
  try {
    return await readJson(rawPath);
  } catch {
    try {
      const tmp = await readJson(tmpPath);
      await mkdir(path.dirname(rawPath), { recursive: true });
      await writeFile(rawPath, JSON.stringify(tmp, null, 2), "utf8");
      return tmp;
    } catch {
      const response = await fetch(DEFAULT_SOURCE_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${DEFAULT_SOURCE_URL}: ${response.status}`);
      }

      const payload = await response.json();
      await mkdir(path.dirname(rawPath), { recursive: true });
      await writeFile(rawPath, JSON.stringify(payload, null, 2), "utf8");
      return payload;
    }
  }
}

function buildEntry(asset, override) {
  const symbol = normalizeSymbol(asset.coin);
  const name = normalizeName(asset.name);
  const categoryDecision = deriveCategoryDecision(asset, override);
  const priorityDecision = derivePriorityDecision(asset, categoryDecision.category, override);
  const networks = uniqueSorted(asset.networks.map((network) => network.id));
  const networkLabels = uniqueSorted(asset.networks.map((network) => network.label));
  const hasMemoRoutes = asset.networks.some((network) => Boolean(network.hasMemo));
  const depositEnabledNetworkCount = asset.networks.filter((network) =>
    Boolean(network.depositEnabled),
  ).length;
  const settleEnabledNetworkCount = asset.networks.filter((network) =>
    Boolean(network.settleEnabled),
  ).length;

  return [
    symbol,
    {
      symbol,
      name,
      category: categoryDecision.category,
      priority: priorityDecision.priority,
      networks,
      networkLabels,
      networkCount: networks.length,
      hasMemoRoutes,
      depositEnabledNetworkCount,
      settleEnabledNetworkCount,
      classificationSource: categoryDecision.source,
      classificationReason: categoryDecision.reason,
      prioritySource: priorityDecision.source,
      priorityReason: priorityDecision.reason,
    },
  ];
}

function getUnknownReviewTier(entry) {
  if (entry.priority === "high") {
    return "urgent";
  }

  if (entry.classificationSource === "manual_override" && entry.priority === "low") {
    return "watch";
  }

  if (
    entry.priority === "medium" ||
    (entry.classificationSource !== "manual_override" && entry.networkCount >= 2) ||
    entry.hasMemoRoutes ||
    entry.depositEnabledNetworkCount !== entry.settleEnabledNetworkCount
  ) {
    return "review";
  }

  return "watch";
}

function buildUnknownReport(entries) {
  const unknownItems = entries
    .filter((entry) => entry.category === "other")
    .map((entry) => ({
      symbol: entry.symbol,
      name: entry.name,
      priority: entry.priority,
      networkCount: entry.networkCount,
      networks: entry.networks,
      hasMemoRoutes: entry.hasMemoRoutes,
      classificationSource: entry.classificationSource,
      classificationReason: entry.classificationReason,
      prioritySource: entry.prioritySource,
      priorityReason: entry.priorityReason,
      reviewTier: getUnknownReviewTier(entry),
    }))
    .sort((a, b) => {
      const rank = { urgent: 0, review: 1, watch: 2 };
      const byTier = rank[a.reviewTier] - rank[b.reviewTier];
      if (byTier !== 0) {
        return byTier;
      }

      const byPriority =
        { high: 0, medium: 1, low: 2 }[a.priority] -
        { high: 0, medium: 1, low: 2 }[b.priority];
      if (byPriority !== 0) {
        return byPriority;
      }

      return a.symbol.localeCompare(b.symbol, "en");
    });

  return {
    generatedAt: new Date().toISOString(),
    unknownCount: unknownItems.length,
    urgentReviewCount: unknownItems.filter((item) => item.reviewTier === "urgent").length,
    reviewCount: unknownItems.filter((item) => item.reviewTier === "review").length,
    watchCount: unknownItems.filter((item) => item.reviewTier === "watch").length,
    items: unknownItems,
  };
}

function buildSummary(entries, unknownReport) {
  const categoryCounts = {};
  const priorityCounts = {};
  const classificationSourceCounts = {};
  const prioritySourceCounts = {};

  for (const entry of entries) {
    incrementCount(categoryCounts, entry.category);
    incrementCount(priorityCounts, entry.priority);
    incrementCount(classificationSourceCounts, entry.classificationSource);
    incrementCount(prioritySourceCounts, entry.prioritySource);
  }

  return {
    generatedAt: new Date().toISOString(),
    tokenCount: entries.length,
    categoryCounts,
    priorityCounts,
    classificationSourceCounts,
    prioritySourceCounts,
    unknownCount: unknownReport.unknownCount,
    urgentUnknownCount: unknownReport.urgentReviewCount,
    otherSymbols: entries
      .filter((entry) => entry.category === "other")
      .map((entry) =>
        compactObject({
          symbol: entry.symbol,
          name: entry.name,
          priority: entry.priority,
          networks: entry.networks,
          classificationReason: entry.classificationReason,
          priorityReason: entry.priorityReason,
        }),
      ),
    highPrioritySymbols: entries
      .filter((entry) => entry.priority === "high")
      .map((entry) => entry.symbol),
    memoRouteSymbols: entries
      .filter((entry) => entry.hasMemoRoutes)
      .map((entry) => entry.symbol),
    networkRichTokens: entries
      .filter((entry) => entry.networkCount >= 3)
      .sort((a, b) => b.networkCount - a.networkCount)
      .slice(0, 25)
      .map((entry) =>
        compactObject({
          symbol: entry.symbol,
          networkCount: entry.networkCount,
          networks: entry.networks,
        }),
      ),
  };
}

async function main() {
  const rawResponse = await loadRawCoinsResponse();
  const overrides = await readJson(overridesPath);
  const assets = Array.isArray(rawResponse.assets) ? rawResponse.assets : [];

  if (assets.length === 0) {
    throw new Error("No assets found in raw SideShift coins payload.");
  }

  const catalogEntries = assets
    .map((asset) => buildEntry(asset, overrides[normalizeSymbol(asset.coin)]))
    .sort(([a], [b]) => a.localeCompare(b, "en"));

  const catalog = Object.fromEntries(catalogEntries);
  const catalogValues = Object.values(catalog);
  const unknownReport = buildUnknownReport(catalogValues);
  const summary = buildSummary(catalogValues, unknownReport);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(catalog, null, 2), "utf8");
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  await writeFile(unknownReportPath, JSON.stringify(unknownReport, null, 2), "utf8");

  console.log(
    `Built token catalog for ${summary.tokenCount} assets. other=${summary.categoryCounts.other || 0} urgentUnknown=${unknownReport.urgentReviewCount}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
