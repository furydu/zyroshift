import type { ParsedPairSlug } from "@/lib/pairs/types";

function normalizeToken(token: string) {
  return token.trim().toUpperCase();
}

function normalizeNetwork(network: string | undefined) {
  const value = (network || "").trim().toLowerCase();
  return value || null;
}

function splitPairSide(input: string) {
  const segments = input
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const [token, ...networkParts] = segments;

  return {
    token: normalizeToken(token),
    network: normalizeNetwork(networkParts.join("-")),
  };
}

export function parsePairSlug(slug: string): ParsedPairSlug | null {
  const normalizedSlug = slug.trim().toLowerCase();
  const segments = normalizedSlug.split("-to-");

  if (segments.length !== 2) {
    return null;
  }

  const from = splitPairSide(segments[0]);
  const to = splitPairSide(segments[1]);

  if (!from || !to) {
    return null;
  }

  return {
    slug: normalizedSlug,
    fromToken: from.token,
    toToken: to.token,
    fromNetwork: from.network,
    toNetwork: to.network,
  };
}
