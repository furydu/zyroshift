import type {
  FixedQuoteResult,
  QuoteInput,
  QuoteResult,
  SideShiftFixedQuoteResponse,
  ShiftOrderView,
  SideShiftCoin,
  SideShiftDeposit,
  SideShiftNetworkFlag,
  SideShiftPairResponse,
  SideShiftShiftResponse,
  SwapAssetOption,
  TimelineStep,
  TimelineStepKey,
} from "@/lib/sideshift/types";

const NETWORK_LABELS: Record<string, string> = {
  mainnet: "Mainnet",
  bitcoin: "Bitcoin",
  bitcoincash: "Bitcoin Cash",
  ethereum: "Ethereum",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  polygon: "Polygon",
  avax: "Avalanche",
  bsc: "BNB Smart Chain",
  solana: "Solana",
  tron: "Tron",
  litecoin: "Litecoin",
  doge: "Dogecoin",
  ton: "TON",
  liquid: "Liquid",
};

const STATUS_META: Record<
  string,
  { label: string; detail: string; step: TimelineStepKey }
> = {
  waiting: {
    label: "Waiting",
    detail: "No deposit has been detected yet.",
    step: "waiting",
  },
  pending: {
    label: "Deposit received",
    detail:
      "The deposit has been detected and is waiting for blockchain confirmations.",
    step: "received",
  },
  processing: {
    label: "Processing",
    detail: "The confirmed deposit is being processed.",
    step: "processing",
  },
  review: {
    label: "Under review",
    detail: "The shift requires manual review before settlement or refund.",
    step: "processing",
  },
  settling: {
    label: "Settlement in progress",
    detail: "The payout transaction is in progress.",
    step: "processing",
  },
  settled: {
    label: "Completed",
    detail: "The settlement transaction has been confirmed.",
    step: "completed",
  },
  refund: {
    label: "Refund in progress",
    detail: "A refund is being prepared for this shift.",
    step: "processing",
  },
  refunded: {
    label: "Refunded",
    detail: "The shift was refunded instead of settled.",
    step: "processing",
  },
  expired: {
    label: "Expired",
    detail: "The shift expired before a usable deposit was processed.",
    step: "waiting",
  },
};

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isFlagActive(flag: SideShiftNetworkFlag, network: string) {
  if (Array.isArray(flag)) {
    return flag.includes(network);
  }

  return Boolean(flag);
}

function supportsVariable(coin: SideShiftCoin, network: string) {
  return !isFlagActive(coin.fixedOnly, network);
}

function supportsFixed(coin: SideShiftCoin, network: string) {
  return !isFlagActive(coin.variableOnly, network);
}

function toEstimatedReceive(amount?: string, rate?: string) {
  if (!amount || !rate) {
    return undefined;
  }

  const depositAmount = Number(amount);
  const exchangeRate = Number(rate);

  if (!Number.isFinite(depositAmount) || !Number.isFinite(exchangeRate)) {
    return undefined;
  }

  return (depositAmount * exchangeRate).toString();
}

function getEffectiveStatus(
  shift: SideShiftShiftResponse,
  latestDeposit?: SideShiftDeposit,
) {
  if (shift.status === "multiple" && latestDeposit?.status) {
    return latestDeposit.status;
  }

  if (shift.status === "waiting" && shift.depositReceivedAt) {
    return "processing";
  }

  return shift.status;
}

