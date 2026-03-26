import { PHASE_LABELS } from "../constants/phases";

export default function Controls({
  phase,
  onNextPhase,
  showScorePopup,
  disableNextPhase = false,
}) {
  return (
    <div className="controlsCard">
      <div className="controlsCard__headline">Ready for the next step?</div>
      <p className="controlsCard__hint">
        Continue when you have finished the current <strong>{PHASE_LABELS[phase]}</strong> actions.
      </p>

      <button
        className="controlsCard__button"
        disabled={showScorePopup || disableNextPhase}
        onClick={onNextPhase}
      >
        Next Phase
      </button>
    </div>
  );
}
