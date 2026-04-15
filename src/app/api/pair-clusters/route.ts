import { getPairClusterReport } from "@/lib/pairs";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(getPairClusterReport());
}
