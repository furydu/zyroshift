import {
  normalizeFixedQuote,
  normalizeQuote,
  normalizeShift,
} from "@/lib/sideshift/transformers";
import type {
  CreateFixedOrderInput,
  CreateOrderInput,
  FixedQuoteInput,
  QuoteInput,
  SideShiftCoin,
  SideShiftFixedQuoteResponse,
  SideShiftPairResponse,
  SideShiftPermissionResponse,
  SideShiftRecentShift,
  SideShiftShiftResponse,
} from "@/lib/sideshift/types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const MOCK_COINS: SideShiftCoin[] = [
  {
    coin: "ETH",
    name: "Ethereum",
    networks: ["ethereum", "arbitrum"],
    hasMemo: false,
    fixedOnly: false,
    variableOnly: false,
    networksWithMemo: [],
    depositOffline: false,
    settleOffline: false,
  },
  {
    coin: "BTC",
    name: "Bitcoin",
    networks: ["bitcoin"],
    hasMemo: false,
    fixedOnly: false,
    variableOnly: false,
    networksWithMemo: [],
    depositOffline: false,
    settleOffline: false,
  },
  {
    coin: "USDT",
    name: "Tether",
    networks: ["ethereum", "bsc", "tron"],
    hasMemo: false,
    fixedOnly: false,
    variableOnly: false,
    networksWithMemo: [],
    depositOffline: false,
    settleOffline: false,
    tokenDetails: {
      ethereum: {
        contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
      },
      bsc: {
        contractAddress: "0x55d398326f99059fF775485246999027B3197955",
        decimals: 18,
      },
      tron: {
        contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        decimals: 6,
      },
    },
  },
  {
    coin: "SOL",
    name: "Solana",
    networks: ["solana"],
    hasMemo: false,
    fixedOnly: false,
    variableOnly: false,
    networksWithMemo: [],
    depositOffline: false,
    settleOffline: false,
  },
];

const MOCK_QUOTES: Record<string, { rate: string; min: string; max: string }> = {
  "ETH:ethereum->BTC:bitcoin": {
    rate: "0.0302",
    min: "0.015",
    max: "55",
  },
  "BTC:bitcoin->ETH:ethereum": {
    rate: "33.1125",
    min: "0.0004",
    max: "3.25",
  },
  "USDT:ethereum->BTC:bitcoin": {
    rate: "0.00001391",
    min: "35",
    max: "30000",
  },
  "BTC:bitcoin->USDT:ethereum": {
    rate: "71640.22",
    min: "0.00035",
    max: "3.1",
  },
  "ETH:arbitrum->USDT:ethereum": {
    rate: "2077.43",
    min: "0.02",
    max: "100",
  },
  "SOL:solana->ETH:ethereum": {
    rate: "0.0641",
    min: "0.7",
    max: "2500",
  },
};

const MOCK_RECENT_SHIFTS: Array<Omit<SideShiftRecentShift, "createdAt"> & { ageMinutes: number }> = [
  {
    ageMinutes: 0,
    depositCoin: "BTC",
    depositNetwork: "liquid",
    depositAmount: "0.00025",
    settleCoin: "USDT",
    settleNetwork: "tron",
    settleAmount: "18.7051",
  },
  {
    ageMinutes: 0,
    depositCoin: "BNB",
    depositNetwork: "bsc",
    depositAmount: "0.0203",
    settleCoin: "BTC",
    settleNetwork: "bitcoin",
    settleAmount: "0.0281",
  },
  {
    ageMinutes: 1,
    depositCoin: "USDT",
    depositNetwork: "ethereum",
    depositAmount: "1079",
    settleCoin: "USDT",
    settleNetwork: "tron",
    settleAmount: "1069.269",
  },
  {
    ageMinutes: 2,
    depositCoin: "ETH",
    depositNetwork: "arbitrum",
    depositAmount: "0.0043",
    settleCoin: "ETH",
    settleNetwork: "base",
    settleAmount: "0.0041",
  },
  {
    ageMinutes: 3,
    depositCoin: "USDT",
    depositNetwork: "bsc",
    depositAmount: "100",
    settleCoin: "USDT",
    settleNetwork: "ton",
    settleAmount: "98.1",
  },
  {
    ageMinutes: 5,
    depositCoin: "SOL",
    depositNetwork: "solana",
    depositAmount: "0.2677",
    settleCoin: "USDT",
    settleNetwork: "ton",
    settleAmount: "21.9873",
  },
  {
    ageMinutes: 10,
    depositCoin: "ETH",
    depositNetwork: "arbitrum",
    depositAmount: "0.0046",
    settleCoin: "USDT",
    settleNetwork: "ethereum",
    settleAmount: "10.4616",
  },
  {
    ageMinutes: 10,
    depositCoin: "BTC",
    depositNetwork: "liquid",
    depositAmount: "0.0023",
    settleCoin: "USDT",
    settleNetwork: "bsc",
    settleAmount: "170.2993",
  },
  {
    ageMinutes: 11,
    depositCoin: "USDT",
    depositNetwork: "ethereum",
    depositAmount: "10.5714",
    settleCoin: "BTC",
    settleNetwork: "bitcoin",
    settleAmount: "0.0238",
  },
  {
    ageMinutes: 13,
    depositCoin: "MATIC",
    depositNetwork: "polygon",
    depositAmount: "38.14",
    settleCoin: "ETH",
    settleNetwork: "ethereum",
    settleAmount: "0.0117",
  },
];

