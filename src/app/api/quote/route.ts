import {
  extractUserIp,
  fetchQuote,
  toRouteErrorResponse,
} from "@/lib/sideshift/client";
import type { QuoteInput } from "@/lib/sideshift/types";
import { NextRequest } from "next/server";

function isValidQuoteInput(value: unknown): value is QuoteInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as QuoteInput;

  return Boolean(
    payload.fromCoin &&
      payload.fromNetwork &&
      payload.toCoin &&
      payload.toNetwork,
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValidQuoteInput(body)) {
      return Response.json(
        {
          error: {
            message:
              "Missing fromCoin, fromNetwork, toCoin or toNetwork in quote request.",
            code: "BAD_USER_INPUT",
          },
        },
        { status: 400 },
      );
    }

    return Response.json(await fetchQuote(body, extractUserIp(request.headers)));
  } catch (error) {
    return toRouteErrorResponse(error);
  }
}
