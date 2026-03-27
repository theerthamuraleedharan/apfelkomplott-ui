import AnimatedModal from "./AnimatedModal";
import "./GameOverModal.css";

export default function GameOverModal({ gameState, onRestart }) {
  if (!gameState?.gameOver) return null;

  const { economy, environment, health } = gameState.scoreTrack;

  let reason = "Game Over";
  let icon = "!";
  let message =
    "The orchard could not hold its balance this time. You can restart and try a different investment rhythm or farming strategy.";

  if (economy <= -3) {
    reason = "Economy collapsed";
    icon = "$";
    message =
      "Too much waste or unused capacity pushed the economy too far down. A tighter balance between trees, crates, and stands may help next time.";
  } else if (environment <= -3) {
    reason = "Environment destroyed";
    icon = "Env";
    message =
      "Environmental pressure became too high. Try a gentler production path or choose cards that protect long-term balance.";
  } else if (health <= -3) {
    reason = "Health crisis";
    icon = "+";
    message =
      "Health dropped too far during the game. Next time, watch card effects more closely and avoid choices that damage long-term wellbeing.";
  } else if (gameState.currentRound >= 15) {
    reason = "15 rounds completed";
    icon = "*";
    message =
      "You reached the end of the game. This is a good moment to review your final balance across economy, environment, and health.";
  }

  return (
    <AnimatedModal
      isOpen
      onClose={onRestart}
      backdropClassName="game-over__backdrop"
      panelClassName="game-over__modal"
    >
      <div className="game-over__eyebrow">Final Result</div>

      <div className="game-over__titleRow">
        <div>
          <h1 className="game-over__title">Game Over</h1>
          <p className="game-over__reason">{reason}</p>
        </div>
        <div className="game-over__icon" aria-hidden="true">
          {icon}
        </div>
      </div>

      <div className="game-over__summary">
        <div className="game-over__stat">
          <span className="game-over__statLabel">Economy</span>
          <strong className="game-over__statValue">{economy}</strong>
        </div>
        <div className="game-over__stat">
          <span className="game-over__statLabel">Environment</span>
          <strong className="game-over__statValue">{environment}</strong>
        </div>
        <div className="game-over__stat">
          <span className="game-over__statLabel">Health</span>
          <strong className="game-over__statValue">{health}</strong>
        </div>
        <div className="game-over__stat">
          <span className="game-over__statLabel">Rounds</span>
          <strong className="game-over__statValue">{gameState.currentRound}</strong>
        </div>
      </div>

      <div className="game-over__message">{message}</div>

      <div className="game-over__actions">
        <button className="game-over__button" onClick={onRestart}>
          Restart Game
        </button>
      </div>
    </AnimatedModal>
  );
}
