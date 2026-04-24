import { CryptoIcon } from "@/components/swap/CryptoIcon";
import type {
  GuidePageSpec,
  GuideStep,
  GuideStepVisualState,
} from "@/lib/guides/types";
import { getNetworkIconSources, getNetworkTintStyle } from "@/lib/sideshift/display";
import { QRCodeSVG } from "qrcode.react";

const VISUAL_FLOW: GuideStepVisualState[] = [
  "mode",
  "select",
  "amount",
  "review",
  "confirm",
  "settled",
];

function getStateIndex(state: GuideStepVisualState) {
  return VISUAL_FLOW.indexOf(state);
}

function renderStepBody(body: string) {
  return body.split("\n").map((line, index) => {
    if (!line.trim()) {
      return <div key={`space-${index}`} className="h-2.5" />;
    }

    const trimmedLine = line.trimStart();
    const isLeadLine =
      trimmedLine.startsWith("⦿") || trimmedLine.startsWith("â¦¿");

    return (
      <p
        key={`line-${index}`}
        className={
          isLeadLine
            ? "theme-text-main text-[15px] font-semibold leading-7"
            : "theme-text-muted text-sm leading-7"
        }
      >
        {line}
      </p>
    );
  });
}

function progressClassName(active: boolean, completed: boolean) {
  if (active) {
    return "border-cyan-300/60 bg-cyan-300/18 text-cyan-50";
  }

  if (completed) {
    return "border-emerald-300/40 bg-emerald-300/12 text-emerald-50";
  }

  return "border-[var(--border-soft)] bg-[var(--card-bg)] text-[var(--soft-text)]";
}

function panelClassName(active: boolean) {
  return active
    ? "theme-panel-strong border-cyan-300/45 shadow-[0_24px_70px_rgba(13,190,215,0.14)]"
    : "theme-card border-[var(--border-soft)]";
}

function getExampleDepositAddress(networkId: string) {
  switch (networkId) {
    case "bitcoin":
      return "bc1qzyroshift7deposit2btc8route4example9x7h3";
    case "tron":
      return "TQ9zyroshift3tron8deposit6route4demo";
    case "ethereum":
      return "0xZyroShiftDepositRouteExample0000000000000000";
    case "solana":
      return "8yZyroShiftSolanaDepositRouteExample4mR4";
    default:
      return "route-deposit-address-example";
  }
}

function getExampleReceiveAddress(networkId: string) {
  switch (networkId) {
    case "tron":
      return "TK7receiveUsdtOnTronExample9zWf2P";
    case "ethereum":
      return "0xReceiveAddressExampleForEthereum000000000000";
    case "solana":
      return "6yReceiveSolExampleAddress8LkP3";
    case "bitcoin":
      return "bc1qreceiveexampleaddress7btc2wallet4";
    default:
      return "destination-address-example";
  }
}

function getExampleVariableRange(token: string) {
  if (token === "BTC") {
    return {
      min: "0.0015 BTC",
      max: "0.8500 BTC",
    };
  }

  return {
    min: `Example minimum ${token}`,
    max: `Example maximum ${token}`,
  };
}

function getExampleFixedAmount(token: string) {
  if (token === "BTC") {
    return "0.1000 BTC";
  }

  return `Exact ${token} amount`;
}

