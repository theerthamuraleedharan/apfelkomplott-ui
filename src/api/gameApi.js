const DEFAULT_API_BASE_URL = "http://localhost:8081";

export const GAME_ID_STORAGE_KEY = "apfelkomplott-game-id";
export const GAME_SESSION_EXPIRED_EVENT = "apfelkomplott-game-session-expired";

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

const GAME_BASE_URL = `${API_BASE_URL}/game`;
export const ASSET_BASE_URL = API_BASE_URL;

export function getStoredGameId() {
  return localStorage.getItem(GAME_ID_STORAGE_KEY);
}

export function clearStoredGameId() {
  localStorage.removeItem(GAME_ID_STORAGE_KEY);
}

function gameUrl(path) {
  const gameId = getStoredGameId();

  if (!gameId) {
    notifyExpiredSession();
    throw new Error("No active game session. Please start a new game.");
  }

  return `${GAME_BASE_URL}/${encodeURIComponent(gameId)}${path}`;
}

function notifyExpiredSession() {
  clearStoredGameId();
  window.dispatchEvent(new Event(GAME_SESSION_EXPIRED_EVENT));
}

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

async function parseResponse(res, fallbackMessage, { allowEmpty = false } = {}) {
  if (!res.ok) {
    const text = await res.text();

    if (res.status === 401 || res.status === 404 || res.status === 410) {
      notifyExpiredSession();
    }

    throw new Error(extractErrorMessage(text, fallbackMessage));
  }

  const text = await res.text();
  if (!text && allowEmpty) return null;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(fallbackMessage);
  }

  return text ? JSON.parse(text) : null;
}

async function gameRequest(path, options, fallbackMessage, parseOptions) {
  const res = await fetch(gameUrl(path), options);
  return parseResponse(res, fallbackMessage, parseOptions);
}

/* ---------- GAME ---------- */

export async function startGame(mode) {
  const url = new URL(`${GAME_BASE_URL}/sessions/start`);
  if (mode) url.searchParams.set("mode", mode);

  const res = await fetch(url.toString(), { method: "POST" });
  const game = await parseResponse(res, "Unable to start the game.");

  if (!game?.gameId) {
    throw new Error("The backend did not return a game ID.");
  }

  localStorage.setItem(GAME_ID_STORAGE_KEY, String(game.gameId));
  return game;
}

export function getGameState() {
  return gameRequest("/state", undefined, "Unable to load the game.");
}

export function nextPhase() {
  return gameRequest(
    "/next-phase",
    { method: "POST" },
    "Unable to advance to the next phase."
  );
}

export function getEventOptions() {
  return gameRequest("/event/options", undefined, "Unable to load event choices.");
}

export async function fetchGameGuide() {
  const res = await fetch(`${GAME_BASE_URL}/help`);
  return parseResponse(res, "Unable to load the game guide.");
}

export function fetchCurrentPhaseHelp() {
  return gameRequest(
    "/help/current-phase",
    undefined,
    "Unable to load help for the current phase."
  );
}

export function selectEventOption(optionIndex) {
  return gameRequest(
    "/event/select",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIndex }),
    },
    "Unable to reveal the selected event."
  );
}

/* ---------- MARKET ---------- */

export function getMarket() {
  return gameRequest("/market", undefined, "Unable to load the card market.");
}

export function getActiveProductionCards() {
  return gameRequest(
    "/active-production-cards",
    undefined,
    "Unable to load active production cards."
  );
}

export function cardScoring() {
  return gameRequest(
    "/card-scoring",
    { method: "POST" },
    "Unable to score production cards."
  );
}

export function buyProductionCard(cardId) {
  return gameRequest(
    `/buy-card?cardId=${encodeURIComponent(cardId)}`,
    { method: "POST" },
    "Unable to buy the selected production card."
  );
}

/* ---------- INVESTMENTS ---------- */

export function buyInvestment(type) {
  return gameRequest(
    "/invest",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ investmentType: type }),
    },
    "Unable to buy this investment.",
    { allowEmpty: true }
  );
}

export function buyProductionInvestment(payload) {
  return gameRequest(
    "/invest/production",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Unable to buy this production investment.",
    { allowEmpty: true }
  );
}
