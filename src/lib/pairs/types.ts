export type TokenCategory =
  | "btc"
  | "stable"
  | "layer1"
  | "layer2"
  | "defi"
  | "meme"
  | "exchange"
  | "gaming"
  | "other";

export type TokenPriority = "high" | "medium" | "low";

export type PairIntentType =
  | "btc_to_stable"
  | "btc_to_alt"
  | "btc_to_meme"
  | "stable_to_btc"
  | "stable_to_alt"
  | "alt_to_btc"
  | "alt_to_stable"
  | "alt_to_alt"
  | "meme_to_stable"
  | "meme_to_btc"
  | "other";

export type PairTemplateFamily =
  | "stable_network_specific_to_btc"
  | "stable_to_btc"
  | "btc_to_stable"
  | "stable_to_alt"
  | "btc_to_alt"
  | "alt_to_btc"
  | "alt_to_stable"
  | "alt_to_alt"
  | "other";

export type PairIndexState = "index" | "noindex" | "skip";

export type NetworkModifier =
  | "network_variant"
  | "cross_chain"
  | "same_chain"
  | "bitcoin_confirmation_sensitive"
  | "stablecoin_network_sensitive"
  | "address_format_sensitive"
  | "memo_warning"
  | "low_fee_route"
  | "l2_exit"
  | "none";

export type PairPageFaq = {
  question: string;
  answer: string;
};

export type PairHeroBadge = {
  label: string;
  tone: "info" | "warning" | "success";
};

export type PairExploreLink = {
  href: string;
  label: string;
  detail: string;
};

export type PairBuilderPreset = {
  fromCoin: string;
  fromNetwork: string;
  toCoin: string;
  toNetwork: string;
};

export type PairPageSeed = {
  slug: string;
  fromLabel: string;
  toLabel: string;
  fromNetworkLabel: string;
  toNetworkLabel: string;
  builderPreset: PairBuilderPreset;
  relatedSlugs?: string[];
  priorityScore: number;
  indexable?: boolean;
  extraNotes?: string[];
  classification?: Partial<PairClassification>;
  overrides?: Partial<{
    intro: string;
    useCase: string;
    etaNote: string;
    minMaxNote: string;
    howItWorks: string[];
  }>;
};

export type PairClassification = {
  fromCategory: TokenCategory;
  toCategory: TokenCategory;
  pairIntentType: PairIntentType;
  templateFamily: PairTemplateFamily;
  networkModifiers: NetworkModifier[];
};

export type PairIndexabilityBreakdown = {
  intentStrength: number;
  tokenPriority: number;
  networkSpecificity: number;
  contentDifferentiation: number;
  internalLinkValue: number;
  metadataReadiness: number;
  total: number;
};

export type PairIndexabilityEvaluation = {
  state: PairIndexState;
  launchRequested: boolean;
  readyForIndex: boolean;
  renderReady: boolean;
  breakdown: PairIndexabilityBreakdown;
  reasons: string[];
};

export type PairPageSpec = PairPageSeed &
  PairClassification & {
    title: string;
    description: string;
    h1: string;
    intro: string;
    useCase: string;
    etaNote: string;
    minMaxNote: string;
    howItWorks: string[];
    networkNotes: string[];
    faqs: PairPageFaq[];
    indexability: PairIndexabilityEvaluation;
  };

export type ParsedPairSlug = {
  slug: string;
  fromToken: string;
  toToken: string;
  fromNetwork: string | null;
  toNetwork: string | null;
};

export type TokenCatalogEntry = {
  symbol: string;
  name: string;
  category: TokenCategory;
  priority: TokenPriority;
  networks: string[];
  networkLabels: string[];
  networkCount: number;
  hasMemoRoutes: boolean;
  depositEnabledNetworkCount: number;
  settleEnabledNetworkCount: number;
  classificationSource?: string;
  classificationReason?: string;
  prioritySource?: string;
  priorityReason?: string;
  aliases?: string[];
  preferredNetworks?: string[];
};
