import { useEffect, useState } from "react";

import {
  startGame,
  getGameState,
  nextPhase,
  getMarket,
  buyInvestment
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




export default function GamePage() {
  const [gameState, setGameState] = useState(null);
  const [market, setMarket] = useState([]);
  const [eventVisible, setEventVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(null);



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
  <div className="game-root">
    <div className="game-board-container">

      <GameOverModal
        gameState={gameState}
        onRestart={async () => {
          const newState = await startGame();
          setGameState(newState);
          const market = await getMarket();
          setMarket(market);
        }}
      />

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


      {/* <PhaseIndicator
        round={gameState.currentRound}
        phase={gameState.currentPhase}
      /> */}

      {/* MAIN BOARD */}
      <BoardLayout gameState={gameState} animationPhase={animationPhase} />

      <ScoreBoard
        score={gameState.scoreTrack}
        money={gameState.money}
      />

      {gameState.currentPhase === "INVEST" && (
        <InvestmentPanel
          money={gameState.money}
          onBuySeedling={() => buy("BUY_SEEDLING")}
          onBuyPreGrown={() => buy("BUY_PRE_GROWN_TREE")}
          onBuyCrate={() => buy("BUY_CRATE")}
          onBuyStand={() => buy("BUY_SALES_STAND")}
        />
      )}

      {/* <Market
        market={market}
        phase={gameState.currentPhase}
        onBuy={() => {
          getGameState().then(setGameState);
          getMarket().then(setMarket);
        }}
      /> */}

      <Controls
        phase={gameState.currentPhase}
        onNextPhase={handleNextPhase}
      />

    </div>
  </div>
);


}
