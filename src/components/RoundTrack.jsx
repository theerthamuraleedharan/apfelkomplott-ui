import "./RoundTrack.css";

export default function RoundTrack({ round }) {
  const rounds = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="round-track">
      {rounds.map(r => (
        <div
          key={r}
          className={`round-cell ${r === round ? "active" : ""}`}
        >
          {r === 0 ? "Round" : r}
        </div>
      ))}
    </div>
  );
}
