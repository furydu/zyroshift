import {
  extractUserIp,
  fetchOrderStatus,
  toRouteErrorResponse,
} from "@/lib/sideshift/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("id");

  if (!orderId) {
    return Response.json(
      {
        error: {
          message: "Missing order id.",
          code: "BAD_USER_INPUT",
        },
      },
      { status: 400 },
    );
  }

  try {
    return Response.json(
      await fetchOrderStatus(orderId, extractUserIp(request.headers)),
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
