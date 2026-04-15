const BTC_LIKE = new Set(["BTC", "WBTC", "CBBTC", "BTC.B", "TBTC"]);
const LAYER1_NATIVE = new Set([
  "ADA",
  "ALGO",
  "APT",
  "ATOM",
  "AVAX",
  "BCH",
  "BERA",
  "CORE",
  "DASH",
  "ETH",
  "FET",
  "LTC",
  "SOL",
  "SUI",
  "TIA",
  "TON",
  "TRX",
  "XEC",
  "XLM",
  "XRP",
  "WETH",
  "WAVAX",
  "WSOL",
  "WEETH",
  "WBETH",
  "CBETH",
  "BSOL",
  "WHYPE",
  "HBAR",
  "HYPE",
  "ICP",
  "INJ",
  "NEAR",
  "RON",
  "S",
  "SEI",
  "STX",
  "TAO",
  "MON",
  "HNT",
]);
const LAYER2_SYMBOLS = new Set(["ARB", "OP", "WPOL", "ZRO", "MNT", "STRK", "METIS", "LINEA"]);
const EXCHANGE_SYMBOLS = new Set(["BNB", "WBNB", "CRO", "WOO"]);
const GAMING_SYMBOLS = new Set(["APE", "AXS", "GALA", "ILV", "IMX", "MANA", "SAND", "TNSR"]);
const DEFI_SYMBOLS = new Set([
  "1INCH",
  "AAVE",
  "AERO",
  "AMP",
  "CAKE",
  "COMP",
  "CRV",
  "DRIFT",
  "ENA",
  "ETHFI",
  "FLUID",
  "FXS",
  "JOE",
  "JTO",
  "JUP",
  "KMNO",
  "LDO",
  "LINK",
  "MORPHO",
  "ONDO",
  "ORCA",
  "PENDLE",
  "RAY",
  "RPL",
  "GMX",
  "GNS",
  "METH",
  "MSOL",
  "RETH",
  "SAVAX",
  "STETH",
  "UNI",
  "YFI",
  "SUSHI",
  "SYN",
]);
const MEME_SYMBOLS = new Set([
  "APU",
  "BITCOIN",
  "BOME",
  "BONE",
  "BONK",
  "BRETT",
  "DOGE",
  "FARTCOIN",
  "FWOG",
  "GIGA",
  "PEPE",
  "SHIB",
  "TOSHI",
  "TRUMP",
  "TURBO",
  "USELESS",
  "WEN",
  "WIF",
  "MEW",
  "MOG",
  "MOODENG",
  "NEIRO",
  "PENGU",
  "POPCAT",
  "PUMP",
  "SPX",
  "STONKS",
  "SIREN",
]);
const HIGH_PRIORITY_SYMBOLS = new Set([
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "USDT",
  "USDC",
  "XRP",
  "DOGE",
  "ADA",
  "TRX",
  "TON",
  "LTC",
  "BCH",
  "ARB",
  "OP",
]);
const CHAIN_NETWORK_IDS = new Set([
  "algorand",
  "aptos",
  "avax",
  "berachain",
  "bitcoin",
  "bitcoincash",
  "cardano",
  "celestia",
  "core",
  "cosmos",
  "dash",
  "doge",
  "ethereum",
  "fetch",
  "hedera",
  "hyperevm",
  "icp",
  "litecoin",
  "monad",
  "near",
  "ronin",
  "ripple",
  "seievm",
  "solana",
  "sonic",
  "stacks",
  "stellar",
  "sui",
  "ton",
  "tron",
  "xec",
  "bittensor",
]);
const LAYER2_NETWORK_IDS = new Set([
  "arbitrum",
  "base",
  "blast",
  "linea",
  "mantle",
  "metis",
  "optimism",
  "plasma",
  "polygon",
  "rootstock",
  "scroll",
  "starknet",
  "zksyncera",
]);

export function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase();
}

export function normalizeName(name) {
  return String(name || "").trim();
}

function isStable(symbol, name) {
  if (
    /^(USDT|USDC|USDE|USDP|USDS|USDT0|USDB|USDBC|USD1|USDG|DAI|TUSD|FRAX|GHO|EURC|BRLA|USR|MIM)$/i.test(
      symbol,
    )
  ) {
    return true;
  }

  return /(usd|dollar|euro coin|tether|stable|magic internet money)/i.test(name);
}

function isMeme(symbol, name) {
  if (MEME_SYMBOLS.has(symbol)) {
    return true;
  }

  return /(doge|shib|pepe|bonk|wif|meme|fart|brett|trump|giga|apu|fwog|toshi|useless)/i.test(
    `${symbol} ${name}`,
  );
}

