"use client";

import { AssetPickerDialog } from "@/components/swap/AssetPickerDialog";
import { AssetSelectorHero } from "@/components/swap/AssetSelectorHero";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLiveNow } from "@/hooks/use-live-now";
import type {
  AsyncStatus,
  CoinsApiResponse,
  FixedQuoteApiResponse,
  QuoteApiResponse,
  RateMode,
  SwapAssetOption,
  SwapNetworkOption,
} from "@/lib/sideshift/types";
import { formatCountdown, formatTokenAmount } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState, useTransition } from "react";

type RemoteState<T> = {
  status: AsyncStatus;
  data?: T;
  error?: string;
  requestKey?: string;
};

type BuilderFormState = {
  fromCoin: string;
  fromNetwork: string;
  toCoin: string;
  toNetwork: string;
  amount: string;
  receiveAddress: string;
};

export type SwapExperiencePreset = Pick<
  BuilderFormState,
  "fromCoin" | "fromNetwork" | "toCoin" | "toNetwork"
>;

const INITIAL_FORM: BuilderFormState = {
  fromCoin: "",
  fromNetwork: "",
  toCoin: "",
  toNetwork: "",
  amount: "",
  receiveAddress: "",
};

const EMPTY_ASSETS: SwapAssetOption[] = [];
const DEFAULT_FROM_COIN = "USDT";
const DEFAULT_FROM_NETWORK = "tron";
const DEFAULT_TO_COIN = "BTC";
const DEFAULT_TO_NETWORK = "bitcoin";

function normalizeId(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

async function fetchJson<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Request failed.");
  }

  return payload as T;
}

function cardShellClassName(active: boolean) {
  return `rounded-[24px] border p-4 transition ${
    active
      ? "theme-panel-strong border-cyan-300/50 shadow-[0_30px_100px_rgba(13,190,215,0.12)]"
      : "theme-card"
  }`;
}

function tabClassName(active: boolean) {
  return `border-b-2 px-1 pb-2.5 font-mono text-[15px] uppercase tracking-[0.24em] transition ${
    active
      ? "border-cyan-300 text-[var(--foreground)]"
      : "border-transparent text-[var(--soft-text)] hover:text-[var(--foreground)]"
  }`;
}

function inputClassName() {
  return "theme-input h-12 w-full rounded-[18px] border-[var(--border-strong)] px-4 text-base font-semibold text-[color:var(--foreground)] outline-none transition placeholder:font-semibold placeholder:text-[color:var(--soft-text-strong)] focus:border-cyan-300/75 focus:shadow-[0_0_0_1px_rgba(143,232,255,0.18)]";
}

function amountBoxClassName() {
  return "theme-card-strong min-h-[112px] rounded-[18px] px-4 py-3";
}

function amountInputClassName() {
  return "theme-input h-11 w-full rounded-[16px] px-4 text-base outline-none transition focus:border-cyan-400/70";
}

function getAssetByCoin(assets: SwapAssetOption[], coin: string) {
  const normalizedCoin = normalizeId(coin);
  return assets.find((asset) => normalizeId(asset.coin) === normalizedCoin);
}

function supportsMode(network: SwapNetworkOption, mode: RateMode) {
  return mode === "fixed" ? network.supportsFixed : network.supportsVariable;
}

function getDepositNetworks(asset: SwapAssetOption | undefined, mode: RateMode) {
  return (
    asset?.networks.filter(
      (network) => network.depositEnabled && supportsMode(network, mode),
    ) || []
  );
}

function getSettleNetworks(asset: SwapAssetOption | undefined, mode: RateMode) {
  return (
    asset?.networks.filter(
      (network) => network.settleEnabled && supportsMode(network, mode),
    ) || []
  );
}

function getFirstDepositNetwork(asset: SwapAssetOption | undefined, mode: RateMode) {
  return getDepositNetworks(asset, mode)[0]?.id || "";
}

function getFirstSettleNetwork(asset: SwapAssetOption | undefined, mode: RateMode) {
  return getSettleNetworks(asset, mode)[0]?.id || "";
}

function findFirstAsset(
  assets: SwapAssetOption[],
  mode: RateMode,
  direction: "deposit" | "settle",
  excludedCoin?: string,
) {
  const normalizedExcludedCoin = normalizeId(excludedCoin);

  return assets.find((asset) => {
    if (
      normalizedExcludedCoin &&
      normalizeId(asset.coin) === normalizedExcludedCoin
    ) {
      return false;
    }

    return direction === "deposit"
      ? getDepositNetworks(asset, mode).length > 0
      : getSettleNetworks(asset, mode).length > 0;
  });
}

