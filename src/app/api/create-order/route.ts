import {
  createOrder,
  extractUserIp,
  toRouteErrorResponse,
} from "@/lib/sideshift/client";
import type { CreateOrderInput } from "@/lib/sideshift/types";
import { NextRequest } from "next/server";

function isValidCreateOrderInput(value: unknown): value is CreateOrderInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as CreateOrderInput;

  return Boolean(
    payload.fromCoin &&
      payload.fromNetwork &&
      payload.toCoin &&
      payload.toNetwork &&
      payload.receiveAddress,
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValidCreateOrderInput(body)) {
      return Response.json(
        {
          error: {
            message:
              "Missing required order fields. fromCoin, fromNetwork, toCoin, toNetwork and receiveAddress are required.",
            code: "BAD_USER_INPUT",
          },
        },
        { status: 400 },
      );
    }

    return Response.json(
      await createOrder(body, extractUserIp(request.headers)),
      { status: 201 },
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
