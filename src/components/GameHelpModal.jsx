// Full in-game help guide modal.
// Used for first-time onboarding and for reopening the guide anytime.
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
      "Start the new round by moving the round marker forward. The game lasts up to 15 rounds.",
    DRAW_EVENT:
      "Draw and resolve the event card. Some events happen now, while others also affect the next round.",
    REFILL_CARDS:
      "Refill the production card market so fresh options are available before you invest.",
    SELL:
      "Sell apples that are already in sales stands. Each sold apple gives money.",
    DELIVER:
      "Move apples from transport crates into sales stands. Apples must arrive here before they can be sold.",
    HARVEST:
      "Harvest apples from mature trees into transport crates. Only trees in fields 3 to 6 produce apples.",
    ROTATE:
      "Rotate the plantation disk so every tree gets older. Trees that pass field 6 are removed.",
    INTERMEDIATE_SCORING:
      "Check whether you created waste or left crates and stands empty. Balanced flow helps your economy.",
    INVEST:
      "Buy trees, crates, sales stands, or production cards. This is where you build your long-term strategy.",
    CARD_SCORING:
      "Apply production card effects that change economy, environment, or health before the next round starts.",
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

const HOW_TO_PLAY_HIGHLIGHTS = [
  {
    title: "Your Main Goal",
    body:
      "Build an orchard that earns money without hurting environment or health. You are playing cooperatively, so discuss each buy together.",
  },
  {
    title: "Apple Flow",
    body:
      "Apples do not earn money immediately. They move in this order: Plantation -> Transport -> Sales -> Money.",
  },
  {
    title: "Important Delay",
    body:
      "A harvested apple is usually delivered next round and sold the round after that. That means harvest, delivery, and selling are spread across multiple rounds.",
  },
  {
    title: "What To Balance",
    body:
      "Do not buy only trees. You also need enough transport crates and sales stands, otherwise apples are wasted and empty capacity can hurt your economy.",
  },
];

const HELP_PAGES = [
  { key: "guide", label: "Guide" },
  { key: "steps", label: "How A Turn Works" },
  { key: "rules", label: "Rules" },
];

const RULEBOOK_SECTIONS = [
  {
    title: "Game Principle",
    body:
      "Players cooperatively build an apple plantation and must balance three goals at the same time: economy, environment, and health. The game lasts up to 15 rounds, and every decision should support the orchard without creating waste or bottlenecks.",
  },
  {
    title: "Production Disk Rules",
    items: [
      "The plantation wheel has 6 fields. Fields 1 and 2 are nursery fields and do not produce apples yet.",
      "Trees start producing only once they reach field 3. Each harvest-ready tree produces 1 apple per round.",
      "Trees age when the plantation rotates. Trees that would move past field 6 are removed from the game.",
      "A field normally holds up to 5 trees, but cards can change capacity. It can never go above 8 or below 3.",
    ],
  },
  {
    title: "Round Flow Rules",
    items: [
      "Each round has 10 steps. First move the round marker, then resolve the event card, then refill production cards if needed.",
      "The plantation phase follows: sell apples, deliver apples from transport to sales, harvest from trees, rotate the plantation, then do intermediate scoring.",
      "The investment phase comes after that: buy trees, transport, sales stands, or production cards, then apply card scoring.",
      "Some steps only become possible in later rounds: harvest starts from round 3, deliver from round 4, and selling from round 5.",
    ],
  },
  {
    title: "Investment Rules",
    items: [
      "Seedlings start on field 1. Pre-grown trees start on field 2, so they produce sooner.",
      "Transport crates and sales stands each have a capacity of 3 apples.",
      "Fill one crate fully before starting another so empty capacity is easy to see during scoring.",
      "Players decide investments cooperatively. If they cannot agree, the starting player decides.",
    ],
  },
  {
    title: "Scoring And Waste",
    items: [
      "Wasted apples hurt the economy score. Every 3 discarded apples gives -1 economy.",
      "Each completely empty transport unit or sales stand gives -1 economy.",
      "If transport and sales are used perfectly with no empty spaces, you gain +1 economy.",
      "Environment and health are driven mainly by production cards and card effects.",
    ],
  },
  {
    title: "Event Card Rules",
    items: [
      "Event cards can apply immediately, later, or in both the current and next round.",
      "Delayed event cards are placed in the upcoming-events area and resolved in the following round.",
      "This means some rounds can have two event effects active, while others may have none.",
      "Any delayed event that would resolve after round 15 expires instead.",
    ],
  },
];

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
  const activePageIndex = HELP_PAGES.findIndex((page) => page.key === activePage);
  const previousPage = activePageIndex > 0 ? HELP_PAGES[activePageIndex - 1] : null;
  const nextPage =
    activePageIndex >= 0 && activePageIndex < HELP_PAGES.length - 1
      ? HELP_PAGES[activePageIndex + 1]
      : null;

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
        {HELP_PAGES.map((page) => (
          <button
            key={page.key}
            type="button"
            className={`game-help__pageTab${activePage === page.key ? " is-active" : ""}`}
            onClick={() => setActivePage(page.key)}
          >
            {page.label}
          </button>
        ))}
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
          ) : activePage === "steps" ? (
            <section className="game-help__section">
              <div className="game-help__sectionTitle">How To Play</div>
              <p className="game-help__body">
                Think of each round as one repeating orchard cycle. First the game updates the round, then apples move forward through the chain, then you invest for the future.
              </p>

              <div className="game-help__stepHighlights">
                {HOW_TO_PLAY_HIGHLIGHTS.map((item) => (
                  <article key={item.title} className="game-help__stepHighlight">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>

              <div className="game-help__sectionTitle">Turn Steps</div>
              <p className="game-help__body">
                Use this simpler order to understand what happens in a normal round and where your attention should go.
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
          ) : (
            <>
              <section className="game-help__section">
                <div className="game-help__sectionTitle">Rulebook Highlights</div>
                <p className="game-help__body">
                  These rules are adapted from the attached Apfelkomplott PDF rulebook so players can check the core system without leaving the game.
                </p>
              </section>

              {RULEBOOK_SECTIONS.map((section) => (
                <Section
                  key={section.title}
                  title={section.title}
                  body={section.body}
                  items={section.items}
                />
              ))}
            </>
          )}

          <div className="game-help__footer">
            {previousPage ? (
              <button
                type="button"
                className="game-help__secondaryAction"
                onClick={() => setActivePage(previousPage.key)}
              >
                Back: {previousPage.label}
              </button>
            ) : null}

            {nextPage ? (
              <button
                type="button"
                className="game-help__action"
                onClick={() => setActivePage(nextPage.key)}
              >
                Next: {nextPage.label}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </AnimatedModal>
  );
}
