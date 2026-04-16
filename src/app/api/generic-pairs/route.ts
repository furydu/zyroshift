import { getFrozenGoldPairSetSummary, getGenericPairUniverseReport } from "@/lib/pairs";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    gold: getFrozenGoldPairSetSummary(),
    generic: getGenericPairUniverseReport(),
  });
}
