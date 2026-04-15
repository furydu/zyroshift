import { buildPairPageSpec } from "@/lib/pairs/pairCopy";
import type { PairPageSeed } from "@/lib/pairs/types";

const PAIR_PAGE_SEEDS: PairPageSeed[] = [
  {
    slug: "usdt-trc20-to-btc",
    fromLabel: "USDT",
    toLabel: "BTC",
    fromNetworkLabel: "Tron (TRC20)",
    toNetworkLabel: "Bitcoin",
    builderPreset: {
      fromCoin: "USDT",
      fromNetwork: "tron",
      toCoin: "BTC",
      toNetwork: "bitcoin",
    },
    relatedSlugs: [
      "usdt-erc20-to-btc",
      "usdt-bep20-to-btc",
      "btc-to-usdt",
      "eth-to-btc",
    ],
    priorityScore: 98,
    indexable: true,
    overrides: {
      intro:
        "Move from low-cost USDT on Tron into native BTC with a non-custodial route that starts in the builder and finishes on a dedicated status page.",
    },
    extraNotes: [
      "Double-check that the deposit is sent as USDT on TRC20, not ERC20 or another USDT network.",
    ],
  },
  {
    slug: "btc-to-eth",
    fromLabel: "BTC",
    toLabel: "ETH",
    fromNetworkLabel: "Bitcoin",
    toNetworkLabel: "Ethereum",
    builderPreset: {
      fromCoin: "BTC",
      fromNetwork: "bitcoin",
      toCoin: "ETH",
      toNetwork: "ethereum",
    },
    relatedSlugs: ["eth-to-btc", "btc-to-usdt", "btc-to-sol", "usdt-to-eth"],
    priorityScore: 97,
    indexable: true,
  },
  {
    slug: "btc-to-usdt",
    fromLabel: "BTC",
    toLabel: "USDT",
    fromNetworkLabel: "Bitcoin",
    toNetworkLabel: "Tron",
    builderPreset: {
      fromCoin: "BTC",
      fromNetwork: "bitcoin",
      toCoin: "USDT",
      toNetwork: "tron",
    },
    relatedSlugs: ["btc-to-usdc", "usdt-trc20-to-btc", "eth-to-usdt", "btc-to-eth"],
    priorityScore: 96,
    indexable: true,
  },
  {
    slug: "eth-to-btc",
    fromLabel: "ETH",
    toLabel: "BTC",
    fromNetworkLabel: "Ethereum",
    toNetworkLabel: "Bitcoin",
    builderPreset: {
      fromCoin: "ETH",
      fromNetwork: "ethereum",
      toCoin: "BTC",
      toNetwork: "bitcoin",
    },
    relatedSlugs: ["btc-to-eth", "eth-to-usdt", "eth-to-usdc", "usdc-to-btc"],
    priorityScore: 95,
    indexable: true,
  },
  {
    slug: "usdt-erc20-to-btc",
    fromLabel: "USDT",
    toLabel: "BTC",
    fromNetworkLabel: "Ethereum (ERC20)",
    toNetworkLabel: "Bitcoin",
    builderPreset: {
      fromCoin: "USDT",
      fromNetwork: "ethereum",
      toCoin: "BTC",
      toNetwork: "bitcoin",
    },
    relatedSlugs: [
      "usdt-trc20-to-btc",
      "usdt-bep20-to-btc",
      "usdc-to-btc",
      "eth-to-btc",
    ],
    priorityScore: 94,
    indexable: true,
    extraNotes: [
      "Double-check that the deposit is sent as USDT on ERC20, not TRC20, BEP20, or another USDT network.",
    ],
  },
  {
    slug: "btc-to-sol",
    fromLabel: "BTC",
    toLabel: "SOL",
    fromNetworkLabel: "Bitcoin",
    toNetworkLabel: "Solana",
    builderPreset: {
      fromCoin: "BTC",
      fromNetwork: "bitcoin",
      toCoin: "SOL",
      toNetwork: "solana",
    },
    relatedSlugs: ["sol-to-btc", "btc-to-eth", "btc-to-usdt", "btc-to-bnb"],
    priorityScore: 93,
    indexable: true,
    extraNotes: [
      "Make sure the receiving wallet is a native Solana address that can receive SOL on Solana.",
    ],
  },
  {
    slug: "eth-to-usdc",
    fromLabel: "ETH",
    toLabel: "USDC",
    fromNetworkLabel: "Ethereum",
    toNetworkLabel: "Ethereum",
    builderPreset: {
      fromCoin: "ETH",
      fromNetwork: "ethereum",
      toCoin: "USDC",
      toNetwork: "ethereum",
    },
    relatedSlugs: ["eth-to-usdt", "btc-to-usdc", "usdc-base-to-eth", "btc-to-eth"],
    priorityScore: 92,
    indexable: true,
  },
  {
    slug: "usdc-base-to-eth",
    fromLabel: "USDC",
    toLabel: "ETH",
    fromNetworkLabel: "Base",
    toNetworkLabel: "Ethereum",
    builderPreset: {
      fromCoin: "USDC",
      fromNetwork: "base",
      toCoin: "ETH",
      toNetwork: "ethereum",
    },
    relatedSlugs: ["usdt-to-eth", "eth-to-usdc", "eth-to-btc", "btc-to-eth"],
    priorityScore: 91,
    indexable: true,
    extraNotes: [
      "You are sending USDC on Base and receiving ETH on Ethereum, so the destination must be an ETH-compatible wallet on Ethereum.",
    ],
  },
  {
    slug: "btc-to-usdc",
    fromLabel: "BTC",
    toLabel: "USDC",
    fromNetworkLabel: "Bitcoin",
    toNetworkLabel: "Ethereum",
    builderPreset: {
      fromCoin: "BTC",
      fromNetwork: "bitcoin",
      toCoin: "USDC",
      toNetwork: "ethereum",
    },
    relatedSlugs: ["btc-to-usdt", "usdc-to-btc", "eth-to-usdc", "btc-to-eth"],
    priorityScore: 90,
    indexable: true,
  },
  {
    slug: "eth-to-usdt",
    fromLabel: "ETH",
    toLabel: "USDT",
    fromNetworkLabel: "Ethereum",
    toNetworkLabel: "Tron",
    builderPreset: {
      fromCoin: "ETH",
      fromNetwork: "ethereum",
      toCoin: "USDT",
      toNetwork: "tron",
    },
    relatedSlugs: ["eth-to-usdc", "usdt-to-eth", "btc-to-usdt", "eth-to-btc"],
    priorityScore: 89,
    indexable: true,
  },
  {
    slug: "sol-to-usdt",
    fromLabel: "SOL",
    toLabel: "USDT",
    fromNetworkLabel: "Solana",
    toNetworkLabel: "Tron (TRC20)",
    builderPreset: {
      fromCoin: "SOL",
      fromNetwork: "solana",
      toCoin: "USDT",
      toNetwork: "tron",
    },
    relatedSlugs: ["sol-to-btc", "btc-to-usdt", "eth-to-usdt", "eth-to-usdc"],
    priorityScore: 88,
    indexable: true,
  },
  {
    slug: "sol-to-btc",
    fromLabel: "SOL",
    toLabel: "BTC",
    fromNetworkLabel: "Solana",
    toNetworkLabel: "Bitcoin",
    builderPreset: {
      fromCoin: "SOL",
      fromNetwork: "solana",
      toCoin: "BTC",
      toNetwork: "bitcoin",
    },
    relatedSlugs: ["btc-to-sol", "sol-to-usdt", "eth-to-btc", "bnb-to-btc"],
    priorityScore: 87,
    indexable: true,
  },
  {
    slug: "usdc-to-btc",
    fromLabel: "USDC",
    toLabel: "BTC",
    fromNetworkLabel: "Ethereum",
    toNetworkLabel: "Bitcoin",
    builderPreset: {
      fromCoin: "USDC",
      fromNetwork: "ethereum",
      toCoin: "BTC",
      toNetwork: "bitcoin",
    },
    relatedSlugs: ["usdt-erc20-to-btc", "usdt-trc20-to-btc", "btc-to-usdc", "eth-to-btc"],
    priorityScore: 86,
    indexable: true,
  },
  {
    slug: "bnb-to-btc",
    fromLabel: "BNB",
    toLabel: "BTC",
    fromNetworkLabel: "BNB Chain",
    toNetworkLabel: "Bitcoin",
    builderPreset: {
      fromCoin: "BNB",
      fromNetwork: "bsc",
      toCoin: "BTC",
      toNetwork: "bitcoin",
    },
    relatedSlugs: ["btc-to-bnb", "usdt-bep20-to-btc", "sol-to-btc", "eth-to-btc"],
    priorityScore: 85,
    indexable: true,
  },
  {
    slug: "btc-to-bnb",
    fromLabel: "BTC",
    toLabel: "BNB",
    fromNetworkLabel: "Bitcoin",
    toNetworkLabel: "BNB Chain",
    builderPreset: {
      fromCoin: "BTC",
      fromNetwork: "bitcoin",
      toCoin: "BNB",
      toNetwork: "bsc",
    },
    relatedSlugs: ["bnb-to-btc", "btc-to-sol", "btc-to-eth", "btc-to-usdt"],
    priorityScore: 84,
    indexable: true,
    extraNotes: [
      "The receiving wallet must be able to accept native BNB on BNB Chain, not a wrapped BNB representation on another network.",
    ],
  },
  {
    slug: "usdt-bep20-to-btc",
    fromLabel: "USDT",
    toLabel: "BTC",
    fromNetworkLabel: "BNB Chain (BEP20)",
    toNetworkLabel: "Bitcoin",
    builderPreset: {
      fromCoin: "USDT",
      fromNetwork: "bsc",
      toCoin: "BTC",
      toNetwork: "bitcoin",
    },
    relatedSlugs: [
      "usdt-trc20-to-btc",
      "usdt-erc20-to-btc",
      "bnb-to-btc",
      "usdc-to-btc",
    ],
    priorityScore: 83,
    indexable: true,
    extraNotes: [
      "Double-check that the deposit is sent as USDT on BEP20, not TRC20, ERC20, or another USDT network.",
    ],
  },
  {
    slug: "usdt-to-eth",
    fromLabel: "USDT",
    toLabel: "ETH",
    fromNetworkLabel: "Tron",
    toNetworkLabel: "Ethereum",
    builderPreset: {
      fromCoin: "USDT",
      fromNetwork: "tron",
      toCoin: "ETH",
      toNetwork: "ethereum",
    },
    relatedSlugs: ["usdc-base-to-eth", "eth-to-usdt", "btc-to-eth", "usdt-trc20-to-btc"],
    priorityScore: 82,
    indexable: true,
  },
];

const PAIR_PAGE_SPECS = PAIR_PAGE_SEEDS.map(buildPairPageSpec);

const PAIR_PAGE_SPEC_MAP = new Map(
  PAIR_PAGE_SPECS.map((spec) => [spec.slug, spec]),
);

export function getPairPageSpec(slug: string) {
  return PAIR_PAGE_SPEC_MAP.get(slug.trim().toLowerCase());
}

export function getPairPageSpecs() {
  return PAIR_PAGE_SPECS;
}

export function getPairPageStaticParams() {
  return PAIR_PAGE_SPECS.filter((spec) => spec.indexable).map((spec) => ({
    pair: spec.slug,
  }));
}
