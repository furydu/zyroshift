import { cancelOrder, toRouteErrorResponse } from "@/lib/sideshift/client";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { orderId?: string };

    if (!body.orderId) {
      return Response.json(
        {
          error: {
            message: "Missing orderId in cancel request.",
            code: "BAD_USER_INPUT",
          },
        },
        { status: 400 },
      );
    }

    return Response.json(await cancelOrder(body.orderId));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