interface MockShiftRecord {
  id: string;
  createdAt: number;
  input: QuoteInput & { amount?: string };
  base: SideShiftShiftResponse;
}

interface MockQuoteRecord {
  id: string;
  quote: SideShiftFixedQuoteResponse;
}

declare global {
  var __mockSideshiftOrders: Map<string, MockShiftRecord> | undefined;
  var __mockSideshiftFixedQuotes: Map<string, MockQuoteRecord> | undefined;
}

const mockOrders =
  globalThis.__mockSideshiftOrders ?? new Map<string, MockShiftRecord>();
const mockFixedQuotes =
  globalThis.__mockSideshiftFixedQuotes ?? new Map<string, MockQuoteRecord>();

globalThis.__mockSideshiftOrders = mockOrders;
globalThis.__mockSideshiftFixedQuotes = mockFixedQuotes;

function getPairKey(input: QuoteInput) {
  return `${input.fromCoin}:${input.fromNetwork}->${input.toCoin}:${input.toNetwork}`;
}

function buildQuote(input: QuoteInput): SideShiftPairResponse {
  const pairKey = getPairKey(input);
  const preset = MOCK_QUOTES[pairKey];

  if (input.fromCoin === input.toCoin && input.fromNetwork === input.toNetwork) {
    throw new Error("Cannot swap the same asset and network pair.");
  }

  if (!preset) {
    throw new Error("This pair is not available in mock mode yet.");
  }

  return {
    min: preset.min,
    max: preset.max,
    rate: preset.rate,
    depositCoin: input.fromCoin,
    settleCoin: input.toCoin,
    depositNetwork: input.fromNetwork,
    settleNetwork: input.toNetwork,
  };
}

function getMockDepositAddress(input: CreateOrderInput) {
  if (input.fromNetwork === "bitcoin") {
    return "bc1qmockh6uw3j5h2k6j2j5pt4mmsr3r9j0a7n0c9g";
  }

  if (input.fromNetwork === "solana") {
    return "8fKxczDmVwXt9K1m6W6zFzS7PzQ6rLjz6QYp4H7s8M9n";
  }

  return "0x44642E63D5A50E872Df2d162D02F9A259B247350";
}

function deriveMockShift(record: MockShiftRecord): SideShiftShiftResponse {
  const elapsed = Date.now() - record.createdAt;
  const depositAmount = record.input.amount || record.base.depositMin;
  const quote = buildQuote(record.input);
  const settleAmount = normalizeQuote(quote, {
    ...record.input,
    amount: depositAmount,
  }).estimatedReceive;
  const depositDetectedAt = new Date(record.createdAt + 15_000).toISOString();
  const updatedAt = new Date(record.createdAt + 65_000).toISOString();

  if (elapsed < 15_000) {
    return record.base;
  }

  if (elapsed < 35_000) {
    return {
      ...record.base,
      status: "pending",
      depositAmount,
      depositReceivedAt: depositDetectedAt,
      depositHash: "0x6ed4cc85f7345a69bdb687b3be9c2f558b0fd9b3ef968eea130e24f404eabccc",
      updatedAt: new Date(record.createdAt + 30_000).toISOString(),
    };
  }

  if (elapsed < 55_000) {
    return {
      ...record.base,
      status: "processing",
      depositAmount,
      depositReceivedAt: depositDetectedAt,
      depositHash: "0x6ed4cc85f7345a69bdb687b3be9c2f558b0fd9b3ef968eea130e24f404eabccc",
      updatedAt: new Date(record.createdAt + 45_000).toISOString(),
    };
  }

  return {
    ...record.base,
    status: "settled",
    depositAmount,
    settleAmount,
    rate: quote.rate,
    depositReceivedAt: depositDetectedAt,
    depositHash: "0x6ed4cc85f7345a69bdb687b3be9c2f558b0fd9b3ef968eea130e24f404eabccc",
    settleHash: "0x918b876f19a9c2130a2ba00c7311f460d8997cca387e3d9836d57d6dcb38d4c1",
    updatedAt,
  };
}

export function getMockPermissions(): SideShiftPermissionResponse {
  return { createShift: true };
}

export function getMockCoins() {
  return MOCK_COINS;
}

