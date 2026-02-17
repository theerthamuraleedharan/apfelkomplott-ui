export default function Controls({ phase, onNextPhase, showScorePopup }) {
  return (
    <div>
      <p>Current Phase: {phase}</p>
      <button
        disabled={showScorePopup}
        onClick={onNextPhase}
      >
    Next
</button>

    </div>
  );
}