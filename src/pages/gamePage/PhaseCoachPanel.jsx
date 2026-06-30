import { PHASE_LABELS } from "../../constants/phases";

export default function PhaseCoachPanel({ phase, coach }) {
  return (
    <section className="game-focus">
      <div className="game-focus__copy">
        <div className="game-focus__eyebrow">Current Step</div>
        <h2 className="game-focus__title">
          {PHASE_LABELS[phase] ?? phase.replaceAll("_", " ")}
        </h2>
        <p className="game-focus__summary">{coach.summary}</p>
      </div>
      <div className="game-focus__meta">
        <div className="game-focus__chip">{coach.urgency}</div>
        <div className="game-focus__tip">{coach.tip}</div>
      </div>
    </section>
  );
}
