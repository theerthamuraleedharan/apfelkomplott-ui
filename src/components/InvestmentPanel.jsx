import "./InvestmentPanel.css";

const INVESTMENT_ACTIONS = [
  {
    id: "seedling",
    badge: "Tree",
    title: "Seedling",
    subtitle: "Start a new orchard line with a young tree.",
    cost: 3,
    cta: "Buy Seedling",
  },
  {
    id: "pregrown",
    badge: "Growth",
    title: "Pre-grown Tree",
    subtitle: "Place a stronger tree and accelerate future harvests.",
    cost: 4,
    cta: "Buy Tree",
  },
  {
    id: "crate",
    badge: "Logistics",
    title: "Transport Crate",
    subtitle: "Expand carrying capacity for upcoming deliveries.",
    cost: 3,
    cta: "Buy Crate",
  },
  {
    id: "stand",
    badge: "Sales",
    title: "Sales Stand",
    subtitle: "Open another sales point for stronger market output.",
    cost: 3,
    cta: "Buy Stand",
  },
];

export default function InvestmentPanel({
  money,
  onBuySeedling,
  onBuyPreGrown,
  onBuyCrate,
  onBuyStand,
}) {
  const handlers = {
    seedling: onBuySeedling,
    pregrown: onBuyPreGrown,
    crate: onBuyCrate,
    stand: onBuyStand,
  };

  return (
    <section className="investPanel">
      <div className="investPanel__header">
        <div>
          <div className="investPanel__eyebrow">Invest Phase</div>
          <div className="investPanel__titleRow">
            <h3 className="investPanel__title">Farm Investments</h3>
            <span className="investPanel__phaseBadge">Open Market</span>
          </div>
          <p className="investPanel__hint">
            Choose one of these upgrades to strengthen production, transport, or sales.
          </p>
        </div>

        <div className="investPanel__money" title="Money available">
          <span className="investPanel__moneyLabel">Available</span>
          <span className="investPanel__moneyValue">{money}</span>
          <span className="investPanel__moneyUnit">Money</span>
        </div>
      </div>

      <div className="investPanel__grid">
        {INVESTMENT_ACTIONS.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            money={money}
            onClick={handlers[action.id]}
          />
        ))}
      </div>
    </section>
  );
}

function ActionCard({ action, money, onClick }) {
  const disabled = money < action.cost;

  return (
    <button
      className={`investAction ${disabled ? "is-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? `Not enough money (need ${action.cost})` : `Buy for ${action.cost}`}
      type="button"
    >
      <div className="investAction__top">
        <span className="investAction__badge">{action.badge}</span>
        <span className={`investAction__state ${disabled ? "is-locked" : ""}`}>
          {disabled ? "Locked" : "Ready"}
        </span>
      </div>

      <div className="investAction__body">
        <div className="investAction__title">{action.title}</div>
        <div className="investAction__sub">{action.subtitle}</div>
      </div>

      <div className="investAction__bottom">
        <div className="investAction__cost">
          <span className="investAction__costLabel">Cost</span>
          <span className="investAction__costValue">{action.cost} Money</span>
        </div>

        <span className="investAction__cta">{action.cta}</span>
      </div>
    </button>
  );
}
