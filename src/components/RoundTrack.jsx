import "./RoundTrack.css";

export default function RoundTrack({ currentRound }) {
  const rounds = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="round-track">
      <span className="round start">Start</span>

      {rounds.map((round) => (
        <span
          key={round}
          className={`round ${round === currentRound ? "active" : ""}`}
        >
          {round}
        </span>
      ))}
    </div>
  );
}
