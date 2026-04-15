import type {
  PairClassification,
  PairIntentType,
  PairPageFaq,
  PairPageSeed,
} from "@/lib/pairs/types";

export type PairCopyContext = {
  seed: PairPageSeed;
  classification: PairClassification;
  fromDisplay: string;
  toDisplay: string;
  routeName: string;
};

type StringBuilder = (context: PairCopyContext) => string;
type Rule<T> = {
  when: (context: PairCopyContext) => boolean;
  build: (context: PairCopyContext) => T;
};

const DEFAULT_TITLE_TEMPLATE =
  "Swap {fromDisplay} to {toDisplay} | Non-Custodial Crypto Swap";
const DEFAULT_DESCRIPTION_TEMPLATE =
  "Exchange {fromDisplay} for {toDisplay} with live routing, network-aware settlement, and a dedicated shift status page.";

export const TITLE_TEMPLATES: Partial<Record<PairIntentType, string>> = {
  stable_to_btc:
    "Swap {fromDisplay} to {toDisplay} | Fast Non-Custodial Crypto Swap",
  stable_to_alt:
    "Swap {fromDisplay} to {toDisplay} | Fast Ecosystem Entry Route",
  btc_to_stable:
    "Swap {fromDisplay} to {toDisplay} | Fast Stablecoin Exit Route",
  btc_to_alt:
    "Swap {fromDisplay} to {toDisplay} | Fast Ecosystem Entry Route",
  alt_to_btc:
    "Swap {fromDisplay} to {toDisplay} | Fast Non-Custodial Crypto Swap",
  alt_to_stable:
    "Swap {fromDisplay} to {toDisplay} | Fast Stablecoin Exit Route",
  meme_to_btc:
    "Swap {fromDisplay} to {toDisplay} | Fast Non-Custodial Crypto Swap",
  meme_to_stable:
    "Swap {fromDisplay} to {toDisplay} | Fast Stablecoin Exit Route",
};

export const DESCRIPTION_TEMPLATES: Partial<Record<PairIntentType, string>> = {
  stable_to_btc:
    "Swap {fromDisplay} to {toDisplay} with a non-custodial flow. Check live rates, deposit limits, and receiving details before you send funds.",
  stable_to_alt:
    "Swap {fromDisplay} to {toDisplay} with a non-custodial route. Review the selected network, live quote, and deposit instructions before sending funds.",
  btc_to_stable:
    "Swap {fromDisplay} to {toDisplay} using a non-custodial route. Review the live quote, deposit range, and selected network before creating the shift.",
  btc_to_alt:
    "Swap {fromDisplay} to {toDisplay} with a non-custodial route. Review the selected network, live quote, and deposit instructions before sending funds.",
  alt_to_stable:
    "Swap {fromDisplay} to {toDisplay} using a non-custodial route. Review the live quote, deposit range, and selected network before creating the shift.",
  meme_to_stable:
    "Swap {fromDisplay} to {toDisplay} using a non-custodial route. Review the live quote, deposit range, and selected network before creating the shift.",
};

export const INTRO_BUILDERS: Partial<Record<PairIntentType, StringBuilder>> = {
  stable_to_btc: (context) =>
    `This route is built for users moving from ${context.seed.fromLabel} on ${context.seed.fromNetworkLabel} into ${context.seed.toLabel} on ${context.seed.toNetworkLabel} without relying on a custodial account flow.`,
  stable_to_alt: (context) =>
    `This route is built for users moving from ${context.seed.fromLabel} on ${context.seed.fromNetworkLabel} into ${context.seed.toLabel} on ${context.seed.toNetworkLabel} when they want to enter the destination ecosystem without using a custodial exchange account.`,
  btc_to_stable: (context) =>
    `This route is useful when the goal is to move from Bitcoin into ${context.seed.toLabel} on ${context.seed.toNetworkLabel} while preserving wallet control and avoiding a custodial exchange account.`,
  btc_to_alt: (context) =>
    `This route helps move value from ${context.seed.fromLabel} into the ${context.seed.toLabel} ecosystem when the user needs ${context.seed.toLabel} settlement without going through a centralized exchange account.`,
  btc_to_meme: (context) =>
    `This route moves Bitcoin value into a higher-volatility destination asset on ${context.seed.toNetworkLabel}, making network checks and destination wallet compatibility especially important before you create the shift.`,
  alt_to_btc: (context) =>
    `This route rotates ${context.seed.fromLabel} into ${context.seed.toLabel} with a non-custodial flow that starts in the builder and completes on a dedicated shift page.`,
  alt_to_alt: (context) =>
    `This route rotates ${context.seed.fromLabel} into ${context.seed.toLabel} with a non-custodial flow that starts in the builder and completes on a dedicated shift page.`,
  alt_to_stable: (context) =>
    `This route is useful when the goal is to move from ${context.seed.fromLabel} volatility into ${context.seed.toLabel} while keeping wallet control and network selection explicit from the start.`,
  meme_to_btc: () =>
    "This route helps users rotate out of a meme-driven asset and into native Bitcoin while keeping the send and receive flow non-custodial from start to finish.",
  meme_to_stable: (context) =>
    `This route is useful when the goal is to move from ${context.seed.fromLabel} volatility into ${context.seed.toLabel} while keeping wallet control and network selection explicit from the start.`,
};

