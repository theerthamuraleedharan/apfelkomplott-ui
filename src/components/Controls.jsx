import { PHASE_LABELS } from "../constants/phases";

/**
 * Phase-control panel for advancing the game.
 *
 * The component explains the current action, displays status text from the
 * parent page, and disables advancement when required choices or popups still
 * need player attention.
 *
 * @component
 * @param {object} props - Component props.
 * @param {string} props.phase - Current phase identifier.
 * @param {() => void} props.onNextPhase - Callback that advances or reopens the
 * required phase action.
 * @param {boolean} [props.showScorePopup] - Whether scoring feedback should
 * temporarily block the button.
 * @param {boolean} [props.disableNextPhase=false] - Whether phase advancement
 * is disabled by parent state.
 * @param {string} [props.buttonLabel] - Button text.
 * @param {string} [props.statusText] - Additional status message.
 * @param {boolean} [props.spotlight=false] - Whether to use first-action
 * spotlight styling.
 * @param {string} [props.headline] - Main panel heading.
 * @param {React.ReactNode|string} [props.hint] - Instructional hint content.
 * @returns {JSX.Element} Next-step control card.
 */
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
