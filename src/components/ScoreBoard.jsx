import { useEffect, useState } from "react";
import "./ScoreBoard.css";

export default function ScoreBoard({ score, money }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 400);
    return () => clearTimeout(t);
  }, [money]);

  return (
    <div className="scoreboard">
      <h2>Scores</h2>

      <p className={`money ${flash ? "flash" : ""}`}>
        💰 Money: {money}
      </p>

      <p>📊 Economy: {score.economy}</p>
      <p>🌱 Environment: {score.environment}</p>
      <p>❤️ Health: {score.health}</p>
    </div>
  );
}

