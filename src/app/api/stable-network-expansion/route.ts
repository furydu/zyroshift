import {
  getStableNetworkExpansionItems,
  getStableNetworkExpansionSummary,
  type StableNetworkExpansionFamily,
} from "@/lib/pairs/stableNetworkExpansion";
import { getStableNetworkRolloutStatus } from "@/lib/pairs/stableNetworkRollout";
import { NextRequest, NextResponse } from "next/server";

const VALID_FAMILIES = new Set<StableNetworkExpansionFamily>([
  "usdt-network-to-btc",
  "btc-to-usdt-network",
  "usdt-network-to-topcoin",
  "topcoin-to-usdt-network",
  "usdt-network-to-usdt-network",
  "usdc-network-to-btc",
  "btc-to-usdc-network",
  "usdc-network-to-topcoin",
  "topcoin-to-usdc-network",
  "usdc-network-to-usdc-network",
  "usdt-network-to-usdc-network",
  "usdc-network-to-usdt-network",
]);

function parseLimit(value: string | null) {
  if (!value) {
    return 40;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 40;
  }

  return Math.min(parsed, 500);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const family = url.searchParams.get("family")?.trim() as
    | StableNetworkExpansionFamily
    | undefined;

  if (family && VALID_FAMILIES.has(family)) {
    const items = getStableNetworkExpansionItems(limit, family);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      family,
      totalCount: getStableNetworkExpansionItems(undefined, family).length,
      returnedCount: items.length,
      items,
    });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: getStableNetworkExpansionSummary(),
    rollout: getStableNetworkRolloutStatus(),
    samples: {
      top: getStableNetworkExpansionItems(limit),
    },
  });
}
