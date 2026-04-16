import contentWeightMatrixJson from "../../../data/seo/content-weight-matrix.json";
import destinationModifierMatrixJson from "../../../data/seo/destination-modifier-matrix.json";
import familyMatrixJson from "../../../data/seo/family-matrix.json";
import indexPolicyJson from "../../../data/seo/index-policy.json";
import internalLinkMatrixJson from "../../../data/seo/internal-link-matrix.json";
import networkTraitMatrixJson from "../../../data/seo/network-trait-matrix.json";
import sourceModifierMatrixJson from "../../../data/seo/source-modifier-matrix.json";
import {
  getDestinationModifier,
  getGenericDestinationTokenProfiles,
  getGenericNetworkProfile,
  getGenericNetworkTraits,
  getGenericPairFamily,
  getGenericSourceTokenProfiles,
  getGenericTokenProfile,
  getLegacyNetworkModifiers,
  getRoleMatchPenalty,
  getSourceModifier,
} from "@/lib/pairs/genericTaxonomy";
import type {
  DestinationModifier,
  NetworkTrait,
  PairIndexTier,
  PairPageFaq,
  PairPageSeed,
  PairPageSpec,
  SeoTokenRole,
  SourceModifier,
  TokenPriority,
} from "@/lib/pairs/types";

type FamilyMatrixEntry = {
  titlePatterns: string[];
  metaPatterns: string[];
  introAngles: string[];
  useCaseAngles: string[];
  warningAngles: string[];
  faqTemplates: Array<{
    question: string;
    answer: string;
  }>;
  indexBias: string;
};

type ModifierMatrixEntry = {
  introSnippets: string[];
  useCaseSnippets: string[];
};

type NetworkTraitMatrixEntry = {
  noteTemplates: string[];
  faqTemplates: Array<{
    question: string;
    answer: string;
  }>;
};

type ContentWeightEntry = {
  networkNotes: number;
  faqCount: number;
};

type InternalLinkEntry = {
  reverse: number;
  sameSource: number;
  sameDestination: number;
  sameFamily: number;
};

type IndexPolicy = {
  weights: {
    tokenPriority: number;
    familyValue: number;
    searchValue: number;
    trustValue: number;
    overlapRisk: number;
  };
  tierThresholds: Record<Exclude<PairIndexTier, "D">, number>;
  familyScores: Record<string, number>;
  roleScores: Record<string, number>;
  trustScores: Record<string, number>;
  overlapPenalties: Record<string, number>;
};

type GenericBuildContext = {
  slug: string;
  seed: PairPageSeed;
  fromProfile: ReturnType<typeof getGenericTokenProfile>;
  toProfile: ReturnType<typeof getGenericTokenProfile>;
  family: PairPageSpec["pairIntentType"];
  sourceModifier: SourceModifier;
  destinationModifier: DestinationModifier;
  networkTraits: NetworkTrait[];
  fromNetworkProfile: ReturnType<typeof getGenericNetworkProfile>;
  toNetworkProfile: ReturnType<typeof getGenericNetworkProfile>;
};

const familyMatrix = familyMatrixJson as Record<string, FamilyMatrixEntry>;
const sourceModifierMatrix = sourceModifierMatrixJson as Record<string, ModifierMatrixEntry>;
const destinationModifierMatrix =
  destinationModifierMatrixJson as Record<string, ModifierMatrixEntry>;
const networkTraitMatrix = networkTraitMatrixJson as Record<string, NetworkTraitMatrixEntry>;
const contentWeightMatrix = contentWeightMatrixJson as Record<string, ContentWeightEntry>;
const internalLinkMatrix = internalLinkMatrixJson as Record<string, InternalLinkEntry>;
const indexPolicy = indexPolicyJson as IndexPolicy;

const sourceProfiles = getGenericSourceTokenProfiles();
const destinationProfiles = getGenericDestinationTokenProfiles();
const sourceProfilesByRole = groupProfilesByRole(sourceProfiles);
const destinationProfilesByRole = groupProfilesByRole(destinationProfiles);

