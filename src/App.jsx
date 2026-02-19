import { useState } from "react";
import GamePage from "./pages/GamePage";
import StartScreen from "./pages/StartScreen";
import ModeSelection from "./pages/ModeSelection";

import { startGame as apiStartGame } from "./api/gameApi"; // ✅ add this

function App() {
  const [screen, setScreen] = useState("START");
  const [gameMode, setGameMode] = useState(null);

  const startGame = async (mode) => {
    try {
      await fetch(`http://localhost:8081/game/start?mode=${mode}`, {
        method: "POST"
      });

      setGameMode(mode);
      setScreen("GAME");
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleRestart = () => {
    setGameMode(null);     // reset mode
    setScreen("START");    // go back to landing
  };

  if (screen === "START") {
    return <StartScreen onPlay={() => setScreen("MODE")} />;
  }

  if (screen === "MODE") {
    return <ModeSelection onSelect={startGame} />;
  }

  return (
    <GamePage
      gameMode={gameMode}
      onRestart={handleRestart}   // 👈 pass restart
    />
  );
}


export default App;
