import { motion as Motion, useReducedMotion } from "framer-motion";
import TransportZone from "./TransportZone";
import SalesZone from "./SalesZone";
import ProductionZone from "./ProductionZone";
import ActiveCardsPanel from "./ActiveCardsPanel";
import AnimatedModal from "./AnimatedModal";
import AnimatedNumber from "./AnimatedNumber";
import { playSellCelebration } from "../utils/soundManager";

import { useEffect, useRef, useState } from "react";

import "./BoardLayout.css";

function hasValue(value) {
  return value !== null && value !== undefined;
}

function getCountLabel(value, singular, plural) {
  return Number(value) === 1 ? singular : plural;
}

function groupScoringReasons(reasons) {
  const grouped = new Map();

  (reasons ?? []).forEach((reason) => {
    const text = typeof reason === "string" ? reason.trim() : "";
    if (!text) return;

    grouped.set(text, (grouped.get(text) ?? 0) + 1);
  });

  return Array.from(grouped, ([text, count]) => ({ text, count }));
}

/**
 * Main animated board layout for the game page.
 *
 * The layout combines transport, sales, production, and active production-card
 * zones. It also listens for backend result objects and opens summary modals for
 * apple sales and intermediate scoring so players can connect board changes to
 * their score and money consequences.
 *
 * @component
 * @param {object} props - Component props.
 * @param {object} props.gameState - Current backend game-state snapshot.
 * @param {Array<object>} props.activeProductionCards - Cards currently affecting
 * or scheduled to affect the orchard.
 * @returns {JSX.Element} Responsive board grid with result modals.
 */
