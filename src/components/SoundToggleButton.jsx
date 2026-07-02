import "./SoundToggle.css";

/**
 * Button for enabling or muting interface sound effects.
 *
 * @component
 * @param {object} props - Component props.
 * @param {boolean} props.enabled - Whether sound is currently enabled.
 * @param {Function} props.onToggle - Callback for toggling the sound setting.
 * @returns {JSX.Element} Sound preference toggle.
 */
export default function SoundToggleButton({ enabled, onToggle }) {
  return (
    <button
      type="button"
      className={`sound-toggle${enabled ? "" : " sound-toggle--muted"}`}
      onClick={onToggle}
      aria-pressed={enabled}
      title={enabled ? "Turn sound off" : "Turn sound on"}
    >
      <span className="sound-toggle__icon" aria-hidden="true">
        {enabled ? "S" : "M"}
      </span>
      {enabled ? "Sound On" : "Sound Off"}
    </button>
  );
}
