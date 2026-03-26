import { motion, useReducedMotion } from "framer-motion";
import "./GameHelp.css";

function HelpState({ title, body, onRetry }) {
  return (
    <div className="phase-help__state">
      <strong>{title}</strong>
      <p>{body}</p>
      {onRetry && (
        <button type="button" className="phase-help__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default function PhaseHelpPanel({
  phaseHelp,
  isLoading,
  error,
  onRetry,
  onOpenGuide,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="panel panel--soft phase-help"
      initial={reduceMotion ? false : { opacity: 0.92, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
    >
      <div className="phase-help__header">
        <div>
          <div className="panel__eyebrow">What Do I Do Now?</div>
          <h2 className="phase-help__title">
            {phaseHelp?.title || "Current phase guidance"}
          </h2>
        </div>

        <button
          type="button"
          className="phase-help__guideButton"
          onClick={onOpenGuide}
        >
          Open Guide
        </button>
      </div>

      {isLoading ? (
        <HelpState
          title="Loading help..."
          body="Pulling the next best step for this phase."
        />
      ) : error ? (
        <HelpState
          title="Help is unavailable"
          body={error}
          onRetry={onRetry}
        />
      ) : phaseHelp ? (
        <div className="phase-help__grid">
          <article className="phase-help__card">
            <span className="phase-help__label">Goal</span>
            <p>{phaseHelp.goal}</p>
          </article>
          <article className="phase-help__card">
            <span className="phase-help__label">Why it matters</span>
            <p>{phaseHelp.whyItMatters}</p>
          </article>
        </div>
      ) : (
        <HelpState
          title="No guidance yet"
          body="Move to the next phase or reopen the guide for the full rules overview."
        />
      )}
    </motion.section>
  );
}
