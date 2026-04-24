import { getTokenCatalogEntry } from "@/lib/pairs/classify";
import type {
  PairClassification,
  PairIndexState,
  PairIndexabilityEvaluation,
  PairPageFaq,
  PairPageSeed,
  PairTemplateFamily,
  TokenPriority,
} from "@/lib/pairs/types";

type IndexabilityInput = {
  seed: PairPageSeed;
  classification: PairClassification;
  title: string;
  description: string;
  h1: string;
  howItWorks: string[];
  networkNotes: string[];
  faqs: PairPageFaq[];
};

const PRIORITY_SCORE: Record<TokenPriority, number> = {
  high: 10,
  medium: 7,
  low: 4,
};

function getIntentStrengthScore(templateFamily: PairTemplateFamily) {
  switch (templateFamily) {
    case "stable_network_specific_to_btc":
      return 30;
    case "stable_to_btc":
      return 28;
    case "stable_to_stable":
      return 24;
    case "btc_to_stable":
      return 27;
    case "btc_to_alt":
      return 26;
    case "alt_to_btc":
      return 24;
    case "stable_to_alt":
      return 22;
    case "alt_to_stable":
      return 21;
    case "alt_to_alt":
      return 16;
    default:
      return 8;
  }
}

function getTokenPriorityScore(seed: PairPageSeed) {
  const fromEntry = getTokenCatalogEntry(seed.fromLabel);
  const toEntry = getTokenCatalogEntry(seed.toLabel);

  return Math.min(
    20,
    PRIORITY_SCORE[fromEntry.priority] + PRIORITY_SCORE[toEntry.priority],
  );
}

function getNetworkSpecificityScore(input: IndexabilityInput) {
  const { seed, classification } = input;

  let score = 0;

  if (classification.templateFamily === "stable_network_specific_to_btc") {
    score += 8;
  }

  if (classification.networkModifiers.includes("network_variant")) {
    score += 3;
  }

  if (classification.networkModifiers.includes("stablecoin_network_sensitive")) {
    score += 2;
  }

  if (classification.networkModifiers.includes("bitcoin_confirmation_sensitive")) {
    score += 1;
  }

  if (classification.networkModifiers.includes("low_fee_route")) {
    score += 1;
  }

  if (seed.builderPreset.fromNetwork !== seed.builderPreset.toNetwork) {
    score += 1;
  }

  return Math.min(15, score);
}

function getContentDifferentiationScore(input: IndexabilityInput) {
  const { classification, howItWorks, networkNotes, faqs } = input;

  let score = 0;

  if (classification.pairIntentType !== "other") {
    score += 4;
  }

  if (classification.templateFamily !== "other") {
    score += 4;
  }

  if (howItWorks.length >= 4) {
    score += 3;
  }

  if (networkNotes.length >= 3) {
    score += 5;
  } else if (networkNotes.length >= 2) {
    score += 3;
  }

  if (faqs.length >= 5) {
    score += 4;
  } else if (faqs.length >= 4) {
    score += 3;
  }

  return Math.min(20, score);
}

function getInternalLinkValueScore(seed: PairPageSeed) {
  const relatedSlugs = seed.relatedSlugs || [];
  const uniqueRelated = new Set(relatedSlugs);
  let score = 0;

  if (uniqueRelated.size >= 4) {
    score += 6;
  } else if (uniqueRelated.size >= 3) {
    score += 4;
  }

  const reverseSlug = `${seed.toLabel.trim().toLowerCase()}-to-${seed.fromLabel
    .trim()
    .toLowerCase()}`;
  if (relatedSlugs.some((slug) => slug.includes(reverseSlug))) {
    score += 2;
  } else {
    score += 1;
  }

  score += 2;

  return Math.min(10, score);
}

function getMetadataReadinessScore(input: IndexabilityInput) {
  const { title, description, h1 } = input;

  if (title && description && h1) {
    return 5;
  }

  return 0;
}

function buildReasons(
  input: IndexabilityInput,
  total: number,
  readyForIndex: boolean,
  renderReady: boolean,
): string[] {
  const { seed, classification, networkNotes, faqs } = input;
  const reasons: string[] = [];

  reasons.push(`Template family: ${classification.templateFamily}.`);

  if (classification.templateFamily === "stable_network_specific_to_btc") {
    reasons.push(
      `Strong launch candidate because ${seed.fromLabel} uses a network-specific stablecoin route into native BTC.`,
    );
  }

  if (classification.networkModifiers.includes("stablecoin_network_sensitive")) {
    reasons.push("Includes network-sensitive stablecoin routing copy.");
  }

  if (networkNotes.length >= 3) {
    reasons.push("Has enough route-specific notes to avoid generic copy.");
  }

  if (faqs.length >= 4) {
    reasons.push("Has a full FAQ block for pair intent and route safety.");
  }

  if (readyForIndex) {
    reasons.push(`Launch-ready with score ${total}.`);
  } else if (renderReady) {
    reasons.push(`Render-ready but not strong enough to index yet (score ${total}).`);
  } else {
    reasons.push(`Below launch threshold and should stay out of generation for now (score ${total}).`);
  }

  return reasons;
}

export function evaluatePairIndexability(
  input: IndexabilityInput,
): PairIndexabilityEvaluation {
  const { seed, classification, howItWorks, networkNotes, faqs, title, description, h1 } =
    input;

  const intentStrength = getIntentStrengthScore(classification.templateFamily);
  const tokenPriority = getTokenPriorityScore(seed);
  const networkSpecificity = getNetworkSpecificityScore(input);
  const contentDifferentiation = getContentDifferentiationScore(input);
  const internalLinkValue = getInternalLinkValueScore(seed);
  const metadataReadiness = getMetadataReadinessScore(input);
  const total =
    intentStrength +
    tokenPriority +
    networkSpecificity +
    contentDifferentiation +
    internalLinkValue +
    metadataReadiness;

  const hasStrongClassification =
    classification.pairIntentType !== "other" &&
    classification.templateFamily !== "other";
  const hasCoreContent =
    howItWorks.length >= 4 &&
    networkNotes.length >= 2 &&
    faqs.length >= 4 &&
    Boolean(title && description && h1);
  const hasInternalLinks = new Set(seed.relatedSlugs || []).size >= 3;
  const hasQualifiedToken =
    getTokenCatalogEntry(seed.fromLabel).priority === "high" ||
    getTokenCatalogEntry(seed.toLabel).priority === "high" ||
    classification.fromCategory === "stable" ||
    classification.toCategory === "stable" ||
    classification.fromCategory === "btc" ||
    classification.toCategory === "btc";

  const readyForIndex =
    hasStrongClassification &&
    hasCoreContent &&
    hasInternalLinks &&
    hasQualifiedToken &&
    total >= 75;
  const renderReady =
    hasStrongClassification && hasCoreContent && total >= 55;

  let state: PairIndexState;
  if (readyForIndex && seed.indexable) {
    state = "index";
  } else if (renderReady) {
    state = "noindex";
  } else {
    state = "skip";
  }

  return {
    state,
    launchRequested: Boolean(seed.indexable),
    readyForIndex,
    renderReady,
    breakdown: {
      intentStrength,
      tokenPriority,
      networkSpecificity,
      contentDifferentiation,
      internalLinkValue,
      metadataReadiness,
      total,
    },
    reasons: buildReasons(input, total, readyForIndex, renderReady),
  };
}
