import { PHASE_LABELS } from "../constants/phases";

export default function Controls({ phase,mode, onNextPhase, showScorePopup }) {
  return (
    <div>
      <p>Mode selected: {mode}</p>
      <p>Current Phase: {PHASE_LABELS[phase]}</p>
      <button
        disabled={showScorePopup}
        onClick={onNextPhase}
      >    
    Next
</button>

    </div>
  );
}