function findPreferredAssetWithNetwork(
  assets: SwapAssetOption[],
  mode: RateMode,
  direction: "deposit" | "settle",
  preferredCoin: string,
  preferredNetwork: string,
  excludedCoin?: string,
) {
  const asset = getAssetByCoin(assets, preferredCoin);
  const normalizedPreferredNetwork = normalizeId(preferredNetwork);
  const normalizedExcludedCoin = normalizeId(excludedCoin);

  if (
    !asset ||
    (normalizedExcludedCoin &&
      normalizeId(asset.coin) === normalizedExcludedCoin)
  ) {
    return null;
  }

  const networks =
    direction === "deposit"
      ? getDepositNetworks(asset, mode)
      : getSettleNetworks(asset, mode);

  const network = networks.find(
    (item) => normalizeId(item.id) === normalizedPreferredNetwork,
  );

  if (!network) {
    return null;
  }

  return {
    asset,
    networkId: network.id,
  };
}

function normalizeFormForMode(
  current: BuilderFormState,
  assets: SwapAssetOption[],
  mode: RateMode,
  preferredPair?: Partial<SwapExperiencePreset>,
) {
  const currentFromAsset = getAssetByCoin(assets, current.fromCoin);
  const currentToAsset = getAssetByCoin(assets, current.toCoin);
  const preferredFrom = findPreferredAssetWithNetwork(
    assets,
    mode,
    "deposit",
    preferredPair?.fromCoin || DEFAULT_FROM_COIN,
    preferredPair?.fromNetwork || DEFAULT_FROM_NETWORK,
  );

  const candidateFrom =
    currentFromAsset &&
    getDepositNetworks(currentFromAsset, mode).length > 0
      ? currentFromAsset
      : preferredFrom?.asset || findFirstAsset(assets, mode, "deposit");
  const preferredTo = findPreferredAssetWithNetwork(
    assets,
    mode,
    "settle",
    preferredPair?.toCoin || DEFAULT_TO_COIN,
    preferredPair?.toNetwork || DEFAULT_TO_NETWORK,
    candidateFrom?.coin,
  );

  const candidateTo =
    currentToAsset &&
    normalizeId(current.toCoin) !== normalizeId(candidateFrom?.coin) &&
    getSettleNetworks(currentToAsset, mode).length > 0
      ? currentToAsset
      : preferredTo?.asset ||
        findFirstAsset(assets, mode, "settle", candidateFrom?.coin);

  if (!candidateFrom || !candidateTo) {
    return current;
  }

  const nextFromNetwork =
    getDepositNetworks(candidateFrom, mode).find(
      (network) => network.id === current.fromNetwork,
    )?.id ||
    (normalizeId(candidateFrom.coin) === normalizeId(preferredFrom?.asset.coin) &&
    !current.fromNetwork
      ? preferredFrom?.networkId
      : undefined) ||
    getFirstDepositNetwork(candidateFrom, mode);
  const nextToNetwork =
    getSettleNetworks(candidateTo, mode).find(
      (network) => network.id === current.toNetwork,
    )?.id ||
    (normalizeId(candidateTo.coin) === normalizeId(preferredTo?.asset.coin) &&
    !current.toNetwork
      ? preferredTo?.networkId
      : undefined) ||
    getFirstSettleNetwork(candidateTo, mode);

  return {
    ...current,
    fromCoin: candidateFrom.coin,
    fromNetwork: nextFromNetwork,
    toCoin: candidateTo.coin,
    toNetwork: nextToNetwork,
    amount: mode === "variable" ? "" : current.amount,
  };
}

function createRequestKey(...parts: Array<string | null | undefined>) {
  if (parts.some((part) => !part)) {
    return null;
  }

  return parts.join(":");
}

function getScopedState<T>(
  state: RemoteState<T>,
  requestKey: string | null,
): RemoteState<T> {
  if (!requestKey || state.requestKey !== requestKey) {
    return { status: "idle" };
  }

  return state;
}

