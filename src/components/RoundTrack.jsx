import "./RoundTrack.css";

/**
 * Horizontal round tracker for the full fifteen-round game.
 *
 * @component
 * @param {object} props - Component props.
 * @param {number} props.round - Current active round.
 * @returns {JSX.Element} Round progress cells.
 */
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
