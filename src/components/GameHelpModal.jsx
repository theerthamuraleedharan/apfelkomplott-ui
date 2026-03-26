import { useEffect, useState } from "react";
import AnimatedModal from "./AnimatedModal";
import { PHASE_LABELS } from "../constants/phases";
import "./GameHelp.css";

function toText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return toText(
            item.text ?? item.description ?? item.label ?? item.title ?? item.name
          );
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function normalizeGuide(guide) {
  if (!guide || typeof guide !== "object") {
    return {
      title: "Apfelkomplott",
      overview: "",
      winCondition: "",
      setupSteps: [],
      beginnerTips: [],
      roundPhases: [],
    };
  }

  const phaseSource =
    guide.roundPhases ?? guide.phases ?? guide.roundFlow ?? guide.phaseGuide ?? [];

  const roundPhases = Array.isArray(phaseSource)
    ? phaseSource
        .map((phase, index) => {
          if (typeof phase === "string") {
            return {
              key: phase,
              title: PHASE_LABELS[phase] ?? phase,
              description: "",
              index,
            };
          }

          if (!phase || typeof phase !== "object") return null;

          const key = toText(phase.phaseKey ?? phase.phase ?? phase.id);
          return {
            key,
            title: toText(
              phase.title ?? phase.name ?? phase.label,
              PHASE_LABELS[key] ?? `Phase ${index + 1}`
            ),
            description: toText(
              phase.summary ??
                phase.description ??
                phase.goal ??
                phase.whatToDo ??
                phase.whyItMatters
            ),
            icon: toText(phase.icon ?? phase.badge),
            index,
          };
        })
        .filter(Boolean)
    : [];

  return {
    title: toText(guide.gameTitle ?? guide.title, "Apfelkomplott"),
    overview: toText(guide.overview ?? guide.summary),
    winCondition: toText(guide.winCondition ?? guide.objective),
    setupSteps: toList(guide.setupSteps ?? guide.setup ?? guide.startingSteps),
    beginnerTips: toList(guide.beginnerTips ?? guide.tips ?? guide.playerTips),
    roundPhases,
  };
}

function buildGuideSteps(roundPhases) {
  const fallbackDescriptions = {
    MOVE_MARKER:
      "Advance the round marker so the whole table knows a new round has started.",
    DRAW_EVENT:
      "Reveal the round twist by selecting one event card. This can change costs, bonuses, or later outcomes.",
    REFILL_CARDS:
      "Refresh the market so new production cards are available before investment decisions.",
    SELL:
      "Resolve sales and turn harvested apples into money based on current bonuses and conditions.",
    DELIVER:
      "Move apples through delivery so your orchard output can actually reach the market.",
    HARVEST:
      "Collect apples from the plantation and check whether events or earlier choices affect the yield.",
    ROTATE:
      "Rotate plantation state so the board is ready for the next yearly cycle.",
    INTERMEDIATE_SCORING:
      "Review score changes to economy, environment, and health after the round's effects are applied.",
    INVEST:
      "Spend money on improvements or production cards to shape future rounds.",
    CARD_SCORING:
      "Apply production-card scoring effects that trigger at the end of the round.",
  };

  return roundPhases.map((phase, index) => ({
    ...phase,
    stepTitle: `Step ${index + 1}`,
    detail:
      phase.description ||
      fallbackDescriptions[phase.key] ||
      "Complete this part of the round before moving to the next step.",
  }));
}