function buildTimeline(currentStep: TimelineStepKey): TimelineStep[] {
  const stepOrder: TimelineStepKey[] = [
    "waiting",
    "received",
    "processing",
    "completed",
  ];

  const labels: Record<TimelineStepKey, { label: string; description: string }> = {
    waiting: {
      label: "Waiting",
      description: "Deposit address is live and ready to receive funds.",
    },
    received: {
      label: "Received",
      description: "The deposit has been detected.",
    },
    processing: {
      label: "Processing",
      description: "The confirmed deposit is being converted and sent.",
    },
    completed: {
      label: "Completed",
      description: "The output asset has been delivered to the receiving address.",
    },
  };

  const currentIndex = stepOrder.indexOf(currentStep);

  return stepOrder.map((step, index) => ({
    key: step,
    label: labels[step].label,
    description: labels[step].description,
    state:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

export function networkToLabel(network: string) {
  return NETWORK_LABELS[network] || titleCase(network);
}

export function normalizeAssets(coins: SideShiftCoin[]): SwapAssetOption[] {
  return coins
    .map((coin) => ({
      coin: coin.coin,
      name: coin.name,
      networks: coin.networks
        .map((network) => ({
          id: network,
          label: networkToLabel(network),
          hasMemo: coin.networksWithMemo.includes(network),
          depositEnabled:
            !isFlagActive(coin.depositOffline, network),
          settleEnabled:
            !isFlagActive(coin.settleOffline, network),
          supportsVariable: supportsVariable(coin, network),
          supportsFixed: supportsFixed(coin, network),
          contractAddress: coin.tokenDetails?.[network]?.contractAddress,
          decimals: coin.tokenDetails?.[network]?.decimals,
        }))
        .filter(
          (network) =>
            (network.depositEnabled || network.settleEnabled) &&
            (network.supportsVariable || network.supportsFixed),
        ),
    }))
    .filter((coin) => coin.networks.length > 0)
    .sort((left, right) => left.coin.localeCompare(right.coin));
}

export function normalizeQuote(
  quote: SideShiftPairResponse,
  input: QuoteInput,
): QuoteResult {
  return {
    ...quote,
    amount: input.amount,
    estimatedReceive: toEstimatedReceive(input.amount, quote.rate),
    feeLabel: "Included in the rate",
  };
}

export function normalizeFixedQuote(
  quote: SideShiftFixedQuoteResponse,
): FixedQuoteResult {
  return {
    id: quote.id,
    createdAt: quote.createdAt,
    expiresAt: quote.expiresAt,
    depositCoin: quote.depositCoin,
    settleCoin: quote.settleCoin,
    depositNetwork: quote.depositNetwork,
    settleNetwork: quote.settleNetwork,
    depositAmount: quote.depositAmount,
    settleAmount: quote.settleAmount,
    rate: quote.rate,
    feeLabel: "Locked for 15 minutes",
  };
}

export function normalizeShift(shift: SideShiftShiftResponse): ShiftOrderView {
  const latestDeposit = shift.deposits?.at(-1);
  const effectiveStatus = getEffectiveStatus(shift, latestDeposit);
  const statusMeta = STATUS_META[effectiveStatus] || {
    label: titleCase(effectiveStatus),
    detail: "The shift is updating.",
    step: "processing" as const,
  };

  const terminalKind =
    effectiveStatus === "settled"
      ? "success"
      : effectiveStatus === "expired"
        ? "expired"
        : effectiveStatus === "refund" || effectiveStatus === "refunded"
          ? "refund"
          : effectiveStatus === "review"
            ? "issue"
            : null;

  return {
    id: shift.id,
    createdAt: shift.createdAt,
    updatedAt: latestDeposit?.updatedAt || shift.updatedAt,
    depositCoin: shift.depositCoin,
    settleCoin: shift.settleCoin,
    depositNetwork: shift.depositNetwork,
    settleNetwork: shift.settleNetwork,
    depositAddress: shift.depositAddress,
    depositMemo: shift.depositMemo,
    settleAddress: shift.settleAddress,
    settleMemo: shift.settleMemo,
    depositMin: shift.depositMin,
    depositMax: shift.depositMax,
    expiresAt: shift.expiresAt,
    type: shift.type,
    rateMode: shift.type === "fixed" ? "fixed" : "variable",
    providerStatus: effectiveStatus,
    providerStatusLabel: statusMeta.label,
    providerStatusDetail: statusMeta.detail,
    currentStep: statusMeta.step,
    timeline: buildTimeline(statusMeta.step),
    depositAmount: latestDeposit?.depositAmount || shift.depositAmount,
    settleAmount: latestDeposit?.settleAmount || shift.settleAmount,
    rate: latestDeposit?.rate || shift.rate,
    quoteId: shift.quoteId,
    averageShiftSeconds:
      latestDeposit?.averageShiftSeconds || shift.averageShiftSeconds,
    settleCoinNetworkFee: shift.settleCoinNetworkFee,
    networkFeeUsd: shift.networkFeeUsd,
    depositHash: latestDeposit?.depositHash || shift.depositHash,
    settleHash: latestDeposit?.settleHash || shift.settleHash,
    depositReceivedAt:
      latestDeposit?.depositReceivedAt || shift.depositReceivedAt,
    issue: shift.issue,
    isTerminal: terminalKind !== null,
    terminalKind,
  };
}
