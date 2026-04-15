import {
  extractUserIp,
  fetchPermissions,
  toRouteErrorResponse,
} from "@/lib/sideshift/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return Response.json(await fetchPermissions(extractUserIp(request.headers)));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
