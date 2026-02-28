const BASE_URL = "http://localhost:8081/game";
export const ASSET_BASE_URL = "http://localhost:8081";

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

/* ---------- MARKET ---------- */

export async function getMarket() {
  const res = await fetch(`${BASE_URL}/market`);
  return await res.json();
}

/* ---------- INVESTMENTS ---------- */

export async function buyProductionCard(cardId) {
  const res = await fetch(`${BASE_URL}/invest/production`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId }),  
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json(); // return updated GameState
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

