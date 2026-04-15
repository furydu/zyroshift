import {
  extractUserIp,
  fetchFixedQuote,
  toRouteErrorResponse,
} from "@/lib/sideshift/client";
import type { FixedQuoteInput } from "@/lib/sideshift/types";
import { NextRequest } from "next/server";

function isValidFixedQuoteInput(value: unknown): value is FixedQuoteInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as FixedQuoteInput;

  return Boolean(
    payload.fromCoin &&
      payload.fromNetwork &&
      payload.toCoin &&
      payload.toNetwork &&
      payload.amount,
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValidFixedQuoteInput(body)) {
      return Response.json(
        {
          error: {
            message:
              "Missing fromCoin, fromNetwork, toCoin, toNetwork or amount in fixed-quote request.",
            code: "BAD_USER_INPUT",
          },
        },
        { status: 400 },
      );
    }

    return Response.json(
      await fetchFixedQuote(body, extractUserIp(request.headers)),
      { status: 201 },
    );
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