export function getMockRecentShifts(limit = 10) {
  return MOCK_RECENT_SHIFTS.slice(0, limit).map(({ ageMinutes, ...shift }) => ({
    ...shift,
    createdAt: new Date(Date.now() - ageMinutes * 60_000).toISOString(),
  }));
}

export function getMockQuote(input: QuoteInput) {
  return normalizeQuote(buildQuote(input), input);
}

export function getMockFixedQuote(input: FixedQuoteInput) {
  const pair = buildQuote(input);
  const quoteId = `mock_quote_${crypto.randomUUID().slice(0, 10)}`;
  const createdAt = new Date().toISOString();
  const quote: SideShiftFixedQuoteResponse = {
    id: quoteId,
    createdAt,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    depositCoin: pair.depositCoin,
    settleCoin: pair.settleCoin,
    depositNetwork: pair.depositNetwork,
    settleNetwork: pair.settleNetwork,
    depositAmount: input.amount,
    settleAmount:
      normalizeQuote(pair, { ...input, amount: input.amount }).estimatedReceive ||
      "0",
    rate: pair.rate,
    affiliateId: "mock_affiliate",
  };

  mockFixedQuotes.set(quoteId, { id: quoteId, quote });

  return normalizeFixedQuote(quote);
}

export function createMockOrder(input: CreateOrderInput) {
  const id = `mock_${crypto.randomUUID().slice(0, 10)}`;
  const quote = buildQuote(input);
  const createdAt = Date.now();

  const base: SideShiftShiftResponse = {
    id,
    createdAt: new Date(createdAt).toISOString(),
    depositCoin: quote.depositCoin,
    settleCoin: quote.settleCoin,
    depositNetwork: quote.depositNetwork,
    settleNetwork: quote.settleNetwork,
    depositAddress: getMockDepositAddress(input),
    settleAddress: input.receiveAddress,
    settleMemo: input.receiveMemo,
    depositMin: quote.min,
    depositMax: quote.max,
    refundAddress: input.refundAddress,
    refundMemo: input.refundMemo,
    type: "variable",
    expiresAt: new Date(createdAt + 7 * DAY_IN_MS).toISOString(),
    status: "waiting",
    averageShiftSeconds: "48.2",
    externalId: input.externalId,
    settleCoinNetworkFee: "3.14",
    networkFeeUsd: "3.14",
  };

  mockOrders.set(id, {
    id,
    createdAt,
    input: {
      fromCoin: input.fromCoin,
      fromNetwork: input.fromNetwork,
      toCoin: input.toCoin,
      toNetwork: input.toNetwork,
      amount: input.amount,
    },
    base,
  });

  return normalizeShift(base);
}

export function createMockFixedOrder(input: CreateFixedOrderInput) {
  const record = mockFixedQuotes.get(input.quoteId);

  if (!record) {
    throw new Error("Mock fixed quote not found or expired.");
  }

  const id = `mock_fixed_${crypto.randomUUID().slice(0, 10)}`;
  const createdAt = Date.now();
  const quote = record.quote;
  const base: SideShiftShiftResponse = {
    id,
    createdAt: new Date(createdAt).toISOString(),
    depositCoin: quote.depositCoin,
    settleCoin: quote.settleCoin,
    depositNetwork: quote.depositNetwork,
    settleNetwork: quote.settleNetwork,
    depositAddress: getMockDepositAddress({
      fromCoin: quote.depositCoin,
      fromNetwork: quote.depositNetwork,
      toCoin: quote.settleCoin,
      toNetwork: quote.settleNetwork,
      receiveAddress: input.receiveAddress,
      amount: quote.depositAmount,
    }),
    settleAddress: input.receiveAddress,
    settleMemo: input.receiveMemo,
    depositMin: quote.depositAmount,
    depositMax: quote.depositAmount,
    refundAddress: input.refundAddress,
    refundMemo: input.refundMemo,
    type: "fixed",
    quoteId: quote.id,
    depositAmount: quote.depositAmount,
    settleAmount: quote.settleAmount,
    expiresAt: quote.expiresAt,
    status: "waiting",
    averageShiftSeconds: "42.1",
    externalId: input.externalId,
    rate: quote.rate,
  };

  mockOrders.set(id, {
    id,
    createdAt,
    input: {
      fromCoin: quote.depositCoin,
      fromNetwork: quote.depositNetwork,
      toCoin: quote.settleCoin,
      toNetwork: quote.settleNetwork,
      amount: quote.depositAmount,
    },
    base,
  });

  return normalizeShift(base);
}

export function getMockOrder(id: string) {
  const record = mockOrders.get(id);

  if (!record) {
    throw new Error("Mock order not found.");
  }

  return normalizeShift(deriveMockShift(record));
}

export function cancelMockOrder(id: string) {
  const record = mockOrders.get(id);

  if (!record) {
    throw new Error("Mock order not found.");
  }

  record.base = {
    ...record.base,
    status: "expired",
  };

  mockOrders.set(id, record);
}
