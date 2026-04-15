import {
  getPairClusterReport,
  type PairClusterReportItem,
  type PairClusterReport,
} from "@/lib/pairs/clusters";
import {
  getPhaseOnePairInventory,
  type PairInventoryItem,
} from "@/lib/pairs/inventory";
import { resolvePairPageSpec } from "@/lib/pairs/resolveSpec";
import type { PairIndexState, PairTemplateFamily } from "@/lib/pairs/types";

export type PairClusterPageId =
  | "stable-to-btc"
  | "btc-to-stable"
  | "btc-to-alt"
  | "stable-to-alt"
  | "alt-to-btc"
  | "alt-to-stable"
  | "alt-to-alt";

type PairClusterPageDefinition = {
  id: PairClusterPageId;
  title: string;
  templateFamilies: PairTemplateFamily[];
  heroTitle: string;
  heroDescription: string;
  narrativeHeading: string;
  narrativeParagraphs: string[];
  guidanceHeading: string;
  guidancePoints: string[];
  decisionHeading: string;
  decisionCards: Array<{
    title: string;
    body: string;
  }>;
  routeSectionHeading: string;
  routeSectionDescription: string;
  sourceTokenHeading: string;
  sourceTokenDescription: string;
  destinationTokenHeading: string;
  destinationTokenDescription: string;
  sourceNetworkHeading: string;
  sourceNetworkDescription: string;
  destinationNetworkHeading: string;
  destinationNetworkDescription: string;
  faqHeading: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedIds: PairClusterPageId[];
};

type PairClusterRouteCard = {
  slug: string;
  href: string;
  label: string;
  summary: string;
  fromToken: string;
  fromLabel: string;
  fromNetworkId: string;
  fromNetworkLabel: string;
  toToken: string;
  toLabel: string;
  toNetworkId: string;
  toNetworkLabel: string;
  state: PairIndexState;
};

type PairClusterCountCard = {
  id: string;
  label: string;
  href: string;
  count: number;
};

export type PairClusterDirectoryCard = {
  id: PairClusterPageId;
  href: string;
  title: string;
  summary: string;
  totalRoutes: number;
  indexRoutes: number;
  noindexRoutes: number;
};

export type PairClusterPageData = {
  id: PairClusterPageId;
  href: string;
  title: string;
  heroTitle: string;
  heroDescription: string;
  narrativeHeading: string;
  narrativeParagraphs: string[];
  guidanceHeading: string;
  guidancePoints: string[];
  decisionHeading: string;
  decisionCards: Array<{
    title: string;
    body: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
  }>;
  routeSectionHeading: string;
  routeSectionDescription: string;
  topRoutes: PairClusterRouteCard[];
  sourceTokenHeading: string;
  sourceTokenDescription: string;
  topSourceTokens: PairClusterCountCard[];
  destinationTokenHeading: string;
  destinationTokenDescription: string;
  topDestinationTokens: PairClusterCountCard[];
  sourceNetworkHeading: string;
  sourceNetworkDescription: string;
  topSourceNetworks: PairClusterCountCard[];
  destinationNetworkHeading: string;
  destinationNetworkDescription: string;
  topDestinationNetworks: PairClusterCountCard[];
  faqHeading: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedClusters: PairClusterDirectoryCard[];
  report: PairClusterReportItem;
};

