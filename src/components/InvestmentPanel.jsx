import "./InvestmentPanel.css";

const INVESTMENT_ACTIONS = [
  {
    id: "seedling",
    investmentType: "BUY_SEEDLING",
    badge: "Tree",
    title: "Seedling",
    subtitle: "Start a new orchard line with a young tree.",
    cost: 3,
    cta: "Buy Seedling",
  },
  {
    id: "pregrown",
    investmentType: "BUY_PRE_GROWN_TREE",
    badge: "Growth",
    title: "Pre-grown Tree",
    subtitle: "Place a stronger tree and accelerate future harvests.",
    cost: 4,
    cta: "Buy Tree",
  },
  {
    id: "crate",
    investmentType: "BUY_CRATE",
    badge: "Logistics",
    title: "Transport Crate",
    subtitle: "Expand carrying capacity for upcoming deliveries.",
    cost: 3,
    cta: "Buy Crate",
  },
  {
    id: "stand",
    investmentType: "BUY_SALES_STAND",
    badge: "Sales",
    title: "Sales Stand",
    subtitle: "Open another sales point for stronger market output.",
    cost: 3,
    cta: "Buy Stand",
  },
];

/**
 * Investment interface shown during the Invest phase.
 *
 * The panel displays the four basic farm upgrades, their costs, and whether the
 * player has enough money to buy each one. Purchase behavior is delegated to the
 * parent page so backend validation remains centralized.
 *
 * @component
 * @param {object} props - Component props.
 * @param {number} props.money - Player money available for investments.
 * @param {string|null} props.pendingInvestmentType - Investment request that is
 * currently awaiting a backend response.
 * @param {Function} props.onBuySeedling - Buy-seedling callback.
 * @param {Function} props.onBuyPreGrown - Buy pre-grown-tree callback.
 * @param {Function} props.onBuyCrate - Buy transport-crate callback.
 * @param {Function} props.onBuyStand - Buy sales-stand callback.
 * @returns {JSX.Element} Farm investment panel.
 */
export default function InvestmentPanel({
  money,
  pendingInvestmentType,
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
            pendingInvestmentType={pendingInvestmentType}
            investmentType={action.investmentType}
            onClick={handlers[action.id]}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Single purchasable farm-upgrade card.
 *
 * @param {object} props - Component props.
 * @param {object} props.action - Static investment action definition.
 * @param {number} props.money - Player money available for comparison.
 * @param {Function} props.onClick - Purchase callback.
 * @returns {JSX.Element} Investment action button.
 */
function ActionCard({
  action,
  money,
  onClick,
  pendingInvestmentType,
  investmentType,
}) {
  const isPending = pendingInvestmentType === investmentType;
  const disabled = money < action.cost || Boolean(pendingInvestmentType);

  return (
    <button
      className={`investAction ${disabled ? "is-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={
        pendingInvestmentType
          ? "Please wait for the current purchase to finish"
          : disabled
            ? `Not enough money (need ${action.cost})`
            : `Buy for ${action.cost}`
      }
      type="button"
    >
      <div className="investAction__top">
        <span className="investAction__badge">{action.badge}</span>
        <span className={`investAction__state ${disabled ? "is-locked" : ""}`}>
          {isPending ? "Buying..." : disabled ? "Unavailable" : "Ready"}
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

        <span className="investAction__cta">
          {isPending ? "Processing..." : action.cta}
        </span>
      </div>
    </button>
  );
}
