import "./ScoreBoard.css";
import { formatSaleBonusPerApple } from "../utils/saleBonus";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const MIN = -3;
const MAX = 8;

function toPercent(value) {
  const v = clamp(value, MIN, MAX);
  return ((v - MIN) / (MAX - MIN)) * 100;
}

export default function ScoreBoard({ score, money, currentSaleBonusPerApple = 0 }) {
  const economy = score?.economy ?? 0;
  const environment = score?.environment ?? 0;
  const health = score?.health ?? 0;
  const hasSaleBonus = currentSaleBonusPerApple > 0;

  return (
    <div className="scoreHud">
      <div className="scoreHud__header">
        <div className="scoreHud__title">Scores</div>

        <div className="moneyBadge" title="Money">
          <span className="moneyBadge__icon">Cash</span>
          <span className="moneyBadge__value">{money}</span>
        </div>
      </div>

      {hasSaleBonus && (
        <div className="bonusBadge" title="Ongoing sale bonus applied to future sold apples">
          <span className="bonusBadge__label">Sale bonus</span>
          <strong className="bonusBadge__value">
            {formatSaleBonusPerApple(currentSaleBonusPerApple)}
          </strong>
        </div>
      )}

      <ScoreBar label="Economy" value={economy} />
      <ScoreBar label="Environment" value={environment} />
      <ScoreBar label="Health" value={health} />
    </div>
  );
}

function ScoreBar({ label, value }) {
  const pct = toPercent(value);

  return (
    <div className="scoreRow">
      <div className="scoreRow__top">
        <div className="scoreRow__label">{label}</div>
        <div className="scoreRow__value">{value}</div>
      </div>

      <div className="bar">
        <div className="bar__track" />
        <div className="bar__fill" style={{ width: `${pct}%` }} />
        <div className="bar__zero" />
      </div>
    </div>
  );
}