export const USE_CASE_BUILDERS: Partial<Record<PairIntentType, StringBuilder>> = {
  stable_to_btc: (context) =>
    `Useful when the user wants to rotate from ${context.seed.fromLabel} into ${context.seed.toLabel} as a more durable store-of-value route while keeping the flow wallet-native.`,
  stable_to_alt: (context) =>
    `Useful when the user wants to deploy stablecoin value into native ${context.seed.toLabel} on ${context.seed.toNetworkLabel} for activity in the destination ecosystem.`,
  btc_to_stable: () =>
    "Useful when the user wants to reduce Bitcoin exposure, exit into a stable asset, or prepare funds for another move without leaving the non-custodial flow.",
  btc_to_alt: (context) =>
    `Useful when the user wants to move from ${context.seed.fromLabel} into native ${context.seed.toLabel} for on-chain activity in the destination ecosystem.`,
  btc_to_meme: () =>
    "Useful when the user wants to move Bitcoin value into a fast-moving destination asset with more speculative upside and more risk.",
  alt_to_btc: (context) =>
    `Useful when the user wants to rotate from ${context.seed.fromLabel} into Bitcoin as a more conservative destination asset or a native BTC position.`,
  alt_to_alt: (context) =>
    `Useful when the user wants to switch ecosystems or rebalance from ${context.seed.fromLabel} into ${context.seed.toLabel} while keeping the send and receive flow wallet-native.`,
  alt_to_stable: (context) =>
    `Useful when the user wants to move out of ${context.seed.fromLabel} into ${context.seed.toLabel} for a more stable landing asset without leaving the non-custodial flow.`,
  meme_to_btc: (context) =>
    `Useful when the user wants to rotate from ${context.seed.fromLabel} into Bitcoin as a more conservative destination asset or a native BTC position.`,
  meme_to_stable: (context) =>
    `Useful when the user wants to move out of ${context.seed.fromLabel} into ${context.seed.toLabel} for a more stable landing asset without leaving the non-custodial flow.`,
};

export const INTENT_FAQ_BUILDERS: Partial<
  Record<PairIntentType, (context: PairCopyContext) => PairPageFaq>
