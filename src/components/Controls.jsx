export default function Controls({ phase, onNextRound, disabled }) {
  return (
    <button onClick={onNextRound} disabled={disabled}>
      Next Phase ({phase})
    </button>
  );
}
