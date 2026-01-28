import { buyProductionCard } from "../api/gameApi";

export default function Market({ market, phase, onBuy }) {
  return (
    <div>
      <h2>Production Market</h2>

      {phase !== "INVEST" && (
        <p>Production cards can only be bought in INVEST phase</p>
      )}

      <div style={{ display: "flex", gap: "12px" }}>
        {market.map((card) => (
          <div key={card.name} style={{ border: "1px solid black", padding: "8px" }}>
            <h3>{card.name}</h3>
            <p>{card.description}</p>
            <p>Cost: {card.cost}</p>

            {phase === "INVEST" && (
              <button
                onClick={() => {
                  buyProductionCard(card.name).then(onBuy);
                }}
              >
                Buy
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
