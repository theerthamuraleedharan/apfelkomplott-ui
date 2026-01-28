export default function InvestmentPanel({
  money,
  onBuySeedling,
  onBuyPreGrown,
  onBuyCrate,
  onBuyStand
}) {
  return (
    <div className="investment-panel">
      <h3>💰 Investment Phase</h3>
      <p>Money: {money} 💰</p>

      <button onClick={onBuySeedling} disabled={money < 3}>
        Buy Seedling (3💰)
      </button>

      <button onClick={onBuyPreGrown} disabled={money < 4}>
        Buy Pre-grown Tree (4💰)
      </button>

      <button onClick={onBuyCrate} disabled={money < 3}>
        Buy Transport Crate (3💰)
      </button>

      <button onClick={onBuyStand} disabled={money < 3}>
        Buy Sales Stand (3💰)
      </button>
    </div>
  );
}
