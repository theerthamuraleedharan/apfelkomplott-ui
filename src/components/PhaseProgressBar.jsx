import "./PhaseProgressBar.css";
import RoundTrack from "../components/RoundTrack";

const PHASES = [
  "MOVE_MARKER",
  "DRAW_EVENT",
  "REFILL_CARDS",
  "SELL",
  "DELIVER",
  "HARVEST",
  "ROTATE",
  "INTERMEDIATE_SCORING",
  "INVEST",
  "CARD_SCORING",
];

const LABELS = {
  MOVE_MARKER: "Round Start",
  DRAW_EVENT: "Event",
  REFILL_CARDS: "Refill",
  SELL: "Sell",
  DELIVER: "Deliver",
  HARVEST: "Harvest",
  ROTATE: "Rotate",
  INTERMEDIATE_SCORING: "Scoring",
  INVEST: "Invest",
  CARD_SCORING: "Cards",
};

/**
 * Round and phase progress visualization for the game header.
 *
 * The component highlights the active phase and marks earlier phases as
 * completed, helping players understand where they are in the ten-step round
 * sequence.
 *
 * @component
 * @param {object} props - Component props.
 * @param {string} props.currentPhase - Active phase identifier.
 * @param {number} props.round - Current round number.
 * @returns {JSX.Element} Combined round track and phase progress bar.
 */
export default function PhaseProgressBar({ currentPhase, round }) {
  return (
    <div className="phase-bar">
      <RoundTrack round={round} />

      <div className="phase-steps">
        {PHASES.map((phase, index) => {
          const isActive = phase === currentPhase;
          const isDone =
            PHASES.indexOf(currentPhase) > index;

          return (
            <div
              key={phase}
              className={`phase-step 
                ${isActive ? "active" : ""} 
                ${isDone ? "done" : ""}`}
            >
              <div className="dot" />
              <span>{LABELS[phase]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
