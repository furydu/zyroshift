const DEFAULT_BASE_URL = "https://sideshift.ai/api/v2";

function readEnv(name: string) {
  return process.env[name]?.trim();
}

function isPrivateOrLoopbackIp(ip: string) {
  const normalized = ip.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  if (
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "localhost"
  ) {
    return true;
  }

  if (
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized) ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
    return true;
  }

  return false;
}

const hasLiveSecrets =
  Boolean(readEnv("SIDESHIFT_SECRET")) &&
  Boolean(readEnv("SIDESHIFT_AFFILIATE_ID"));

export const sideshiftConfig = {
  baseUrl: readEnv("SIDESHIFT_BASE_URL") || DEFAULT_BASE_URL,
  secret: readEnv("SIDESHIFT_SECRET"),
  affiliateId: readEnv("SIDESHIFT_AFFILIATE_ID"),
  commissionRate: readEnv("SIDESHIFT_COMMISSION_RATE"),
  devUserIp: readEnv("SIDESHIFT_DEV_USER_IP"),
  mockMode:
    process.env.NODE_ENV !== "production" &&
    (readEnv("SIDESHIFT_MOCK_MODE") === "true" || !hasLiveSecrets),
} as const;

export function resolveUserIp(inputIp?: string | null) {
  if (process.env.NODE_ENV !== "production" && sideshiftConfig.devUserIp) {
    return sideshiftConfig.devUserIp;
  }

  const candidate = inputIp?.trim();

  if (candidate && !isPrivateOrLoopbackIp(candidate)) {
    return candidate;
  }

  return sideshiftConfig.devUserIp || null;
}

export function requireUserIp(inputIp?: string | null) {
  const ip = resolveUserIp(inputIp);

  if (!ip) {
    throw new Error(
      "Missing end-user IP. SideShift requires x-user-ip when requests are proxied through your server.",
    );
  }

  return ip;
}

export function requireLiveConfig() {
  if (!sideshiftConfig.secret || !sideshiftConfig.affiliateId) {
    throw new Error(
      "Missing SIDESHIFT_SECRET or SIDESHIFT_AFFILIATE_ID. Provide both to enable live SideShift mode.",
    );
  }

  return {
    baseUrl: sideshiftConfig.baseUrl,
    secret: sideshiftConfig.secret,
    affiliateId: sideshiftConfig.affiliateId,
    commissionRate: sideshiftConfig.commissionRate,
  };
}
