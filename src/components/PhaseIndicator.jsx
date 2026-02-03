import "./PhaseIndicator.css";

const PHASE_ORDER = [
  "MOVE_MARKER",
  "DRAW_EVENT",
  "REFILL_CARDS",
  "SELL",
  "DELIVER",
  "HARVEST",
  "ROTATE",
  "INTERMEDIATE_SCORING",
  "INVEST",
  "CARD_SCORING"
];

const PHASE_LABELS = {
  MOVE_MARKER: "Move Round Marker",
  DRAW_EVENT: "Draw Event",
  REFILL_CARDS: "Refill Cards",
  SELL: "Sell Apples",
  DELIVER: "Deliver Apples",
  HARVEST: "Harvest Apples",
  ROTATE: "Rotate Plantation",
  INTERMEDIATE_SCORING: "Intermediate Scoring",
  INVEST: "Invest",
  CARD_SCORING: "Card Scoring"
};

export default function PhaseIndicator({ round, phase }) {
  const stepIndex = PHASE_ORDER.indexOf(phase);
  const stepNumber = stepIndex >= 0 ? stepIndex + 1 : "?";

  return (
    <div className="phase-indicator">
      {/* <div className="round-info">
        🍏 <strong>Round {round}</strong> / 15
      </div> */}

      <div className="step-info">
        Step {stepNumber} / 10 —{" "}
        <strong>{PHASE_LABELS[phase]}</strong>
      </div>
    </div>
  );
}
