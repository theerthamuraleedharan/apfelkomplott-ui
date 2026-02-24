import "./InvestmentPanel.css";

export default function InvestmentPanel({
  money,   
  onBuySeedling,
  onBuyPreGrown,
  onBuyCrate,
  onBuyStand,
}) {
  return (
    <div className="investPanel">
      <div className="investPanel__header">
        <div className="investPanel__title">
          <span className="investPanel__icon">🏗️</span>
          Investments
        </div>

        <div className="investPanel__money" title="Money available">
          <span className="investPanel__moneyIcon">🪙</span>
          <span className="investPanel__moneyValue">{money}</span>
        </div>
      </div>

      <div className="investPanel__hint">
        Choose what to buy this round.
      </div>

      <div className="investPanel__grid">
        <ActionCard
          icon="🌱"
          title="Seedling"
          cost={3}
          money={money}
          onClick={onBuySeedling}
        />
        <ActionCard
          icon="🌳"
          title="Pre-grown tree"
          cost={4}
          money={money}
          onClick={onBuyPreGrown}
        />
        <ActionCard
          icon="📦"
          title="Transport crate"
          cost={3}
          money={money}
          onClick={onBuyCrate}
        />
        <ActionCard
          icon="🧺"
          title="Sales stand"
          cost={3}
          money={money}
          onClick={onBuyStand}
        />
      </div>
    </div>
  );
}

function ActionCard({ icon, title, cost, money, onClick }) {
  const disabled = money < cost;

  return (
    <button
      className={`investAction ${disabled ? "is-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? `Not enough money (need ${cost})` : `Buy for ${cost}`}
      type="button"
    >
      <div className="investAction__left">
        <div className="investAction__icon">{icon}</div>
        <div className="investAction__text">
          <div className="investAction__title">{title}</div>
          <div className="investAction__sub">Add to your farm</div>
        </div>
      </div>

      <div className="investAction__cost">
        <span className="investAction__costNum">{cost}</span>
        <span className="investAction__costLabel">Geld</span>
      </div>
    </button>
  );
}
