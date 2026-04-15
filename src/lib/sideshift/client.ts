import {
  requireLiveConfig,
  requireUserIp,
  sideshiftConfig,
} from "@/lib/sideshift/config";
import {
  cancelMockOrder,
  createMockFixedOrder,
  createMockOrder,
  getMockFixedQuote,
  getMockCoins,
  getMockOrder,
  getMockPermissions,
  getMockQuote,
  getMockRecentShifts,
} from "@/lib/sideshift/mock";
import {
  normalizeAssets,
  normalizeFixedQuote,
  normalizeQuote,
  normalizeShift,
} from "@/lib/sideshift/transformers";
import type {
  CancelOrderApiResponse,
  CreateFixedOrderInput,
  CoinsApiResponse,
  CreateOrderInput,
  FixedQuoteApiResponse,
  FixedQuoteInput,
  OrderApiResponse,
  QuoteApiResponse,
  QuoteInput,
  SideShiftCoin,
  SideShiftErrorPayload,
  SideShiftFixedQuoteResponse,
  SideShiftPairResponse,
  SideShiftPermissionResponse,
  RecentShiftsApiResponse,
  SideShiftRecentShift,
  SideShiftShiftResponse,
} from "@/lib/sideshift/types";

class SideShiftApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "SideShiftApiError";
    this.status = status;
    this.code = code;
  }
}

function isProviderErrorPayload(value: unknown): value is SideShiftErrorPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error &&
    typeof value.error.message === "string"
  );
}

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, `${sideshiftConfig.baseUrl}/`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

async function parseJsonResponse(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  options?: {
    method?: "GET" | "POST";
    body?: unknown;
    includeSecret?: boolean;
    query?: Record<string, string | undefined>;
    userIp?: string | null;
  },
) {
  const liveConfig = requireLiveConfig();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options?.includeSecret !== false) {
    headers["x-sideshift-secret"] = liveConfig.secret;
  }

  if (options?.userIp) {
    headers["x-user-ip"] = options.userIp;
  }

  const response = await fetch(buildUrl(path, options?.query), {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    if (isProviderErrorPayload(payload)) {
      throw new SideShiftApiError(
        payload.error.message,
        response.status,
        payload.error.code,
      );
    }

    throw new SideShiftApiError(
      `SideShift request failed with status ${response.status}.`,
      response.status,
    );
  }

  return payload as T;
}

export function extractUserIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip");

  return candidate || null;
}

export function toRouteErrorResponse(error: unknown) {
  if (error instanceof SideShiftApiError) {
    return Response.json(
      {
        error: {
          message: error.message,
          code: error.code ?? "SIDESHIFT_ERROR",
        },
      },
      { status: error.status },
    );
  }

  return Response.json(
    {
      error: {
        message:
          error instanceof Error ? error.message : "Unexpected server error.",
        code: "INTERNAL_ERROR",
      },
    },
    { status: 500 },
  );
}

export async function fetchCoinsAndPermissions(
  userIp?: string | null,
): Promise<CoinsApiResponse> {
  if (sideshiftConfig.mockMode) {
    return {
      assets: normalizeAssets(getMockCoins()),
      permission: getMockPermissions(),
      mockMode: true,
    };
  }

  const requiredIp = requireUserIp(userIp);
  const [coins, permission] = await Promise.all([
    requestJson<SideShiftCoin[]>("/coins", {
      includeSecret: false,
      userIp: requiredIp,
    }),
    requestJson<SideShiftPermissionResponse>("/permissions", {
      includeSecret: false,
      userIp: requiredIp,
    }),
  ]);

  return {
    assets: normalizeAssets(coins),
    permission,
    mockMode: false,
  };
}

export async function fetchPermissions(userIp?: string | null) {
  if (sideshiftConfig.mockMode) {
    return { permission: getMockPermissions(), mockMode: true };
  }

  const permission = await requestJson<SideShiftPermissionResponse>(
    "/permissions",
    {
      includeSecret: false,
      userIp: requireUserIp(userIp),
    },
  );

  return { permission, mockMode: false };
}

export async function fetchRecentShifts(
  limit = 10,
): Promise<RecentShiftsApiResponse> {
  const normalizedLimit = Math.min(Math.max(Math.trunc(limit) || 10, 1), 20);

  if (sideshiftConfig.mockMode) {
    return {
      shifts: getMockRecentShifts(normalizedLimit),
      mockMode: true,
    };
  }

  const shifts = await requestJson<SideShiftRecentShift[]>("/recent-shifts", {
    includeSecret: false,
    query: {
      limit: String(normalizedLimit),
    },
  });

  return {
    shifts,
    mockMode: false,
  };
}

