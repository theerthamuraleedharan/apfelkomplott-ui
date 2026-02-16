export default function ScoreZone({ score }) {
  return (
    <div className="zone score">
      <h3>📊 Scores</h3>
      <p>Economy: {score.economy}</p>
      <p>Environment: {score.environment}</p>
      <p>Health: {score.health}</p>
    </div>
  );
}
