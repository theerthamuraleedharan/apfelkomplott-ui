import { buyProductionCard } from "../api/gameApi";

export default function Market({ market, phase, onBuy }) {

  async function handleBuy(cardName) {
    try {
      await buyProductionCard(cardName);
      onBuy(); // refresh state + market
    } catch (err) {
      alert(err.message || "Action not allowed");
    }
  }

  return (
    <div>
      <h2>Production Market</h2>

      {phase !== "INVEST" && (
        <p>Production cards can only be bought in INVEST phase</p>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        {market.map((card) => (
          <div
            key={card.name}
            style={{ border: "1px solid black", padding: "8px" }}
          >
            <h3>{card.name}</h3>
            <p>{card.description}</p>
            <p>Cost: {card.cost}</p>

            {phase === "INVEST" && (
              <button onClick={() => handleBuy(card.name)}>
                Buy
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
