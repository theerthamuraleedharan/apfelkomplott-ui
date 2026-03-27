import { PHASE_LABELS } from "../constants/phases";

export default function Controls({
  phase,
  onNextPhase,
  showScorePopup,
  disableNextPhase = false,
  buttonLabel = "Continue to Next Step",
  statusText = "",
}) {
  return (
    <div className="controlsCard">
      <div className="controlsCard__headline">Ready for the next step?</div>
      <p className="controlsCard__hint">
        Continue when you have finished the current <strong>{PHASE_LABELS[phase]}</strong> actions.
      </p>
      {statusText ? <div className="controlsCard__status">{statusText}</div> : null}

      <button
        className="controlsCard__button"
        disabled={showScorePopup || disableNextPhase}
        onClick={onNextPhase}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
