import "./PhaseIndicator.css";
import { PHASE_LABELS } from "../constants/phases";
import { PHASE_ORDER } from "../constants/phases";

export default function PhaseIndicator({ round, phase }) {
  const stepIndex = PHASE_ORDER.indexOf(phase);
  const stepNumber = stepIndex >= 0 ? stepIndex + 1 : "?";

  return (
    <div className="phase-indicator">
      <div className="step-info">
        Step {stepNumber} / 10 —{" "}
        <strong>{PHASE_LABELS[phase]}</strong>
      </div>
    </div>
  );
}
