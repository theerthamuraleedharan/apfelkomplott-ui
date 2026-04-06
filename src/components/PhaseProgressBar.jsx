// Displays the current phase within the round.
// Gives players a quick sense of where they are in the turn flow.
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