> = {
  stable_to_btc: (context) => ({
    question: `Why do users swap ${context.routeName}?`,
    answer:
      "This route is often used to move from a dollar-pegged asset into Bitcoin quickly without opening a custodial exchange position.",
  }),
  stable_to_alt: (context) => ({
    question: `Why move ${context.routeName} instead of holding stablecoins?`,
    answer: `This route is often used when the user wants to deploy stable value into the ${context.seed.toLabel} ecosystem for apps, DeFi, transfers, or general chain activity.`,
  }),
  btc_to_stable: (context) => ({
    question: `Why swap ${context.routeName} instead of holding BTC?`,
    answer:
      "This route is commonly used when the goal is to reduce Bitcoin volatility and land in a stable asset on the selected destination network.",
  }),
  btc_to_alt: (context) => ({
    question: `Why move ${context.routeName} instead of using a custodial exchange?`,
    answer:
      "This route is useful when the user wants to move Bitcoin value into another blockchain ecosystem while keeping the flow non-custodial from start to finish.",
  }),
  alt_to_btc: (context) => ({
    question: `Why rotate ${context.routeName} into Bitcoin?`,
    answer:
      "This route is useful when the user wants to move from a higher-volatility asset into native BTC as a more conservative destination asset.",
  }),
  alt_to_stable: (context) => ({
    question: `Why use ${context.seed.toLabel} as the destination for ${context.routeName}?`,
    answer:
      "This route is often used to lock in value after trading, reduce exposure, or keep funds ready on a more stable settlement asset.",
  }),
  meme_to_btc: (context) => ({
    question: `Why rotate ${context.routeName} into Bitcoin?`,
    answer:
      "This route is useful when the user wants to move from a higher-volatility asset into native BTC as a more conservative destination asset.",
  }),
  meme_to_stable: (context) => ({
    question: `Why use ${context.seed.toLabel} as the destination for ${context.routeName}?`,
    answer:
      "This route is often used to lock in value after trading, reduce exposure, or keep funds ready on a more stable settlement asset.",
  }),
};

export const BASE_NOTE_RULES: Rule<string>[] = [
  {
    when: (context) => context.classification.pairIntentType === "stable_to_btc",
    build: (context) =>
      `This route is commonly used to convert ${context.seed.fromLabel} into a native Bitcoin position without relying on a custodial exchange account.`,
  },
  {
    when: (context) => context.classification.pairIntentType === "btc_to_stable",
    build: (context) =>
      `This route is commonly used when the goal is to reduce BTC volatility and land in a stable asset on ${context.seed.toNetworkLabel}.`,
  },
  {
    when: (context) =>
      context.classification.pairIntentType === "alt_to_stable" ||
      context.classification.pairIntentType === "meme_to_stable",
    build: (context) =>
      `This route can be useful after trading or profit-taking when the goal is to preserve value in ${context.seed.toLabel}.`,
  },
  {
    when: (context) =>
      context.classification.pairIntentType === "btc_to_alt" ||
      context.classification.pairIntentType === "stable_to_alt",
    build: (context) =>
      `This route is oriented toward entering the ${context.seed.toLabel} ecosystem, so destination wallet readiness matters before the shift is created.`,
  },
  {
    when: (context) => context.seed.builderPreset.fromNetwork === "bitcoin",
    build: () =>
      "Bitcoin confirmation timing can affect when the route begins processing.",
  },
  {
    when: (context) => context.seed.builderPreset.fromNetwork === "tron",
    build: () =>
      "Tron is commonly used for lower-cost stablecoin transfers compared with ERC20 routes.",
  },
  {
    when: (context) => context.seed.builderPreset.fromNetwork === "bsc",
    build: () =>
      "BNB Chain routes can feel cheaper than ERC20 routes, but the deposit network still needs to match BEP20 exactly.",
  },
  {
    when: (context) => context.seed.builderPreset.fromNetwork === "ethereum",
    build: () =>
      "Ethereum network conditions and gas cost can influence how practical the route feels for smaller deposits.",
  },
  {
    when: (context) => context.seed.builderPreset.fromNetwork === "solana",
    build: () =>
      "Solana routes usually start from a fast settlement chain, but the selected destination asset and network still need to match the route exactly.",
  },
  {
    when: (context) => context.seed.builderPreset.fromNetwork === "base",
    build: () =>
      "Base is an L2 route, so the destination wallet and network details should be checked carefully before you send funds.",
  },
  {
    when: (context) =>
      context.classification.networkModifiers.includes(
        "stablecoin_network_sensitive",
      ),
    build: () =>
      "Stablecoin routes are network-sensitive, so the selected path must match the exact deposit and settlement chain shown on the shift page.",
  },
  {
    when: (context) => context.seed.toLabel === "BTC",
    build: () =>
      "The receiving address must be a native Bitcoin address on the Bitcoin network, not a wrapped BTC address on another chain.",
  },
  {
    when: (context) => context.seed.toLabel === "ETH",
    build: () =>
      "Make sure the receiving address is a native ETH-compatible address on Ethereum.",
  },
  {
    when: (context) => ["USDT", "USDC"].includes(context.seed.toLabel),
    build: (context) =>
      `${context.seed.toLabel} exists on multiple networks, so the receiving wallet must match the selected destination chain exactly.`,
  },
  {
    when: (context) =>
      context.classification.networkModifiers.includes("memo_warning"),
    build: () =>
      "Some routes can require memo-style destination details depending on the asset and receiving wallet, so the final instructions on the shift page should be checked carefully before sending funds.",
  },
];

