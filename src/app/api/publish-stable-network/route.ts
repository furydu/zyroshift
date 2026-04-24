import { getStableNetworkPublishSummary } from "@/lib/site/stableNetworkPublish";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    ...getStableNetworkPublishSummary(),
  });
}