const CLUSTER_PAGE_DEFINITIONS: Record<PairClusterPageId, PairClusterPageDefinition> = {
  "stable-to-btc": {
    id: "stable-to-btc",
    title: "Stablecoin to BTC routes",
    templateFamilies: ["stable_network_specific_to_btc", "stable_to_btc"],
    heroTitle: "Stablecoin routes that land in BTC",
    heroDescription:
      "Use this family when the funding asset starts stable, but the destination needs to end as native Bitcoin with the right send rail and wallet compatibility from the start.",
    narrativeHeading: "What this route family covers",
    narrativeParagraphs: [
      "These routes typically start from USDT or USDC and finish on native Bitcoin. The main difference is not only the asset pair, but the network that carries the deposit into the route before BTC settlement begins.",
      "That makes this family useful when the user already holds stablecoins, wants a direct BTC position, and still needs to decide whether fee-first routing, ERC20 compatibility, or another network context should shape the send side.",
    ],
    guidanceHeading: "When to use this family",
    guidancePoints: [
      "When stablecoins are already in the wallet and the destination must end in BTC.",
      "When the funding rail changes cost, wallet fit, or exchange transfer behavior before BTC settlement.",
      "When you want to compare Tron, ERC20, and other stablecoin send paths into the same BTC destination.",
      "When Bitcoin is the real goal and the network choice only matters on the deposit side.",
    ],
    decisionHeading: "How to compare routes in this family",
    decisionCards: [
      {
        title: "Choose the stablecoin family first",
        body: "USDT and USDC dominate this family, but they do not always serve the same wallet flows or transfer habits before the BTC destination is reached.",
      },
      {
        title: "Then compare the send rail",
        body: "The key difference is usually Tron vs ERC20 vs another supported rail. Cost, wallet support, and exchange withdrawal options all change before BTC settlement starts.",
      },
      {
        title: "Keep the BTC destination fixed",
        body: "Most decisions in this family happen on the funding side. The destination stays Bitcoin-focused, so the send asset and send network carry most of the route nuance.",
      },
    ],
    routeSectionHeading: "Representative stablecoin to BTC routes",
    routeSectionDescription:
      "These examples show the most useful comparisons inside this family: fee-first stablecoin paths, compatibility-first ERC20 paths, and alternative rails that still end in a Bitcoin destination.",
    sourceTokenHeading: "Stable funding assets",
    sourceTokenDescription:
      "These are the stable assets most often used to fund BTC destinations inside this route family.",
    destinationTokenHeading: "BTC destination variants",
    destinationTokenDescription:
      "These are the Bitcoin-native or Bitcoin-linked destination assets that appear most often once the stable funding decision is made.",
    sourceNetworkHeading: "Common stablecoin send rails",
    sourceNetworkDescription:
      "The send-side network usually creates the most meaningful difference between one stable-to-BTC route and another.",
    destinationNetworkHeading: "Common BTC landing networks",
    destinationNetworkDescription:
      "Most routes still end on Bitcoin, but wrapped or ecosystem-specific BTC destinations also appear in the broader family graph.",
    faqHeading: "Stable-to-BTC family FAQ",
    faqs: [
      {
        question: "Why does the funding network matter so much in stable-to-BTC routes?",
        answer:
          "Because the biggest route difference often happens before Bitcoin settlement starts. Tron, ERC20, and other rails change transfer cost, wallet compatibility, and how easy it is to fund the route from the current wallet or exchange.",
      },
      {
        question: "Should I compare USDT and USDC separately in this family?",
        answer:
          "Yes. They can look similar at the pair level, but they behave differently across supported networks, wallet habits, and exchange withdrawal paths, so it makes sense to compare both family and rail.",
      },
      {
        question: "Does every route here end in native BTC?",
        answer:
          "No. Native BTC is the clearest destination in this family, but wrapped BTC variants can appear in the broader route graph. The destination network and asset still need to match the exact route you open.",
      },
      {
        question: "What is the main decision order for stable-to-BTC routes?",
        answer:
          "First choose the stablecoin you already hold, then compare the send network, and only after that narrow down the exact BTC destination route that matches your wallet expectations.",
      },
    ],
    relatedIds: ["btc-to-stable", "stable-to-alt", "alt-to-btc"],
  },
  "btc-to-stable": {
    id: "btc-to-stable",
    title: "BTC to stable routes",
    templateFamilies: ["btc_to_stable"],
    heroTitle: "Bitcoin routes that exit into stable value",
    heroDescription:
      "Use this family when the route starts in BTC and ends in a stable destination so volatility can drop before the next transfer, treasury step, or portfolio move.",
    narrativeHeading: "What this route family covers",
    narrativeParagraphs: [
      "BTC-to-stable routes sit between settlement and risk reduction. The destination is usually a stablecoin, but the right landing asset still depends on liquidity, network fit, and how the next step should happen after the route settles.",
      "These pages matter when the user is already in Bitcoin, wants a more stable destination, and still needs to choose whether USDT, USDC, or another stable route is the cleanest landing asset.",
    ],
    guidanceHeading: "When to use this family",
    guidancePoints: [
      "When the position currently sits in BTC and the next step needs a stable destination.",
      "When a treasury or trading flow needs to preserve value after leaving Bitcoin.",
      "When the landing asset matters more than entering another chain ecosystem directly.",
      "When the user wants to compare stablecoin destinations without leaving the non-custodial flow.",
    ],
    decisionHeading: "How to compare routes in this family",
    decisionCards: [
      {
        title: "Start with the stable landing asset",
        body: "The first comparison is usually USDT vs USDC vs another stable destination, because that determines what the next wallet or treasury step looks like after BTC exits.",
      },
      {
        title: "Then compare the landing network",
        body: "A stable destination on Tron does not serve the same follow-up flow as a stable destination on Ethereum, Base, or another EVM rail.",
      },
      {
        title: "Keep the BTC source context visible",
        body: "Some routes begin from native BTC, while others begin from Bitcoin-linked variants on other networks. That source context changes how representative the route really is.",
      },
    ],
    routeSectionHeading: "Representative BTC to stable routes",
    routeSectionDescription:
      "These examples highlight the cleanest BTC exit paths, starting with native BTC routes and then moving into broader Bitcoin-linked variants where the stable landing network changes the outcome.",
    sourceTokenHeading: "Bitcoin source assets",
    sourceTokenDescription:
      "These are the Bitcoin-native or Bitcoin-linked assets most often used as the starting point when the route exits into stable value.",
    destinationTokenHeading: "Stable landing assets",
    destinationTokenDescription:
      "These are the stable destinations that matter most when the goal is to reduce volatility after leaving Bitcoin exposure.",
    sourceNetworkHeading: "Common BTC source networks",
    sourceNetworkDescription:
      "Some exits start from native Bitcoin, while others start from Bitcoin-linked assets on other chains. That source environment still changes the route meaningfully.",
    destinationNetworkHeading: "Common stable landing networks",
    destinationNetworkDescription:
      "The stable landing network matters because it determines what the user can do next after leaving BTC.",
    faqHeading: "BTC-to-stable family FAQ",
    faqs: [
      {
        question: "What is the first thing to compare in BTC-to-stable routes?",
        answer:
          "Start with the landing asset and its network. The destination stablecoin and settlement rail usually matter more than the starting BTC leg once the decision to exit Bitcoin has already been made.",
      },
      {
        question: "Why do some routes start from cbBTC or other BTC-linked assets?",
        answer:
          "The broader family includes Bitcoin-linked assets on other chains because many users hold BTC exposure outside the native Bitcoin network. Those routes still belong to the BTC exit family even if they are not the cleanest native BTC examples.",
      },
      {
        question: "When should I prefer USDT over USDC after BTC?",
        answer:
          "That depends on the next destination network and wallet flow. USDT often aligns with cross-network liquidity and Tron funding habits, while USDC is more often used when Ethereum-style compatibility matters.",
      },
      {
        question: "Are BTC-to-stable routes mainly about trading or preservation?",
        answer:
          "Usually preservation. This family is strongest when the real goal is to reduce BTC volatility or prepare a stable landing asset for another transfer, treasury move, or portfolio step.",
      },
    ],
    relatedIds: ["stable-to-btc", "btc-to-alt", "alt-to-stable"],
  },
  "btc-to-alt": {
    id: "btc-to-alt",
    title: "BTC to ecosystem-entry routes",
    templateFamilies: ["btc_to_alt"],
    heroTitle: "Bitcoin routes that enter another ecosystem",
    heroDescription:
      "Use this family when the route starts in BTC but the real goal is another native asset ecosystem such as Ethereum, Solana, or BNB Chain.",
    narrativeHeading: "What this route family covers",
    narrativeParagraphs: [
      "BTC-to-alt routes matter when Bitcoin is only the starting asset. The destination ecosystem is the real decision because wallet type, app environment, and native settlement all change after the route finishes.",
      "These pages help compare where BTC is most often deployed next, especially when the destination chain needs native assets rather than another stable landing asset.",
    ],
    guidanceHeading: "When to use this family",
    guidancePoints: [
      "When BTC is already funded and the next step requires native ETH, SOL, BNB, or another ecosystem asset.",
      "When the destination chain matters more than keeping value in Bitcoin.",
      "When you want to compare ecosystem-entry routes that all begin from BTC.",
      "When wallet readiness on the destination side matters after settlement.",
    ],
    decisionHeading: "How to compare routes in this family",
    decisionCards: [
      {
        title: "Choose the destination ecosystem first",
        body: "The biggest question is usually where BTC should go next: Ethereum, Solana, BNB Chain, or another native environment with its own wallet and app context.",
      },
      {
        title: "Then compare destination settlement type",
        body: "Some routes end in native L1 assets, others in L2 or ecosystem-adjacent assets. That changes what the user can do immediately after settlement.",
      },
      {
        title: "Keep BTC source variants secondary",
        body: "For this family, the destination ecosystem usually matters more than whether the source starts as native BTC or another Bitcoin-linked variant.",
      },
    ],
    routeSectionHeading: "Representative BTC ecosystem-entry routes",
    routeSectionDescription:
      "These examples prioritize the clearest ecosystem-entry paths that begin from BTC and end in native destination assets such as ETH, SOL, or BNB before expanding into more specialized variants.",
    sourceTokenHeading: "Bitcoin source assets",
    sourceTokenDescription:
      "These are the Bitcoin-native or Bitcoin-linked starting assets that most often fund ecosystem-entry routes.",
    destinationTokenHeading: "Common ecosystem targets",
    destinationTokenDescription:
      "These are the destination assets most often chosen when BTC moves into another native chain environment.",
    sourceNetworkHeading: "Common BTC starting networks",
    sourceNetworkDescription:
      "Most high-intent routes begin from native Bitcoin, but the family also includes Bitcoin-linked assets on other chains where the source environment changes before ecosystem entry.",
    destinationNetworkHeading: "Common destination ecosystems",
    destinationNetworkDescription:
      "The destination network is usually the real decision in this family because it determines app compatibility, wallet type, and what can happen next after settlement.",
    faqHeading: "BTC-to-alt family FAQ",
    faqs: [
      {
        question: "What should I compare first in BTC-to-alt routes?",
        answer:
          "Start with the destination ecosystem. The most important difference is usually whether the route should end in Ethereum, Solana, BNB Chain, or another native chain environment.",
      },
      {
        question: "Why is this family different from BTC-to-stable routes?",
        answer:
          "BTC-to-stable routes are mostly about reducing volatility, while BTC-to-alt routes are about deploying Bitcoin value into another ecosystem for on-chain activity, wallet compatibility, or app access.",
      },
      {
        question: "Should native BTC routes be prioritized over Bitcoin-linked variants here?",
        answer:
          "Usually yes for representative examples. Native BTC gives the clearest ecosystem-entry route, while Bitcoin-linked variants are useful but more secondary inside the family map.",
      },
      {
        question: "Why do destination networks matter more than source context in this family?",
        answer:
          "Because the route usually exists to reach a new ecosystem. Once the user decides to leave Bitcoin, the destination chain and asset determine the real utility of the route.",
      },
    ],
    relatedIds: ["stable-to-alt", "alt-to-btc", "btc-to-stable"],
  },
  "stable-to-alt": {
    id: "stable-to-alt",
    title: "Stablecoin to ecosystem-entry routes",
    templateFamilies: ["stable_to_alt"],
    heroTitle: "Stablecoin routes that enter other ecosystems",
    heroDescription:
      "Use this family when the funding asset stays stable at the start, but the destination should become a native ecosystem asset such as ETH, SOL, or BNB.",
    narrativeHeading: "What this route family covers",
    narrativeParagraphs: [
      "Stable-to-alt routes are usually about deployment rather than preservation. Stablecoins make funding easy, but the destination chain and wallet environment become the more important decision once the route settles.",
      "This family is useful when you want to compare ecosystem-entry paths while keeping the starting side stable and network-aware.",
    ],
    guidanceHeading: "When to use this family",
    guidancePoints: [
      "When the wallet already holds stablecoins and the next move should enter another chain ecosystem.",
      "When the user wants to compare which destination asset fits the next on-chain action.",
      "When the send rail stays stable, but the destination asset needs to be native to another network.",
      "When landing in ETH, SOL, BNB, or similar assets matters more than preserving stable value.",
    ],
    decisionHeading: "How to compare routes in this family",
    decisionCards: [
      {
        title: "Start with the destination ecosystem",
        body: "This family is driven by where stable value should be deployed next, not by preserving the starting asset.",
      },
      {
        title: "Use the stable send side as a constraint",
        body: "The funding asset stays stable, but its send network still affects cost, wallet fit, and transfer practicality before ecosystem entry.",
      },
      {
        title: "Check whether native settlement matters",
        body: "Some destinations are valuable only if the route ends in the chain's native asset and wallet environment.",
      },
    ],
    routeSectionHeading: "Representative stablecoin ecosystem-entry routes",
    routeSectionDescription:
      "These examples show the strongest ways stablecoins are deployed into native ecosystem assets once the user has already decided to move beyond a stable landing asset.",
    sourceTokenHeading: "Stable funding assets",
    sourceTokenDescription:
      "These stable assets most often fund ecosystem-entry routes when the user wants to preserve value until the moment of deployment.",
    destinationTokenHeading: "Common ecosystem targets",
    destinationTokenDescription:
      "These destination assets show where stable value is most often deployed next once the ecosystem decision is made.",
    sourceNetworkHeading: "Common stable send rails",
    sourceNetworkDescription:
      "Stable routes still depend on the funding rail because transfer cost and wallet compatibility vary before the destination asset settles.",
    destinationNetworkHeading: "Common destination ecosystems",
    destinationNetworkDescription:
      "These networks show where stablecoin-funded routes most often land once the user is moving into another chain.",
    faqHeading: "Stable-to-alt family FAQ",
    faqs: [
      {
        question: "What is the real decision inside stable-to-alt routes?",
        answer:
          "Usually the destination ecosystem. The stable send side matters for funding cost and compatibility, but the destination chain is what determines the route's actual purpose.",
      },
      {
        question: "Why are these routes different from stable-to-BTC routes?",
        answer:
          "Stable-to-BTC routes preserve value in Bitcoin, while stable-to-alt routes are usually about entering another ecosystem for on-chain activity, trading, or application use.",
      },
      {
        question: "Should I compare send networks or destination assets first?",
        answer:
          "Compare destination assets first, then narrow by the stablecoin send rail that best matches the wallet or exchange you already use.",
      },
      {
        question: "Do stable-to-alt routes always end in native assets?",
        answer:
          "The strongest routes usually do, because native settlement is often the reason this family exists at all. But the exact destination still needs to match the route you open.",
      },
    ],
    relatedIds: ["btc-to-alt", "stable-to-btc", "alt-to-alt"],
  },
  "alt-to-btc": {
    id: "alt-to-btc",
    title: "Altcoin to BTC routes",
    templateFamilies: ["alt_to_btc"],
    heroTitle: "Altcoin routes that rotate back into BTC",
    heroDescription:
      "Use this family when the route starts from a non-Bitcoin asset and the destination should settle as native Bitcoin.",
    narrativeHeading: "What this route family covers",
    narrativeParagraphs: [
      "Alt-to-BTC routes are usually about moving out of another ecosystem and back into Bitcoin as the destination asset. The decision is less about stable landing and more about ending in BTC cleanly from the current chain context.",
      "These pages help compare which altcoin ecosystems most often rotate into Bitcoin and which send-side networks need more caution before BTC settlement begins.",
    ],
    guidanceHeading: "When to use this family",
    guidancePoints: [
      "When the starting position is ETH, SOL, BNB, or another alt asset and the destination should be BTC.",
      "When the user wants a Bitcoin landing without stopping in a stablecoin first.",
      "When route comparisons depend on the current ecosystem more than the destination network.",
      "When Bitcoin is the conservative destination asset for the next step.",
    ],
    decisionHeading: "How to compare routes in this family",
    decisionCards: [
      {
        title: "Start with the source ecosystem",
        body: "This family is usually driven by where the route begins, because the current chain context shapes wallet fit, transfer behavior, and route practicality before BTC settlement.",
      },
      {
        title: "Keep Bitcoin as the destination anchor",
        body: "The destination usually stays fixed as BTC, so the main route differences happen on the send side rather than on the settlement side.",
      },
      {
        title: "Compare direct BTC landings",
        body: "This family is strongest when the route lands straight in Bitcoin instead of pausing in a stable asset first.",
      },
    ],
    routeSectionHeading: "Representative altcoin to BTC routes",
    routeSectionDescription:
      "These examples show the clearest ways non-Bitcoin assets rotate back into BTC, with the source ecosystem carrying most of the route nuance before Bitcoin settlement begins.",
    sourceTokenHeading: "Altcoin source assets",
    sourceTokenDescription:
      "These are the non-Bitcoin assets most often rotated into BTC across the current route family.",
    destinationTokenHeading: "BTC destination variants",
    destinationTokenDescription:
      "These are the Bitcoin-native or Bitcoin-linked destinations that capture most of the family once users rotate out of alt exposure.",
    sourceNetworkHeading: "Common source ecosystems",
    sourceNetworkDescription:
      "The source network usually explains why one alt-to-BTC route feels different from another before the Bitcoin destination is reached.",
    destinationNetworkHeading: "Common BTC landing networks",
    destinationNetworkDescription:
      "The destination still clusters around Bitcoin-focused settlement, with some broader Bitcoin-linked variants appearing in the graph.",
    faqHeading: "Alt-to-BTC family FAQ",
    faqs: [
      {
        question: "What is the main comparison inside alt-to-BTC routes?",
        answer:
          "Usually the source ecosystem. Bitcoin stays the destination anchor, so the meaningful route differences often come from the asset and network being exited.",
      },
      {
        question: "Why choose alt-to-BTC instead of alt-to-stable?",
        answer:
          "Use alt-to-BTC when Bitcoin itself is the intended destination asset. Use alt-to-stable when the goal is mainly preservation or a neutral landing asset.",
      },
      {
        question: "Does this family include wrapped BTC destinations too?",
        answer:
          "Yes, the broader family graph can include Bitcoin-linked destinations on other networks, but the cleanest examples are still routes that end in native BTC.",
      },
      {
        question: "Should I compare by asset or by network first?",
        answer:
          "Compare the source asset first, then the source network if the same asset exists across multiple chains or route rails.",
      },
    ],
    relatedIds: ["stable-to-btc", "alt-to-stable", "btc-to-alt"],
  },
  "alt-to-stable": {
    id: "alt-to-stable",
    title: "Altcoin to stable routes",
    templateFamilies: ["alt_to_stable"],
    heroTitle: "Altcoin routes that land in stable assets",
    heroDescription:
      "Use this family when the route starts in a non-stable ecosystem asset and the destination should finish in USDT, USDC, or another stable landing asset.",
    narrativeHeading: "What this route family covers",
    narrativeParagraphs: [
      "Alt-to-stable routes are value-preservation routes. The starting asset may be ETH, SOL, BNB, or another altcoin, but the real outcome is a stable landing asset with the right network fit for whatever happens next.",
      "These pages are useful when the user wants to compare stable exits across ecosystems instead of comparing another round of volatile destinations.",
    ],
    guidanceHeading: "When to use this family",
    guidancePoints: [
      "When the current position is volatile and the destination should finish in a stable asset.",
      "When the route is part of a portfolio exit, treasury move, or take-profit step.",
      "When the landing network of the stablecoin matters after settlement.",
      "When the user wants to compare USDT and USDC exits from the same ecosystem family.",
    ],
    decisionHeading: "How to compare routes in this family",
    decisionCards: [
      {
        title: "Start with the stable destination",
        body: "The landing stable asset is usually the first real decision once the route is being used to exit volatility.",
      },
      {
        title: "Then compare the landing network",
        body: "A stable exit only becomes useful when the destination network still matches what the user wants to do next after settlement.",
      },
      {
        title: "Keep the source ecosystem in view",
        body: "The source asset still matters because some exits are clean native routes while others are cross-network or wrapped-asset variants.",
      },
    ],
    routeSectionHeading: "Representative altcoin to stable routes",
    routeSectionDescription:
      "These examples highlight the clearest ways altcoin exposure exits into a stable landing asset once the decision to reduce volatility is already made.",
    sourceTokenHeading: "Altcoin source assets",
    sourceTokenDescription:
      "These are the volatile assets most often exited when the route should land in a stable destination.",
    destinationTokenHeading: "Stable landing assets",
    destinationTokenDescription:
      "These stable assets capture most of the landing outcomes once the route is being used to reduce exposure.",
    sourceNetworkHeading: "Common source ecosystems",
    sourceNetworkDescription:
      "The source chain still changes route behavior before the stable landing asset is reached.",
    destinationNetworkHeading: "Common stable landing networks",
    destinationNetworkDescription:
      "These networks show where stable exits most often settle once users leave altcoin exposure.",
    faqHeading: "Alt-to-stable family FAQ",
    faqs: [
      {
        question: "What is the main decision inside alt-to-stable routes?",
        answer:
          "Usually the landing stablecoin and its network. Once the route is being used to reduce volatility, the destination needs to fit the next treasury or wallet step.",
      },
      {
        question: "Why compare this family separately from BTC-to-stable?",
        answer:
          "Because the source ecosystem is different. Alt-to-stable routes are mostly about exiting non-Bitcoin volatility, while BTC-to-stable routes start from Bitcoin exposure specifically.",
      },
      {
        question: "Should I compare USDT and USDC separately here?",
        answer:
          "Yes. The stable destination and its network often define what the user can do next, so those differences matter more than they might seem at a generic route level.",
      },
      {
        question: "Is the source asset still important if the destination is stable?",
        answer:
          "Yes. The source asset and network still shape route practicality, even if the destination stablecoin is the final reason the route exists.",
      },
    ],
    relatedIds: ["btc-to-stable", "alt-to-btc", "stable-to-alt"],
  },
  "alt-to-alt": {
    id: "alt-to-alt",
    title: "Altcoin to altcoin routes",
    templateFamilies: ["alt_to_alt"],
    heroTitle: "Cross-ecosystem routes between volatile assets",
    heroDescription:
      "Use this family when the route starts and ends in non-stable assets, usually because the user is switching ecosystem exposure rather than preserving value.",
    narrativeHeading: "What this route family covers",
    narrativeParagraphs: [
      "Alt-to-alt routes are the most ecosystem-sensitive family in the graph. They are usually about switching chains, application environments, or exposure narratives without landing in BTC or a stablecoin along the way.",
      "These pages are useful when users want to compare direct ecosystem switches and understand which chain contexts appear most often on each side of the route.",
    ],
    guidanceHeading: "When to use this family",
    guidancePoints: [
      "When the destination should stay volatile but move into a different ecosystem.",
      "When the route is about rebalancing between app environments rather than preserving value.",
      "When the user wants to compare direct chain-to-chain switches without a stable stop.",
      "When destination wallet compatibility matters on both sides of the route.",
    ],
    decisionHeading: "How to compare routes in this family",
    decisionCards: [
      {
        title: "Start with the destination ecosystem",
        body: "This family is usually about where exposure should move next, not whether it should stay volatile at all.",
      },
      {
        title: "Compare chain context on both sides",
        body: "Because neither side is stable, wallet compatibility and native settlement can matter on both ends of the route.",
      },
      {
        title: "Use this family for direct switches",
        body: "These routes matter most when the user wants a direct ecosystem switch without pausing in BTC or a stablecoin.",
      },
    ],
    routeSectionHeading: "Representative altcoin to altcoin routes",
    routeSectionDescription:
      "These examples show the strongest direct ecosystem switches inside the current family, where both the source and destination remain volatile assets.",
    sourceTokenHeading: "Source ecosystem assets",
    sourceTokenDescription:
      "These are the volatile source assets most often used when the route is a direct ecosystem switch rather than a preservation move.",
    destinationTokenHeading: "Destination ecosystem assets",
    destinationTokenDescription:
      "These are the target assets most often chosen when the user wants a new volatile destination instead of a stable or BTC landing.",
    sourceNetworkHeading: "Common source ecosystems",
    sourceNetworkDescription:
      "These source networks show where direct ecosystem switches most often begin.",
    destinationNetworkHeading: "Common destination ecosystems",
    destinationNetworkDescription:
      "These destination networks show where direct chain switches most often end once the user keeps exposure volatile.",
    faqHeading: "Alt-to-alt family FAQ",
    faqs: [
      {
        question: "What makes alt-to-alt routes different from the other families?",
        answer:
          "Neither side of the route is a stable or BTC landing. That means the route is usually about switching ecosystem exposure directly rather than preserving value.",
      },
      {
        question: "What should I compare first in alt-to-alt routes?",
        answer:
          "Start with the destination ecosystem, then compare how the source chain affects wallet fit and route practicality before settlement happens.",
      },
      {
        question: "Why does chain context matter more here?",
        answer:
          "Because both sides are ecosystem-specific. Without a stable or BTC stop in the middle, compatibility and native settlement can matter on both ends of the route.",
      },
      {
        question: "When should I avoid alt-to-alt routes?",
        answer:
          "If the real goal is preservation or a more neutral landing asset, the better comparison is usually alt-to-stable or alt-to-BTC instead of staying in a volatile destination.",
      },
    ],
    relatedIds: ["stable-to-alt", "btc-to-alt", "alt-to-stable"],
  },
};

