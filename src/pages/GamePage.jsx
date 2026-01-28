import { useEffect, useState } from "react";
import {
  startGame,
  getGameState,
  nextRound,
  getMarket,
} from "../api/gameApi";

import Board from "../components/Board";   // ✅ ADD THIS
import Market from "../components/Market";
import ScoreBoard from "../components/ScoreBoard";
import Controls from "../components/Controls";


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


  function refreshState() {
    getGameState().then(setGameState);
  }

  function refreshMarket() {
    getMarket().then(setMarket);
  }

 async function handleNextRound() {
  await nextRound();
  const updated = await getGameState();
  setGameState(updated);
}


  if (!gameState) return <div>Loading...</div>;

 return (
  <div>
    <h1>🍏 Apfelkomplott</h1>

    <Board gameState={gameState} />

    <ScoreBoard
      score={gameState.scoreTrack}
      money={gameState.money}
    />

    <Market
      market={market}
      phase={gameState.currentPhase}
      onBuy={() => {
        refreshState();
        refreshMarket();
      }}
    />

    <Controls
      phase={gameState.currentPhase}
      onNextRound={handleNextRound}
    />
  </div>
);

}
