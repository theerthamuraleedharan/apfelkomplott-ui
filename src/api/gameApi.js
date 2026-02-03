const BASE_URL = "http://localhost:8081/game";

/* ---------- GAME ---------- */

export async function startGame() {
  const res = await fetch(`${BASE_URL}/start-demo`, {
    method: "POST",
  });
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

export async function buyProductionCard(cardName) {
  const res = await fetch(`${BASE_URL}/invest/production`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardName }),
  });

  return await res.json(); // ✅ important
}

export async function buyInvestment(type) {
  const res = await fetch(`${BASE_URL}/invest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ investmentType: type }),
  });

  return await res.json(); // ✅ important
}