const TEMPLATE_FAMILY_TO_CLUSTER: Partial<
  Record<PairTemplateFamily, PairClusterPageId>
> = {
  stable_network_specific_to_btc: "stable-to-btc",
  stable_to_btc: "stable-to-btc",
  btc_to_stable: "btc-to-stable",
  btc_to_alt: "btc-to-alt",
  stable_to_alt: "stable-to-alt",
  alt_to_btc: "alt-to-btc",
  alt_to_stable: "alt-to-stable",
  alt_to_alt: "alt-to-alt",
};

function getStateLabel(state: PairIndexState) {
  switch (state) {
    case "index":
      return "Featured now";
    case "noindex":
      return "Mapped next";
    default:
      return "Skip";
  }
}

function getClusterInventoryItems(templateFamilies: PairTemplateFamily[]) {
  return getPhaseOnePairInventory().items.filter((item) =>
    templateFamilies.includes(item.templateFamily),
  );
}

function pushUniqueByKey(
  target: PairInventoryItem[],
  source: PairInventoryItem[],
  keyFor: (item: PairInventoryItem) => string,
  limit: number,
) {
  const seen = new Set(target.map((item) => item.slug));
  const seenKeys = new Set<string>();

  for (const item of target) {
    seenKeys.add(keyFor(item));
  }

  for (const item of source) {
    if (target.length >= limit) {
      break;
    }

    const key = keyFor(item);
    if (seen.has(item.slug) || seenKeys.has(key)) {
      continue;
    }

    target.push(item);
    seen.add(item.slug);
    seenKeys.add(key);
  }
}

