const baseUrl = process.env.BASE_URL?.trim();

if (!baseUrl) {
  console.error("Missing BASE_URL. Example: BASE_URL=https://preview.example.vercel.app npm run smoke:preview");
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchJson(path, init) {
  const response = await fetch(new URL(path, baseUrl), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json();
  return { response, payload };
}

async function fetchPage(path) {
  const response = await fetch(new URL(path, baseUrl));
  const html = await response.text();
  return { response, html };
}

async function main() {
  const smoke = await fetchJson("/api/preview-smoke");
  assert(smoke.response.ok, `/api/preview-smoke failed with ${smoke.response.status}`);

  const { generic, sideshift } = smoke.payload;

  assert(generic.renderEnabled === true, "Generic render mode is not enabled.");
  assert(generic.rolloutMode === "off", "Generic rollout mode should stay off on preview.");
  assert(Array.isArray(generic.samples) && generic.samples.every((sample) => sample.resolved), "One or more generic sample routes did not resolve.");
  assert(sideshift.coins?.ok === true, "Coins check failed.");
  assert(sideshift.coins?.mockMode === false, "Coins endpoint is still in mock mode.");
  assert(sideshift.quote?.ok === true, "Quote check failed.");
  assert(sideshift.quote?.mockMode === false, "Quote endpoint is still in mock mode.");
  assert(Boolean(sideshift.quote?.rate), "Live quote rate is missing.");

  const pageChecks = await Promise.all([
    fetchPage("/swap/usdt-to-btc"),
    fetchPage("/swap/usdc-to-trump"),
    fetchPage("/swap/usdt-trc20-to-btc"),
  ]);

  for (const { response } of pageChecks) {
    assert(response.ok, `Page check failed with status ${response.status}`);
  }

  assert(
    pageChecks[0].html.includes("Route overview") &&
      pageChecks[0].html.includes("Route note: this page is prefilled with USDT on Tron"),
    "Generic USDT to BTC page is missing the expected route overview note.",
  );
  assert(
    pageChecks[1].html.includes("Route profile") &&
      pageChecks[1].html.includes("Route note: this page is prefilled with USDC on Ethereum"),
    "Generic USDC to TRUMP page is missing the expected route note/profile.",
  );
  assert(
    pageChecks[2].html.includes("Pair route") &&
      pageChecks[2].html.includes("Pair intent"),
    "Gold benchmark page no longer matches the expected gold labels.",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        genericRenderEnabled: generic.renderEnabled,
        genericRolloutMode: generic.rolloutMode,
        liveQuoteRate: sideshift.quote.rate,
        checkedPages: [
          "/swap/usdt-to-btc",
          "/swap/usdc-to-trump",
          "/swap/usdt-trc20-to-btc",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
