import "./GameHelp.css";

/**
 * Header button that opens the full game guide.
 *
 * @component
 * @param {object} props - Component props.
 * @param {Function} props.onClick - Callback for opening the help modal.
 * @returns {JSX.Element} Help button.
 */
export default function HelpButton({ onClick }) {
  return (
    <button type="button" className="help-button" onClick={onClick}>
      <span className="help-button__icon" aria-hidden="true">
        ?
      </span>
      Help
    </button>
  );
}
