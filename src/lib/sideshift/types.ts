export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type RateMode = "variable" | "fixed";

export type SideShiftNetworkFlag = boolean | string[];

export type TimelineStepKey =
  | "waiting"
  | "received"
  | "processing"
  | "completed";

export type TimelineStepState = "complete" | "current" | "upcoming";

export type TimelineStep = {
  key: TimelineStepKey;
  label: string;
  description: string;
  state: TimelineStepState;
};

export type SwapNetworkOption = {
  id: string;
  label: string;
  hasMemo: boolean;
  depositEnabled: boolean;
  settleEnabled: boolean;
  supportsVariable: boolean;
  supportsFixed: boolean;
  contractAddress?: string;
  decimals?: number;
};

export type SwapAssetOption = {
  coin: string;
  name: string;
  networks: SwapNetworkOption[];
};

export type CoinsApiResponse = {
  assets: SwapAssetOption[];
  permission: SideShiftPermissionResponse;
  mockMode: boolean;
  executionReady: boolean;
};

export type SideShiftPermissionResponse = {
  createShift: boolean;
};

export type QuoteInput = {
  fromCoin: string;
  fromNetwork: string;
  toCoin: string;
  toNetwork: string;
  amount?: string;
};

export type FixedQuoteInput = QuoteInput & {
  amount: string;
};

export type CreateOrderInput = QuoteInput & {
  receiveAddress: string;
  receiveMemo?: string;
  refundAddress?: string;
  refundMemo?: string;
  externalId?: string;
};

export type CreateFixedOrderInput = {
  quoteId: string;
  receiveAddress: string;
  receiveMemo?: string;
  refundAddress?: string;
  refundMemo?: string;
  externalId?: string;
};

export type SideShiftTokenDetail = {
  contractAddress?: string;
  decimals?: number;
};

export type SideShiftCoin = {
  coin: string;
  name: string;
  networks: string[];
  hasMemo: boolean;
  fixedOnly: SideShiftNetworkFlag;
  variableOnly: SideShiftNetworkFlag;
  networksWithMemo: string[];
  depositOffline: SideShiftNetworkFlag;
  settleOffline: SideShiftNetworkFlag;
  tokenDetails?: Record<string, SideShiftTokenDetail>;
};

export type SideShiftPairResponse = {
  min: string;
  max: string;
  rate: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
};

export type QuoteResult = SideShiftPairResponse & {
  amount?: string;
  estimatedReceive?: string;
  feeLabel?: string;
};

export type QuoteApiResponse = {
  quote: QuoteResult;
  mockMode: boolean;
};

export type SideShiftFixedQuoteResponse = {
  id: string;
  createdAt: string;
  expiresAt: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  affiliateId?: string;
};

export type FixedQuoteResult = {
  id: string;
  createdAt: string;
  expiresAt: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  feeLabel?: string;
};

export type FixedQuoteApiResponse = {
  quote: FixedQuoteResult;
  mockMode: boolean;
};

export type SideShiftDeposit = {
  status?: string;
  depositAmount?: string;
  settleAmount?: string;
  rate?: string;
  averageShiftSeconds?: string;
  depositHash?: string;
  settleHash?: string;
  depositReceivedAt?: string;
  updatedAt?: string;
};

export type SideShiftShiftResponse = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAddress: string;
  depositMemo?: string;
  settleAddress: string;
  settleMemo?: string;
  refundAddress?: string;
  refundMemo?: string;
  depositMin: string;
  depositMax: string;
  depositAmount?: string;
  settleAmount?: string;
  rate?: string;
  expiresAt: string;
  type: RateMode;
  status: string;
  issue?: string;
  quoteId?: string;
  externalId?: string;
  averageShiftSeconds?: string;
  settleCoinNetworkFee?: string;
  networkFeeUsd?: string;
  depositHash?: string;
  settleHash?: string;
  depositReceivedAt?: string;
  deposits?: SideShiftDeposit[];
};

export type ShiftTerminalKind = "success" | "expired" | "refund" | "issue" | null;

export type ShiftOrderView = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  depositAddress: string;
  depositMemo?: string;
  settleAddress: string;
  settleMemo?: string;
  depositMin: string;
  depositMax: string;
  expiresAt: string;
  type: RateMode;
  rateMode: RateMode;
  providerStatus: string;
  providerStatusLabel: string;
  providerStatusDetail: string;
  currentStep: TimelineStepKey;
  timeline: TimelineStep[];
  depositAmount?: string;
  settleAmount?: string;
  rate?: string;
  quoteId?: string;
  averageShiftSeconds?: string;
  settleCoinNetworkFee?: string;
  networkFeeUsd?: string;
  depositHash?: string;
  settleHash?: string;
  depositReceivedAt?: string;
  issue?: string;
  isTerminal: boolean;
  terminalKind: ShiftTerminalKind;
};

export type OrderApiResponse = {
  order: ShiftOrderView;
  mockMode: boolean;
};

export type CancelOrderApiResponse = {
  success: boolean;
  mockMode: boolean;
};

export type SideShiftRecentShift = {
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  depositAmount: string | null;
  settleCoin: string;
  settleNetwork: string;
  settleAmount: string | null;
};

export type RecentShiftsApiResponse = {
  shifts: SideShiftRecentShift[];
  mockMode: boolean;
};

export type SideShiftErrorPayload = {
  error: {
    message: string;
    code?: string;
  };
};
