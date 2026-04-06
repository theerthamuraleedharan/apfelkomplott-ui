// Reopens the game help guide on demand.
// Gives players quick access to instructions without leaving the game.
import "./GameHelp.css";

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
