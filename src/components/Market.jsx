import "./Market.css";

import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";

export default function Market({ market, mode, canBuy, onBuy }) {
  
  useEffect(() => {
  const onKeyDown = (e) => {
    if (e.key === "Escape") setSelectedCard(null);
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, []);
  const [selectedCard, setSelectedCard] = useState(null);
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
                <div className="prod-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCard(card)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedCard(card)}
                >
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
                     {card.media && card.media.length > 0 && (
                      <div className="prod-card__media">
                        {card.media.map((item, index) => (
                          <CardMedia key={index} item={item} />
                        ))}
                      </div>
                      )}

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
                   onClick={(e) => {
                        e.stopPropagation();     
                        onBuy(card.id);
                      }}
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
      {selectedCard && (
  <div
    className="cardModal__backdrop"
    onClick={() => setSelectedCard(null)}
  >
    <div
      className="cardModal__content"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="cardModal__close"
        onClick={() => setSelectedCard(null)}
      >
        ✕
      </button>

      {/* Reuse the same card UI but bigger */}
      <div className="prod-card prod-card--zoom">
        <div className="prod-card__top">
          {selectedCard.media && selectedCard.media.length > 0 && (
            <div className="prod-card__media">
              {selectedCard.media.map((item, index) => (
                <CardMedia key={index} item={item} />
              ))}
            </div>
          )}

          <div className="prod-card__topRow">
            <div className="prod-card__name">{selectedCard.name}</div>
          </div>

          <div className="prod-card__sub">
            {selectedCard.deck === "SHORT_TERM" ? "Short-term" : "Long-term"}:{" "}
            {selectedCard.category}
          </div>
        </div>

        <div className="prod-card__body">
          <div className="prod-card__sectionTitle">Effects</div>

          <div className="prod-card__effects">
            {(selectedCard.effects ?? []).map((e, i) => (
              <div className="effect" key={i}>
                <div className="effect__years">Year {e.years?.join(", ")}</div>
                <div className="effect__stats">
                  <Stat label="💰 Eco" value={formatDelta(e.economy)} />
                  <Stat label="🌿 Env" value={formatDelta(e.environment)} />
                  <Stat label="❤️ Health" value={formatDelta(e.health)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
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

function CardMedia({ item }) {
  const [failed, setFailed] = useState(false);

  const API_BASE_URL = "http://localhost:8081/game";
  const ASSET_BASE_URL = API_BASE_URL.replace(/\/game$/, ""); // http://localhost:8081

  const resolveSrc = (src) => {
    if (!src) return "";
    if (src.startsWith("http")) return src;
    return `${ASSET_BASE_URL}${src}`;
  };

  // image media
  if (item.type === "image") {
    const src = resolveSrc(item.src);
    if (!src) return <div className="prod-card__imgPlaceholder">Image src missing</div>;
    if (failed) return <div className="prod-card__imgPlaceholder">Image not found</div>;
    return <img className="prod-card__img" src={src} alt="" onError={() => setFailed(true)} />;
  }

  // qr media: if src exists, show QR as image
  if (item.type === "qr" && item.src) {
    const src = resolveSrc(item.src);
    if (!src) return <div className="prod-card__imgPlaceholder">QR src missing</div>;
    if (failed) return <div className="prod-card__imgPlaceholder">QR image not found</div>;
    return <img className="prod-card__qrImg" src={src} alt="QR" onError={() => setFailed(true)} />;
  }

  // qr media: if value exists, generate QR
  if (item.type === "qr" && item.value) {
    return (
      <div className="prod-card__qrWrap">
        <QRCodeCanvas value={item.value} size={120} />
      </div>
    );
  }

  return null;
}