import {
  createFixedOrder,
  extractUserIp,
  toRouteErrorResponse,
} from "@/lib/sideshift/client";
import type { CreateFixedOrderInput } from "@/lib/sideshift/types";
import { NextRequest } from "next/server";

function isValidCreateFixedOrderInput(
  value: unknown,
): value is CreateFixedOrderInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as CreateFixedOrderInput;
  return Boolean(payload.quoteId && payload.receiveAddress);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValidCreateFixedOrderInput(body)) {
      return Response.json(
        {
          error: {
            message:
              "Missing required fixed order fields. quoteId and receiveAddress are required.",
            code: "BAD_USER_INPUT",
          },
        },
        { status: 400 },
      );
    }

    return Response.json(
      await createFixedOrder(body, extractUserIp(request.headers)),
      { status: 201 },
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