function StaticRouteCard({
  accent,
  label,
  value,
  token,
  tokenIconSources,
  networkId,
  networkLabel,
  active,
}: {
  accent: "cyan" | "amber";
  label: string;
  value: string;
  token: string;
  tokenIconSources: string[];
  networkId: string;
  networkLabel: string;
  active: boolean;
}) {
  return (
    <div className={`rounded-[18px] border px-4 py-4 ${panelClassName(active)}`}>
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.24em] ${
          accent === "cyan" ? "theme-accent-cyan" : "theme-accent-amber"
        }`}
      >
        {label}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="theme-card-elevated inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-2">
          <CryptoIcon
            alt={`${token} icon`}
            className="rounded-full"
            size={18}
            sources={tokenIconSources}
          />
          <span className="theme-text-main font-semibold leading-none">
            {value}
          </span>
        </span>

        <span className="theme-card inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-3 py-2">
          <CryptoIcon
            alt={`${networkLabel} icon`}
            className="rounded-full"
            size={16}
            sources={getNetworkIconSources(networkId)}
          />
          <span className="theme-text-main font-mono text-[10px] uppercase tracking-[0.16em]">
            {networkLabel}
          </span>
        </span>
      </div>
    </div>
  );
}

function MiniSelectorCard({
  accent,
  label,
  token,
  tokenIconSources,
  networkId,
  networkLabel,
}: {
  accent: "cyan" | "amber";
  label: string;
  token: string;
  tokenIconSources: string[];
  networkId: string;
  networkLabel: string;
}) {
  const networkTint = getNetworkTintStyle(networkId);

  return (
    <div className="grid min-w-0 gap-2.5">
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.24em] ${
          accent === "cyan" ? "theme-accent-cyan" : "theme-accent-amber"
        }`}
      >
        {label}
      </p>

      <div className="flex items-center gap-2.5">
        <div className="theme-card flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
          <CryptoIcon
            alt={`${token} icon`}
            className="rounded-full"
            size={26}
            sources={tokenIconSources}
          />
        </div>

        <div className="min-w-0">
          <p className="theme-text-main text-[1rem] font-semibold leading-none">
            {token}
          </p>
          <p className="theme-text-soft mt-1 font-mono text-[9px] uppercase tracking-[0.18em]">
            Coin
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5" style={networkTint}>
        <span
          className="theme-network-tag inline-flex min-h-[30px] shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em]"
        >
          Network
        </span>

        <span
          className="theme-network-pill inline-flex min-h-[30px] min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10">
            <CryptoIcon
              alt={`${networkLabel} icon`}
              className="rounded-full"
              size={14}
              sources={getNetworkIconSources(networkId)}
            />
          </span>
          <span className="min-w-0 truncate text-sm font-medium">
            {networkLabel}
          </span>
        </span>
      </div>
    </div>
  );
}

function SelectBuilderMock({ spec }: { spec: GuidePageSpec }) {
  return (
    <div className="theme-panel-strong flex h-full flex-col justify-center rounded-[24px] p-4 md:p-5">
      <div className="rounded-[20px] border border-[var(--border-soft)] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <MiniSelectorCard
              accent="cyan"
              label="You send"
              networkId={spec.fromNetworkId}
              networkLabel={spec.fromNetworkLabel}
              token={spec.fromToken}
              tokenIconSources={spec.fromIconSources}
            />
          </div>

          <div className="flex shrink-0 items-center justify-center">
            <div className="theme-outline-button flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
              -&gt;
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <MiniSelectorCard
              accent="amber"
              label="You receive"
              networkId={spec.toNetworkId}
              networkLabel={spec.toNetworkLabel}
              token={spec.toToken}
              tokenIconSources={spec.toIconSources}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <label className="grid min-w-0 flex-1 gap-2">
          <span className="theme-text-muted font-mono text-[11px] font-semibold uppercase tracking-[0.24em]">
            Receiving address
          </span>
          <div className="theme-input flex h-12 items-center rounded-[18px] border-[var(--border-strong)] px-4 text-sm font-semibold text-[color:var(--soft-text-strong)]">
            Your {spec.toToken} address
          </div>
        </label>

        <button
          type="button"
          className="ml-auto h-12 w-[148px] shrink-0 rounded-[18px] border border-cyan-200/24 bg-[linear-gradient(135deg,rgba(116,255,244,0.96),rgba(97,204,255,0.92),rgba(118,155,255,0.9))] px-5 font-mono text-[15px] font-extrabold uppercase tracking-[0.22em] text-[#04121b] shadow-[0_16px_36px_rgba(64,184,255,0.28)]"
        >
          SHIFT
        </button>
      </div>
    </div>
  );
}

function ShiftScreenDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="theme-card-strong overflow-hidden rounded-[16px] px-3 py-3">
      <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.2em]">
        {label}
      </p>
      <p className="theme-text-main mt-1.5 break-words text-sm font-semibold leading-6">
        {value}
      </p>
    </div>
  );
}

