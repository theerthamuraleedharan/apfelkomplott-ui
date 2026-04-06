// Visual round tracker for the full game timeline.
// Helps the player see current progress across all rounds.
import "./RoundTrack.css";

export default function RoundTrack({ round }) {
  const rounds = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="round-track">
      {rounds.map((r) => (
        <div
          key={r}
          className={`round-cell ${r === round ? "active" : ""}`}
        >
          <span className="round-cell__label">{r === 0 ? "Round" : r}</span>
        </div>
      ))}
    </div>
  );
}
