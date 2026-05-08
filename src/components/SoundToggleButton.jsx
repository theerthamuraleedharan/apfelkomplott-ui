import "./SoundToggle.css";

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
