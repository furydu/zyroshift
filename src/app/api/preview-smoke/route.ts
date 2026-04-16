import {
  extractUserIp,
  fetchCoinsAndPermissions,
  fetchQuote,
} from "@/lib/sideshift/client";
import { hasLiveSecrets } from "@/lib/sideshift/config";
import {
  getGenericRolloutStatus,
  isFrozenGoldPairSlug,
  isGenericPairIndexLaunchSlug,
  resolvePairPageSpec,
} from "@/lib/pairs";
import { NextRequest } from "next/server";

const GENERIC_SAMPLE_SLUGS = ["usdt-to-btc", "usdc-to-trump", "ada-to-btc"] as const;
const GOLD_SAMPLE_SLUGS = ["usdt-trc20-to-btc"] as const;

function buildPairSample(slug: string) {
  const spec = resolvePairPageSpec(slug);

  return {
    slug,
    resolved: Boolean(spec),
    canonicalSlug: spec?.slug || null,
    isGold: spec ? isFrozenGoldPairSlug(spec.slug) : false,
    shouldIndex: spec
      ? isFrozenGoldPairSlug(spec.slug) || isGenericPairIndexLaunchSlug(spec.slug)
      : false,
    title: spec?.title || null,
  };
}

export async function GET(request: NextRequest) {
  const userIp = extractUserIp(request.headers);
  const rollout = getGenericRolloutStatus();

  const result = {
    generatedAt: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || null,
      vercelEnv: process.env.VERCEL_ENV || null,
    },
    generic: {
      renderMode: rollout.renderMode,
      renderEnabled: rollout.renderEnabled,
      rolloutMode: rollout.mode,
      activeBuckets: rollout.activeBuckets,
      previewSafe: rollout.previewSafe,
      samples: GENERIC_SAMPLE_SLUGS.map((slug) => buildPairSample(slug)),
    },
    gold: {
      samples: GOLD_SAMPLE_SLUGS.map((slug) => buildPairSample(slug)),
    },
    sideshift: {
      hasLiveSecrets,
      coins: null as
        | {
            ok: boolean;
            assetCount: number;
            executionReady: boolean;
            mockMode: boolean;
          }
        | {
            ok: boolean;
            error: string;
          }
        | null,
      quote: null as
        | {
            ok: boolean;
            mockMode: boolean;
            rate: string | null;
            depositCoin: string | null;
            settleCoin: string | null;
          }
        | {
            ok: boolean;
            error: string;
          }
        | null,
    },
  };

  try {
    const coins = await fetchCoinsAndPermissions(userIp);
    result.sideshift.coins = {
      ok: true,
      assetCount: coins.assets.length,
      executionReady: coins.executionReady,
      mockMode: coins.mockMode,
    };
  } catch (error) {
    result.sideshift.coins = {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown coins check error",
    };
  }

  try {
    const quote = await fetchQuote(
      {
        fromCoin: "USDT",
        fromNetwork: "tron",
        toCoin: "BTC",
        toNetwork: "bitcoin",
      },
      userIp,
    );
    result.sideshift.quote = {
      ok: true,
      mockMode: quote.mockMode,
      rate: quote.quote.rate || null,
      depositCoin: quote.quote.depositCoin || null,
      settleCoin: quote.quote.settleCoin || null,
    };
  } catch (error) {
    result.sideshift.quote = {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown quote check error",
    };
  }

  return Response.json(result, { status: 200 });
}
