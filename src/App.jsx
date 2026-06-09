import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import GamePage from "./pages/GamePage";
import StartScreen from "./pages/StartScreen";
import ModeSelection from "./pages/ModeSelection";
import { startGame as apiStartGame } from "./api/gameApi";

const HELP_DISMISSED_STORAGE_KEY = "apfelkomplott-help-dismissed";

/**
 * Root application component that defines the game navigation flow.
 *
 * The component routes the player from the start screen to mode selection and
 * then into the playable game. It also starts a new backend game session for the
 * selected farming mode and resets local help state when a fresh game begins.
 *
 * @component
 * @returns {JSX.Element} The route configuration for the Apfelkomplott UI.
 */
function App() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState(null);
  const [isStartingGame, setIsStartingGame] = useState(false);

  const startGame = async (mode) => {
    setIsStartingGame(true);

    try {
      await apiStartGame(mode);
      localStorage.removeItem(HELP_DISMISSED_STORAGE_KEY);
      setGameMode(mode);
      navigate("/game");
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setIsStartingGame(false);
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
        element={
          <ModeSelection
            onSelect={startGame}
            onBack={() => navigate(-1)}
            isLoading={isStartingGame}
          />
        }
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
