import type { PairPageFaq, PairPageSpec } from "@/lib/pairs/types";

export type GuidePairType =
  | "token_to_stablecoin"
  | "stablecoin_to_token"
  | "token_to_token";

export type GuideStepVisualState =
  | "mode"
  | "select"
  | "amount"
  | "review"
  | "confirm"
  | "settled";

export type GuideSnapshotItem = {
  label: string;
  value: string;
};

export type GuideRateModeCard = {
  title: string;
  summary: string;
  bullets: string[];
};

export type GuideStep = {
  title: string;
  body: string;
  visualCaption: string;
  visualState: GuideStepVisualState;
  showVisual?: boolean;
};

export type GuideMistake = {
  title: string;
  body: string;
};

export type GuidePageSpec = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  fromToken: string;
  toToken: string;
  fromNetworkId: string;
  toNetworkId: string;
  fromNetworkLabel: string;
  toNetworkLabel: string;
  fromIconSources: string[];
  toIconSources: string[];
  pairType: GuidePairType;
  isCrossChain: boolean;
  moneyHref: string;
  guideHref: string;
  supportedSourceNetworks: Array<{
    id: string;
    label: string;
  }>;
  supportedDestinationNetworks: Array<{
    id: string;
    label: string;
  }>;
  rateModeCards: GuideRateModeCard[];
  snapshotItems: GuideSnapshotItem[];
  steps: GuideStep[];
  reasons: string[];
  feeAndTimingPoints: string[];
  networkCompatibilityPoints: string[];
  mistakes: GuideMistake[];
  faqs: PairPageFaq[];
  relatedRoutes: PairPageSpec[];
  swapSpec: PairPageSpec;
};