function groupProfilesByRole<T extends { seoRole: SeoTokenRole }>(profiles: T[]) {
  return profiles.reduce<Record<SeoTokenRole, T[]>>(
    (acc, profile) => {
      acc[profile.seoRole].push(profile);
      return acc;
    },
    {
      btc: [],
      stable: [],
      topcoin: [],
      meme: [],
      wrapped_btc: [],
      other: [],
    },
  );
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function buildGenericPairSlug(fromToken: string, toToken: string) {
  return `${fromToken.trim().toLowerCase()}-to-${toToken.trim().toLowerCase()}`;
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function hashKey(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return Math.abs(hash);
}

function pickVariant(values: string[], key: string, fallback: string) {
  if (!values.length) {
    return fallback;
  }

  return values[hashKey(key) % values.length];
}

function renderTemplate(template: string, context: GenericBuildContext) {
  return template
    .replaceAll("{fromLabel}", context.seed.fromLabel)
    .replaceAll("{toLabel}", context.seed.toLabel)
    .replaceAll("{fromNetworkLabel}", context.seed.fromNetworkLabel)
    .replaceAll("{toNetworkLabel}", context.seed.toNetworkLabel)
    .replaceAll("{fromNetworkId}", context.seed.builderPreset.fromNetwork)
    .replaceAll("{toNetworkId}", context.seed.builderPreset.toNetwork);
}

function getPriorityWeight(priority: TokenPriority) {
  switch (priority) {
    case "high":
      return 100;
    case "medium":
      return 72;
    default:
      return 42;
  }
}

function getRoleWeight(role: SeoTokenRole) {
  return indexPolicy.roleScores[role] || 40;
}

function getFamilyEntry(family: string) {
  return familyMatrix[family] || familyMatrix.other;
}

function getWeightEntry(family: string) {
  return contentWeightMatrix[family] || contentWeightMatrix.other;
}

function getInternalLinkEntry(family: string) {
  return internalLinkMatrix[family] || internalLinkMatrix.other;
}

function getTopProfilesForRole(role: SeoTokenRole, direction: "source" | "destination") {
  return direction === "source" ? sourceProfilesByRole[role] : destinationProfilesByRole[role];
}

function isRenderableGenericDirection(fromToken: string, toToken: string) {
  if (normalizeSymbol(fromToken) === normalizeSymbol(toToken)) {
    return false;
  }

  const fromProfile = getGenericTokenProfile(fromToken);
  const toProfile = getGenericTokenProfile(toToken);
  return fromProfile.depositReady && toProfile.settleReady;
}

function pushRelatedSlug(
  target: string[],
  slug: string,
  currentSlug: string,
  limit: number,
) {
  if (!slug || slug === currentSlug || target.length >= limit || target.includes(slug)) {
    return;
  }

  target.push(slug);
}

function sortCandidateProfiles(currentSymbol: string, currentRole: SeoTokenRole, profiles: typeof sourceProfiles) {
  return [...profiles]
    .filter((profile) => normalizeSymbol(profile.symbol) !== normalizeSymbol(currentSymbol))
    .sort((a, b) => {
      const roleBoostA = a.seoRole === currentRole ? -10 : 0;
      const roleBoostB = b.seoRole === currentRole ? -10 : 0;
      const scoreA = getPriorityWeight(a.priority) + getRoleWeight(a.seoRole) + roleBoostA;
      const scoreB = getPriorityWeight(b.priority) + getRoleWeight(b.seoRole) + roleBoostB;

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return a.symbol.localeCompare(b.symbol, "en");
    });
}

function buildRelatedSlugs(context: GenericBuildContext) {
  const rules = getInternalLinkEntry(context.family);
  const currentSlug = context.slug;
  const related: string[] = [];
  const reverseSlug = buildGenericPairSlug(context.seed.toLabel, context.seed.fromLabel);

  if (isRenderableGenericDirection(context.seed.toLabel, context.seed.fromLabel)) {
    pushRelatedSlug(related, reverseSlug, currentSlug, 16);
  }

  const sameSourceCandidates = sortCandidateProfiles(
    context.seed.toLabel,
    context.toProfile.seoRole,
    destinationProfiles,
  )
    .filter((profile) =>
      isRenderableGenericDirection(context.seed.fromLabel, profile.symbol),
    )
    .slice(0, rules.sameSource + 4);

  for (const candidate of sameSourceCandidates) {
    pushRelatedSlug(
      related,
      buildGenericPairSlug(context.seed.fromLabel, candidate.symbol),
      currentSlug,
      16,
    );
    if (related.length >= 1 + rules.sameSource) {
      break;
    }
  }

  const sameDestinationCandidates = sortCandidateProfiles(
    context.seed.fromLabel,
    context.fromProfile.seoRole,
    sourceProfiles,
  )
    .filter((profile) =>
      isRenderableGenericDirection(profile.symbol, context.seed.toLabel),
    )
    .slice(0, rules.sameDestination + 4);

  for (const candidate of sameDestinationCandidates) {
    pushRelatedSlug(
      related,
      buildGenericPairSlug(candidate.symbol, context.seed.toLabel),
      currentSlug,
      16,
    );
    if (related.length >= 1 + rules.sameSource + rules.sameDestination) {
      break;
    }
  }

  const sameFamilyDestinations = getTopProfilesForRole(context.toProfile.seoRole, "destination")
    .filter((profile) =>
      isRenderableGenericDirection(context.seed.fromLabel, profile.symbol),
    )
    .slice(0, rules.sameFamily + 3);

  for (const candidate of sameFamilyDestinations) {
    const slug = buildGenericPairSlug(context.seed.fromLabel, candidate.symbol);
    const family = getGenericPairFamily(context.fromProfile.seoRole, candidate.seoRole);

    if (family === context.family) {
      pushRelatedSlug(related, slug, currentSlug, 16);
    }
  }

  if (related.length < rules.reverse + rules.sameSource + rules.sameDestination + rules.sameFamily) {
    const sameFamilySources = getTopProfilesForRole(context.fromProfile.seoRole, "source")
      .filter((profile) =>
        isRenderableGenericDirection(profile.symbol, context.seed.toLabel),
      )
      .slice(0, rules.sameFamily + 3);

    for (const candidate of sameFamilySources) {
      const slug = buildGenericPairSlug(candidate.symbol, context.seed.toLabel);
      const family = getGenericPairFamily(candidate.seoRole, context.toProfile.seoRole);

      if (family === context.family) {
        pushRelatedSlug(related, slug, currentSlug, 16);
      }
    }
  }

  return related.slice(0, 8);
}

function buildHowItWorks(context: GenericBuildContext) {
  return [
    `Choose ${context.seed.fromLabel} as the asset you send and ${context.seed.toLabel} as the asset you receive.`,
    `Confirm the route starts on ${context.seed.fromNetworkLabel} and settles on ${context.seed.toNetworkLabel} before creating the shift.`,
    `Enter a ${context.seed.toLabel} receiving wallet that matches the destination network exactly.`,
    `Create the shift, follow the deposit instructions, and track settlement until ${context.seed.toLabel} lands on the destination side.`,
  ];
}

function buildEtaNote(context: GenericBuildContext) {
  if (context.networkTraits.includes("confirmation_sensitive")) {
    return `Timing depends on deposit detection, route processing, and confirmation-sensitive settlement before ${context.seed.toLabel} lands on ${context.seed.toNetworkLabel}.`;
  }

  if (context.networkTraits.includes("memo_sensitive")) {
    return `Timing is still provider-driven, but memo-aware routing and final settlement details on ${context.seed.toNetworkLabel} can affect completion time.`;
  }

  return `Timing depends on deposit detection, provider routing, and final settlement on ${context.seed.toNetworkLabel}.`;
}

function buildMinMaxNote(context: GenericBuildContext) {
  if (context.toProfile.seoRole === "stable") {
    return `The live minimum and maximum still depend on the exact route, even when the destination lands in stable value.`;
  }

  if (context.toProfile.seoRole === "meme") {
    return `Minimums and maximums are route-specific, and higher-volatility destinations should always be checked again on the live shift page before sending funds.`;
  }

  return `Minimums and maximums are route-specific, so the builder and final shift page remain the source of truth before funds are sent.`;
}

function buildNetworkNotes(context: GenericBuildContext) {
  const familyEntry = getFamilyEntry(context.family);
  const weightEntry = getWeightEntry(context.family);
  const sourceEntry = sourceModifierMatrix[context.sourceModifier];
  const destinationEntry = destinationModifierMatrix[context.destinationModifier];
  const notes = uniqueStrings([
    renderTemplate(
      pickVariant(
        familyEntry.warningAngles,
        `${context.slug}:family-warning`,
        familyEntry.warningAngles[0] || "",
      ),
      context,
    ),
    ...context.networkTraits.map((trait) =>
      renderTemplate(
        pickVariant(
          networkTraitMatrix[trait]?.noteTemplates || [],
          `${context.slug}:${trait}:note`,
          "",
        ),
        context,
      ),
    ),
    renderTemplate(
      pickVariant(
        sourceEntry?.useCaseSnippets || [],
        `${context.slug}:source-note`,
        "",
      ),
      context,
    ),
    renderTemplate(
      pickVariant(
        destinationEntry?.useCaseSnippets || [],
        `${context.slug}:destination-note`,
        "",
      ),
      context,
    ),
    context.fromNetworkProfile.bestFor.length
      ? `${context.seed.fromNetworkLabel} is commonly used for ${context.fromNetworkProfile.bestFor[0].toLowerCase()}.`
      : "",
    context.toNetworkProfile.bestFor.length
      ? `${context.seed.toNetworkLabel} is commonly used for ${context.toNetworkProfile.bestFor[0].toLowerCase()} after settlement.`
      : "",
    ...(context.seed.extraNotes || []),
  ]);

  return notes.slice(0, weightEntry.networkNotes);
}

function buildFaqs(context: GenericBuildContext): PairPageFaq[] {
  const familyEntry = getFamilyEntry(context.family);
  const weightEntry = getWeightEntry(context.family);
  const baseFaqs = familyEntry.faqTemplates.map((faq, index) => ({
    question: renderTemplate(faq.question, context),
    answer: renderTemplate(faq.answer, context),
    order: index,
  }));
  const traitFaqs = context.networkTraits
    .map((trait, index) => {
      const template = networkTraitMatrix[trait]?.faqTemplates?.[0];
      if (!template) {
        return null;
      }

      return {
        question: renderTemplate(template.question, context),
        answer: renderTemplate(template.answer, context),
        order: 100 + index,
      };
    })
    .filter((faq): faq is { question: string; answer: string; order: number } => Boolean(faq));

  const fallbackFaqs: Array<{ question: string; answer: string; order: number }> = [
    {
      question: `How long does ${context.seed.fromLabel} to ${context.seed.toLabel} usually take?`,
      answer: buildEtaNote(context),
      order: 200,
    },
    {
      question: `What is the minimum ${context.seed.fromLabel} to ${context.seed.toLabel} shift amount?`,
      answer: buildMinMaxNote(context),
      order: 201,
    },
    {
      question: `Do I need a ${context.seed.toLabel} wallet before opening this route?`,
      answer: `Yes. You should have a ${context.seed.toLabel} receiving wallet that matches ${context.seed.toNetworkLabel} before the shift is created.`,
      order: 202,
    },
    {
      question: `What should I verify before sending ${context.seed.fromLabel}?`,
      answer: `Verify the selected pair, the destination wallet, and the exact send and receive networks shown in the builder before sending funds.`,
      order: 203,
    },
  ];

  return [...baseFaqs, ...traitFaqs, ...fallbackFaqs]
    .sort((a, b) => a.order - b.order)
    .slice(0, weightEntry.faqCount)
    .map(({ question, answer }) => ({ question, answer }));
}

function buildIndexability(
  context: GenericBuildContext,
  relatedSlugs: string[],
  title: string,
  description: string,
  h1: string,
  networkNotes: string[],
  faqs: PairPageFaq[],
) {
  const hardGateOtherFamily = context.family === "other";
  const priorityScore = Math.round(
    (getPriorityWeight(context.fromProfile.priority) +
      getPriorityWeight(context.toProfile.priority)) /
      2,
  );
  const familyValue = indexPolicy.familyScores[context.family] || indexPolicy.familyScores.other;
  const searchValue = Math.round(
    (getRoleWeight(context.fromProfile.seoRole) +
      getRoleWeight(context.toProfile.seoRole)) /
      2,
  );
  const trustValue =
    indexPolicy.trustScores[context.destinationModifier] ||
    indexPolicy.trustScores.other_destination;
  const overlapRisk =
    getRoleMatchPenalty(context.fromProfile.seoRole, context.toProfile.seoRole) *
      indexPolicy.overlapPenalties.sameRolePair +
    (context.family === "other" ? indexPolicy.overlapPenalties.otherFamily : 0) +
    (context.toProfile.seoRole === "meme" ? indexPolicy.overlapPenalties.memeDestination : 0) +
    (context.fromProfile.seoRole === "wrapped_btc" ||
    context.toProfile.seoRole === "wrapped_btc"
      ? indexPolicy.overlapPenalties.wrappedBtcRoute
      : 0);

  const weightedScore = Math.round(
    priorityScore * indexPolicy.weights.tokenPriority +
      familyValue * indexPolicy.weights.familyValue +
      searchValue * indexPolicy.weights.searchValue +
      trustValue * indexPolicy.weights.trustValue +
      overlapRisk * indexPolicy.weights.overlapRisk,
  );

  let tier: PairIndexTier = "D";
  if (!hardGateOtherFamily && weightedScore >= indexPolicy.tierThresholds.A) {
    tier = "A";
  } else if (!hardGateOtherFamily && weightedScore >= indexPolicy.tierThresholds.B) {
    tier = "B";
  } else if (!hardGateOtherFamily && weightedScore >= indexPolicy.tierThresholds.C) {
    tier = "C";
  }

  const readyForIndex = !hardGateOtherFamily && (tier === "A" || tier === "B");
  const renderReady = Boolean(title && description && h1);
  const state =
    seedCanIndex(context.seed) && readyForIndex ? "index" : renderReady ? "noindex" : "skip";

  return {
    state,
    tier,
    launchRequested: Boolean(context.seed.indexable),
    readyForIndex,
    renderReady,
    breakdown: {
      intentStrength: familyValue,
      tokenPriority: Math.round(priorityScore / 5),
      networkSpecificity: Math.min(15, context.networkTraits.length * 3),
      contentDifferentiation: Math.min(20, networkNotes.length * 3 + faqs.length),
      internalLinkValue: Math.min(10, relatedSlugs.length + (relatedSlugs.length >= 5 ? 2 : 0)),
      metadataReadiness: title && description && h1 ? 5 : 0,
      total: weightedScore,
      familyValue,
      searchValue,
      trustValue,
      overlapRisk,
      weightedScore,
    },
    reasons: [
      `Generic 40k family: ${context.family}.`,
      `Source role: ${context.fromProfile.seoRole}; destination role: ${context.toProfile.seoRole}.`,
      hardGateOtherFamily
        ? "Other-family routes are forced to render-first and stay out of early index tiers."
        : `Assigned index tier ${tier} with weighted score ${weightedScore}.`,
      readyForIndex
        ? "Strong enough to join a future indexed launch tier."
        : "Kept renderable first and can move into index tiers later.",
    ],
  } satisfies PairPageSpec["indexability"];
}

function seedCanIndex(seed: PairPageSeed) {
  return Boolean(seed.indexable);
}

function buildContext(seed: PairPageSeed): GenericBuildContext {
  const fromProfile = getGenericTokenProfile(seed.fromLabel);
  const toProfile = getGenericTokenProfile(seed.toLabel);
  const family = getGenericPairFamily(fromProfile.seoRole, toProfile.seoRole);
  const sourceModifier = getSourceModifier(fromProfile.seoRole);
  const destinationModifier = getDestinationModifier(toProfile.seoRole);
  const networkTraits = getGenericNetworkTraits(
    seed.builderPreset.fromNetwork,
    seed.builderPreset.toNetwork,
  );

  return {
    slug: seed.slug,
    seed,
    fromProfile,
    toProfile,
    family,
    sourceModifier,
    destinationModifier,
    networkTraits,
    fromNetworkProfile: getGenericNetworkProfile(seed.builderPreset.fromNetwork),
    toNetworkProfile: getGenericNetworkProfile(seed.builderPreset.toNetwork),
  };
}

export function buildGenericPairPageSpec(seed: PairPageSeed): PairPageSpec {
  const context = buildContext(seed);
  const familyEntry = getFamilyEntry(context.family);
  const sourceEntry = sourceModifierMatrix[context.sourceModifier];
  const destinationEntry = destinationModifierMatrix[context.destinationModifier];
  const title = renderTemplate(
    pickVariant(familyEntry.titlePatterns, `${context.slug}:title`, familyEntry.titlePatterns[0]),
    context,
  );
  const description = renderTemplate(
    pickVariant(
      familyEntry.metaPatterns,
      `${context.slug}:description`,
      familyEntry.metaPatterns[0],
    ),
    context,
  );
  const intro = uniqueStrings([
    renderTemplate(
      pickVariant(
        familyEntry.introAngles,
        `${context.slug}:intro-family`,
        familyEntry.introAngles[0],
      ),
      context,
    ),
    renderTemplate(
      pickVariant(
        sourceEntry?.introSnippets || [],
        `${context.slug}:intro-source`,
        "",
      ),
      context,
    ),
    renderTemplate(
      pickVariant(
        destinationEntry?.introSnippets || [],
        `${context.slug}:intro-destination`,
        "",
      ),
      context,
    ),
  ]).join(" ");
  const useCase = uniqueStrings([
    renderTemplate(
      pickVariant(
        familyEntry.useCaseAngles,
        `${context.slug}:use-case-family`,
        familyEntry.useCaseAngles[0],
      ),
      context,
    ),
    renderTemplate(
      pickVariant(
        sourceEntry?.useCaseSnippets || [],
        `${context.slug}:use-case-source`,
        "",
      ),
      context,
    ),
    renderTemplate(
      pickVariant(
        destinationEntry?.useCaseSnippets || [],
        `${context.slug}:use-case-destination`,
        "",
      ),
      context,
    ),
  ]).join(" ");
  const relatedSlugs = buildRelatedSlugs(context);
  const etaNote = buildEtaNote(context);
  const minMaxNote = buildMinMaxNote(context);
  const networkNotes = buildNetworkNotes(context);
  const faqs = buildFaqs(context);
  const h1 = `Swap ${seed.fromLabel} to ${seed.toLabel}`;
  const indexability = buildIndexability(
    context,
    relatedSlugs,
    title,
    description,
    h1,
    networkNotes,
    faqs,
  );

  return {
    ...seed,
    relatedSlugs,
    indexable: indexability.state === "index",
    fromCategory: context.fromProfile.category,
    toCategory: context.toProfile.category,
    pairIntentType: context.family,
    templateFamily: context.family,
    networkModifiers: getLegacyNetworkModifiers(
      seed.builderPreset.fromNetwork,
      seed.builderPreset.toNetwork,
      context.networkTraits,
    ),
    fromSeoRole: context.fromProfile.seoRole,
    toSeoRole: context.toProfile.seoRole,
    sourceModifier: context.sourceModifier,
    destinationModifier: context.destinationModifier,
    networkTraits: context.networkTraits,
    title,
    description,
    h1,
    intro,
    useCase,
    etaNote,
    minMaxNote,
    howItWorks: buildHowItWorks(context),
    networkNotes,
    faqs,
    indexability,
  };
}