function getRepresentativeClusterRoutes(
  clusterId: PairClusterPageId,
  items: PairInventoryItem[],
  limit = 9,
) {
  const selected: PairInventoryItem[] = [];

  switch (clusterId) {
    case "stable-to-btc": {
      const nativeBtc = items.filter((item) => item.toToken === "BTC");
      const stableRails = nativeBtc.filter((item) =>
        ["USDT", "USDC", "DAI"].includes(item.fromToken),
      );

      pushUniqueByKey(
        selected,
        stableRails,
        (item) => `${item.fromToken}-${item.fromNetworkId}`,
        limit,
      );
      pushUniqueByKey(
        selected,
        nativeBtc,
        (item) => `${item.fromToken}-${item.fromNetworkId}`,
        limit,
      );
      pushUniqueByKey(
        selected,
        items.filter((item) => item.toToken !== "BTC"),
        (item) => `${item.fromToken}-${item.toToken}-${item.fromNetworkId}`,
        limit,
      );
      break;
    }
    case "btc-to-stable": {
      const nativeBtc = items.filter((item) => item.fromToken === "BTC");
      const stableLandings = nativeBtc.filter((item) =>
        ["USDT", "USDC", "DAI"].includes(item.toToken),
      );

      pushUniqueByKey(
        selected,
        stableLandings,
        (item) => `${item.toToken}-${item.toNetworkId}`,
        limit,
      );
      pushUniqueByKey(
        selected,
        nativeBtc,
        (item) => `${item.toToken}-${item.toNetworkId}`,
        limit,
      );
      pushUniqueByKey(
        selected,
        items.filter((item) => item.fromToken !== "BTC"),
        (item) => `${item.fromToken}-${item.toToken}-${item.toNetworkId}`,
        limit,
      );
      break;
    }
    case "btc-to-alt": {
      const nativeBtc = items.filter((item) => item.fromToken === "BTC");
      const ecosystemTargets = nativeBtc.filter((item) =>
        ["ETH", "SOL", "BNB", "TON", "XRP"].includes(item.toToken),
      );

      pushUniqueByKey(
        selected,
        ecosystemTargets,
        (item) => item.toToken,
        limit,
      );
      pushUniqueByKey(
        selected,
        nativeBtc,
        (item) => `${item.toToken}-${item.toNetworkId}`,
        limit,
      );
      pushUniqueByKey(
        selected,
        items.filter((item) => item.fromToken !== "BTC"),
        (item) => `${item.fromToken}-${item.toToken}-${item.toNetworkId}`,
        limit,
      );
      break;
    }
    default:
      pushUniqueByKey(
        selected,
        items,
        (item) => `${item.fromToken}-${item.toToken}-${item.fromNetworkId}-${item.toNetworkId}`,
        limit,
      );
      break;
  }

  return selected;
}