export async function fetchQuote(
  input: QuoteInput,
  userIp?: string | null,
): Promise<QuoteApiResponse> {
  if (sideshiftConfig.mockMode) {
    return {
      quote: getMockQuote(input),
      mockMode: true,
    };
  }

  const liveConfig = requireLiveConfig();
  const requiredIp = requireUserIp(userIp);
  const quote = await requestJson<SideShiftPairResponse>(
    `/pair/${input.fromCoin}-${input.fromNetwork}/${input.toCoin}-${input.toNetwork}`,
    {
      userIp: requiredIp,
      query: {
        affiliateId: liveConfig.affiliateId,
        amount: input.amount,
        commissionRate: liveConfig.commissionRate,
      },
    },
  );

  return {
    quote: normalizeQuote(quote, input),
    mockMode: false,
  };
}

export async function createOrder(
  input: CreateOrderInput,
  userIp?: string | null,
): Promise<OrderApiResponse> {
  if (sideshiftConfig.mockMode) {
    return {
      order: createMockOrder(input),
      mockMode: true,
    };
  }

  const liveConfig = requireLiveConfig();
  const order = await requestJson<SideShiftShiftResponse>("/shifts/variable", {
    method: "POST",
    userIp: requireUserIp(userIp),
    body: {
      settleAddress: input.receiveAddress,
      settleMemo: input.receiveMemo,
      refundAddress: input.refundAddress,
      refundMemo: input.refundMemo,
      depositCoin: input.fromCoin,
      depositNetwork: input.fromNetwork,
      settleCoin: input.toCoin,
      settleNetwork: input.toNetwork,
      affiliateId: liveConfig.affiliateId,
      externalId: input.externalId,
      commissionRate: liveConfig.commissionRate,
    },
  });

  return {
    order: normalizeShift(order),
    mockMode: false,
  };
}

export async function fetchFixedQuote(
  input: FixedQuoteInput,
  userIp?: string | null,
): Promise<FixedQuoteApiResponse> {
  if (sideshiftConfig.mockMode) {
    return {
      quote: getMockFixedQuote(input),
      mockMode: true,
    };
  }

  const liveConfig = requireLiveConfig();
  const quote = await requestJson<SideShiftFixedQuoteResponse>("/quotes", {
    method: "POST",
    userIp: requireUserIp(userIp),
    body: {
      depositCoin: input.fromCoin,
      depositNetwork: input.fromNetwork,
      settleCoin: input.toCoin,
      settleNetwork: input.toNetwork,
      depositAmount: input.amount,
      settleAmount: null,
      affiliateId: liveConfig.affiliateId,
      commissionRate: liveConfig.commissionRate,
    },
  });

  return {
    quote: normalizeFixedQuote(quote),
    mockMode: false,
  };
}

export async function createFixedOrder(
  input: CreateFixedOrderInput,
  userIp?: string | null,
): Promise<OrderApiResponse> {
  if (sideshiftConfig.mockMode) {
    return {
      order: createMockFixedOrder(input),
      mockMode: true,
    };
  }

  const liveConfig = requireLiveConfig();
  const order = await requestJson<SideShiftShiftResponse>("/shifts/fixed", {
    method: "POST",
    userIp: requireUserIp(userIp),
    body: {
      quoteId: input.quoteId,
      settleAddress: input.receiveAddress,
      settleMemo: input.receiveMemo,
      refundAddress: input.refundAddress,
      refundMemo: input.refundMemo,
      affiliateId: liveConfig.affiliateId,
      externalId: input.externalId,
    },
  });

  return {
    order: normalizeShift(order),
    mockMode: false,
  };
}

export async function fetchOrderStatus(
  orderId: string,
  userIp?: string | null,
): Promise<OrderApiResponse> {
  if (sideshiftConfig.mockMode) {
    return {
      order: getMockOrder(orderId),
      mockMode: true,
    };
  }

  const order = await requestJson<SideShiftShiftResponse>(
    `/shifts/${orderId}`,
    {
      includeSecret: false,
      userIp: requireUserIp(userIp),
    },
  );

  return {
    order: normalizeShift(order),
    mockMode: false,
  };
}

export async function cancelOrder(
  orderId: string,
): Promise<CancelOrderApiResponse> {
  if (sideshiftConfig.mockMode) {
    cancelMockOrder(orderId);
    return {
      success: true,
      mockMode: true,
    };
  }

  await requestJson<null>("/cancel-order", {
    method: "POST",
    body: {
      orderId,
    },
  });

  return {
    success: true,
    mockMode: false,
  };
}
