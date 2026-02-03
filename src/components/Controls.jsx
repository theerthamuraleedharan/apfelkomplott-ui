export default function Controls({ phase, onNextPhase }) {
  return (
    <div>
      <p>Current Phase: {phase}</p>
      <button onClick={onNextPhase}>
        Next Phase
      </button>
    </div>
  );
}

