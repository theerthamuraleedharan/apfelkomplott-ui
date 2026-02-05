export default function InvestmentPanel({
  money,
  onBuySeedling,
  onBuyPreGrown,
  onBuyCrate,
  onBuyStand,
}) {
  return (
    <div className="investment-panel" style={{ border: "2px solid green", padding: "10px" }}>
      <h2>🏗️ Investments</h2>
      <p>Money: {money}</p>

     <button
        onClick={() => {
          onBuySeedling();
        }}
      >
        🌱 Buy Seedling (3)
      </button>
        <button onClick={onBuyPreGrown}>
          🌳 Buy Pre-grown Tree (4)
        </button>

        <button onClick={onBuyCrate}>
          📦 Buy Transport Crate (3)
        </button>

      <button onClick={onBuyStand} disabled={money < 3}>
        Buy Sales Stand (3💰)
      </button>
    </div>
  );
}
