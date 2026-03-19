import "./Market.css";

import { useEffect, useState } from "react";
import CardMedia from "./CardMedia";

export default function Market({ market, mode, canBuy, onBuy }) {
  const buyHint = "Available only during the Invest phase";
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedCard(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function resolveCost(card) {
    if (!card?.cost) return "-";
    if (typeof card.cost.fixed === "number") return card.cost.fixed;
    if (card.cost.byMode && mode && card.cost.byMode[mode] != null) {
      return card.cost.byMode[mode];
    }
    return "-";
  }

  function getCostDisplay(card) {
    if (!card?.cost) {
      return { type: "single", value: "-" };
    }

    if (typeof card.cost.fixed === "number") {
      return { type: "single", value: card.cost.fixed };
    }

    if (card.cost.byMode) {
      return {
        type: "byMode",
        values: [
          {
            key: "CONVENTIONAL",
            label: "Conventional",
            value: card.cost.byMode.CONVENTIONAL ?? "-",
          },
          {
            key: "ORGANIC",
            label: "Organic",
            value: card.cost.byMode.ORGANIC ?? "-",
          },
        ],
      };
    }

    return { type: "single", value: resolveCost(card) };
  }

  function formatDelta(n) {
    if (!n) return "0";
    return n > 0 ? `+${n}` : `${n}`;
  }

  function getDeckLabel(card) {
    return card?.deck === "SHORT_TERM" ? "Short-term" : "Long-term";
  }

  function getHeaderMedia(card) {
    return (card?.media ?? []).filter((item) => item && item.type === "image" && item.src);
  }

  function getBodyMedia(card) {
    return (card?.media ?? []).filter((item) => item && item.type === "qr" && (item.src || item.value));
  }

  const openCard = (card) => setSelectedCard(card);

  return (
    <div className="market">
      <div className="market__header">
        <div>
          <div className="market__eyebrow">Investment Market</div>
          <h3 className="market__title">Production Cards</h3>
        </div>
        <div className="market__metaWrap">
          <div className="market__meta">5 market slots</div>
          {mode ? <div className="market__meta market__meta--accent">Mode: {mode}</div> : null}
        </div>
      </div>

      <div className="market__grid market__grid--fixed">
        {Array.from({ length: 5 }).map((_, idx) => {
          const card = market[idx] ?? null;
          const headerMedia = getHeaderMedia(card);
          const bodyMedia = getBodyMedia(card);

          return (
            <div className="market__slot" key={idx}>
              {card ? (
                <div
                  className="prod-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openCard(card)}
                  onKeyDown={(e) => e.key === "Enter" && openCard(card)}
                >
                  <div className="prod-card__glow" aria-hidden="true" />

                  <div className="prod-card__top">
                    <div className="prod-card__chips">
                      <span className={`prod-card__chip prod-card__chip--${card.deck === "SHORT_TERM" ? "short" : "long"}`}>
                        {getDeckLabel(card)}
                      </span>
                      <span className="prod-card__chip prod-card__chip--ghost">Inspect</span>
                    </div>

                    <div className="prod-card__topRow">
                      <div className="prod-card__name">{card.name}</div>
                      {headerMedia.length > 0 && (
                        <div className="prod-card__cornerMedia">
                          {headerMedia.map((item, index) => (
                            <CardMedia
                              key={`${card.id}-header-${index}`}
                              item={item}
                              imageClassName="prod-card__img"
                              qrClassName="prod-card__qrImg"
                              qrWrapClassName="prod-card__qrWrap"
                              placeholderClassName="prod-card__imgPlaceholder"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="prod-card__sub">{card.category}</div>
                  </div>

                  <div className="prod-card__body">
                    {bodyMedia.length > 0 && (
                      <div className="prod-card__bodyMedia">
                        {bodyMedia.map((item, index) => (
                          <CardMedia
                            key={`${card.id}-body-${index}`}
                            item={item}
                            imageClassName="prod-card__img"
                            qrClassName="prod-card__qrImg"
                            qrWrapClassName="prod-card__qrWrap"
                            placeholderClassName="prod-card__imgPlaceholder"
                          />
                        ))}
                      </div>
                    )}

                    <div className="prod-card__sectionTitle">Effects</div>

                    <div className="prod-card__effects">
                      {getEffectSections(card).map((section, sectionIndex) => (
                        <div key={sectionIndex} className="effectGroup">
                          {section.title && <div className="effectGroup__title">{section.title}</div>}

                          {section.effects.map((effect, effectIndex) => (
                            <div className="effect" key={`${sectionIndex}-${effectIndex}`}>
                              <div className="effect__years">Year {effect.years?.join(", ")}</div>

                              <div className="effect__stats">
                                <Stat label="Eco" value={formatDelta(effect.economy)} />
                                <Stat label="Env" value={formatDelta(effect.environment)} />
                                <Stat label="Health" value={formatDelta(effect.health)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                      {getEffectSections(card).every((section) => (section.effects ?? []).length === 0) && (
                        <div className="no-effects">No effects configured.</div>
                      )}
                    </div>
                  </div>

                  <div className={`prod-card__bottom${card.cost?.byMode ? " prod-card__bottom--dual" : ""}`}>
                    <CostDisplay card={card} mode={mode} getCostDisplay={getCostDisplay} />

                    <div className={`buy-btn-wrap${canBuy ? "" : " is-disabled"}`} title={canBuy ? "Buy this card" : buyHint}>
                      <button
                        className="buy-btn"
                        disabled={!canBuy}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBuy(card.id);
                        }}
                        aria-describedby={canBuy ? undefined : `buy-hint-${card.id}`}
                      >
                        Buy
                      </button>

                      {!canBuy && (
                        <span className="buy-tooltip" id={`buy-hint-${card.id}`} role="tooltip">
                          {buyHint}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="marketEmpty">
                  <div className="marketEmpty__icon">+</div>
                  <div className="marketEmpty__label">Empty slot</div>
                  <div className="marketEmpty__sub">Refills in Step 3</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCard && (
        <div className="cardModal__backdrop" onClick={() => setSelectedCard(null)}>
          <div className="cardModal__content" onClick={(e) => e.stopPropagation()}>
            <button className="cardModal__close" onClick={() => setSelectedCard(null)}>
              x
            </button>

            <div className="prod-card prod-card--zoom">
              <div className="prod-card__glow" aria-hidden="true" />

              <div className="prod-card__top">
                <div className="prod-card__chips">
                  <span
                    className={`prod-card__chip prod-card__chip--${selectedCard.deck === "SHORT_TERM" ? "short" : "long"}`}
                  >
                    {getDeckLabel(selectedCard)}
                  </span>
                  <span className="prod-card__chip prod-card__chip--ghost">Detailed view</span>
                </div>

                <div className="prod-card__topRow">
                  <div className="prod-card__name">{selectedCard.name}</div>
                  {getHeaderMedia(selectedCard).length > 0 && (
                    <div className="prod-card__cornerMedia">
                      {getHeaderMedia(selectedCard).map((item, index) => (
                        <CardMedia
                          key={`${selectedCard.id}-header-${index}`}
                          item={item}
                          imageClassName="prod-card__img"
                          qrClassName="prod-card__qrImg"
                          qrWrapClassName="prod-card__qrWrap"
                          placeholderClassName="prod-card__imgPlaceholder"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="prod-card__sub">{selectedCard.category}</div>
              </div>

              <div className="prod-card__body">
                <div className="prod-card__sectionTitle">Effects</div>

                <div className="prod-card__effects">
                  {getEffectSections(selectedCard).map((section, sectionIndex) => (
                    <div key={sectionIndex} className="effectGroup">
                      {section.title && <div className="effectGroup__title">{section.title}</div>}

                      {section.effects.map((effect, effectIndex) => (
                        <div className="effect" key={`${sectionIndex}-${effectIndex}`}>
                          <div className="effect__years">Year {effect.years?.join(", ")}</div>

                          <div className="effect__stats">
                            <Stat label="Eco" value={formatDelta(effect.economy)} />
                            <Stat label="Env" value={formatDelta(effect.environment)} />
                            <Stat label="Health" value={formatDelta(effect.health)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`prod-card__bottom${selectedCard.cost?.byMode ? " prod-card__bottom--dual" : ""}`}>
                <CostDisplay card={selectedCard} mode={mode} getCostDisplay={getCostDisplay} />
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

function CostDisplay({ card, mode, getCostDisplay }) {
  const cost = getCostDisplay(card);

  if (cost.type === "byMode") {
    return (
      <div className="cost cost--dual">
        {cost.values.map((entry) => (
          <div className={`costMode${mode === entry.key ? " is-active" : ""}`} key={entry.key}>
            <div className="costMode__label">
              {entry.label}
              {mode === entry.key ? " (Current)" : ""}
            </div>
            <div className="costMode__num">{entry.value}</div>
            <div className="costMode__unit">Money</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="cost">
      <div className="cost__num">{cost.value}</div>
      <div className="cost__label">Money</div>
    </div>
  );
}

function getEffectSections(card) {
  if (!card) return [];

  if (card.effectsByPlantationSize) {
    return Object.entries(card.effectsByPlantationSize).map(([key, effects]) => ({
      title:
        key === "SMALL"
          ? "Small plantations"
          : key === "MEDIUM"
            ? "Medium plantations"
            : key === "LARGE"
              ? "Large plantations"
              : key,
      effects: effects ?? [],
      kind: "plantationSize",
    }));
  }

  if (card.effectsByMode) {
    const orderedModes = ["ORGANIC", "CONVENTIONAL"];

    return orderedModes
      .filter((key) => card.effectsByMode[key])
      .map((key) => ({
        title: key === "ORGANIC" ? "Organic Farming" : "Conventional Farming",
        effects: card.effectsByMode[key] ?? [],
        kind: "mode",
      }));
  }

  return [
    {
      title: null,
      effects: card.effects ?? [],
      kind: "default",
    },
  ];
}