function isGaming(symbol, name) {
  if (GAMING_SYMBOLS.has(symbol)) {
    return true;
  }

  return /(game|gaming|axie|gala|decentraland|illuvium|sandbox|immutable|tensor|echelon prime)/i.test(
    name,
  );
}

function isExchange(symbol, name) {
  if (EXCHANGE_SYMBOLS.has(symbol)) {
    return true;
  }

  return /(binance|exchange)/i.test(name);
}

function isLayer2(symbol, name) {
  if (LAYER2_SYMBOLS.has(symbol)) {
    return true;
  }

  return /(arbitrum|optimism|polygon|layerzero)/i.test(name);
}

function isLayer1(symbol, asset) {
  if (LAYER1_NATIVE.has(symbol)) {
    return true;
  }

  const wrappedOrStakedL1 =
    /(wrapped|staked|beacon)/i.test(asset.name) &&
    /(btc|ether|eth|sol|avax|bnb|hype)/i.test(asset.name);

  if (wrappedOrStakedL1) {
    return true;
  }

  return asset.networks.some(
    (network) => CHAIN_NETWORK_IDS.has(network.id) && !network.contractAddress,
  );
}

function isNativeLayer2(asset) {
  return asset.networks.some(
    (network) => LAYER2_NETWORK_IDS.has(network.id) && !network.contractAddress,
  );
}

function isDefi(symbol, name) {
  if (DEFI_SYMBOLS.has(symbol)) {
    return true;
  }

  return /(swap|finance|dao|protocol|compound|curve|aave|gains|gmx|aerodrome|yearn|jupiter|jito|kamino|morpho|raydium|orca|trader joe|lido|rocket pool|pendle|synapse|sushi|ondo)/i.test(
    name,
  );
}

export function deriveCategoryDecision(asset, override) {
  const symbol = normalizeSymbol(asset.coin);
  const name = normalizeName(asset.name);

  if (override?.category) {
    return {
      category: override.category,
      source: "manual_override",
      reason: "manual_category_override",
    };
  }

  if (BTC_LIKE.has(symbol)) {
    return { category: "btc", source: "rule", reason: "btc_like_symbol" };
  }

  if (isStable(symbol, name)) {
    return { category: "stable", source: "rule", reason: "stable_symbol_or_name" };
  }

  if (isMeme(symbol, name)) {
    return { category: "meme", source: "rule", reason: "meme_symbol_or_name" };
  }

  if (isGaming(symbol, name)) {
    return { category: "gaming", source: "rule", reason: "gaming_symbol_or_name" };
  }

  if (isLayer2(symbol, name)) {
    return { category: "layer2", source: "rule", reason: "layer2_symbol_or_name" };
  }

  if (isNativeLayer2(asset)) {
    return { category: "layer2", source: "rule", reason: "native_layer2_network" };
  }

  if (isExchange(symbol, name)) {
    return { category: "exchange", source: "rule", reason: "exchange_symbol_or_name" };
  }

  if (isLayer1(symbol, asset)) {
    return { category: "layer1", source: "rule", reason: "native_or_wrapped_l1" };
  }

  if (isDefi(symbol, name)) {
    return { category: "defi", source: "rule", reason: "defi_symbol_or_name" };
  }

  return { category: "other", source: "rule", reason: "no_safe_rule_match" };
}

export function derivePriorityDecision(asset, category, override) {
  const symbol = normalizeSymbol(asset.coin);

  if (override?.priority) {
    return {
      priority: override.priority,
      source: "manual_override",
      reason: "manual_priority_override",
    };
  }

  if (HIGH_PRIORITY_SYMBOLS.has(symbol)) {
    return { priority: "high", source: "rule", reason: "high_priority_symbol" };
  }

  if (category === "btc") {
    return { priority: "high", source: "rule", reason: "btc_category_default" };
  }

  if (category === "stable") {
    return {
      priority: asset.networks.length >= 3 ? "high" : "medium",
      source: "rule",
      reason:
        asset.networks.length >= 3
          ? "stable_multi_network_default"
          : "stable_default",
    };
  }

  if (category === "layer1" || category === "layer2" || category === "exchange") {
    return {
      priority: "medium",
      source: "rule",
      reason: `${category}_default`,
    };
  }

  if (category === "meme" || category === "defi" || category === "gaming") {
    return {
      priority: "medium",
      source: "rule",
      reason: `${category}_default`,
    };
  }

  return { priority: "low", source: "rule", reason: "fallback_low_priority" };
}
