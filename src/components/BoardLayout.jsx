import TransportZone from "./TransportZone";
import SalesZone from "./SalesZone";
import ProductionZone from "./ProductionZone";
import EventZone from "./EventZone";
import ScoreBoard from "./ScoreBoard";
import AppleAnimation from "./appleAnimation";

import { useState, useEffect, useRef } from "react";


import "./BoardLayout.css";

export default function BoardLayout({ gameState, animationPhase }) {

 const [showSellPopup, setShowSellPopup] = useState(false);
 const lastShownSellRef = useRef(null);
 const lastShownScoreRef = useRef(null);

const [showScorePopup, setShowScorePopup] = useState(false);

  useEffect(() => {
    const score = gameState.lastScoreResult;

    if (
      score &&
      (
        score.economyChange !== 0 ||
        score.environmentChange !== 0 ||
        score.healthChange !== 0
      )
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
}, [gameState.currentPhase]);




  return (
    <div className="board-grid">

      

        {/* {animationPhase && (
        <AppleAnimation type={animationPhase} />
        )} */}


      {/* TOP ROW */}
      <div className="zone transport">
        <TransportZone plantation={gameState.plantation} />
      </div>

      <div className="zone sales">
        <SalesZone plantation={gameState.plantation} />
      </div>

      {/* MIDDLE ROW */}
      <div className="zone production">
        <ProductionZone plantation={gameState.plantation} />
      </div>

      {/* BOTTOM ROW */}
      {/* <div className="zone event">
        {gameState.activeEvents[0] && (
          <EventZone event={gameState.activeEvents[0]} />
        )}
      </div> */}

      {/* <div className="zone scores">
        <ScoreBoard
          score={gameState.scoreTrack}
          money={gameState.money}
        />
      </div> */}

        {showSellPopup && gameState.lastSellResult && (
      <div className="sell-overlay">
        <div className="sell-modal">
          <h2>🍎 Sell Summary</h2>

          <p><strong>Apples sold:</strong> {gameState.lastSellResult.applesSold}</p>

          <p><strong>Base price:</strong> 1</p>
          <p><strong>Market bonus:</strong> {gameState.plantation.applePriceModifier}</p>

          <hr />

          <p style={{ fontSize: "18px", fontWeight: "bold" }}>
            💰 Total earned: {gameState.lastSellResult.moneyEarned}
          </p>

          <button onClick={() => setShowSellPopup(false)}>
            Close
          </button>
        </div>
      </div>
    )}

    {showScorePopup && gameState.lastScoreResult && (
    <div className="score-overlay">
      <div className="score-modal">
        <h2>📊 Round Scoring</h2>

        <p>Economy: {gameState.lastScoreResult.economyChange}</p>
        <p>Environment: {gameState.lastScoreResult.environmentChange}</p>
        <p>Health: {gameState.lastScoreResult.healthChange}</p>

          {gameState.lastScoreResult.reasons.map((reason, index) => (
            <p key={index}>{reason}</p>
          ))}

        <button onClick={() => setShowScorePopup(false)}>
          Close
        </button>
      </div>
    </div>
)}


 </div>
  );
}