export const NETWORK_SAFETY_FAQ_RULES: Rule<PairPageFaq>[] = [
  {
    when: (context) =>
      context.classification.networkModifiers.includes(
        "stablecoin_network_sensitive",
      ),
    build: (context) => {
      const networkSensitiveToken =
        context.classification.fromCategory === "stable"
          ? context.seed.fromLabel
          : context.seed.toLabel;

      return {
        question: `How important is network matching for ${networkSensitiveToken} on this route?`,
        answer: `Very important. ${networkSensitiveToken} can exist on multiple networks, so the shift page instructions and selected route must be matched exactly before you send funds.`,
      };
    },
  },
  {
    when: (context) =>
      context.classification.networkModifiers.includes("memo_warning"),
    build: (context) => ({
      question: `Do I need any extra destination details before swapping ${context.seed.fromLabel} to ${context.seed.toLabel}?`,
      answer:
        "Some assets and wallets require memo-style destination details, so the final shift instructions should always be checked before you send funds.",
    }),
  },
];

function formatTemplate(template: string, context: PairCopyContext) {
  return template
    .replaceAll("{fromDisplay}", context.fromDisplay)
    .replaceAll("{toDisplay}", context.toDisplay)
    .replaceAll("{fromLabel}", context.seed.fromLabel)
    .replaceAll("{toLabel}", context.seed.toLabel)
    .replaceAll("{fromNetworkLabel}", context.seed.fromNetworkLabel)
    .replaceAll("{toNetworkLabel}", context.seed.toNetworkLabel)
    .replaceAll("{routeName}", context.routeName);
}

export function createPairCopyContext(
  seed: PairPageSeed,
  classification: PairClassification,
  fromDisplay: string,
  toDisplay: string,
): PairCopyContext {
  return {
    seed,
    classification,
    fromDisplay,
    toDisplay,
    routeName: `${fromDisplay} to ${toDisplay}`,
  };
}

export function getTitleFromMatrix(context: PairCopyContext) {
  return formatTemplate(
    TITLE_TEMPLATES[context.classification.pairIntentType] ||
      DEFAULT_TITLE_TEMPLATE,
    context,
  );
}

export function getDescriptionFromMatrix(context: PairCopyContext) {
  return formatTemplate(
    DESCRIPTION_TEMPLATES[context.classification.pairIntentType] ||
      DEFAULT_DESCRIPTION_TEMPLATE,
    context,
  );
}

export function getIntroFromMatrix(context: PairCopyContext) {
  const builder = INTRO_BUILDERS[context.classification.pairIntentType];

  if (builder) {
    return builder(context);
  }

  return "This route is rendered from the live swap builder with the selected asset pair and network context already in place before the shift is created.";
}

export function getUseCaseFromMatrix(context: PairCopyContext) {
  const builder = USE_CASE_BUILDERS[context.classification.pairIntentType];

  if (builder) {
    return builder(context);
  }

  return `Useful when the user wants to switch ecosystems or rebalance from ${context.seed.fromLabel} into ${context.seed.toLabel} while keeping the send and receive flow wallet-native.`;
}

export function getIntentFaqFromMatrix(context: PairCopyContext): PairPageFaq {
  const builder = INTENT_FAQ_BUILDERS[context.classification.pairIntentType];

  if (builder) {
    return builder(context);
  }

  return {
    question: `What should I check before swapping ${context.routeName}?`,
    answer:
      "Before creating the shift, verify the selected asset pair, network path, receiving wallet compatibility, and the live minimum and maximum shown by the builder.",
  };
}

export function collectNoteRules(context: PairCopyContext) {
  return BASE_NOTE_RULES.filter((rule) => rule.when(context)).map((rule) =>
    rule.build(context),
  );
}

export function getNetworkSafetyFaqFromMatrix(context: PairCopyContext) {
  const match = NETWORK_SAFETY_FAQ_RULES.find((rule) => rule.when(context));
  return match ? match.build(context) : null;
}
