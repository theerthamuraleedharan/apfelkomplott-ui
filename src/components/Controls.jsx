import { PHASE_LABELS } from "../constants/phases";

export default function Controls({
  phase,
  mode,
  onNextPhase,
  showScorePopup,
  disableNextPhase = false,
}) {
  return (
    <div className="controlsCard">
      <div className="controlsCard__meta">
        <div className="controlsCard__item">
          <span className="controlsCard__label">Mode</span>
          <div className="controlsCard__value">{mode}</div>
        </div>

        <div className="controlsCard__item">
          <span className="controlsCard__label">Current Phase</span>
          <div className="controlsCard__value">{PHASE_LABELS[phase]}</div>
        </div>
      </div>

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
