import {
  getGenericLaunchBucketItems,
  getGenericPairUniverseReport,
  type GenericLaunchBucket,
} from "@/lib/pairs";
import { getGenericPublishSummary } from "@/lib/site/genericPublish";
import { NextRequest, NextResponse } from "next/server";

const VALID_BUCKETS = new Set<GenericLaunchBucket>([
  "recommendedIndexNow",
  "recommendedIndexNext",
  "renderOnlyBacklog",
]);

function parseLimit(value: string | null) {
  if (!value) {
    return 40;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 40;
  }

  return Math.min(parsed, 500);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const bucket = url.searchParams.get("bucket") as GenericLaunchBucket | null;
  const limit = parseLimit(url.searchParams.get("limit"));
  const report = getGenericPairUniverseReport();

  if (bucket && VALID_BUCKETS.has(bucket)) {
    const items = getGenericLaunchBucketItems(bucket, limit);
    const bucketSummary =
      bucket === "renderOnlyBacklog"
        ? report.launchInventory.renderOnlyBacklog.count
        : report.launchInventory[bucket].availableCount;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      bucket,
      totalCount: bucketSummary,
      returnedCount: items.length,
      items,
    });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: getGenericPublishSummary(),
    samples: {
      recommendedIndexNow: getGenericLaunchBucketItems("recommendedIndexNow", limit),
      recommendedIndexNext: getGenericLaunchBucketItems("recommendedIndexNext", limit),
      renderOnlyBacklog: getGenericLaunchBucketItems("renderOnlyBacklog", limit),
    },
  });
}
