import { classifyPairSeed } from "@/lib/pairs/classify";
import { getPairClusterLinksForTemplateFamily } from "@/lib/pairs/clusterPages";
import {
  collectNoteRules,
  createPairCopyContext,
  getDescriptionFromMatrix,
  getIntentFaqFromMatrix,
  getIntroFromMatrix,
  getNetworkSafetyFaqFromMatrix,
  getTitleFromMatrix,
  getUseCaseFromMatrix,
  type PairCopyContext,
} from "@/lib/pairs/contentMatrix";
import { evaluatePairIndexability } from "@/lib/pairs/indexability";
import type {
  NetworkModifier,
  PairClassification,
  PairExploreLink,
  PairHeroBadge,
  PairPageFaq,
  PairPageSeed,
  PairPageSpec,
  PairTemplateFamily,
} from "@/lib/pairs/types";

function slugify(value: string) {
  return value.trim().toLowerCase();
}

function hasChainQualifier(networkLabel: string) {
  return /(TRC20|ERC20|BEP20|Base|Arbitrum|Polygon)/i.test(networkLabel);
}

function getDisplayTokenLabel(token: string, networkLabel: string) {
  if (!hasChainQualifier(networkLabel)) {
    return token;
  }

  const match = networkLabel.match(/TRC20|ERC20|BEP20|Base|Arbitrum|Polygon/i);
  return match ? `${token} ${match[0]}` : token;
}

function getRouteDisplayLabels(seed: PairPageSeed) {
  return {
    fromDisplay: getDisplayTokenLabel(seed.fromLabel, seed.fromNetworkLabel),
    toDisplay: getDisplayTokenLabel(seed.toLabel, seed.toNetworkLabel),
  };
}

function hasModifier(
  classification: PairClassification,
  modifier: NetworkModifier,
) {
  return classification.networkModifiers.includes(modifier);
}

function getTitle(copyContext: PairCopyContext) {
  return getTitleFromMatrix(copyContext);
}

function getDescription(copyContext: PairCopyContext) {
  return getDescriptionFromMatrix(copyContext);
}

function getIntro(copyContext: PairCopyContext) {
  const { seed } = copyContext;

  if (seed.overrides?.intro) {
    return seed.overrides.intro;
  }

  return getIntroFromMatrix(copyContext);
}

function getUseCase(copyContext: PairCopyContext) {
  const { seed } = copyContext;

  if (seed.overrides?.useCase) {
    return seed.overrides.useCase;
  }

  return getUseCaseFromMatrix(copyContext);
}

function getTemplateFamilyLabel(templateFamily: PairTemplateFamily) {
  switch (templateFamily) {
    case "stable_network_specific_to_btc":
      return "Stable network-specific to BTC";
    case "stable_to_btc":
      return "Stable to BTC";
    case "btc_to_stable":
      return "BTC to stable";
    case "stable_to_alt":
      return "Stable to alt";
    case "btc_to_alt":
      return "BTC to alt";
    case "alt_to_btc":
      return "Alt to BTC";
    case "alt_to_stable":
      return "Alt to stable";
    case "alt_to_alt":
      return "Alt to alt";
    default:
      return "General pair";
  }
}

function getEtaNote(seed: PairPageSeed, classification: PairClassification) {
  if (seed.overrides?.etaNote) {
    return seed.overrides.etaNote;
  }

  if (seed.builderPreset.fromNetwork === "bitcoin") {
    return `${seed.fromLabel} routes on Bitcoin depend on deposit detection and Bitcoin confirmation time before settlement can complete.`;
  }

  if (seed.builderPreset.toNetwork === "bitcoin") {
    return `Routes that settle into BTC still depend on source-chain deposit confirmation, provider routing, and final Bitcoin delivery timing before settlement is complete.`;
  }

  if (seed.builderPreset.fromNetwork === "ethereum") {
    return `${seed.fromLabel} routes on Ethereum depend on on-chain deposit confirmation, route processing, and final settlement timing on the destination side.`;
  }

  if (hasModifier(classification, "l2_exit")) {
    return `Routes that start on ${seed.fromNetworkLabel} can feel fast, but final timing still depends on provider routing and settlement on ${seed.toNetworkLabel}.`;
  }

  return `Processing time depends on deposit detection, blockchain confirmations, route processing, and final settlement on ${seed.toNetworkLabel}.`;
}

