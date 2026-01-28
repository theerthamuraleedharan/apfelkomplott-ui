export default function ScoreTracks({ score }) {
  return (
    <div className="zone">
      <h3>Wertung</h3>

      <p>Wirtschaft: {score.economy}</p>
      <p>Umwelt: {score.environment}</p>
      <p>Gesundheit: {score.health}</p>
    </div>
  );
}
