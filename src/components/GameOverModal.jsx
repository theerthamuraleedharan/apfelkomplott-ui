import "./GameOverModal.css";

export default function GameOverModal({ gameState, onRestart }) {
  if (!gameState?.gameOver) return null;

  const { economy, environment, health } = gameState.scoreTrack;

  let reason = "Game Over";

  if (economy <= -3) reason = "💸 Economy collapsed";
  else if (environment <= -3) reason = "🌍 Environment destroyed";
  else if (health <= -3) reason = "❤️ Health crisis";
  else if (gameState.currentRound >= 15) reason = "🏁 15 rounds completed";

  return (
    <div className="overlay">
      <div className="modal">
        <h1>🚨 Game Over</h1>

        <p>{reason}</p>

        <div className="scores">
          <p>💸 Economy: {economy}</p>
          <p>🌍 Environment: {environment}</p>
          <p>❤️ Health: {health}</p>
          <p>🔁 Rounds Played: {gameState.currentRound}</p>
        </div>

        <button onClick={onRestart}>
          🔄 Restart Game
        </button>
      </div>
    </div>
  );
}
