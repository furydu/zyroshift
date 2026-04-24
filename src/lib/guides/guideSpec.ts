import { getCoinIconSources } from "@/lib/sideshift/display";
import {
  formatAssetNetworkLabel,
  getSupportedAssetNetworks,
  getTokenCatalogEntry,
  getRelatedRouteSpecs,
  resolvePairPageSpec,
} from "@/lib/pairs";
import { getGuideSupportTargetItems, isGuideSupportSlug } from "@/lib/guides/guideInventory";
import type { PairPageFaq } from "@/lib/pairs/types";
import type {
  GuideMistake,
  GuidePageSpec,
  GuidePairType,
  GuideRateModeCard,
  GuideSnapshotItem,
  GuideStep,
} from "@/lib/guides/types";

const GUIDE_STATIC_SAMPLE_SLUGS = ["btc-to-usdt"] as const;

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function formatList(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function getGuidePairType(fromToken: string, toToken: string): GuidePairType {
  const fromEntry = getTokenCatalogEntry(fromToken);
  const toEntry = getTokenCatalogEntry(toToken);
  const fromStable = fromEntry.category === "stable";
  const toStable = toEntry.category === "stable";

  if (!fromStable && toStable) {
    return "token_to_stablecoin";
  }

  if (fromStable && !toStable) {
    return "stablecoin_to_token";
  }

  return "token_to_token";
}

function getGuideIntro(
  fromToken: string,
  toToken: string,
  fromNetworkLabel: string,
  toNetworkLabel: string,
  pairType: GuidePairType,
  sourceNetworkCount: number,
  destinationNetworkCount: number,
) {
  const sourceReference =
    fromToken === "BTC" || sourceNetworkCount === 1
      ? `${fromToken} on ${fromNetworkLabel}`
      : fromToken;
  const destinationReference =
    destinationNetworkCount > 1 ? toToken : `${toToken} on ${toNetworkLabel}`;
  const networkContext =
    destinationNetworkCount > 1
      ? `${toToken} currently supports ${destinationNetworkCount} settlement networks on ZyroShift, and the examples below use ${toNetworkLabel} as the sample selection.`
      : `The examples below use ${destinationReference} as the destination side of the route.`;

  if (pairType === "token_to_stablecoin") {
    return `Swapping ${fromToken} to ${toToken} is a common move for users who want to reduce exposure to short-term price swings while staying liquid inside crypto markets. On ZyroShift, this route is currently prefilled as ${sourceReference} to ${destinationReference}. ${networkContext} The guide below focuses on the practical checks that matter before you send funds.`;
  }

  if (pairType === "stablecoin_to_token") {
    return `Swapping ${fromToken} to ${toToken} is usually about moving stable capital back into market exposure while keeping execution simple. On ZyroShift, this route is currently prefilled as ${sourceReference} to ${destinationReference}. ${networkContext} This guide walks through the current route setup, the network checks worth confirming first, and the points that affect timing and final settlement.`;
  }

  return `Swapping ${fromToken} to ${toToken} is often about repositioning between two crypto assets without sending funds through multiple platforms. On ZyroShift, this route is currently prefilled as ${sourceReference} to ${destinationReference}. ${networkContext} This step-by-step guide uses the current route context so you can check networks, timing, and destination details before creating the order.`;
}

function getGuideReasons(
  fromToken: string,
  toToken: string,
  pairType: GuidePairType,
) {
  if (pairType === "token_to_stablecoin") {
    return [
      `Move out of ${fromToken} price exposure and into ${toToken} when users want a more stable balance after a market move.`,
      `Hold value in a liquid stable asset before redeploying into another trade, bridge, or treasury transfer.`,
      `${toToken} is widely used across exchanges, apps, and on-chain workflows, so it can be a practical settlement asset after leaving ${fromToken}.`,
    ];
  }

  if (pairType === "stablecoin_to_token") {
    return [
      `Use ${fromToken} as a funding asset before rotating into ${toToken} market exposure.`,
      `Enter a specific ecosystem or token thesis without routing capital through a separate custodial venue first.`,
      `Keep the flow simple by moving from a familiar stable balance into the destination asset from one swap interface.`,
    ];
  }

  return [
    `Rebalance between ${fromToken} and ${toToken} when market conviction changes.`,
    `Access applications, ecosystems, or liquidity that are easier to reach with ${toToken}.`,
    `Move from one crypto position to another without splitting the route into multiple manual transfers.`,
  ];
}

function getGuideSnapshotItems(
  fromToken: string,
  toToken: string,
  fromNetworkLabel: string,
  toNetworkLabel: string,
  pairType: GuidePairType,
  sourceNetworkCount: number,
  destinationNetworkCount: number,
): GuideSnapshotItem[] {
  const routePurpose =
    pairType === "token_to_stablecoin"
      ? `Usually used to move from ${fromToken} volatility into ${toToken} liquidity.`
      : pairType === "stablecoin_to_token"
        ? `Usually used to deploy stable capital into ${toToken} exposure.`
        : `Usually used to rebalance between ${fromToken} and ${toToken}.`;

  return [
    {
      label: "Current prefilled route",
      value:
        destinationNetworkCount > 1
          ? `${fromToken} on ${fromNetworkLabel} -> ${toToken}, then choose the destination network that matches your receiving wallet. The examples below use ${toNetworkLabel} as the sample selection.`
          : `${fromToken} on ${fromNetworkLabel} -> ${toToken} on ${toNetworkLabel}`,
    },
    {
      label: "Source network selection",
      value:
        fromToken === "BTC" || sourceNetworkCount === 1
          ? `${fromToken} uses ${fromNetworkLabel} as the send network in this example, so the source side stays preselected.`
          : sourceNetworkCount > 1
          ? `${fromToken} is supported on multiple send networks, so users should explicitly choose the source network before creating the route.`
          : `${fromToken} currently has a single supported send network on ZyroShift, so the source network stays preselected for this example.`,
    },
    {
      label: "Primary use case",
      value: routePurpose,
    },
    {
      label: "Destination network context",
      value:
        destinationNetworkCount > 1
          ? `${toToken} currently has ${destinationNetworkCount} supported settlement networks on ZyroShift, so the receiving wallet and selected destination network must match. The walkthrough uses ${toNetworkLabel} as the sample destination, not as the only available choice.`
          : `${toToken} currently settles through a single supported destination network on ZyroShift, so the preset shown here is the route you should expect.`,
    },
    {
      label: "Timing reality",
      value:
        destinationNetworkCount > 1
          ? `The final timeline depends on deposit detection, confirmation depth, route processing, and settlement on the destination network you choose. The examples below use ${toNetworkLabel} as the sample settlement rail.`
          : `The final timeline depends on deposit detection, confirmation depth, route processing, and settlement on ${toNetworkLabel}.`,
    },
  ];
}

function getGuideRateModeCards(
  fromToken: string,
  toToken: string,
): GuideRateModeCard[] {
  return [
    {
      title: "Variable Rate",
      summary: `Use Variable Rate when you want to create the shift first, then send a deposit amount that stays inside the live min/max range for the route.`,
      bullets: [
        `You choose ${fromToken}, its source network, ${toToken}, and the destination network first.`,
        `You enter the ${toToken} receiving address, then press SHIFT.`,
        `After the order is created, ZyroShift shows the deposit address, QR code, and the live min/max range for the amount you can send.`,
      ],
    },
    {
      title: "Fixed Rate",
      summary: `Use Fixed Rate when you want to lock the quote first. ZyroShift then expects you to send one exact deposit amount within the quote window.`,
      bullets: [
        `You enter the exact ${fromToken} amount before creating the order.`,
        `You also enter the ${toToken} receiving address before pressing SHIFT.`,
        `After the order is created, the deposit address and QR stay tied to that exact amount, and the fixed quote is only valid for 15 minutes.`,
      ],
    },
  ];
}

function getGuideSteps(
  fromToken: string,
  toToken: string,
  fromNetworkLabel: string,
  toNetworkLabel: string,
  sourceNetworkCount: number,
  destinationNetworkCount: number,
  isCrossChain: boolean,
  destinationNetworkLabels: string[],
) {
  const combinedSelectionSentence =
    fromToken === "BTC" || sourceNetworkCount === 1
      ? destinationNetworkCount > 1
        ? `⦿ Select ${fromToken} as the coin you send\nIn this example, ${fromToken} only uses ${fromNetworkLabel}, so the source network stays preselected.\n\n⦿ Select ${toToken} as the coin you want to receive ➞ choose the destination network that matches your receiving wallet\nZyroShift currently supports ${destinationNetworkCount} ${toToken} settlement networks: ${formatList(destinationNetworkLabels)}.\nThis walkthrough uses ${toNetworkLabel} as the example selection, but it is only one of the available choices.`
        : `Select ${fromToken} as the coin you send.\nIn this example, ${fromToken} only uses ${fromNetworkLabel}, so the source network stays preselected.\nSelect ${toToken} as the coin you want to receive.\nBecause the destination side is pinned to ${toNetworkLabel} here, the network stays fixed for the example route.`
      : sourceNetworkCount > 1
        ? destinationNetworkCount > 1
          ? `⦿ Select ${fromToken} as the coin you send ➞ choose the source network before continuing\nMake sure the source network matches the wallet or exchange you are sending from.\n\n⦿ Select ${toToken} as the coin you want to receive ➞ choose the destination network that matches your receiving wallet\nZyroShift currently supports ${destinationNetworkCount} ${toToken} settlement networks: ${formatList(destinationNetworkLabels)}.\nThis walkthrough uses ${toNetworkLabel} as the example selection, but it is only one of the available choices.`
          : `Select ${fromToken} as the coin you send, then explicitly choose the source network before continuing.\nSelect ${toToken} as the coin you want to receive.\nBecause the destination side is pinned to ${toNetworkLabel} here, the network stays fixed for the example route.`
        : destinationNetworkCount > 1
          ? `⦿ Select ${fromToken} as the coin you send\nBecause it currently has only one supported send network on ZyroShift, the source network stays preselected for this example.\n\n⦿ Select ${toToken} as the coin you want to receive ➞ choose the destination network that matches your receiving wallet\nZyroShift currently supports ${destinationNetworkCount} ${toToken} settlement networks: ${formatList(destinationNetworkLabels)}.\nThis walkthrough uses ${toNetworkLabel} as the example selection, but it is only one of the available choices.`
          : `Select ${fromToken} as the coin you send.\nBecause it currently has only one supported send network on ZyroShift, the source network stays preselected for this example.\nSelect ${toToken} as the coin you want to receive.\nBecause the destination side is pinned to ${toNetworkLabel} here, the network stays fixed for the example route.`;
  const postShiftSentence = isCrossChain
    ? `Once you press SHIFT, ZyroShift creates the order and shows the deposit address plus QR for the cross-network route.`
    : `Once you press SHIFT, ZyroShift creates the order and shows the deposit address plus QR for the selected route.`;

  return [
    {
      title: "Select the coins to SHIFT",
      body: combinedSelectionSentence,
      visualCaption: "The card is set up with the send asset, receive asset, and sample destination network before address entry.",
      visualState: "select",
    },
    {
      title: "Enter the receiving address and, if needed, the fixed amount",
      body: `For Variable Rate, paste the ${toToken} receiving address and then press SHIFT. For Fixed Rate, enter the exact ${fromToken} amount first, paste the ${toToken} receiving address, and then press SHIFT.`,
      visualCaption: "Amount and destination details are in place before the order is created.",
      visualState: "amount",
      showVisual: false,
    },
    {
      title: "Deposit the coin to the address shown",
      body: `⦿ ${postShiftSentence}\nIf the order is Variable Rate, the next screen tells you the live min/max deposit range and lets you send any amount inside that range to the generated wallet address or QR.\nIf the order is Fixed Rate, the next screen tells you to send the exact locked amount to the generated wallet address or QR before the 15-minute timer expires.\n\n⦿ Send ${fromToken} exactly as the order requires\nOn the created shift page, copy the provided deposit address or scan the QR code, then open your own wallet app or exchange app and send ${fromToken}. Variable Rate lets you send the amount you want as long as it stays within the shown minimum and maximum, while Fixed Rate requires the exact amount shown on the quote.`,
      visualCaption: "The route review state highlights the fields that matter most before confirmation.",
      visualState: "review",
    },
    {
      title: `Wait for confirmation and receive ${toToken}`,
      body: `After the deposit is sent, wait for detection, confirmation, and final settlement. Many faster routes settle in roughly 20 seconds to 1 minute after the deposit is detected, but Bitcoin confirmation time, route conditions, or destination-network load can still make the full process take longer.`,
      visualCaption: "The route completes after the deposit confirms and settlement is sent out.",
      visualState: "settled",
    },
  ] satisfies GuideStep[];
}

function getFeeAndTimingPoints(
  fromToken: string,
  toToken: string,
  fromNetworkId: string,
  toNetworkId: string,
  toNetworkLabel: string,
) {
  const points = [
    `Network cost starts with the send side. When ${fromToken} is sent on ${fromNetworkId === "bitcoin" ? "Bitcoin" : fromNetworkId}, congestion can change the effective cost of getting the route started.`,
    `The final ${toToken} amount can still move with route liquidity, provider fees, and slippage conditions at the moment the order is processed.`,
    `Always treat the live builder and the shift page as the source of truth for minimums, maximums, and order instructions before funds leave your wallet.`,
  ];

  if (fromNetworkId === "bitcoin") {
    points.unshift(
      `Because the source side is Bitcoin, total completion time begins with Bitcoin deposit detection and confirmation depth before settlement can be released, even if many faster routes settle very quickly once the deposit is recognized.`,
    );
  }

  if (toNetworkId === "ethereum") {
    points.push(
      `If you choose ${toToken} on Ethereum (ERC20), downstream settlement fees can feel heavier during peak activity than lighter destination rails.`,
    );
  }

  if (toNetworkId === "tron" || toNetworkId === "solana" || toNetworkId === "bsc") {
    points.push(
      `${toToken} on ${toNetworkLabel} is usually chosen when users want a lighter-fee destination rail after the route settles.`,
    );
  }

  return points;
}

function getNetworkCompatibilityPoints(
  toToken: string,
  toNetworkLabel: string,
  supportedDestinationNetworkCount: number,
) {
  return [
    supportedDestinationNetworkCount > 1
      ? `Make sure the receiving wallet supports ${toToken} on the exact destination network you choose. The examples in this guide use ${toNetworkLabel}, but that is only one of the supported rails.`
      : `Make sure the receiving wallet supports ${toToken} on ${toNetworkLabel} before you create the order.`,
    supportedDestinationNetworkCount > 1
      ? `If you change the destination network, update the receiving address to match that exact network instead of reusing an address from a different ${toToken} rail.`
      : `Because this route is pinned to one destination rail, keep the receiving wallet aligned with the preset network instead of assuming every ${toToken} address is interchangeable.`,
    "Never send the source asset to the receiving address. The deposit address is generated only after the order is created and must be followed exactly.",
  ];
}

function getGuideMistakes(
  fromToken: string,
  toToken: string,
  toNetworkLabel: string,
) {
  return [
    {
      title: "Using the wrong destination network",
      body: `${toToken} exists on multiple rails, so the receiving wallet has to match the destination network you choose. A wallet that only supports one version of ${toToken} should not be used for another.`,
    },
    {
      title: "Ignoring source-side network costs",
      body: `If the send transaction spends more on network cost than expected, the amount that actually reaches the route can fall below the live minimum. That is especially important when the source side starts with ${fromToken}.`,
    },
    {
      title: "Sending before rechecking the order screen",
      body: `The deposit address, live limits, and route details should always be rechecked on the created order page before funds move. Treat that screen as the operational source of truth.`,
    },
  ] satisfies GuideMistake[];
}

function getGuideFaqs(
  fromToken: string,
  toToken: string,
  toNetworkLabel: string,
  pairType: GuidePairType,
  isCrossChain: boolean,
  destinationNetworkCount: number,
) {
  const faqs: PairPageFaq[] = [
    {
      question: `Is it safe to swap ${fromToken} to ${toToken}?`,
      answer:
        "It can be, provided you verify the route details, use the exact deposit instructions created for the order, and confirm that the receiving wallet supports the destination network.",
    },
    {
      question: `How long does it take to swap ${fromToken} to ${toToken}?`,
      answer: `Completion time depends on deposit detection, network confirmations, route processing, and final settlement. For this route, the shift page is the best live reference before you send funds.`,
    },
    {
      question: `What affects the final amount of ${toToken} I receive?`,
      answer:
        "Source-chain network cost, route fees, slippage, and available liquidity can all influence the final amount that settles to the destination wallet.",
    },
  ];

  if (pairType === "token_to_stablecoin") {
    faqs.push({
      question: `Why do users swap ${fromToken} into ${toToken} instead of holding the original asset?`,
      answer: `${toToken} is often used when users want a more stable balance, easier venue transfers, or a liquid settlement asset after exiting ${fromToken} exposure.`,
    });
  }

  if (isCrossChain) {
    faqs.push({
      question: `Why does the destination network matter when receiving ${toToken}?`,
      answer:
        destinationNetworkCount > 1
          ? `Because ${toToken} can settle on multiple networks, the receiving wallet has to support the exact network you choose on the route. This walkthrough uses ${toNetworkLabel} as the example destination, but a mismatch between address and selected rail can delay or break settlement.`
          : `Because this route settles ${toToken} on ${toNetworkLabel}, the receiving wallet has to support that exact network. A mismatch between address and destination rail can delay or break settlement.`,
    });
  }

  faqs.push({
    question: "Do I need identity verification for every route?",
    answer:
      "Requirements depend on the route provider and compliance checks applied at execution time. Review the live flow and route terms instead of assuming every pair behaves the same way.",
  });

  return faqs;
}

export function getGuideStaticParams() {
  return GUIDE_STATIC_SAMPLE_SLUGS.map((pair) => ({ pair }));
}

export function hasGuidePage(slug: string) {
  return isGuideSupportSlug(normalizeSlug(slug));
}

export function resolveGuidePageSpec(slug: string): GuidePageSpec | null {
  const normalizedSlug = normalizeSlug(slug);
  if (!isGuideSupportSlug(normalizedSlug)) {
    return null;
  }
  const swapSpec = resolvePairPageSpec(normalizedSlug);

  if (!swapSpec) {
    return null;
  }

  const fromToken = swapSpec.builderPreset.fromCoin.trim().toUpperCase();
  const toToken = swapSpec.builderPreset.toCoin.trim().toUpperCase();
  const fromNetworkId = swapSpec.builderPreset.fromNetwork.trim().toLowerCase();
  const toNetworkId = swapSpec.builderPreset.toNetwork.trim().toLowerCase();
  const pairType = getGuidePairType(fromToken, toToken);
  const isCrossChain = fromNetworkId !== toNetworkId;
  const supportedDestinationNetworks = getSupportedAssetNetworks(toToken, "settle").map(
    (network) => ({
      id: network.id,
      label: formatAssetNetworkLabel(network, true),
    }),
  );
  const supportedSourceNetworks = getSupportedAssetNetworks(fromToken, "deposit").map(
    (network) => ({
      id: network.id,
      label: formatAssetNetworkLabel(network, true),
    }),
  );

  return {
    slug: normalizedSlug,
    title: `How to Swap ${fromToken} to ${toToken} | Step-by-Step Guide | ZyroShift`,
    description: `Learn how to swap ${fromToken} to ${toToken} with a clear step-by-step guide, network checks, timing notes, and a direct path to the live ZyroShift route.`,
    h1: `How to Swap ${fromToken} to ${toToken}`,
    intro: getGuideIntro(
      fromToken,
      toToken,
      swapSpec.fromNetworkLabel,
      swapSpec.toNetworkLabel,
      pairType,
      supportedSourceNetworks.length,
      supportedDestinationNetworks.length,
    ),
    fromToken,
    toToken,
    fromNetworkId,
    toNetworkId,
    fromNetworkLabel: swapSpec.fromNetworkLabel,
    toNetworkLabel: swapSpec.toNetworkLabel,
    fromIconSources: getCoinIconSources(fromToken, fromNetworkId),
    toIconSources: getCoinIconSources(toToken, toNetworkId),
    pairType,
    isCrossChain,
    moneyHref: `/swap/${normalizedSlug}`,
    guideHref: `/guides/${normalizedSlug}`,
    supportedSourceNetworks,
    supportedDestinationNetworks,
    rateModeCards: getGuideRateModeCards(fromToken, toToken),
    snapshotItems: getGuideSnapshotItems(
      fromToken,
      toToken,
      swapSpec.fromNetworkLabel,
      swapSpec.toNetworkLabel,
      pairType,
      supportedSourceNetworks.length,
      supportedDestinationNetworks.length,
    ),
    steps: getGuideSteps(
      fromToken,
      toToken,
      swapSpec.fromNetworkLabel,
      swapSpec.toNetworkLabel,
      supportedSourceNetworks.length,
      supportedDestinationNetworks.length,
      isCrossChain,
      supportedDestinationNetworks.map((network) => network.label),
    ),
    reasons: getGuideReasons(fromToken, toToken, pairType),
    feeAndTimingPoints: getFeeAndTimingPoints(
      fromToken,
      toToken,
      fromNetworkId,
      toNetworkId,
      swapSpec.toNetworkLabel,
    ),
    networkCompatibilityPoints: getNetworkCompatibilityPoints(
      toToken,
      swapSpec.toNetworkLabel,
      supportedDestinationNetworks.length,
    ),
    mistakes: getGuideMistakes(fromToken, toToken, swapSpec.toNetworkLabel),
    faqs: getGuideFaqs(
      fromToken,
      toToken,
      swapSpec.toNetworkLabel,
      pairType,
      isCrossChain,
      supportedDestinationNetworks.length,
    ),
    relatedRoutes: getRelatedRouteSpecs(swapSpec, 5),
    swapSpec,
  };
}

export function getGuideListingSpecs(limit = 24): GuidePageSpec[] {
  return getGuideSupportTargetItems(limit)
    .map((item) => resolveGuidePageSpec(item.slug))
    .filter(
    (spec): spec is GuidePageSpec => Boolean(spec),
  );
}
