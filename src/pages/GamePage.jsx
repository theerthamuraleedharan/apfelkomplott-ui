import { useEffect, useState } from "react";
import {
  startGame,
  getGameState,
  nextRound,
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


export default function GamePage() {
  const [gameState, setGameState] = useState(null);
  const [market, setMarket] = useState([]);

  useEffect(() => {
    async function init() {
      const state = await startGame();
      setGameState(state);
      const market = await getMarket();
      setMarket(market);
    }
    init();
  }, []);

  async function handleNextRound() {
    await nextRound();
    const updated = await getGameState();
    setGameState(updated);
  }

  async function handleBuyCrate() {
    await buyInvestment("BUY_CRATE");
    const updated = await getGameState();
    setGameState(updated);
  }

  async function buy(type) {
  await buyInvestment(type);
  const updated = await getGameState();
  setGameState(updated);
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
      onNextRound={handleNextRound}
    />
  </div>
);

}
