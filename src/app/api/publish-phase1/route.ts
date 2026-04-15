import { getPhaseOnePublishSummary } from "@/lib/site/publish";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    ...getPhaseOnePublishSummary(),
  });
}

