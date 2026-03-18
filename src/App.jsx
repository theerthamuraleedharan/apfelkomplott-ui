import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import GamePage from "./pages/GamePage";
import StartScreen from "./pages/StartScreen";
import ModeSelection from "./pages/ModeSelection";
import { startGame as apiStartGame } from "./api/gameApi";

function App() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState(null);

  const startGame = async (mode) => {
    try {
      await apiStartGame(mode);
      setGameMode(mode);
      navigate("/game");
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const handleRestart = () => {
    setGameMode(null);
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<StartScreen onPlay={() => navigate("/mode")} />} />
      <Route
        path="/mode"
        element={<ModeSelection onSelect={startGame} onBack={() => navigate(-1)} />}
      />
      <Route
        path="/game"
        element={<GamePage gameMode={gameMode} onRestart={handleRestart} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