function buildClusterDirectoryCard(
  definition: PairClusterPageDefinition,
  report: PairClusterReportItem,
): PairClusterDirectoryCard {
  return {
    id: definition.id,
    href: `/swap/${definition.id}`,
    title: definition.title,
    summary: definition.heroDescription,
    totalRoutes: report.totalRoutes,
    indexRoutes: report.countsByState.index,
    noindexRoutes: report.countsByState.noindex,
  };
}

function buildRouteSummary(slug: string, fallback: string) {
  const spec = resolvePairPageSpec(slug);

  if (!spec) {
    return fallback;
  }

  return spec.useCase || spec.intro;
}

function buildRouteCards(cluster: PairClusterReportItem): PairClusterRouteCard[] {
  return cluster.topRoutes.map((route) => ({
    slug: route.slug,
    href: `/swap/${route.slug}`,
    label: `${route.fromLabel} to ${route.toLabel}`,
    summary: buildRouteSummary(route.slug, route.reasons[0] || cluster.summary),
    fromToken: route.fromToken,
    fromLabel: route.fromLabel,
    fromNetworkId: route.fromNetworkId,
    fromNetworkLabel: route.fromNetworkLabel,
    toToken: route.toToken,
    toLabel: route.toLabel,
    toNetworkId: route.toNetworkId,
    toNetworkLabel: route.toNetworkLabel,
    state: route.state,
  }));
}

