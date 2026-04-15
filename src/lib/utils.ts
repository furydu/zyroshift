export function formatTokenAmount(value?: string | null, digits = 8) {
  if (!value) {
    return "--";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(parsed);
}

export function formatUsd(value?: string | null) {
  if (!value) {
    return "--";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(parsed);
}

export function formatTimestamp(value?: string | null) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function shortenAddress(value?: string | null) {
  if (!value) {
    return "--";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-8)}`;
}

export function formatCountdown(msRemaining: number) {
  if (msRemaining <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h`;
  }

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getMsUntil(value?: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 0;
  }

  return timestamp - Date.now();
}