function Section({ title, items, body }) {
  if (!body && (!items || items.length === 0)) return null;

  return (
    <section className="game-help__section">
      <div className="game-help__sectionTitle">{title}</div>
      {body ? <p className="game-help__body">{body}</p> : null}
      {items?.length ? (
        <div className="game-help__list">
          {items.map((item) => (
            <article key={item} className="game-help__listItem">
              {item}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function GameHelpModal({
  isOpen,
  guide,
  isLoading,
  error,
  onClose,
  onRetry,
  currentPhase,
  isWelcome = false,
}) {
  const normalizedGuide = normalizeGuide(guide);
  const [activePage, setActivePage] = useState("guide");
  const guideSteps = buildGuideSteps(normalizedGuide.roundPhases);

  useEffect(() => {
    if (isOpen) {
      setActivePage("guide");
    }
  }, [isOpen]);

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      backdropClassName="game-help__backdrop"
      panelClassName="game-help__modal"
    >
      <div className="game-help__pageTabs">
        <button
          type="button"
          className={`game-help__pageTab${activePage === "guide" ? " is-active" : ""}`}
          onClick={() => setActivePage("guide")}
        >
          Guide
        </button>
        <button
          type="button"
          className={`game-help__pageTab${activePage === "steps" ? " is-active" : ""}`}
          onClick={() => setActivePage("steps")}
        >
          How A Turn Works
        </button>
      </div>

      <div className="game-help__header">
        <div>
          <div className="game-help__eyebrow">
            {isWelcome ? "Welcome to the orchard" : "Full game guide"}
          </div>
          <h2 className="game-help__title">{normalizedGuide.title}</h2>
          <p className="game-help__subtitle">
            {normalizedGuide.overview ||
              "Learn the flow of each round and make confident decisions from the start."}
          </p>
        </div>

        <button type="button" className="game-help__close" onClick={onClose}>
          Close
        </button>
      </div>

      {isLoading ? (
        <div className="game-help__state">
          <div className="game-help__spinner" aria-hidden="true" />
          <p>Loading the beginner guide...</p>
        </div>
      ) : error ? (
        <div className="game-help__state">
          <strong>Could not load the guide</strong>
          <p>{error}</p>
          <button type="button" className="game-help__action" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : (
        <div className="game-help__content">
          {activePage === "guide" ? (
            <>
              <Section title="Win Condition" body={normalizedGuide.winCondition} />
              <Section title="Setup Steps" items={normalizedGuide.setupSteps} />
              <Section title="Beginner Tips" items={normalizedGuide.beginnerTips} />

              <section className="game-help__section">
                <div className="game-help__sectionTitle">Round Phases</div>
                <div className="game-help__phaseList">
                  {normalizedGuide.roundPhases.map((phase) => {
                    const isCurrent = phase.key && phase.key === currentPhase;
                    return (
                      <article
                        key={`${phase.key || phase.title}-${phase.index}`}
                        className={`game-help__phaseItem${isCurrent ? " game-help__phaseItem--current" : ""}`}
                      >
                        <div className="game-help__phaseTop">
                          <span className="game-help__phaseBadge">
                            {phase.icon || `P${phase.index + 1}`}
                          </span>
                          <div>
                            <h3>{phase.title}</h3>
                            {isCurrent ? (
                              <span className="game-help__phaseCurrent">Current phase</span>
                            ) : null}
                          </div>
                        </div>
                        {phase.description ? (
                          <p className="game-help__phaseDescription">{phase.description}</p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="game-help__section">
              <div className="game-help__sectionTitle">Turn Steps</div>
              <p className="game-help__body">
                A round moves through the same sequence each time. Use these steps to understand what the game expects from you next.
              </p>
              <div className="game-help__stepList">
                {guideSteps.map((step) => {
                  const isCurrent = step.key && step.key === currentPhase;
                  return (
                    <article
                      key={`${step.key || step.title}-${step.index}-step`}
                      className={`game-help__stepItem${isCurrent ? " game-help__stepItem--current" : ""}`}
                    >
                      <div className="game-help__stepTop">
                        <span className="game-help__stepNumber">{step.index + 1}</span>
                        <div>
                          <div className="game-help__stepEyebrow">{step.stepTitle}</div>
                          <h3>{step.title}</h3>
                          {isCurrent ? (
                            <span className="game-help__phaseCurrent">You are here</span>
                          ) : null}
                        </div>
                      </div>
                      <p className="game-help__stepDescription">{step.detail}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <div className="game-help__footer">
            {activePage === "steps" ? (
              <button
                type="button"
                className="game-help__secondaryAction"
                onClick={() => setActivePage("guide")}
              >
                Back To Guide
              </button>
            ) : (
              <button
                type="button"
                className="game-help__action"
                onClick={() => setActivePage("steps")}
              >
                Next: Turn Steps
              </button>
            )}
          </div>
        </div>
      )}
    </AnimatedModal>
  );
}
