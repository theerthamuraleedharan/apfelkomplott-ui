import "./ScoreBoard.css";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatSaleBonusPerApple } from "../utils/saleBonus";
import AnimatedNumber from "./AnimatedNumber";
import { useEffect, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const MIN = -3;
const MAX = 8;

function toPercent(value) {
  const v = clamp(value, MIN, MAX);
  return ((v - MIN) / (MAX - MIN)) * 100;
}

export default function ScoreBoard({
  score,
  money,
  currentSaleBonusPerApple = 0,
  waterManagementPenalty = 0,
  shadeNetsPenalty = 0,
}) {
  const economy = score?.economy ?? 0;
  const environment = score?.environment ?? 0;
  const health = score?.health ?? 0;
  const hasSaleBonus = currentSaleBonusPerApple > 0;
  const hasInfoBadges =
    hasSaleBonus || waterManagementPenalty > 0 || shadeNetsPenalty > 0;
  const reduceMotion = useReducedMotion();
  const [moneyPulse, setMoneyPulse] = useState(false);

  useEffect(() => {
    if (reduceMotion) return undefined;

    setMoneyPulse(true);
    const timer = setTimeout(() => setMoneyPulse(false), 700);
    return () => clearTimeout(timer);
  }, [money, reduceMotion]);

  return (
    <div className="scoreHud">
      <div className="scoreHud__header">
        <div className="scoreHud__title">Scores</div>

        <motion.div
          className={`moneyBadge${moneyPulse ? " moneyBadge--pulse" : ""}`}
          title="Money"
          animate={
            reduceMotion
              ? undefined
              : moneyPulse
                ? { scale: [1, 1.04, 1], y: [0, -2, 0] }
                : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <span className="moneyBadge__icon">Cash</span>
          <AnimatedNumber className="moneyBadge__value" value={money} />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {hasInfoBadges && (
          <motion.div
            className="bonusBadgeList"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
          >
            {hasSaleBonus && (
              <InfoBadge
                title="Ongoing sale bonus applied to future sold apples"
                label="Sale bonus"
                value={formatSaleBonusPerApple(currentSaleBonusPerApple)}
              />
            )}

            {waterManagementPenalty > 0 && (
              <InfoBadge
                title="Current Water Management cost increase from the Chemical Accident event"
                label="Water Management"
                value={`+${waterManagementPenalty} money`}
              />
            )}

            {shadeNetsPenalty > 0 && (
              <InfoBadge
                title="Current Shade Nets cost increase from the selected event"
                label="Shade Nets"
                value={`+${shadeNetsPenalty} money`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ScoreBar label="Economy" value={economy} />
      <ScoreBar label="Environment" value={environment} />
      <ScoreBar label="Health" value={health} />
    </div>
  );
}

function InfoBadge({ title, label, value }) {
  return (
    <div className="bonusBadge" title={title}>
      <span className="bonusBadge__label">{label}</span>
      <strong className="bonusBadge__value">{value}</strong>
    </div>
  );
}

function ScoreBar({ label, value }) {
  const pct = toPercent(value);

  return (
    <div className="scoreRow">
      <div className="scoreRow__top">
        <div className="scoreRow__label">{label}</div>
        <AnimatedNumber className="scoreRow__value" value={value} />
      </div>

      <div className="bar">
        <div className="bar__track" />
        <div className="bar__fill" style={{ width: `${pct}%` }} />
        <div className="bar__zero" />
      </div>
    </div>
  );
}