function buildTokenCountCards(
  items: PairClusterReportItem["topSourceTokens"],
): PairClusterCountCard[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    href: `/tokens/${item.id}`,
    count: item.count,
  }));
}

function buildNetworkCountCards(
  items: PairClusterReportItem["topSourceNetworks"],
): PairClusterCountCard[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    href: `/networks/${item.id}`,
    count: item.count,
  }));
}

export function getPairClusterPageIds(): PairClusterPageId[] {
  return Object.keys(CLUSTER_PAGE_DEFINITIONS) as PairClusterPageId[];
}

export function getPairClusterDirectoryCards() {
  const report = getPairClusterReport();

  return getPairClusterPageIds()
    .map((id) => {
      const definition = CLUSTER_PAGE_DEFINITIONS[id];
      const cluster = report.clusters.find((item) => item.id === id);

      if (!cluster) {
        return null;
      }

      return buildClusterDirectoryCard(definition, cluster);
    })
    .filter((item): item is PairClusterDirectoryCard => Boolean(item));
}

function buildClusterDirectoryCardsFromReport(report: PairClusterReport) {
  return getPairClusterPageIds()
    .map((id) => {
      const definition = CLUSTER_PAGE_DEFINITIONS[id];
      const cluster = report.clusters.find((item) => item.id === id);

      if (!cluster) {
        return null;
      }

      return buildClusterDirectoryCard(definition, cluster);
    })
    .filter((item): item is PairClusterDirectoryCard => Boolean(item));
}

