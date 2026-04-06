// Action panel for moving the game forward.
// Highlights the next required step and triggers the phase transition.
import { PHASE_LABELS } from "../constants/phases";

export default function Controls({
  phase,
  onNextPhase,
  showScorePopup,
  disableNextPhase = false,
  buttonLabel = "Continue to Next Step",
  statusText = "",
  spotlight = false,
  headline = "Ready for the next step?",
  hint = "",
}) {
  return (
    <div className={`controlsCard${spotlight ? " controlsCard--spotlight" : ""}`}>
      <div className="controlsCard__headline">{headline}</div>
      <p className="controlsCard__hint">
        {hint || (
          <>
            Continue when you have finished the current <strong>{PHASE_LABELS[phase]}</strong> actions.
          </>
        )}
      </p>
      {statusText ? <div className="controlsCard__status">{statusText}</div> : null}

      <div className="controlsCard__buttonWrap">
        <button
          className="controlsCard__button"
          disabled={showScorePopup || disableNextPhase}
          onClick={onNextPhase}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