export function SwapExperience({
  embedded = false,
  preset,
  showThemeToggle = true,
}: {
  embedded?: boolean;
  preset?: Partial<SwapExperiencePreset>;
  showThemeToggle?: boolean;
} = {}) {
  const router = useRouter();
  const [rateMode, setRateMode] = useState<RateMode>("variable");
  const [pickerTarget, setPickerTarget] = useState<"from" | "to" | null>(null);
  const [directoryState, setDirectoryState] = useState<RemoteState<CoinsApiResponse>>({
    status: "loading",
  });
  const [variableQuoteState, setVariableQuoteState] =
    useState<RemoteState<QuoteApiResponse>>({
      status: "idle",
    });
  const [fixedQuoteState, setFixedQuoteState] =
    useState<RemoteState<FixedQuoteApiResponse>>({
      status: "idle",
    });
  const [submitState, setSubmitState] = useState<RemoteState<never>>({
    status: "idle",
  });
  const [form, setForm] = useState<BuilderFormState>(INITIAL_FORM);
  const [isFlipping, startFlipTransition] = useTransition();
  const deferredAmount = useDeferredValue(form.amount);

  const assets = directoryState.data?.assets ?? EMPTY_ASSETS;
  const permissionGranted = directoryState.data?.permission.createShift ?? false;
  const directoryReady =
    directoryState.status === "success" && permissionGranted;
  const mockMode =
    directoryState.data?.mockMode ||
    variableQuoteState.data?.mockMode ||
    fixedQuoteState.data?.mockMode ||
    false;
  const showPermissionWarning =
    directoryState.status === "success" && !mockMode && !permissionGranted;

  const normalizedForm = normalizeFormForMode(form, assets, rateMode, preset);
  const fromAsset = getAssetByCoin(assets, normalizedForm.fromCoin);
  const toAsset = getAssetByCoin(assets, normalizedForm.toCoin);
  const fromNetworks = getDepositNetworks(fromAsset, rateMode);
  const toNetworks = getSettleNetworks(toAsset, rateMode);
  const selectableFromAssets = assets.filter(
    (asset) => getDepositNetworks(asset, rateMode).length > 0,
  );
  const selectableToAssets = assets.filter(
    (asset) => getSettleNetworks(asset, rateMode).length > 0,
  );
  const selectedFromNetwork = fromNetworks.find(
    (network) => network.id === normalizedForm.fromNetwork,
  );
  const selectedToNetwork = toNetworks.find(
    (network) => network.id === normalizedForm.toNetwork,
  );

  const variableQuoteRequestKey = directoryReady
    ? createRequestKey(
        normalizedForm.fromCoin,
        normalizedForm.fromNetwork,
        normalizedForm.toCoin,
        normalizedForm.toNetwork,
      )
    : null;
  const fixedQuoteRequestKey =
    rateMode === "fixed" &&
    directoryReady &&
    deferredAmount &&
    Number(deferredAmount) > 0
      ? createRequestKey(
          normalizedForm.fromCoin,
          normalizedForm.fromNetwork,
          normalizedForm.toCoin,
          normalizedForm.toNetwork,
          deferredAmount,
        )
      : null;

  const currentVariableQuoteState = getScopedState(
    variableQuoteState,
    variableQuoteRequestKey,
  );
  const currentFixedQuoteState = getScopedState(
    fixedQuoteState,
    fixedQuoteRequestKey,
  );

  const fixedQuoteNow = useLiveNow(
    Boolean(currentFixedQuoteState.data?.quote.expiresAt),
  );
  const fixedQuoteBaseTime = currentFixedQuoteState.data?.quote
    ? new Date(currentFixedQuoteState.data.quote.createdAt).getTime()
    : 0;
  const fixedQuoteActiveNow = fixedQuoteNow || fixedQuoteBaseTime;
  const fixedQuoteMsRemaining = currentFixedQuoteState.data?.quote?.expiresAt
    ? Math.max(
        new Date(currentFixedQuoteState.data.quote.expiresAt).getTime() -
          fixedQuoteActiveNow,
        0,
      )
    : 0;
  const fixedQuoteCountdownLabel = currentFixedQuoteState.data?.quote
    ? formatCountdown(fixedQuoteMsRemaining)
    : "--:--";

  const activeRateText =
    rateMode === "fixed"
      ? currentFixedQuoteState.data?.quote
        ? `LOCKED 1 ${currentFixedQuoteState.data.quote.depositCoin} = ${formatTokenAmount(
            currentFixedQuoteState.data.quote.rate,
          )} ${currentFixedQuoteState.data.quote.settleCoin}`
        : currentVariableQuoteState.data?.quote
          ? `1 ${currentVariableQuoteState.data.quote.depositCoin} ~ ${formatTokenAmount(
              currentVariableQuoteState.data.quote.rate,
            )} ${currentVariableQuoteState.data.quote.settleCoin}`
        : "Enter an amount to lock a fixed quote"
      : currentVariableQuoteState.data?.quote
        ? `1 ${currentVariableQuoteState.data.quote.depositCoin} ~ ${formatTokenAmount(
            currentVariableQuoteState.data.quote.rate,
          )} ${currentVariableQuoteState.data.quote.settleCoin}`
        : "Select a valid pair to fetch a live variable rate";

  const activeQuoteError =
    rateMode === "fixed"
      ? currentFixedQuoteState.error
      : currentVariableQuoteState.error;

  const minMaxWarning =
    rateMode === "fixed"
      ? currentFixedQuoteState.data?.quote
        ? `Fixed quote locked for 15 minutes. You must send exactly ${formatTokenAmount(
            currentFixedQuoteState.data.quote.depositAmount,
          )} ${currentFixedQuoteState.data.quote.depositCoin}.`
        : currentFixedQuoteState.error
          ? currentFixedQuoteState.error
        : currentVariableQuoteState.data?.quote
          ? `Fixed quotes depend on the exact amount. Current pair minimum is around ${formatTokenAmount(
              currentVariableQuoteState.data.quote.min,
            )} ${currentVariableQuoteState.data.quote.depositCoin} and the max is ${formatTokenAmount(
              currentVariableQuoteState.data.quote.max,
            )} ${currentVariableQuoteState.data.quote.depositCoin}. Enter an amount in range to try locking the quote.`
        : "Enter the amount you want to send to lock a fixed quote before creating the order."
      : currentVariableQuoteState.data?.quote
        ? `Variable shifts accept deposits between ${formatTokenAmount(
            currentVariableQuoteState.data.quote.min,
          )} and ${formatTokenAmount(currentVariableQuoteState.data.quote.max)} ${
            currentVariableQuoteState.data.quote.depositCoin
          }. Deposits outside this range can fail or be refunded.`
        : "Select a pair to see the live min and max deposit range before you create the shift.";

  useEffect(() => {
    let ignore = false;

    void (async () => {
      try {
        const payload = await fetchJson<CoinsApiResponse>("/api/coins");

        if (!ignore) {
          setDirectoryState({
            status: "success",
            data: payload,
          });
        }
      } catch (error) {
        if (!ignore) {
          setDirectoryState({
            status: "error",
            error: error instanceof Error ? error.message : "Unable to load assets.",
          });
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!variableQuoteRequestKey) {
      return;
    }

    let ignore = false;
    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => {
      if (ignore) {
        return;
      }

      setVariableQuoteState((current) => ({
        status: "loading",
        requestKey: variableQuoteRequestKey,
        data:
          current.requestKey === variableQuoteRequestKey
            ? current.data
            : undefined,
      }));
    }, 0);

    void (async () => {
      try {
        const payload = await fetchJson<QuoteApiResponse>("/api/quote", {
          method: "POST",
          body: JSON.stringify({
            fromCoin: normalizedForm.fromCoin,
            fromNetwork: normalizedForm.fromNetwork,
            toCoin: normalizedForm.toCoin,
            toNetwork: normalizedForm.toNetwork,
          }),
          signal: controller.signal,
        });

        if (!ignore) {
          setVariableQuoteState({
            status: "success",
            data: payload,
            requestKey: variableQuoteRequestKey,
          });
        }
      } catch (error) {
        if (!ignore && !controller.signal.aborted) {
          setVariableQuoteState({
            status: "error",
            requestKey: variableQuoteRequestKey,
            error:
              error instanceof Error
                ? error.message
                : "Unable to refresh variable quote.",
          });
        }
      }
    })();

    return () => {
      ignore = true;
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [
    normalizedForm.fromCoin,
    normalizedForm.fromNetwork,
    normalizedForm.toCoin,
    normalizedForm.toNetwork,
    variableQuoteRequestKey,
  ]);

  useEffect(() => {
    if (!fixedQuoteRequestKey) {
      return;
    }

    let ignore = false;
    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => {
      if (ignore) {
        return;
      }

      setFixedQuoteState((current) => ({
        status: "loading",
        requestKey: fixedQuoteRequestKey,
        data:
          current.requestKey === fixedQuoteRequestKey ? current.data : undefined,
      }));
    }, 0);

    void (async () => {
      try {
        const payload = await fetchJson<FixedQuoteApiResponse>("/api/fixed-quote", {
          method: "POST",
          body: JSON.stringify({
            fromCoin: normalizedForm.fromCoin,
            fromNetwork: normalizedForm.fromNetwork,
            toCoin: normalizedForm.toCoin,
            toNetwork: normalizedForm.toNetwork,
            amount: deferredAmount,
          }),
          signal: controller.signal,
        });

        if (!ignore) {
          setFixedQuoteState({
            status: "success",
            data: payload,
            requestKey: fixedQuoteRequestKey,
          });
        }
      } catch (error) {
        if (!ignore && !controller.signal.aborted) {
          setFixedQuoteState({
            status: "error",
            requestKey: fixedQuoteRequestKey,
            error:
              error instanceof Error
                ? error.message
                : "Unable to fetch fixed quote.",
          });
        }
      }
    })();

    return () => {
      ignore = true;
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [
    normalizedForm.fromCoin,
    normalizedForm.fromNetwork,
    normalizedForm.toCoin,
    normalizedForm.toNetwork,
    deferredAmount,
    fixedQuoteRequestKey,
  ]);

  function updateField<Key extends keyof BuilderFormState>(
    field: Key,
    value: BuilderFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSubmitState({ status: "idle" });
  }

  function handleCoinChange(field: "fromCoin" | "toCoin", coin: string) {
    const asset = getAssetByCoin(assets, coin);

    if (field === "fromCoin") {
      setForm((current) => ({
        ...current,
        fromCoin: coin,
        fromNetwork: getFirstDepositNetwork(asset, rateMode),
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      toCoin: coin,
      toNetwork: getFirstSettleNetwork(asset, rateMode),
    }));
  }

  function handleFlipPair() {
    startFlipTransition(() => {
      setForm((current) => ({
        ...current,
        fromCoin: normalizedForm.toCoin,
        fromNetwork: normalizedForm.toNetwork,
        toCoin: normalizedForm.fromCoin,
        toNetwork: normalizedForm.fromNetwork,
      }));
    });
  }

  async function handleSubmit() {
    if (!normalizedForm.receiveAddress.trim()) {
      setSubmitState({
        status: "error",
        error: "Enter the destination wallet address first.",
      });
      return;
    }

    if (rateMode === "fixed") {
      if (!normalizedForm.amount || Number(normalizedForm.amount) <= 0) {
        setSubmitState({
          status: "error",
          error: "Enter the exact amount you want to send for the fixed quote.",
        });
        return;
      }

      if (!currentFixedQuoteState.data?.quote.id) {
        setSubmitState({
          status: "error",
          error: "Wait for the fixed quote to finish loading before creating the order.",
        });
        return;
      }
    }

    setSubmitState({ status: "loading" });

    try {
      const payload =
        rateMode === "fixed"
          ? await fetchJson<{ order: { id: string } }>("/api/create-fixed-order", {
              method: "POST",
              body: JSON.stringify({
                quoteId: currentFixedQuoteState.data?.quote.id,
                receiveAddress: normalizedForm.receiveAddress.trim(),
              }),
            })
          : await fetchJson<{ order: { id: string } }>("/api/create-order", {
              method: "POST",
              body: JSON.stringify({
                fromCoin: normalizedForm.fromCoin,
                fromNetwork: normalizedForm.fromNetwork,
                toCoin: normalizedForm.toCoin,
                toNetwork: normalizedForm.toNetwork,
                receiveAddress: normalizedForm.receiveAddress.trim(),
              }),
            });

      router.push(`/shift/${payload.order.id}`);
    } catch (error) {
      setSubmitState({
        status: "error",
        error:
          error instanceof Error ? error.message : "Unable to create the shift.",
      });
    }
  }

  const disableSubmit =
    !permissionGranted ||
    submitState.status === "loading" ||
    isFlipping ||
    !normalizedForm.fromCoin ||
    !normalizedForm.toCoin ||
    !normalizedForm.fromNetwork ||
    !normalizedForm.toNetwork ||
    !normalizedForm.receiveAddress ||
    (rateMode === "fixed" &&
      (!normalizedForm.amount || !currentFixedQuoteState.data?.quote.id));

  return (
    <div
      className={`mx-auto w-full max-w-[1500px] ${
        embedded ? "px-0 py-0" : "px-4 py-7 md:px-6 lg:px-8"
      }`}
    >
      {!embedded ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="theme-accent-cyan font-mono text-xs uppercase tracking-[0.35em]">
              Live Swap Builder
            </p>
            <h1 className="theme-text-main mt-2 max-w-5xl text-[clamp(2.15rem,4vw,3.75rem)] font-semibold leading-[1.02] tracking-tight">
              Swap crypto across 200+ tokens and 40+ networks, sent directly to your wallet.
            </h1>
            <p className="theme-text-muted mt-2 max-w-4xl text-[15px] leading-7">
              Choose your pair first. Deposit instructions and live status appear after you create the shift.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showThemeToggle ? <ThemeToggle /> : null}
            <span
              className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] ${
                mockMode
                  ? "theme-warning-panel theme-accent-amber"
                  : "theme-success-panel theme-accent-emerald"
              }`}
            >
              {mockMode ? "Mock mode" : "Live mode"}
            </span>
          </div>
        </div>
      ) : null}

      <section className="theme-panel rounded-[30px] p-5 backdrop-blur md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="flex gap-8">
            <button
              type="button"
              className={tabClassName(rateMode === "variable")}
              onClick={() => setRateMode("variable")}
            >
              Variable Rate
            </button>
            <button
              type="button"
              className={tabClassName(rateMode === "fixed")}
              onClick={() => setRateMode("fixed")}
            >
              Fixed Rate
            </button>
          </div>

          <div className="text-right">
            <p className="theme-text-soft font-mono text-xs uppercase tracking-[0.28em]">
              Current rate
            </p>
            <p className="theme-text-main mt-2 max-w-[28rem] text-base font-semibold leading-7">
              {activeRateText}
            </p>
            {rateMode === "fixed" && currentFixedQuoteState.data?.quote ? (
              <p className="theme-accent-cyan mt-1 text-sm">
                Quote expires in {fixedQuoteCountdownLabel}
              </p>
            ) : rateMode === "fixed" && currentFixedQuoteState.error ? (
              <p className="theme-text-muted mt-1 text-sm">
                {currentFixedQuoteState.error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] lg:items-center">
          <div className={cardShellClassName(true)}>
            <div className="grid gap-3">
              <AssetSelectorHero
                accentClassName="theme-accent-cyan"
                asset={fromAsset}
                label="You send"
                network={selectedFromNetwork}
                networkOptions={fromNetworks}
                onNetworkChange={(networkId) => updateField("fromNetwork", networkId)}
                onOpenAssetPicker={() => setPickerTarget("from")}
              />

              {rateMode === "fixed" ? (
                <div className={amountBoxClassName()}>
                  <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.28em]">
                    Fixed amount
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      className={amountInputClassName()}
                      value={normalizedForm.amount}
                      onChange={(event) => updateField("amount", event.target.value)}
                      inputMode="decimal"
                      placeholder={`Enter ${fromAsset?.coin || "amount"}`}
                    />
                  </div>
                </div>
              ) : (
                <div className={`${amountBoxClassName()} theme-text-muted flex items-center text-sm leading-6`}>
                  Variable rate creates the shift first. The shift page shows the
                  deposit range before funds are sent.
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleFlipPair}
            className="theme-outline-button mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg transition hover:border-cyan-400/70 hover:text-cyan-200"
            aria-label="Flip selected pair"
          >
            -&gt;
          </button>

          <div className={cardShellClassName(false)}>
            <div className="grid gap-3">
              <AssetSelectorHero
                accentClassName="theme-accent-amber"
                asset={toAsset}
                label="You receive"
                network={selectedToNetwork}
                networkOptions={toNetworks}
                onNetworkChange={(networkId) => updateField("toNetwork", networkId)}
                onOpenAssetPicker={() => setPickerTarget("to")}
              />

              <div className={`${amountBoxClassName()} flex flex-col justify-between`}>
                <p className="theme-text-soft font-mono text-[11px] uppercase tracking-[0.28em]">
                  {rateMode === "fixed" ? "Locked receive" : "Live unit rate"}
                </p>
                <p className="theme-text-main mt-1.5 text-[1.35rem] font-semibold leading-tight">
                  {rateMode === "fixed"
                    ? currentFixedQuoteState.data?.quote
                      ? `${formatTokenAmount(currentFixedQuoteState.data.quote.settleAmount)} ${currentFixedQuoteState.data.quote.settleCoin}`
                      : currentFixedQuoteState.status === "loading"
                        ? "Loading..."
                      : currentFixedQuoteState.error
                        ? "Quote unavailable"
                      : "--"
                    : currentVariableQuoteState.data?.quote
                      ? `${formatTokenAmount(currentVariableQuoteState.data.quote.rate)} ${currentVariableQuoteState.data.quote.settleCoin}`
                      : "--"}
                </p>
                <p className="theme-text-soft mt-1.5 text-[11px] leading-5">
                  {rateMode === "fixed"
                    ? currentFixedQuoteState.error
                      ? currentFixedQuoteState.error
                      : currentFixedQuoteState.data?.quote
                        ? "Locked quote output amount."
                        : "Enter amount to request a quote."
                    : "Current live rate before the shift is created."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <label className="grid gap-2">
            <span className="theme-text-muted font-mono text-[13px] font-semibold uppercase tracking-[0.24em]">
              Receiving address
            </span>
            <input
              className={inputClassName()}
              value={normalizedForm.receiveAddress}
              onChange={(event) => updateField("receiveAddress", event.target.value)}
              placeholder={`Your ${toAsset?.coin || "destination"} address`}
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={disableSubmit}
            className="h-12 rounded-[18px] border border-cyan-200/24 bg-[linear-gradient(135deg,rgba(116,255,244,0.96),rgba(97,204,255,0.92),rgba(118,155,255,0.9))] px-5 font-mono text-[15px] font-extrabold uppercase tracking-[0.22em] text-[#04121b] shadow-[0_16px_36px_rgba(64,184,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-[1.04] disabled:cursor-not-allowed disabled:border-cyan-200/14 disabled:bg-[linear-gradient(135deg,rgba(67,95,132,0.94),rgba(76,103,146,0.9),rgba(66,86,120,0.9))] disabled:text-white/90 disabled:shadow-[0_12px_24px_rgba(22,34,58,0.18)]"
          >
            {submitState.status === "loading" ? "Creating..." : "Shift"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
          <div className="theme-warning-panel rounded-[20px] p-4">
            <p className="theme-accent-amber font-mono text-xs uppercase tracking-[0.26em]">
              Deposit rule
            </p>
            <pre className="theme-accent-amber mt-2.5 whitespace-pre-wrap font-mono text-sm leading-6">
{`[warning]
${minMaxWarning}`}
            </pre>
          </div>

          <div className="theme-card rounded-[20px] p-4">
            <p className="theme-text-soft font-mono text-xs uppercase tracking-[0.26em]">
              Status note
            </p>
            <p className="theme-text-muted mt-2.5 text-sm leading-6">
              After you create the order, the app redirects to a dedicated shift
              screen with the QR code, countdown, waiting state, and live status
              polling.
            </p>
          </div>
        </div>

        {directoryState.status === "error" ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {directoryState.error}
          </p>
        ) : null}

        {activeQuoteError ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {activeQuoteError}
          </p>
        ) : null}

        {showPermissionWarning ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            SideShift permissions are blocked for this user IP, so order creation is
            disabled.
          </p>
        ) : null}

        {submitState.status === "error" ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {submitState.error}
          </p>
        ) : null}
      </section>

      <AssetPickerDialog
        assets={pickerTarget === "from" ? selectableFromAssets : selectableToAssets}
        description={
          pickerTarget === "from"
            ? "Choose the asset the user will send. Typing the first letters is enough to narrow the list."
            : "Choose the asset the user should receive. Search by symbol or full token name."
        }
        open={pickerTarget !== null}
        selectedCoin={
          pickerTarget === "from" ? normalizedForm.fromCoin : normalizedForm.toCoin
        }
        key={pickerTarget ?? "closed"}
        title={
          pickerTarget === "from"
            ? "Select the deposit coin"
            : "Select the receive coin"
        }
        onClose={() => setPickerTarget(null)}
        onSelect={(coin) => {
          handleCoinChange(pickerTarget === "from" ? "fromCoin" : "toCoin", coin);
        }}
      />
    </div>
  );
}