function getMinMaxNote(seed: PairPageSeed, classification: PairClassification) {
  if (seed.overrides?.minMaxNote) {
    return seed.overrides.minMaxNote;
  }

  if (classification.pairIntentType === "stable_to_btc") {
    return `The live minimum and maximum can move with routing and liquidity conditions, so the shift page should always be treated as the source of truth before you send funds.`;
  }

  if (seed.builderPreset.fromNetwork === "ethereum") {
    return `When the deposit asset starts on Ethereum, the transferred amount still needs to stay above the live minimum after network cost is considered.`;
  }

  if (
    classification.pairIntentType === "stable_to_alt" ||
    hasModifier(classification, "stablecoin_network_sensitive")
  ) {
    return `Even with a stablecoin deposit asset, live minimums and maximums still depend on the selected route and destination network, so confirm the range again on the shift page before sending funds.`;
  }

  return `Minimums and maximums are route-specific and provider-driven, so they should be checked on the builder and confirmed again on the shift page.`;
}

function getHowItWorks(seed: PairPageSeed, classification: PairClassification) {
  const depositStep = hasModifier(classification, "stablecoin_network_sensitive")
    ? `Create the shift, then send ${seed.fromLabel} on the exact ${seed.fromNetworkLabel} route shown on the shift page within the allowed deposit range.`
    : `Create the shift, then send ${seed.fromLabel} within the allowed deposit range shown on the shift page.`;

  return [
    `Choose ${seed.fromLabel} on ${seed.fromNetworkLabel} as the asset you send and ${seed.toLabel} on ${seed.toNetworkLabel} as the asset you receive.`,
    `Enter the ${seed.toLabel} receiving address before creating the shift so settlement has a defined destination.`,
    depositStep,
    `Track the route until ${seed.toLabel} settlement is completed on the dedicated status screen.`,
  ];
}

function getBaseNotes(copyContext: PairCopyContext) {
  return collectNoteRules(copyContext);
}

function getIntentFaq(copyContext: PairCopyContext): PairPageFaq {
  return getIntentFaqFromMatrix(copyContext);
}

function getNetworkSafetyFaq(copyContext: PairCopyContext): PairPageFaq | null {
  return getNetworkSafetyFaqFromMatrix(copyContext);
}

function getFaqs(copyContext: PairCopyContext): PairPageFaq[] {
  const { seed, routeName, classification } = copyContext;
  const safetyFaq = getNetworkSafetyFaq(copyContext);

  return [
    getIntentFaq(copyContext),
    {
      question: `What is the minimum ${routeName} swap amount?`,
      answer:
        "The minimum is provider-driven and route-specific. Always use the live builder and the shift page as the final source of truth before sending funds.",
    },
    {
      question: `How long does ${routeName} usually take?`,
      answer: getEtaNote(seed, classification),
    },
    {
      question: `What happens if I send less than the ${seed.fromLabel} minimum?`,
      answer:
        "Deposits below the allowed range can fail to settle normally and may require provider-side handling, so the live deposit rule should always be checked before sending.",
    },
    ...(safetyFaq ? [safetyFaq] : []),
    {
      question: `Do I need a ${seed.toLabel} wallet before swapping ${routeName}?`,
      answer: `Yes. You should have a compatible ${seed.toLabel} receiving address on ${seed.toNetworkLabel} before you create the shift, because settlement is sent to the exact destination you provide.`,
    },
  ];
}

export function buildPairPageSpec(seed: PairPageSeed): PairPageSpec {
  const { fromDisplay, toDisplay } = getRouteDisplayLabels(seed);
  const classification = classifyPairSeed(seed);
  const copyContext = createPairCopyContext(
    seed,
    classification,
    fromDisplay,
    toDisplay,
  );
  const title = getTitle(copyContext);
  const description = getDescription(copyContext);
  const intro = getIntro(copyContext);
  const useCase = getUseCase(copyContext);
  const etaNote = getEtaNote(seed, classification);
  const minMaxNote = getMinMaxNote(seed, classification);
  const networkNotes = [
    ...getBaseNotes(copyContext),
    ...(seed.extraNotes || []),
  ];
  const howItWorks = getHowItWorks(seed, classification);
  const faqs = getFaqs(copyContext);
  const indexability = evaluatePairIndexability({
    seed,
    classification,
    title,
    description,
    h1: `Swap ${fromDisplay} to ${toDisplay}`,
    howItWorks,
    networkNotes,
    faqs,
  });

  return {
    ...seed,
    indexable: indexability.state === "index",
    ...classification,
    title,
    description,
    h1: `Swap ${fromDisplay} to ${toDisplay}`,
    intro,
    useCase,
    etaNote,
    minMaxNote,
    howItWorks,
    networkNotes,
    faqs,
    indexability,
  };
}

export function getPairHeroBadges(spec: PairPageSpec): PairHeroBadge[] {
  return [
    { label: "Non-custodial", tone: "info" },
    { label: "Live route", tone: "warning" },
    {
      label:
        spec.networkModifiers.includes("same_chain")
          ? "Single-network aware"
          : "Network-aware routing",
      tone: "success",
    },
  ];
}

function isReverseRoute(current: PairPageSpec, related: PairPageSpec) {
  return (
    slugify(current.fromLabel) === slugify(related.toLabel) &&
    slugify(current.toLabel) === slugify(related.fromLabel)
  );
}

