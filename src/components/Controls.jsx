export default function Controls({ phase, onNextRound }) {
  return (
    <div style={{ marginTop: "16px" }}>
      <h2>Controls</h2>
      <p>Current Phase: {phase}</p>

      <button onClick={onNextRound}>
        Next Round
      </button>
    </div>
  );
}
