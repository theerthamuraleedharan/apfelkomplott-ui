import { useState } from "react";
import AnimatedModal from "./AnimatedModal";
import "./GameOverModal.css";

const FEEDBACK_STORAGE_KEY = "apfelkomplott-game-feedback";

const FEEDBACK_OPTIONS = [
  { value: "very_happy", icon: "😄", label: "Very happy" },
  { value: "happy", icon: "🙂", label: "Happy" },
  { value: "neutral", icon: "😐", label: "Neutral" },
  { value: "sad", icon: "🙁", label: "Sad" },
];

export default function GameOverModal({ gameState, onRestart }) {
  const [selectedMood, setSelectedMood] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!gameState?.gameOver) return null;

  const { economy, environment, health } = gameState.scoreTrack;
  // New backend contract: gameOver decides visibility, gameResult decides which ending to show.
  const gameResult = gameState.gameResult ?? "LOSS";

  let title = "Game Over";
  let reason = "Game Over";
  let icon = "!";
  let message =
    "The orchard could not hold its balance this time. You can restart and try a different investment rhythm or farming strategy.";

  if (gameResult === "WIN") {
    title = "You Win";
    reason = "Orchard balanced successfully";
    icon = "🏆";
    message =
      "You guided the orchard through all rounds and kept economy, environment, and health in balance. This is a strong result and a good summary of your strategy.";
  } else if (economy <= -3) {
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
      "The game ended without a win result. This is a good moment to review your final balance across economy, environment, and health.";
  }

  function handleSubmitFeedback(event) {
    event.preventDefault();

    const trimmedFeedback = feedbackText.trim();
    if (!selectedMood && !trimmedFeedback) return;

    const payload = {
      mood: selectedMood || null,
      comment: trimmedFeedback,
      createdAt: new Date().toISOString(),
      finalRound: gameState.currentRound,
      finalScores: { economy, environment, health },
      outcome: reason,
    };

    try {
      const existingFeedback = JSON.parse(
        localStorage.getItem(FEEDBACK_STORAGE_KEY) ?? "[]"
      );
      const nextFeedback = Array.isArray(existingFeedback)
        ? [...existingFeedback, payload]
        : [payload];

      // Feedback is kept locally for now so the UI works before a backend endpoint exists.
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextFeedback));
    } catch {
      // Ignore storage errors so the player can still finish the game gracefully.
    }

    setIsSubmitted(true);
  }

  return (
    <AnimatedModal
      isOpen
      onClose={onRestart}
      backdropClassName="game-over__backdrop"
      panelClassName={`game-over__modal${gameResult === "WIN" ? " game-over__modal--win" : ""}`}
    >
      <div className="game-over__eyebrow">Final Result</div>

      <div className="game-over__titleRow">
        <div>
          <h1 className="game-over__title">{title}</h1>
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

      <form className="game-over__feedback" onSubmit={handleSubmitFeedback}>
        <div className="game-over__feedbackHeader">
          <h2 className="game-over__feedbackTitle">How was the game?</h2>
          <p className="game-over__feedbackHint">
            Choose a smiley and leave a short comment if you want.
          </p>
        </div>

        <div
          className="game-over__moods"
          role="radiogroup"
          aria-label="Game feedback mood"
        >
          {FEEDBACK_OPTIONS.map((option) => {
            const isActive = selectedMood === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`game-over__moodButton${isActive ? " game-over__moodButton--active" : ""}`}
                onClick={() => setSelectedMood(option.value)}
                aria-pressed={isActive}
              >
                <span className="game-over__moodIcon" aria-hidden="true">
                  {option.icon}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <label className="game-over__feedbackLabel" htmlFor="game-feedback">
          Written feedback
        </label>
        <textarea
          id="game-feedback"
          className="game-over__feedbackInput"
          value={feedbackText}
          onChange={(event) => setFeedbackText(event.target.value)}
          placeholder="What did you enjoy, or what should be improved?"
          rows={4}
        />

        <div className="game-over__feedbackFooter">
          {isSubmitted ? (
            <p className="game-over__feedbackThanks">
              Thanks for the feedback.
            </p>
          ) : (
            <p className="game-over__feedbackStatus">
              Your feedback is optional.
            </p>
          )}

          <button
            type="submit"
            className="game-over__button game-over__button--secondary"
            disabled={!selectedMood && !feedbackText.trim()}
          >
            Submit Feedback
          </button>
        </div>
      </form>

      <div className="game-over__actions">
        <button className="game-over__button" onClick={onRestart}>
          Restart Game
        </button>
      </div>
    </AnimatedModal>
  );
}
