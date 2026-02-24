import "./Market.css";

export default function Market({ market, mode, canBuy, onBuy }) {
  function resolveCost(card) {
    if (!card?.cost) return "-";
    if (typeof card.cost.fixed === "number") return card.cost.fixed;
    if (card.cost.byMode && mode && card.cost.byMode[mode] != null)
      return card.cost.byMode[mode];
    return "-";
  }

  function formatDelta(n) {
    if (!n) return "0";
    return n > 0 ? `+${n}` : `${n}`;
  }

  return (
    <div className="market">
      <div className="market__header">
        <h3 className="market__title">Production Cards</h3>
        <div className="market__meta">
          Market (5 slots) {mode ? `• Mode: ${mode}` : ""}
        </div>
      </div>

      <div className="market__grid market__grid--fixed">
        {Array.from({ length: 5 }).map((_, idx) => {
          const card = market[idx] ?? null;

          return (
            <div className="market__slot" key={idx}>
              {card ? (
                <div className="prod-card">
                  <div className="prod-card__top">
                    <div className="prod-card__topRow">
                      <div className="prod-card__name">{card.name}</div>
                    </div>
                    <div className="prod-card__sub">
                      {card.deck === "SHORT_TERM" ? "Short-term" : "Long-term"}:{" "}
                      {card.category}
                    </div>
                  </div>

                  <div className="prod-card__body">
                    <div className="prod-card__sectionTitle">Effects</div>

                    <div className="prod-card__effects">
                      {(card.effects ?? []).map((e, i) => (
                        <div className="effect" key={i}>
                          <div className="effect__years">
                            Year {e.years?.join(", ")}
                          </div>

                          <div className="effect__stats">
                            <Stat label="💰 Eco" value={formatDelta(e.economy)} />
                            <Stat label="🌿 Env" value={formatDelta(e.environment)} />
                            <Stat label="❤️ Health" value={formatDelta(e.health)} />
                          </div>
                        </div>
                      ))}

                      {(card.effects ?? []).length === 0 && (
                        <div className="no-effects">No effects configured.</div>
                      )}
                    </div>
                  </div>

                  <div className="prod-card__bottom">
                    <div className="cost">
                      <div className="cost__num">{resolveCost(card)}</div>
                      <div className="cost__label">Geld</div>
                    </div>

                   <button
                    className="buy-btn"
                    disabled={!canBuy}
                    onClick={() => onBuy(card.id)}
                    title={canBuy ? "Buy this card" : "You can buy only during INVEST phase"}
                  >
                    Buy
                  </button>
                  </div>
                </div>
              ) : (
                <div className="marketEmpty">
                  <div className="marketEmpty__label">Empty slot</div>
                  <div className="marketEmpty__sub">Refills in Step 3</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
    </div>
  );
}