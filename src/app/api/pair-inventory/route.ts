import { getPairInfrastructureReport } from "@/lib/pairs";
import { NextResponse } from "next/server";

export async function GET() {
  const report = getPairInfrastructureReport();

  return NextResponse.json(report);
}
