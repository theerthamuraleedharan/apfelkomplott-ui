const DEFAULT_API_BASE_URL = "http://localhost:8081";

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

const BASE_URL = `${API_BASE_URL}/game`;
export const ASSET_BASE_URL = API_BASE_URL;

function extractErrorMessage(text, fallbackMessage = "Something went wrong.") {
  if (!text) return fallbackMessage;

  try {
    const parsed = JSON.parse(text);

    if (typeof parsed?.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }

    if (typeof parsed?.error === "string" && parsed.error.trim()) {
      return parsed.error.trim();
    }
  } catch {
    // Keep the original text when the backend returned a plain string.
  }

  return text;
}

/* ---------- GAME ---------- */

export async function startGame(mode) {
  const url = new URL(`${BASE_URL}/start`);
  if (mode) url.searchParams.set("mode", mode);

  const res = await fetch(url.toString(), { method: "POST" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage(text, "Unable to start the game."));
  }

  return await res.json();
}

async function parseJsonResponse(res, fallbackMessage) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage(text, fallbackMessage));
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(fallbackMessage);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
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
    throw new Error(extractErrorMessage(text, "Unable to load event choices."));
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchGameGuide() {
  const res = await fetch(`${BASE_URL}/help`);
  return await parseJsonResponse(res, "Unable to load the game guide.");
}

export async function fetchCurrentPhaseHelp() {
  const res = await fetch(`${BASE_URL}/help/current-phase`);
  return await parseJsonResponse(res, "Unable to load help for the current phase.");
}

export async function selectEventOption(optionIndex) {
  const res = await fetch(`${BASE_URL}/event/select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionIndex }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage(text, "Unable to reveal the selected event."));
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
    throw new Error(extractErrorMessage(text, "Unable to score production cards."));
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
    throw new Error(extractErrorMessage(text, "Unable to buy the selected production card."));
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
    throw new Error(extractErrorMessage(errorText, "Unable to buy this investment."));
  }
}

