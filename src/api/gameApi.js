const BASE_URL = "http://localhost:8080/game";

export async function startGame() {
  const res = await fetch("http://localhost:8080/game/start-demo", {
    method: "POST",
  });
  return res.json();
}


export async function getGameState() {
  const res = await fetch(`${BASE_URL}/state`);
  return res.json();
}

export async function nextRound() {
  const res = await fetch("http://localhost:8080/game/next-round", {
    method: "POST",
  });
  return res.json();
}


export async function getMarket() {
  const res = await fetch(`${BASE_URL}/market`);
  return res.json();
}

export async function buyProductionCard(cardName) {
  await fetch(`${BASE_URL}/invest/production`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardName })
  });
}

export async function buyInvestment(type) {
  await fetch("http://localhost:8080/game/invest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ investmentType: type }),
  });
}
