import {
  getGuidePublishBatch,
  getGuideRolloutStatus,
  getGuideSupportSummary,
  getGuideSupportTargetItems,
} from "@/lib/guides";
import { NextRequest, NextResponse } from "next/server";

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
  const limit = parseLimit(url.searchParams.get("limit"));
  const batch = url.searchParams.get("batch")?.trim().toLowerCase();
  const supportSummary = getGuideSupportSummary();

  if (batch === "wave-1" || batch === "wave_1") {
    const items = getGuidePublishBatch(limit);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      batch: "wave-1",
      totalCount: supportSummary.waveOneCount,
      returnedCount: items.length,
      items,
    });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: supportSummary,
    rollout: getGuideRolloutStatus(),
    samples: {
      supportTargets: getGuideSupportTargetItems(limit),
      waveOne: getGuidePublishBatch(limit),
    },
  });
}
