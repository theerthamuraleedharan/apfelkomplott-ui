import TransportZone from "./TransportZone";
import SalesZone from "./SalesZone";
import ProductionZone from "./ProductionZone";

import { useEffect, useRef, useState } from "react";

import "./BoardLayout.css";

export default function BoardLayout({ gameState, animationPhase }) {
  const [showSellPopup, setShowSellPopup] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const lastShownScoreRef = useRef(null);

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
      <div className="zone transport">
        <TransportZone plantation={gameState.plantation} />
      </div>

      <div className="zone sales">
        <SalesZone plantation={gameState.plantation} />
      </div>

      <div className="zone production">
        <ProductionZone
          plantation={gameState.plantation}
          phase={gameState.currentPhase}
          round={gameState.currentRound}
        />
      </div>

      {showSellPopup && gameState.lastSellResult && (
        <div className="sell-overlay">
          <div className="sell-modal">
            <h2>Sell Summary</h2>

            <p>
              <strong>Apples sold:</strong> {gameState.lastSellResult.applesSold}
            </p>
            <p>
              <strong>Base price:</strong> 1
            </p>
            <p>
              <strong>Market bonus:</strong> {gameState.plantation.applePriceModifier}
            </p>

            <hr />

            <p style={{ fontSize: "18px", fontWeight: "bold" }}>
              Total earned: {gameState.lastSellResult.moneyEarned}
            </p>

            <button onClick={() => setShowSellPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {showScorePopup && scoringResult && (
        <div className="score-overlay">
          <div className="score-modal">
            <div className="score-modal__eyebrow">Round Summary</div>
            <h2>Round Scoring</h2>

            <div className="score-modal__stats">
              <div className="score-modal__stat">
                <span>Economy</span>
                <strong>{scoringResult.economyChange}</strong>
              </div>
              <div className="score-modal__stat">
                <span>Environment</span>
                <strong>{scoringResult.environmentChange}</strong>
              </div>
              <div className="score-modal__stat">
                <span>Health</span>
                <strong>{scoringResult.healthChange}</strong>
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
          </div>
        </div>
      )}
    </div>
  );
}