export function getPairClusterLinksForTemplateFamily(
  templateFamily: PairTemplateFamily,
): PairClusterDirectoryCard[] {
  const report = getPairClusterReport();
  const directoryCards = buildClusterDirectoryCardsFromReport(report);
  const primaryId = TEMPLATE_FAMILY_TO_CLUSTER[templateFamily];

  if (!primaryId) {
    return [];
  }

  const primaryDefinition = CLUSTER_PAGE_DEFINITIONS[primaryId];
  const primaryCard = directoryCards.find((item) => item.id === primaryId);

  if (!primaryDefinition || !primaryCard) {
    return [];
  }

  const relatedCards = primaryDefinition.relatedIds
    .map((id) => directoryCards.find((item) => item.id === id))
    .filter((item): item is PairClusterDirectoryCard => Boolean(item))
    .slice(0, 1);

  return [primaryCard, ...relatedCards];
}

export function getPairClusterPageData(id: PairClusterPageId): PairClusterPageData | null {
  const definition = CLUSTER_PAGE_DEFINITIONS[id];
  const cluster = getPairClusterReport().clusters.find((item) => item.id === id);

  if (!definition || !cluster) {
    return null;
  }

  const directoryCards = getPairClusterDirectoryCards();
  const clusterItems = getClusterInventoryItems(definition.templateFamilies);
  const representativeRoutes = getRepresentativeClusterRoutes(id, clusterItems);
  const relatedClusters = definition.relatedIds
    .map((relatedId) => directoryCards.find((item) => item.id === relatedId))
    .filter((item): item is PairClusterDirectoryCard => Boolean(item));

  return {
    id,
    href: `/swap/${id}`,
    title: definition.title,
    heroTitle: definition.heroTitle,
    heroDescription: definition.heroDescription,
    narrativeHeading: definition.narrativeHeading,
    narrativeParagraphs: definition.narrativeParagraphs,
    guidanceHeading: definition.guidanceHeading,
    guidancePoints: definition.guidancePoints,
    decisionHeading: definition.decisionHeading,
    decisionCards: definition.decisionCards,
    stats: [
      { label: "Total routes", value: String(cluster.totalRoutes) },
      { label: "Featured now", value: String(cluster.countsByState.index) },
      { label: "Mapped next", value: String(cluster.countsByState.noindex) },
      { label: "Curated seeds", value: String(cluster.curatedRoutes) },
    ],
    routeSectionHeading: definition.routeSectionHeading,
    routeSectionDescription: definition.routeSectionDescription,
    topRoutes: buildRouteCards({
      ...cluster,
      topRoutes: representativeRoutes,
    }),
    sourceTokenHeading: definition.sourceTokenHeading,
    sourceTokenDescription: definition.sourceTokenDescription,
    topSourceTokens: buildTokenCountCards(cluster.topSourceTokens),
    destinationTokenHeading: definition.destinationTokenHeading,
    destinationTokenDescription: definition.destinationTokenDescription,
    topDestinationTokens: buildTokenCountCards(cluster.topDestinationTokens),
    sourceNetworkHeading: definition.sourceNetworkHeading,
    sourceNetworkDescription: definition.sourceNetworkDescription,
    topSourceNetworks: buildNetworkCountCards(cluster.topSourceNetworks),
    destinationNetworkHeading: definition.destinationNetworkHeading,
    destinationNetworkDescription: definition.destinationNetworkDescription,
    topDestinationNetworks: buildNetworkCountCards(cluster.topDestinationNetworks),
    faqHeading: definition.faqHeading,
    faqs: definition.faqs,
    relatedClusters,
    report: cluster,
  };
}

export function getPairClusterPageMetadata(
  id: PairClusterPageId,
) {
  const definition = CLUSTER_PAGE_DEFINITIONS[id];

  return {
    title: `${definition.title} | ZyroShift`,
    description: definition.heroDescription,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `https://zyroshift.com/swap/${id}`,
    },
  };
}

export function getPairClusterStateLabel(state: PairIndexState) {
  return getStateLabel(state);
}
