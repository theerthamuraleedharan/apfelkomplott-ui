export default function ScoreBoard({ score, money }) {
  return (
    <div>
      <h2>Scores</h2>
      <p>Money: {money}</p>
      <p>Economy: {score.economy}</p>
      <p>Environment: {score.environment}</p>
      <p>Health: {score.health}</p>
    </div>
  );
}