export function getRelatedRouteSummary(
  current: PairPageSpec,
  related: PairPageSpec,
) {
  if (isReverseRoute(current, related)) {
    return `Reverse the flow and move from ${related.fromLabel} back into ${related.toLabel} with the opposite route direction.`; 
  }

  if (
    current.templateFamily === "stable_network_specific_to_btc" &&
    related.toLabel === "BTC" &&
    related.fromLabel === current.fromLabel &&
    related.builderPreset.fromNetwork !== current.builderPreset.fromNetwork
  ) {
    return `Compare ${related.fromNetworkLabel} against ${current.fromNetworkLabel} when network cost and deposit compatibility matter for the same stablecoin-to-BTC path.`;
  }

  if (
    current.templateFamily === "stable_network_specific_to_btc" &&
    related.toLabel === "BTC" &&
    related.fromCategory === "stable"
  ) {
    return `Keep BTC as the destination while changing the stablecoin family, which is useful when wallet funding or preferred stable liquidity differs.`;
  }

  if (related.toLabel === "BTC") {
    return `Another route that still settles into BTC, with a different send asset or deposit network before Bitcoin delivery completes.`;
  }

  if (
    related.fromCategory === "stable" &&
    related.builderPreset.fromNetwork !== current.builderPreset.fromNetwork
  ) {
    return `Alternative stablecoin route with a different source network, useful for comparing cost, wallet support, and network-specific deposit behavior.`;
  }

  if (
    related.fromLabel === current.fromLabel &&
    related.toLabel !== current.toLabel
  ) {
    return `Use the same send asset but redirect value into a different destination asset and ecosystem.`;
  }

  if (
    related.toLabel === current.toLabel &&
    related.fromLabel !== current.fromLabel
  ) {
    return `Land in the same destination asset through a different source route, useful when the starting wallet or source network changes.`;
  }

  return related.useCase;
}

export function getPairRouteHighlights(spec: PairPageSpec) {
  return [
    {
      label: "Send",
      value: `${spec.fromLabel} on ${spec.fromNetworkLabel}`,
      detail:
        "The route starts with the exact deposit asset and network selected for this page.",
    },
    {
      label: "Receive",
      value: `${spec.toLabel} on ${spec.toNetworkLabel}`,
      detail:
        "Settlement is sent to the destination asset and network defined by this route.",
    },
    {
      label: "Timing",
      value: "Provider-driven",
      detail: spec.etaNote,
    },
    {
      label: "Deposit limits",
      value: "Live minimums",
      detail: spec.minMaxNote,
    },
  ];
}

export function getPairExploreLinks(spec: PairPageSpec): PairExploreLink[] {
  const baseLinks: PairExploreLink[] = [
    {
      label: `Explore ${spec.fromLabel} routes`,
      href: `/tokens/${slugify(spec.fromLabel)}`,
      detail: `View routes where ${spec.fromLabel} is the asset being sent or received.`,
    },
    {
      label: `Explore ${spec.toLabel} routes`,
      href: `/tokens/${slugify(spec.toLabel)}`,
      detail: `See more swap paths that settle into ${spec.toLabel}.`,
    },
    {
      label: `Explore ${spec.fromNetworkLabel} routes`,
      href: `/networks/${slugify(spec.builderPreset.fromNetwork)}`,
      detail: `Review routes that start from the ${spec.fromNetworkLabel} network.`,
    },
    {
      label: `Explore ${spec.toNetworkLabel} routes`,
      href: `/networks/${slugify(spec.builderPreset.toNetwork)}`,
      detail: `See destinations and routes that settle on ${spec.toNetworkLabel}.`,
    },
  ];

  const familyLinks = getPairClusterLinksForTemplateFamily(spec.templateFamily).map(
    (item, index) => ({
      label:
        index === 0
          ? `Explore ${item.title}`
          : `Compare ${item.title}`,
      href: item.href,
      detail:
        index === 0
          ? `Move up one level and review the full ${item.title.toLowerCase()} family instead of a single route only.`
          : `Review the adjacent ${item.title.toLowerCase()} family when the next decision could change the destination or landing intent.`,
    }),
  );

  return [...baseLinks, ...familyLinks];
}

export function getPairDisclaimerItems(spec: PairPageSpec) {
  return [
    "Rates, minimums, and maximums are provider-driven and can change before the shift is created.",
    "Always verify the deposit instructions on the shift page before sending funds.",
    "The selected receiving network must match the destination wallet and asset route.",
    `For ${spec.fromLabel} to ${spec.toLabel}, the live builder and shift page remain the final source of truth.`,
  ];
}

export function getPairTemplateFamilyLabel(spec: PairPageSpec) {
  return getTemplateFamilyLabel(spec.templateFamily);
}
