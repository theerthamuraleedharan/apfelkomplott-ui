export default function Controls({ phase,mode, onNextPhase, showScorePopup }) {
  return (
    <div>
      <p>Mode selected: {mode}</p>
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