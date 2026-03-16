import { useState } from "react";
import "./ActiveCardsPanel.css";

function getCardTitle(card) {
  return card.name ?? card.cardName ?? card.title ?? card.cardId ?? "Production card";
}

function getCardKey(card, index) {
  return card.cardId ?? card.id ?? `${getCardTitle(card)}-${index}`;
}

function getCardYears(card) {
  if (Array.isArray(card.remainingYears) && card.remainingYears.length > 0) {
    return `Active in years ${card.remainingYears.join(", ")}`;
  }

  if (Array.isArray(card.years) && card.years.length > 0) {
    return `Active in years ${card.years.join(", ")}`;
  }

  if (card.currentYear != null) {
    return `Currently on year ${card.currentYear}`;
  }

  return "Active effect";
}

function getYearBadges(card) {
  if (Array.isArray(card.remainingYears) && card.remainingYears.length > 0) {
    return card.remainingYears.map((year) => `Y${year}`);
  }

  if (Array.isArray(card.years) && card.years.length > 0) {
    return card.years.map((year) => `Y${year}`);
  }

  if (card.currentYear != null) {
    return [`Y${card.currentYear}`];
  }

  return ["Active"];
}

function getDeckLabel(card) {
  if (card.deck === "LONG_TERM") return "Long-term";
  if (card.deck === "SHORT_TERM") return "Short-term";
  return "Production";
}

function getCompactYears(card) {
  if (Array.isArray(card.remainingYears) && card.remainingYears.length > 0) {
    return `Y${card.remainingYears.join(", Y")}`;
  }

  if (Array.isArray(card.years) && card.years.length > 0) {
    return `Y${card.years.join(", Y")}`;
  }

  if (card.currentYear != null) {
    return `Y${card.currentYear}`;
  }

  return "Active";
}

function getEffectGroups(card) {
  if (Array.isArray(card.effects) && card.effects.length > 0) {
    return [{ title: null, effects: card.effects }];
  }

  if (card.effectsByMode && typeof card.effectsByMode === "object") {
    return Object.entries(card.effectsByMode).map(([key, effects]) => ({
      title: key,
      effects: Array.isArray(effects) ? effects : [],
    }));
  }

  if (
    card.effectsByPlantationSize &&
    typeof card.effectsByPlantationSize === "object"
  ) {
    return Object.entries(card.effectsByPlantationSize).map(([key, effects]) => ({
      title: key,
      effects: Array.isArray(effects) ? effects : [],
    }));
  }

  return [];
}

function formatDelta(value) {
  if (!value) return "0";
  return value > 0 ? `+${value}` : `${value}`;
}

function isCardStillActive(card, currentRound) {
  if (Array.isArray(card.remainingYears)) {
    return card.remainingYears.length > 0;
  }

  if (Array.isArray(card.years) && currentRound != null) {
    return card.years.some((year) => year >= currentRound);
  }

  if (typeof card.currentYear === "number") {
    return card.currentYear <= 3;
  }

  return true;
}

export default function ActiveCardsPanel({ activeCards = [], currentRound }) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const visibleCards = activeCards.filter((card) =>
    isCardStillActive(card, currentRound)
  );

  return (
    <section className="activeCards">
      <button
        className="activeCards__header activeCards__headerButton"
        type="button"
        onClick={() => setIsPanelOpen((value) => !value)}
        aria-expanded={isPanelOpen}
      >
        <div>
          <div className="activeCards__eyebrow">Production Timeline</div>
          <h3 className="activeCards__title">Active Production Cards</h3>
          <p className="activeCards__subtitle">
            Keep track of bought cards that still affect upcoming years.
          </p>
        </div>
        <div className="activeCards__headerMeta">
          <div className="activeCards__count">{visibleCards.length} active</div>
          <span className={`activeCards__chevron${isPanelOpen ? " is-open" : ""}`}>
            ^
          </span>
        </div>
      </button>

      {isPanelOpen &&
        (visibleCards.length > 0 ? (
          <div className="activeCards__grid">
            {visibleCards.map((card, index) => (
              <ActiveCardItem
                card={card}
                index={index}
                expandedCardKey={expandedCardKey}
                onToggle={setExpandedCardKey}
                key={getCardKey(card, index)}
              />
            ))}
          </div>
        ) : (
          <div className="activeCards__empty">
            No active production cards are available for future years.
          </div>
        ))}
    </section>
  );
}

function ActiveCardItem({ card, index, expandedCardKey, onToggle }) {
  const cardKey = getCardKey(card, index);
  const isExpanded = expandedCardKey === cardKey;
  const effectGroups = getEffectGroups(card);

  return (
    <article className={`activeCard${isExpanded ? " is-expanded" : ""}`}>
      <button
        className="activeCard__trigger"
        type="button"
        onClick={() => onToggle(isExpanded ? null : cardKey)}
        aria-expanded={isExpanded}
      >
        <div className="activeCard__summary">
          <div className="activeCard__summaryMain">
            <div className="activeCard__deck">{getDeckLabel(card)}</div>
            <div className="activeCard__name">{getCardTitle(card)}</div>
          </div>

          <div className="activeCard__summaryMeta">
            <div className="activeCard__status">In Play</div>
            <div className="activeCard__summaryYears">{getCompactYears(card)}</div>
            <span className={`activeCard__chevron${isExpanded ? " is-open" : ""}`}>
              ^
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="activeCard__details">
          <div className="activeCard__meta">{getCardYears(card)}</div>

          <div className="activeCard__timeline">
            {getYearBadges(card).map((badge) => (
              <span className="activeCard__yearChip" key={`${cardKey}-${badge}`}>
                {badge}
              </span>
            ))}
          </div>

          {effectGroups.length > 0 ? (
            effectGroups.map((group, groupIndex) => (
              <div className="activeCard__effectGroup" key={`${cardKey}-group-${groupIndex}`}>
                {group.title ? (
                  <div className="activeCard__effectTitle">{group.title}</div>
                ) : null}
                {group.effects.map((effect, effectIndex) => (
                  <div className="activeCard__effectRow" key={`${cardKey}-effect-${effectIndex}`}>
                    <div className="activeCard__effectYears">
                      Y{Array.isArray(effect.years) ? effect.years.join(", ") : "-"}
                    </div>
                    <div className="activeCard__effectStats">
                      <span>Eco {formatDelta(effect.economy)}</span>
                      <span>Env {formatDelta(effect.environment)}</span>
                      <span>Health {formatDelta(effect.health)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="activeCard__detailsEmpty">No effect details available.</div>
          )}
        </div>
      )}
    </article>
  );
}