function ShiftScreenMock({
  spec,
  mode,
}: {
  spec: GuidePageSpec;
  mode: "variable" | "fixed" | "settled";
}) {
  const depositAddress = getExampleDepositAddress(spec.fromNetworkId);
  const receiveAddress = getExampleReceiveAddress(spec.toNetworkId);
  const variableRange = getExampleVariableRange(spec.fromToken);
  const fixedAmount = getExampleFixedAmount(spec.fromToken);

  if (mode === "settled") {
    return (
      <div className="theme-panel rounded-[24px] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="theme-accent-emerald font-mono text-[10px] uppercase tracking-[0.24em]">
              Completed shift example
            </p>
            <p className="theme-text-main mt-2 text-base font-semibold">
              You received {spec.toToken}
            </p>
          </div>
          <span className="theme-pill-success rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]">
            Done
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ShiftScreenDetail
            label="Amount received"
            value={`Example ${spec.toToken} settlement`}
          />
          <ShiftScreenDetail
            label="Deposit detected"
            value="Confirmed on source network"
          />
          <ShiftScreenDetail
            label="Settlement sent"
            value={`Delivered on ${spec.toNetworkLabel}`}
          />
          <ShiftScreenDetail
            label="Status"
            value="Order complete"
          />
        </div>
      </div>
    );
  }

  const isFixed = mode === "fixed";

  return (
    <div className="theme-panel rounded-[24px] p-4">
      {isFixed ? (
        <div className="mb-4 flex justify-end">
          <span className="theme-pill-info rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]">
            14:31 left
          </span>
        </div>
      ) : null}

      <div
        className="grid gap-3 items-start"
        style={{ gridTemplateColumns: "minmax(0, 1fr) 132px" }}
      >
        <div className="theme-card-strong rounded-[18px] px-3 py-3">
          <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.2em]">
            Deposit address
          </p>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_76px] gap-2">
            <div className="theme-card-elevated theme-text-main overflow-hidden rounded-[14px] px-3 py-2.5 font-mono text-[10px] leading-5 tracking-[-0.04em] whitespace-nowrap">
              {depositAddress}
            </div>
            <div className="theme-card-elevated flex items-center justify-center rounded-[14px] px-1.5 py-2">
              <span className="theme-outline-button w-full rounded-[10px] px-2 py-1.5 text-center font-mono text-[9px] uppercase tracking-[0.14em]">
                Copy
              </span>
            </div>
          </div>
          <p className="theme-text-soft mt-2 text-center text-[11px] uppercase tracking-[0.16em]">
            Copy the address or scan the QR code in your wallet app.
          </p>
        </div>

        <div className="rounded-[20px] bg-white p-3">
          <QRCodeSVG
            value={depositAddress}
            size={108}
            bgColor="#ffffff"
            fgColor="#0f172a"
            includeMargin
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {isFixed ? (
          <>
            <ShiftScreenDetail label="Send exactly" value={fixedAmount} />
            <ShiftScreenDetail label="Quote timer" value="15-minute window" />
          </>
        ) : (
          <>
            <ShiftScreenDetail label="Minimum" value={variableRange.min} />
            <ShiftScreenDetail label="Maximum" value={variableRange.max} />
          </>
        )}
        <ShiftScreenDetail
          label="Receive address"
          value={receiveAddress}
        />
        <ShiftScreenDetail
          label="Rate mode"
          value={isFixed ? "Fixed Rate" : "Variable Rate"}
        />
      </div>
    </div>
  );
}

