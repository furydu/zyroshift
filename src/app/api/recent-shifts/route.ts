import { fetchRecentShifts, toRouteErrorResponse } from "@/lib/sideshift/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const rawLimit = request.nextUrl.searchParams.get("limit");
    const parsedLimit = rawLimit ? Number(rawLimit) : NaN;
    const limit = Number.isFinite(parsedLimit) ? parsedLimit : 8;

    return Response.json(await fetchRecentShifts(limit));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
