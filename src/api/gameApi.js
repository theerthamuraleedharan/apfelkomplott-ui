const DEFAULT_API_BASE_URL = "http://localhost:8081";

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

const BASE_URL = `${API_BASE_URL}/game`;
export const ASSET_BASE_URL = API_BASE_URL;

/* ---------- GAME ---------- */

export async function startGame(mode) {
  const url = new URL(`${BASE_URL}/start`);
  if (mode) url.searchParams.set("mode", mode);

  const res = await fetch(url.toString(), { method: "POST" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json();
}


export async function getGameState() {
  const res = await fetch(`${BASE_URL}/state`);
  return await res.json();
}

export async function nextPhase() {
  const res = await fetch(`${BASE_URL}/next-phase`, {
    method: "POST",
  });
  return await res.json();
}

export async function getEventOptions() {
  const res = await fetch(`${BASE_URL}/event/options`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function selectEventOption(optionIndex) {
  const res = await fetch(`${BASE_URL}/event/select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionIndex }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json();
}

/* ---------- MARKET ---------- */

export async function getMarket() {
  const res = await fetch(`${BASE_URL}/market`);
  return await res.json();
}

export async function getActiveProductionCards() {
  const res = await fetch(`${BASE_URL}/active-production-cards`);
  return await res.json();
}

export async function cardScoring() {
  const res = await fetch(`${BASE_URL}/card-scoring`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json();
}

/* ---------- INVESTMENTS ---------- */

export async function buyProductionCard(cardId) {
  const res = await fetch(`${BASE_URL}/buy-card?cardId=${encodeURIComponent(cardId)}`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json();
}



export async function buyInvestment(type) {
  const res = await fetch(`${BASE_URL}/invest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ investmentType: type }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
}