export default function BoardLayout({
  gameState,
  activeProductionCards,
}) {
  const [showSellPopup, setShowSellPopup] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const lastShownScoreRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const scoringResult = gameState.lastScoreResult;
  const hasHarvestSummary =
    hasValue(scoringResult?.applesProduced) ||
    hasValue(scoringResult?.transportCapacity) ||
    hasValue(scoringResult?.wastedApples);
  const wasteReason =
    typeof scoringResult?.wasteReason === "string"
      ? scoringResult.wasteReason.trim()
      : "";
  const groupedReasons = groupScoringReasons(scoringResult?.reasons);

  useEffect(() => {
    const score = scoringResult;
    const hasReasons = (score?.reasons?.length ?? 0) > 0;

    if (
      score &&
      (score.economyChange !== 0 ||
        score.environmentChange !== 0 ||
        score.healthChange !== 0 ||
        hasReasons)
    ) {
      const scoreKey = JSON.stringify(score);

      if (lastShownScoreRef.current !== scoreKey) {
        lastShownScoreRef.current = scoreKey;
        queueMicrotask(() => setShowScorePopup(true));
      }
    }
  }, [scoringResult]);

  useEffect(() => {
    if (
      gameState.currentPhase === "DELIVER" &&
      gameState.lastSellResult?.applesSold > 0
    ) {
      playSellCelebration();
      queueMicrotask(() => setShowSellPopup(true));
    }
  }, [gameState.currentPhase, gameState.lastSellResult?.applesSold]);

  return (
    <div className="board-grid">
      <Motion.div
        className="zone transport"
        key={`transport-${gameState.currentPhase}`}
        initial={reduceMotion ? false : { opacity: 0.88, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
      >
        <TransportZone plantation={gameState.plantation} />
      </Motion.div>

      <Motion.div
        className="zone sales"
        key={`sales-${gameState.currentPhase}`}
        initial={reduceMotion ? false : { opacity: 0.88, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
      >
        <SalesZone plantation={gameState.plantation} />
      </Motion.div>

      <Motion.div
        className="zone production"
        key={`production-${gameState.currentPhase}`}
        initial={reduceMotion ? false : { opacity: 0.88, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.26, ease: "easeOut" }}
      >
        <ProductionZone
          plantation={gameState.plantation}
          phase={gameState.currentPhase}
          round={gameState.currentRound}
          lastEventResult={gameState.lastEventResult}
        />
      </Motion.div>

      <Motion.div
        className="zone active-cards-zone"
        key={`active-cards-${gameState.currentRound}-${activeProductionCards?.length ?? 0}`}
        initial={reduceMotion ? false : { opacity: 0.88, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
      >
        <ActiveCardsPanel
          activeCards={activeProductionCards}
          currentRound={gameState.currentRound}
          variant="embedded"
        />
      </Motion.div>

      <AnimatedModal
        isOpen={showSellPopup && Boolean(gameState.lastSellResult)}
        onClose={() => setShowSellPopup(false)}
        backdropClassName="sell-overlay"
        panelClassName="sell-modal"
      >
        {gameState.lastSellResult && (
          <>
            <h2>Sell Summary</h2>

            <p>
              <strong>Apples sold:</strong>{" "}
              <AnimatedNumber value={gameState.lastSellResult.applesSold} />
            </p>
            <p>
              <strong>Base price:</strong> 1
            </p>
            <p>
              <strong>Market bonus:</strong> {gameState.plantation.applePriceModifier}
            </p>

            <hr />

            <p className="sell-modal__total">
              Total earned:{" "}
              <AnimatedNumber value={gameState.lastSellResult.moneyEarned} />
            </p>

            <button onClick={() => setShowSellPopup(false)}>Close</button>
          </>
        )}
      </AnimatedModal>

      <AnimatedModal
        isOpen={showScorePopup && Boolean(scoringResult)}
        onClose={() => setShowScorePopup(false)}
        backdropClassName="score-overlay"
        panelClassName="score-modal"
      >
        {scoringResult && (
          <>
            <div className="score-modal__eyebrow">Round Summary</div>
            <h2>Round Scoring</h2>

            <div className="score-modal__stats">
              <div className="score-modal__stat">
                <span>Economy</span>
                <strong>
                  <AnimatedNumber value={scoringResult.economyChange} />
                </strong>
              </div>
              <div className="score-modal__stat">
                <span>Environment</span>
                <strong>
                  <AnimatedNumber value={scoringResult.environmentChange} />
                </strong>
              </div>
              <div className="score-modal__stat">
                <span>Health</span>
                <strong>
                  <AnimatedNumber value={scoringResult.healthChange} />
                </strong>
              </div>
            </div>

            {hasHarvestSummary && (
              <section className="score-modal__harvest">
                <h3>Harvest summary</h3>

                <div className="score-modal__harvestStats">
                  {hasValue(scoringResult.applesProduced) && (
                    <div className="score-modal__harvestStat">
                      <span>
                        {getCountLabel(
                          scoringResult.applesProduced,
                          "Apple produced",
                          "Apples produced"
                        )}
                      </span>
                      <strong>{scoringResult.applesProduced}</strong>
                    </div>
                  )}

                  {hasValue(scoringResult.transportCapacity) && (
                    <div className="score-modal__harvestStat">
                      <span>
                        {getCountLabel(
                          scoringResult.transportCapacity,
                          "Transport space",
                          "Transport spaces"
                        )}
                      </span>
                      <strong>{scoringResult.transportCapacity}</strong>
                    </div>
                  )}

                  {hasValue(scoringResult.wastedApples) && (
                    <div className="score-modal__harvestStat score-modal__harvestStat--waste">
                      <span>
                        {getCountLabel(
                          scoringResult.wastedApples,
                          "Apple wasted",
                          "Apples wasted"
                        )}
                      </span>
                      <strong>{scoringResult.wastedApples}</strong>
                    </div>
                  )}
                </div>

                {wasteReason && (
                  <p className="score-modal__wasteReason">{wasteReason}</p>
                )}
              </section>
            )}

            {groupedReasons.length > 0 && (
              <div className="score-modal__reasons">
                {groupedReasons.map(({ text, count }) => (
                  <p key={text}>
                    <span>{text}</span>
                    {count > 1 && (
                      <strong
                        className="score-modal__reasonCount"
                        aria-label={`Occurs ${count} times`}
                      >
                        ×{count}
                      </strong>
                    )}
                  </p>
                ))}
              </div>
            )}

            <button className="score-modal__button" onClick={() => setShowScorePopup(false)}>
              Continue
            </button>
          </>
        )}
      </AnimatedModal>
    </div>
  );
}
