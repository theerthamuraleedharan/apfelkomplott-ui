import { useEffect, useState } from "react";
import "./GamePage.css";


import {
  getGameState,
  nextPhase,
  getMarket,
  buyInvestment,
  buyProductionCard
} from "../api/gameApi";

import Board from "../components/Board";
import BoardLayout from "../components/BoardLayout";
import Market from "../components/Market";
import ScoreBoard from "../components/ScoreBoard";
import Controls from "../components/Controls";
import PhaseIndicator from "../components/PhaseIndicator";
import InvestmentPanel from "../components/InvestmentPanel";
import GameOverModal from "../components/GameOverModal";
import EventCard from "../components/EventCard";
import PhaseProgressBar from "../components/PhaseProgressBar";
import TransportZone from "../components/TransportZone";


export default function GamePage({ gameMode, onRestart }) {

  const [gameState, setGameState] = useState(null);
  const [market, setMarket] = useState([]);
  const [eventVisible, setEventVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(null);



  useEffect(() => {
  async function init() {
    const state = await getGameState();
    setGameState(state);

    const market = await getMarket();
    setMarket(market);
  }
  init();
}, []);


  useEffect(() => {
    if (gameState?.currentPhase === "DRAW_EVENT") {
      setEventVisible(true);
    }
  }, [gameState?.currentPhase]);

  useEffect(() => {
  if (!gameState) return;

  if (
    gameState.currentPhase === "HARVEST" ||
    gameState.currentPhase === "DELIVER" ||
    gameState.currentPhase === "SELL"
  ) {
    setAnimationPhase(gameState.currentPhase);

    setTimeout(() => {
      setAnimationPhase(null);
    }, 800);
  }
}, [gameState?.currentPhase]);


async function handleNextPhase() {
  const updated = await nextPhase();
  setGameState(updated);

  const m = await getMarket();
  setMarket(m);
}

  async function handleBuyCrate() {
    await buyInvestment("BUY_CRATE");
    const updated = await getGameState();
    setGameState(updated);
  }

async function buy(type) {
  try {
    await buyInvestment(type);

    const updated = await getGameState();
    setGameState(updated);

  } catch (err) {
    alert(err.message);
  }
}

async function handleBuyProductionCard(cardId) {
  // optimistic: keep the same slot empty (no shifting)
  setMarket(prev => {
    const idx = prev.findIndex(c => c?.id === cardId);
    if (idx === -1) return prev;
    const copy = [...prev];
    copy[idx] = null;
    return copy;
  });

  try {
    await buyProductionCard(cardId);

    const updated = await getGameState();
    setGameState(updated);

    // backend refills in Step 3, but keep UI synced
    const m = await getMarket();
    setMarket(m);

  } catch (err) {
    alert(err.message);

    // rollback: re-sync from backend
    const m = await getMarket();
    setMarket(m);
  }
}


function resolveCost(card, mode) {
  if (!card?.cost) return "-";
  if (typeof card.cost.fixed === "number") return card.cost.fixed;
  if (card.cost.byMode && mode && card.cost.byMode[mode] != null) return card.cost.byMode[mode];
  return "-";
}




  if (!gameState) return <div>Loading...</div>;

return (
  <div className="game-root">
    <div className="game-shell">
      <GameOverModal gameState={gameState} onRestart={onRestart} />

      <h1 className="game-title">🍏 Apfelkomplott</h1>

      <PhaseProgressBar
        currentPhase={gameState.currentPhase}
        round={gameState.currentRound}
      />

      {eventVisible && gameState.activeEvents.length > 0 && (
        <EventCard
          event={gameState.activeEvents[0]}
          onContinue={() => setEventVisible(false)}
        />
      )}

      {/* BOARD + SIDEBAR (2 columns only) */}
      <div className="game-layout">

        {/* LEFT COLUMN */}
        <div className="board-col">
          <BoardLayout
            gameState={gameState}
            animationPhase={animationPhase}
          />

          {/* Investment panel BELOW the board (only in INVEST phase) */}
          {gameState.currentPhase === "INVEST" && (
            <div className="full-width" style={{ marginTop: 14 }}>
              <InvestmentPanel
                phase={gameState.currentPhase}
                money={gameState.money}
                onBuySeedling={() => buy("BUY_SEEDLING")}
                onBuyPreGrown={() => buy("BUY_PRE_GROWN_TREE")}
                onBuyCrate={() => buy("BUY_CRATE")}
                onBuyStand={() => buy("BUY_SALES_STAND")}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="sidebar">
          <div className="panel score-panel">
            <ScoreBoard score={gameState.scoreTrack} money={gameState.money} />
          </div>

          <div className="panel">
            <Controls
              phase={gameState.currentPhase}
              mode={gameState.farmingMode}
              onNextPhase={handleNextPhase}
            />
          </div>
        </div>

      </div>

      {/* Production cards market below everything */}
      <div className="full-width">
       <Market
          market={market}                     // ✅ use local market state
          mode={gameState.farmingMode}
          canBuy={gameState.currentPhase === "INVEST"}
          onBuy={handleBuyProductionCard}
        />
      </div>
    </div>
  </div>
);



}