function GuideStepVisual({
  spec,
  step,
}: {
  spec: GuidePageSpec;
  step: GuideStep;
}) {
  const activeStateIndex = getStateIndex(step.visualState);
  const sendValue =
    activeStateIndex >= getStateIndex("amount")
      ? `Example: 0.10 ${spec.fromToken}`
      : spec.fromToken;
  const receiveValue =
    activeStateIndex >= getStateIndex("review")
      ? `Estimated ${spec.toToken} output`
      : spec.toToken;

  if (step.visualState === "review") {
    return (
      <figure className="theme-card-strong flex h-full items-center rounded-[24px] p-4">
        <div className="w-full">
          <ShiftScreenMock spec={spec} mode="variable" />
        </div>
      </figure>
    );
  }

  if (step.visualState === "confirm") {
    return (
      <figure className="theme-card-strong rounded-[24px] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.24em]">
              Illustrative order screen
            </p>
            <p className="theme-text-main mt-2 text-base font-semibold">
              Fixed Rate later expects the exact amount and keeps the 15-minute
              countdown visible.
            </p>
          </div>
          <span className="theme-card inline-flex rounded-full border border-[var(--border-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--soft-text-strong)]">
            Mock order screen
          </span>
        </div>

        <div className="mt-4">
          <ShiftScreenMock spec={spec} mode="fixed" />
        </div>
      </figure>
    );
  }

  if (step.visualState === "settled") {
    return (
      <figure className="theme-card-strong rounded-[24px] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.24em]">
              Illustrative status screen
            </p>
            <p className="theme-text-main mt-2 text-base font-semibold">
              Once the deposit confirms and the route settles, the shift moves to
              the completed state.
            </p>
          </div>
          <span className="theme-card inline-flex rounded-full border border-[var(--border-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--soft-text-strong)]">
            Mock status screen
          </span>
        </div>

        <div className="mt-4">
          <ShiftScreenMock spec={spec} mode="settled" />
        </div>
      </figure>
    );
  }

  if (step.visualState === "select") {
    return <SelectBuilderMock spec={spec} />;
  }

  return (
    <figure className="theme-card-strong rounded-[24px] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.24em]">
            Illustrative card state
          </p>
          <p className="theme-text-main mt-2 text-base font-semibold">
            {step.visualCaption}
          </p>
        </div>
        <span className="theme-card inline-flex rounded-full border border-[var(--border-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--soft-text-strong)]">
          Mock visual, not a live quote
        </span>
      </div>

      <div className="mt-4 theme-panel rounded-[24px] p-4">
        <div className="flex flex-wrap gap-2">
          {VISUAL_FLOW.map((state, index) => {
            const active = index === activeStateIndex;
            const completed = index < activeStateIndex;

            return (
              <span
                key={state}
                className={`inline-flex rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] ${progressClassName(
                  active,
                  completed,
                )}`}
              >
                {state}
              </span>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3">
          <StaticRouteCard
            accent="cyan"
            active={activeStateIndex >= getStateIndex("select")}
            label="You send"
            networkId={spec.fromNetworkId}
            networkLabel={spec.fromNetworkLabel}
            token={spec.fromToken}
            tokenIconSources={spec.fromIconSources}
            value={sendValue}
          />

          <StaticRouteCard
            accent="amber"
            active={activeStateIndex >= getStateIndex("review")}
            label="You receive"
            networkId={spec.toNetworkId}
            networkLabel={spec.toNetworkLabel}
            token={spec.toToken}
            tokenIconSources={spec.toIconSources}
            value={receiveValue}
          />

          <div
            className={`rounded-[18px] border px-4 py-4 ${
              activeStateIndex >= getStateIndex("confirm")
                ? "theme-warning-panel border-amber-300/35"
                : "theme-card border-[var(--border-soft)]"
            }`}
          >
            <p className="theme-text-soft font-mono text-[10px] uppercase tracking-[0.24em]">
              Order note
            </p>
            <p className="theme-text-muted mt-2 text-sm leading-6">
              {activeStateIndex >= getStateIndex("confirm")
                ? `Follow the generated deposit instructions exactly and send only ${spec.fromToken} to the created deposit address.`
                : "The live route will show the final range, destination network, and order instructions before funds should move."}
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}

export function GuideStepGallery({ spec }: { spec: GuidePageSpec }) {
  return (
    <section className="theme-panel mt-6 rounded-[28px] px-5 py-5 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="theme-accent-cyan font-mono text-[11px] uppercase tracking-[0.28em]">
            Step-by-step guide
          </p>
          <p className="theme-text-muted mt-2 max-w-3xl text-sm leading-6">
            These deterministic visuals mirror the swap-card flow so the guide can
            show the route clearly without pretending to be a live quote.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {spec.steps.map((step, index) => (
          <article
            key={`${spec.slug}-${step.title}`}
            className={
              step.showVisual === false
                ? "grid gap-4"
                : step.visualState === "select"
                  ? "grid gap-4 lg:grid-cols-2 lg:items-stretch"
                : step.visualState === "review"
                  ? "grid gap-4 lg:grid-cols-2 lg:items-stretch xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
                : step.visualState === "settled"
                  ? "grid gap-4 lg:grid-cols-2 lg:items-stretch xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
                : "grid gap-4 lg:grid-cols-2 lg:items-start xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
            }
          >
            <div
              className={`theme-card rounded-[24px] px-5 py-5 ${
                step.visualState === "select"
                  ? "h-full"
                  : step.visualState === "settled"
                    ? "flex h-full items-center"
                    : ""
              }`}
            >
              <div
                className={`flex gap-4 ${
                  step.visualState === "settled" ? "items-start" : "items-start"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/12 font-semibold text-[var(--text-main)]">
                  {index + 1}
                </div>
                <div>
                  <h2 className="theme-text-main text-lg font-semibold">
                    {step.title}
                  </h2>
                  <div className="mt-3 grid gap-0.5">
                    {renderStepBody(step.body)}
                  </div>
                </div>
              </div>
            </div>

            {step.showVisual === false ? null : (
              <div
                className={`min-w-0 ${
                  step.visualState === "select" ||
                  step.visualState === "review" ||
                  step.visualState === "settled"
                    ? "h-full"
                    : "lg:self-start"
                }`}
              >
                <GuideStepVisual spec={spec} step={step} />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
