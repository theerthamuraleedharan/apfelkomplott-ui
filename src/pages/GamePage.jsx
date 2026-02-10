import { useEffect, useState } from "react";
import {
  startGame,
  getGameState,
  nextPhase,
  getMarket,
  buyInvestment
} from "../api/gameApi";

import Board from "../components/Board";
import Market from "../components/Market";
import ScoreBoard from "../components/ScoreBoard";
import Controls from "../components/Controls";
import PhaseIndicator from "../components/PhaseIndicator";
import InvestmentPanel from "../components/InvestmentPanel";
import GameOverModal from "../components/GameOverModal";
import RoundTrack from "../components/RoundTrack";
import EventCard from "../components/EventCard";
import PhaseProgressBar from "../components/PhaseProgressBar";




export default function GamePage() {
  const [gameState, setGameState] = useState(null);
  const [market, setMarket] = useState([]);
  const [eventVisible, setEventVisible] = useState(false);


  useEffect(() => {
    async function init() {
      const state = await startGame();
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


async function handleNextPhase() {
  const updated = await nextPhase();
  setGameState(updated);
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



  if (!gameState) return <div>Loading...</div>;

 return (
  <div>

     <GameOverModal
      gameState={gameState}
      onRestart={async () => {
        const newState = await startGame();
        setGameState(newState);
        const market = await getMarket();
        setMarket(market);
      }}
    />

    <h1>🍏 Apfelkomplott</h1>
       
    <PhaseProgressBar
      currentPhase={gameState.currentPhase}
      round={gameState.currentRound}
    />

    {eventVisible &&
      gameState.activeEvents.length > 0 && (
        <EventCard
          event={gameState.activeEvents[0]}
          onContinue={() => setEventVisible(false)}
        />
    )}

    <RoundTrack currentRound={gameState.currentRound} />
    
    {/* Phase / Step indicator (if you added it) */}
    <PhaseIndicator
      round={gameState.currentRound}
      phase={gameState.currentPhase}
    />

    {/* Main board */}
    <Board gameState={gameState} />

    {/* Score & money */}
    <ScoreBoard
      score={gameState.scoreTrack}
      money={gameState.money}
    />

    {/* 🔽 INVESTMENT PANEL — ONLY IN INVEST PHASE */}
    {gameState.currentPhase === "INVEST" && (
    <InvestmentPanel
      money={gameState.money}
      onBuySeedling={() => buy("BUY_SEEDLING")}
      onBuyPreGrown={() => buy("BUY_PRE_GROWN_TREE")}
      onBuyCrate={() => buy("BUY_CRATE")}
      onBuyStand={() => buy("BUY_SALES_STAND")}
    />
  )}

    

    {/* Market (production cards) */}
    <Market
      market={market}
      phase={gameState.currentPhase}
      onBuy={() => {
        getGameState().then(setGameState);
        getMarket().then(setMarket);
      }}
    />

    {/* Controls (Next Phase button) */}
    <Controls
      phase={gameState.currentPhase}
      onNextPhase={handleNextPhase}
    />
  </div>
);

}
