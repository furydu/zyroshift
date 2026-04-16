import { getGenericPublishSummary } from "@/lib/site/genericPublish";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    ...getGenericPublishSummary(),
  });
}
