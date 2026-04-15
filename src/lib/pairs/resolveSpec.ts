import {
  formatAssetNetworkLabel,
  getAssetBySymbol,
  getCanonicalNetworkSlug,
  pickPreferredAssetNetwork,
} from "@/lib/pairs/assets";
import { getTokenCatalogEntry } from "@/lib/pairs/classify";
import { buildPairPageSpec } from "@/lib/pairs/pairCopy";
import { parsePairSlug } from "@/lib/pairs/parsePairSlug";
import { getPairPageSpec as getCuratedPairPageSpec } from "@/lib/pairs/registry";
import type {
  PairPageSeed,
  PairPageSpec,
  ParsedPairSlug,
  TokenCategory,
  TokenPriority,
} from "@/lib/pairs/types";
import type { SwapAssetOption, SwapNetworkOption } from "@/lib/sideshift/types";

const TOKEN_PRIORITY_WEIGHT: Record<TokenPriority, number> = {
  high: 18,
  medium: 12,
  low: 6,
};

const TOKEN_CATEGORY_WEIGHT: Record<TokenCategory, number> = {
  btc: 12,
  stable: 10,
  layer1: 8,
  layer2: 6,
  meme: 4,
  defi: 5,
  exchange: 5,
  gaming: 3,
  other: 2,
};

type ResolvedPairContext = {
  parsed: ParsedPairSlug;
  fromAsset: SwapAssetOption;
  toAsset: SwapAssetOption;
  fromNetwork: SwapNetworkOption;
  toNetwork: SwapNetworkOption;
  canonicalSlug: string;
  hasExplicitFromNetwork: boolean;
  hasExplicitToNetwork: boolean;
};

function normalizeSlugPart(value: string) {
  return value.trim().toLowerCase();
}

function buildCanonicalSlugSide(
  asset: SwapAssetOption,
  network: SwapNetworkOption,
  hasExplicitNetwork: boolean,
) {
  const base = normalizeSlugPart(asset.coin);
  const shouldIncludeNetwork = hasExplicitNetwork && asset.networks.length > 1;

  if (!shouldIncludeNetwork) {
    return base;
  }

  return `${base}-${getCanonicalNetworkSlug(network.id)}`;
}

function buildCanonicalSlug(context: Omit<ResolvedPairContext, "canonicalSlug">) {
  return `${buildCanonicalSlugSide(
    context.fromAsset,
    context.fromNetwork,
    context.hasExplicitFromNetwork,
  )}-to-${buildCanonicalSlugSide(
    context.toAsset,
    context.toNetwork,
    context.hasExplicitToNetwork,
  )}`;
}

function buildDynamicRelatedSlugs(context: ResolvedPairContext) {
  const related = new Set<string>();
  const currentSlug = context.canonicalSlug;
  const fromBase = normalizeSlugPart(context.fromAsset.coin);
  const toBase = normalizeSlugPart(context.toAsset.coin);
  const reverseSlug = `${buildCanonicalSlugSide(
    context.toAsset,
    context.toNetwork,
    context.hasExplicitToNetwork,
  )}-to-${buildCanonicalSlugSide(
    context.fromAsset,
    context.fromNetwork,
    context.hasExplicitFromNetwork,
  )}`;

  related.add(reverseSlug);

  if (fromBase !== "btc") {
    related.add(`${fromBase}-to-btc`);
  }

  if (toBase !== "btc") {
    related.add(`btc-to-${toBase}`);
  }

  if (fromBase !== "usdt") {
    related.add(`${fromBase}-to-usdt`);
  }

  if (toBase !== "usdt") {
    related.add(`usdt-to-${toBase}`);
  }

  return [...related].filter((slug) => slug !== currentSlug);
}

function getDynamicPriorityScore(
  fromToken: string,
  toToken: string,
  hasExplicitFromNetwork: boolean,
  hasExplicitToNetwork: boolean,
) {
  const fromEntry = getTokenCatalogEntry(fromToken);
  const toEntry = getTokenCatalogEntry(toToken);
  const priorityWeight =
    TOKEN_PRIORITY_WEIGHT[fromEntry.priority] +
    TOKEN_PRIORITY_WEIGHT[toEntry.priority];
  const categoryWeight = Math.round(
    (TOKEN_CATEGORY_WEIGHT[fromEntry.category] +
      TOKEN_CATEGORY_WEIGHT[toEntry.category]) /
      2,
  );
  const networkVariantBonus =
    hasExplicitFromNetwork || hasExplicitToNetwork ? 6 : 0;

  return Math.min(79, 20 + priorityWeight + categoryWeight + networkVariantBonus);
}

function resolvePairContext(parsed: ParsedPairSlug): ResolvedPairContext | null {
  const fromAsset = getAssetBySymbol(parsed.fromToken);
  const toAsset = getAssetBySymbol(parsed.toToken);

  if (!fromAsset || !toAsset) {
    return null;
  }

  const fromNetwork = pickPreferredAssetNetwork(
    fromAsset,
    parsed.fromNetwork,
    "deposit",
  );
  const toNetwork = pickPreferredAssetNetwork(
    toAsset,
    parsed.toNetwork,
    "settle",
  );

  if (!fromNetwork || !toNetwork) {
    return null;
  }

  if (
    fromAsset.coin.trim().toUpperCase() === toAsset.coin.trim().toUpperCase() &&
    fromNetwork.id.trim().toLowerCase() === toNetwork.id.trim().toLowerCase()
  ) {
    return null;
  }

  const baseContext = {
    parsed,
    fromAsset,
    toAsset,
    fromNetwork,
    toNetwork,
    hasExplicitFromNetwork: Boolean(parsed.fromNetwork),
    hasExplicitToNetwork: Boolean(parsed.toNetwork),
  };

  return {
    ...baseContext,
    canonicalSlug: buildCanonicalSlug(baseContext),
  };
}

function buildDynamicPairSeed(context: ResolvedPairContext): PairPageSeed {
  return {
    slug: context.canonicalSlug,
    fromLabel: context.fromAsset.coin,
    toLabel: context.toAsset.coin,
    fromNetworkLabel: formatAssetNetworkLabel(
      context.fromNetwork,
      context.hasExplicitFromNetwork,
    ),
    toNetworkLabel: formatAssetNetworkLabel(
      context.toNetwork,
      context.hasExplicitToNetwork,
    ),
    builderPreset: {
      fromCoin: context.fromAsset.coin,
      fromNetwork: context.fromNetwork.id,
      toCoin: context.toAsset.coin,
      toNetwork: context.toNetwork.id,
    },
    relatedSlugs: buildDynamicRelatedSlugs(context),
    priorityScore: getDynamicPriorityScore(
      context.fromAsset.coin,
      context.toAsset.coin,
      context.hasExplicitFromNetwork,
      context.hasExplicitToNetwork,
    ),
    indexable: false,
  };
}

export function resolvePairPageSpec(slug: string): PairPageSpec | null {
  const normalizedSlug = slug.trim().toLowerCase();
  const curatedSpec = getCuratedPairPageSpec(normalizedSlug);

  if (curatedSpec) {
    return curatedSpec;
  }

  const parsed = parsePairSlug(normalizedSlug);
  if (!parsed) {
    return null;
  }

  const context = resolvePairContext(parsed);
  if (!context) {
    return null;
  }

  const canonicalCuratedSpec = getCuratedPairPageSpec(context.canonicalSlug);
  if (canonicalCuratedSpec) {
    return canonicalCuratedSpec;
  }

  const spec = buildPairPageSpec(buildDynamicPairSeed(context));

  if (spec.indexability.state === "skip") {
    return null;
  }

  return spec;
}
