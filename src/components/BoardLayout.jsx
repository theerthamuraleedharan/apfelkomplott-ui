import { motion, useReducedMotion } from "framer-motion";
import TransportZone from "./TransportZone";
import SalesZone from "./SalesZone";
import ProductionZone from "./ProductionZone";
import ActiveCardsPanel from "./ActiveCardsPanel";
import AnimatedModal from "./AnimatedModal";
import AnimatedNumber from "./AnimatedNumber";

import { useEffect, useRef, useState } from "react";

import "./BoardLayout.css";

export default function BoardLayout({
  gameState,
  animationPhase,
  activeProductionCards,
}) {
  const [showSellPopup, setShowSellPopup] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const lastShownScoreRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const scoringResult = gameState.lastScoreResult;

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
        setShowScorePopup(true);
      }
    }
  }, [gameState.lastScoreResult]);

  useEffect(() => {
    if (
      gameState.currentPhase === "DELIVER" &&
      gameState.lastSellResult?.applesSold > 0
    ) {
      setShowSellPopup(true);
    }
  }, [gameState.currentPhase, gameState.lastSellResult?.applesSold]);

  return (
    <div className="board-grid">
      <motion.div
        className="zone transport"
        key={`transport-${gameState.currentPhase}`}
        initial={reduceMotion ? false : { opacity: 0.88, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
      >
        <TransportZone plantation={gameState.plantation} />
      </motion.div>

      <motion.div
        className="zone sales"
        key={`sales-${gameState.currentPhase}`}
        initial={reduceMotion ? false : { opacity: 0.88, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
      >
        <SalesZone plantation={gameState.plantation} />
      </motion.div>

      <motion.div
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
      </motion.div>

      <motion.div
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
      </motion.div>

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

            {(scoringResult.reasons ?? []).length > 0 && (
              <div className="score-modal__reasons">
                {(scoringResult.reasons ?? []).map((reason, index) => (
                  <p key={index}>{reason}</p>
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
