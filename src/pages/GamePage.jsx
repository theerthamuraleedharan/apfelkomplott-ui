import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./GamePage.css";

import {
  fetchGameGuide,
  getGameState,
  nextPhase,
  getMarket,
  getActiveProductionCards,
  buyInvestment,
  buyProductionCard,
  getEventOptions,
  selectEventOption,
} from "../api/gameApi";

import BoardLayout from "../components/BoardLayout";
import ActiveCardsPanel from "../components/ActiveCardsPanel";
import Market from "../components/Market";
import ScoreBoard from "../components/ScoreBoard";
import Controls from "../components/Controls";
import InvestmentPanel from "../components/InvestmentPanel";
import GameOverModal from "../components/GameOverModal";
import EventCard, { EventDrawModal } from "../components/EventCard";
import PhaseProgressBar from "../components/PhaseProgressBar";
import AnimatedModal from "../components/AnimatedModal";
import GameHelpModal from "../components/GameHelpModal";
import HelpButton from "../components/HelpButton";
import { PHASE_LABELS, PHASE_ORDER } from "../constants/phases";

const HELP_DISMISSED_STORAGE_KEY = "apfelkomplott-help-dismissed";

function shuffleCards(cards) {
  const copy = [...cards];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildMarketSlots(cards, previousSlots = []) {
  const availableCards = (cards ?? []).filter(Boolean);
  const shortTerm = shuffleCards(
    availableCards.filter((card) => card.deck === "SHORT_TERM")
  );
  const longTerm = shuffleCards(
    availableCards.filter((card) => card.deck === "LONG_TERM")
  );

  // Keep the visible market aligned with the requested 3 short-term / 2 long-term mix.
  const picked = [
    ...shortTerm.slice(0, 3),
    ...longTerm.slice(0, 2),
  ];

  // If one deck runs out, backfill from any remaining cards so all 5 slots stay usable.
  if (picked.length < 5) {
    const usedIds = new Set(picked.map((card) => card.id));
    const leftovers = shuffleCards(
      availableCards.filter((card) => !usedIds.has(card.id))
    );
    picked.push(...leftovers.slice(0, 5 - picked.length));
  }

  const pickedById = new Map(picked.map((card) => [card.id, card]));
  const nextSlots = Array(5).fill(null);

  // Keep cards in their current slot whenever the same market card is still available.
  previousSlots.forEach((card, index) => {
    if (!card) return;
    if (!pickedById.has(card.id)) return;

    nextSlots[index] = pickedById.get(card.id);
    pickedById.delete(card.id);
  });

  const remainingCards = shuffleCards(Array.from(pickedById.values()));

  for (let i = 0; i < nextSlots.length; i += 1) {
    if (!nextSlots[i]) {
      nextSlots[i] = remainingCards.shift() ?? null;
    }
  }

  return nextSlots;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeEventResult(payload) {
  if (!payload) return null;

  if (payload.lastEventResult) {
    return normalizeEventResult(payload.lastEventResult);
  }

  return {
    ...payload,
    cardId: payload.cardId ?? payload.id ?? null,
    cardName: payload.cardName ?? payload.name ?? "Event",
    description: payload.description ?? "",
    effects: Array.isArray(payload.effects) ? payload.effects : [],
    media: Array.isArray(payload.media) ? payload.media : [],
  };
}

function mergeEventResults(primary, fallback) {
  const normalizedPrimary = normalizeEventResult(primary);
  const normalizedFallback = normalizeEventResult(fallback);

  if (!normalizedPrimary) return normalizedFallback;
  if (!normalizedFallback) return normalizedPrimary;

  return {
    ...normalizedFallback,
    ...normalizedPrimary,
    effects:
      normalizedPrimary.effects.length > 0
        ? normalizedPrimary.effects
        : normalizedFallback.effects,
    media:
      normalizedPrimary.media.length > 0
        ? normalizedPrimary.media
        : normalizedFallback.media,
  };
}

function getHelpModalPreference() {
  try {
    return localStorage.getItem(HELP_DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setHelpModalPreference() {
  try {
    localStorage.setItem(HELP_DISMISSED_STORAGE_KEY, "1");
  } catch {
    // Ignore storage errors so help still works in restricted environments.
  }
}

function toText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getPhaseCoach(phase) {
  const guidance = {
    MOVE_MARKER: {
      summary: "Start the new round and get the board ready for the next sequence of actions.",
      tip: "This is a transition step. Once the round marker is updated, you can move ahead.",
      urgency: "Quick setup",
    },
    DRAW_EVENT: {
      summary: "Pick one event card. The revealed event can change costs, bonuses, or upcoming harvest outcomes.",
      tip: "You must choose one event card before the round can continue.",
      urgency: "Required choice",
    },
    REFILL_CARDS: {
      summary: "The market refreshes here so you can see what production cards are available later.",
      tip: "Scan the new cards now so your next investment decision is easier.",
      urgency: "Preview market",
    },
    SELL: {
      summary: "Resolve apple sales and convert your orchard output into money.",
      tip: "Check any active bonus or event effect before moving on.",
      urgency: "Money step",
    },
    DELIVER: {
      summary: "Move apples through delivery so they can actually be sold.",
      tip: "Think of this as preparing your stock for the market.",
      urgency: "Board action",
    },
    HARVEST: {
      summary: "Collect apples from the plantation and see how this round’s conditions affect yield.",
      tip: "Harvest is often influenced by event cards, so keep the latest event result in mind.",
      urgency: "Board action",
    },
    ROTATE: {
      summary: "Rotate the plantation to advance the orchard cycle.",
      tip: "This helps reset the board for the next round structure.",
      urgency: "Board update",
    },
    INTERMEDIATE_SCORING: {
      summary: "Review how the round changed Economy, Environment, and Health.",
      tip: "Use this moment to see whether your strategy is helping or hurting the orchard balance.",
      urgency: "Score check",
    },
    INVEST: {
      summary: "Spend money on investments or production cards to improve future rounds.",
      tip: "Compare card effects before buying. Long-term cards shape your strategy more heavily.",
      urgency: "Best time to act",
    },
    CARD_SCORING: {
      summary: "Apply end-of-round production card effects before the next round begins.",
      tip: "Watch for popups here, because this step can change scores or even farming mode.",
      urgency: "End of round",
    },
  };

  return guidance[phase] ?? {
    summary: "Follow the current board step, then continue when the phase is complete.",
    tip: "Open Help anytime if you need the full explanation.",
    urgency: "Current step",
  };
}

function getNextPhaseLabel(currentPhase) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === PHASE_ORDER.length - 1) {
    return "Next round";
  }

  const nextPhase = PHASE_ORDER[currentIndex + 1];
  return PHASE_LABELS[nextPhase] ?? "Next step";
}

export default function GamePage({ onRestart }) {
  const reduceMotion = useReducedMotion();
  const [gameState, setGameState] = useState(null);
  const [market, setMarket] = useState([]);
  const [activeProductionCards, setActiveProductionCards] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);
  const [eventOptionsLoading, setEventOptionsLoading] = useState(false);
  const [eventSelectionLoading, setEventSelectionLoading] = useState(false);
  const [eventOptionsError, setEventOptionsError] = useState("");
  const [revealedEvent, setRevealedEvent] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null);
  const [cardScoringPopup, setCardScoringPopup] = useState(null);
  const [modeChangePopup, setModeChangePopup] = useState(null);
  const [errorPopup, setErrorPopup] = useState("");
  const [guide, setGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isWelcomeHelp, setIsWelcomeHelp] = useState(false);
  const hasCheckedWelcomeHelpRef = useRef(false);

  function showErrorPopup(message) {
    if (!message) return;
    setErrorPopup(message);
  }

  function openGuideModal() {
    setIsWelcomeHelp(false);
    setIsHelpModalOpen(true);
  }

  function closeGuideModal() {
    if (isWelcomeHelp) {
      setHelpModalPreference();
      setIsWelcomeHelp(false);
    }

    setIsHelpModalOpen(false);
  }

  async function loadGuide() {
    setGuideLoading(true);
    setGuideError("");

    try {
      const nextGuide = await fetchGameGuide();
      setGuide(nextGuide);
    } catch (err) {
      setGuideError(err.message || "Unable to load the game guide.");
    } finally {
      setGuideLoading(false);
    }
  }

  async function loadEventOptions() {
    setEventOptionsLoading(true);
    setEventOptionsError("");

    try {
      const options = await getEventOptions();
      setEventOptions(Array.isArray(options) ? options : []);
    } catch (err) {
      showErrorPopup(err.message);
      setEventOptions([]);
      setEventOptionsError(err.message || "Unable to load event choices.");
    } finally {
      setEventOptionsLoading(false);
    }
  }

  async function fetchMarketForPhase(phase, previousSlots = []) {
    const preserveSlots = phase !== "REFILL_CARDS";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const currentMarket = await getMarket();
      const nextSlots = buildMarketSlots(
        currentMarket,
        preserveSlots ? previousSlots : []
      );

      const filledSlots = nextSlots.filter(Boolean).length;
      if (phase !== "REFILL_CARDS" || filledSlots === 5 || attempt === 2) {
        return nextSlots;
      }

      // Refill can lag briefly behind the phase transition, so retry before showing gaps.
      await delay(250);
    }

    return previousSlots;
  }

  async function refreshGame({ preserveSlots = true } = {}) {
    // State and market are refreshed together so board UI and card slots stay in sync.
    const [state, activeCards] = await Promise.all([
      getGameState(),
      getActiveProductionCards(),
    ]);
    const currentMarket = await fetchMarketForPhase(
      preserveSlots ? state.currentPhase : "REFILL_CARDS",
      preserveSlots ? market : []
    );
    setGameState(state);
    setMarket(currentMarket);
    setActiveProductionCards(Array.isArray(activeCards) ? activeCards : []);
    return state;
  }

  useEffect(() => {
    async function init() {
      await refreshGame();
    }

    init();
  }, []);

  useEffect(() => {
    loadGuide();
  }, []);

  useEffect(() => {
    if (gameState?.currentPhase === "DRAW_EVENT") {
      loadEventOptions();
      return;
    }

    setEventOptions([]);
    setEventOptionsError("");
  }, [gameState?.currentPhase]);

  useEffect(() => {
    if (!gameState) return;

    if (
      gameState.currentPhase === "HARVEST" ||
      gameState.currentPhase === "DELIVER" ||
      gameState.currentPhase === "SELL"
    ) {
      setAnimationPhase(gameState.currentPhase);

      const timer = setTimeout(() => {
        setAnimationPhase(null);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPhase]);

  useEffect(() => {
    if (!gameState || hasCheckedWelcomeHelpRef.current) return;

    hasCheckedWelcomeHelpRef.current = true;

    if (!getHelpModalPreference()) {
      setIsWelcomeHelp(true);
      setIsHelpModalOpen(true);
    }
  }, [gameState]);

  async function handleNextPhase() {
    const updated = await nextPhase();

    if (updated.productionCardFinalScoreResult?.reasons?.length > 0) {
      setCardScoringPopup(updated.productionCardFinalScoreResult);
    }

    setGameState(updated);
    const activeCards = await getActiveProductionCards();
    setActiveProductionCards(Array.isArray(activeCards) ? activeCards : []);
    setMarket((prev) => prev);
    const currentMarket = await fetchMarketForPhase(updated.currentPhase, market);
    setMarket(currentMarket);
  }

  async function handleEventSelection(optionIndex) {
    setEventSelectionLoading(true);

    try {
      const selectionResult = await selectEventOption(optionIndex);
      const updatedState = await refreshGame();
      // Some backends return richer event data from /event/select than in /state,
      // so we merge both and keep media/QR assets when only one payload includes them.
      setRevealedEvent(
        mergeEventResults(selectionResult, updatedState?.lastEventResult)
      );
      setEventOptions([]);
    } catch (err) {
      showErrorPopup(err.message);
      await refreshGame();
    } finally {
      setEventSelectionLoading(false);
    }
  }

  async function buy(type) {
    try {
      await buyInvestment(type);
      const updated = await getGameState();
      setGameState(updated);
    } catch (err) {
      // Backend owns investment rules, so business-rule failures show here as a user-facing popup.
      showErrorPopup(err.message);
    }
  }

  async function handleBuyProductionCard(cardId) {
    const previousMode = gameState?.farmingMode ?? null;

    // Preserve the slot position visually while the backend confirms the purchase.
    setMarket((prev) => {
      const idx = prev.findIndex((card) => card?.id === cardId);
      if (idx === -1) return prev;

      const copy = [...prev];
      copy[idx] = null;
      return copy;
    });

    try {
      const result = await buyProductionCard(cardId);

      if (result?.reasons?.length) {
        showErrorPopup(result.reasons.join("\n"));
      }

      const updatedState = await refreshGame();

      if (
        previousMode &&
        updatedState?.farmingMode &&
        updatedState.farmingMode !== previousMode
      ) {
        setModeChangePopup({
          from: previousMode,
          to: updatedState.farmingMode,
        });
      }
    } catch (err) {
      // This is where backend validation like "max 8 plants" is surfaced to the player.
      showErrorPopup(err.message);
      await refreshGame();
    }
  }

  if (!gameState) return <div className="game-loading">Loading game...</div>;

  const phaseCoach = getPhaseCoach(gameState.currentPhase);
  const controlsDisabled =
    gameState.currentPhase === "DRAW_EVENT" ||
    eventSelectionLoading ||
    Boolean(revealedEvent);
  const controlsStatusText =
    gameState.currentPhase === "DRAW_EVENT"
      ? "Choose an event card in the popup to unlock the next step."
      : revealedEvent
        ? "Review the revealed event, then continue."
        : eventSelectionLoading
          ? "The selected event is being revealed."
          : `After this, the game will move to ${getNextPhaseLabel(gameState.currentPhase)}.`;

  return (
    <div className="game-root">
      <div className="game-shell">
        <GameOverModal gameState={gameState} onRestart={onRestart} />

        <motion.header
          className="game-hero"
          key={`hero-${gameState.currentPhase}-${gameState.currentRound}`}
          initial={reduceMotion ? false : { opacity: 0.92, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.26, ease: "easeOut" }}
        >
          <div className="game-hero__copy">
            <p className="game-kicker">Orchard Strategy Board</p>
            <h1 className="game-title">Apfelkomplott</h1>
            <p className="game-subtitle">
              Guide your orchard through shifting seasons, production choices, and
              careful investments while balancing economy, environment, and health.
            </p>
          </div>

          <div className="game-hero__meta">
            <motion.div
              className="hero-chip"
              animate={
                reduceMotion ? undefined : gameState.currentPhase ? { scale: [1, 1.02, 1] } : undefined
              }
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span className="hero-chip__label">Mode</span>
              <strong>{gameState.farmingMode}</strong>
            </motion.div>
            <motion.div className="hero-chip" layout>
              <span className="hero-chip__label">Round</span>
              <strong>{gameState.currentRound}</strong>
            </motion.div>
            <motion.div
              className="hero-chip hero-chip--phase"
              key={gameState.currentPhase}
              initial={reduceMotion ? false : { opacity: 0.6, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
            >
              <span className="hero-chip__label">Phase</span>
              <strong>{gameState.currentPhase.replaceAll("_", " ")}</strong>
            </motion.div>
            <motion.div className="hero-chip game-help-chip" layout>
              <HelpButton onClick={openGuideModal} />
            </motion.div>
          </div>
        </motion.header>

        <motion.div
          key={`phase-bar-${gameState.currentPhase}`}
          initial={reduceMotion ? false : { opacity: 0.8, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        >
          <PhaseProgressBar
            currentPhase={gameState.currentPhase}
            round={gameState.currentRound}
          />
        </motion.div>

        <section className="game-focus">
          <div className="game-focus__copy">
            <div className="game-focus__eyebrow">Current Step</div>
            <h2 className="game-focus__title">
              {PHASE_LABELS[gameState.currentPhase] ?? gameState.currentPhase.replaceAll("_", " ")}
            </h2>
            <p className="game-focus__summary">{phaseCoach.summary}</p>
          </div>
          <div className="game-focus__meta">
            <div className="game-focus__chip">{phaseCoach.urgency}</div>
            <div className="game-focus__tip">{phaseCoach.tip}</div>
          </div>
        </section>

        {gameState.currentPhase === "DRAW_EVENT" && (
          <EventDrawModal
            options={eventOptions}
            isLoading={eventOptionsLoading}
            isSubmitting={eventSelectionLoading}
            error={eventOptionsError}
            onSelect={handleEventSelection}
            onRetry={loadEventOptions}
          />
        )}

        {revealedEvent && (
          <EventCard
            event={revealedEvent}
            onContinue={() => setRevealedEvent(null)}
          />
        )}

        <AnimatedModal
          isOpen={Boolean(cardScoringPopup)}
          onClose={() => setCardScoringPopup(null)}
          backdropClassName="phase-popup__backdrop"
          panelClassName="phase-popup"
        >
          {cardScoringPopup && (
            <>
              <div className="phase-popup__eyebrow">Card Scoring</div>
              <h2 className="phase-popup__title">Production Card Results</h2>

              <div className="phase-popup__stats">
                <div className="phase-popup__stat">
                  <span>Economy</span>
                  <strong>{cardScoringPopup.economyChange ?? 0}</strong>
                </div>
                <div className="phase-popup__stat">
                  <span>Environment</span>
                  <strong>{cardScoringPopup.environmentChange ?? 0}</strong>
                </div>
                <div className="phase-popup__stat">
                  <span>Health</span>
                  <strong>{cardScoringPopup.healthChange ?? 0}</strong>
                </div>
              </div>

              {(cardScoringPopup.reasons ?? []).length > 0 && (
                <div className="phase-popup__reasons">
                  {(cardScoringPopup.reasons ?? []).map((reason, index) => (
                    <p key={index}>{reason}</p>
                  ))}
                </div>
              )}

              <button
                className="phase-popup__button"
                onClick={() => setCardScoringPopup(null)}
              >
                Continue
              </button>
            </>
          )}
        </AnimatedModal>

        <AnimatedModal
          isOpen={Boolean(modeChangePopup)}
          onClose={() => setModeChangePopup(null)}
          backdropClassName="phase-popup__backdrop"
          panelClassName="phase-popup phase-popup--compact"
        >
          {modeChangePopup && (
            <>
              <div className="phase-popup__eyebrow">Production Card</div>
              <h2 className="phase-popup__title">Farming Mode Changed</h2>
              <div className="phase-popup__reasons">
                <p>
                  The selected production card changed the farming mode from{" "}
                  <strong>{modeChangePopup.from}</strong> to{" "}
                  <strong>{modeChangePopup.to}</strong>.
                </p>
              </div>
              <button
                className="phase-popup__button"
                onClick={() => setModeChangePopup(null)}
              >
                Continue
              </button>
            </>
          )}
        </AnimatedModal>

        <AnimatedModal
          isOpen={Boolean(errorPopup)}
          onClose={() => setErrorPopup("")}
          backdropClassName="phase-popup__backdrop"
          panelClassName="phase-popup phase-popup--compact"
        >
          {errorPopup && (
            <>
              <div className="phase-popup__eyebrow">Action Blocked</div>
              <h2 className="phase-popup__title">Cannot complete purchase</h2>
              <div className="phase-popup__reasons">
                <p>{errorPopup}</p>
              </div>
              <button
                className="phase-popup__button"
                onClick={() => setErrorPopup("")}
              >
                Close
              </button>
            </>
          )}
        </AnimatedModal>

        <div className="game-layout">
          <div className="board-col">
            <BoardLayout
              gameState={gameState}
              animationPhase={animationPhase}
            />

            {gameState.currentPhase === "INVEST" && (
              <div className="full-width">
                <InvestmentPanel
                  phase={gameState.currentPhase}
                  money={gameState.money}
                  onBuySeedling={() => buy("BUY_SEEDLING")}
                  onBuyPreGrown={() => buy("BUY_PRE_GROWN_TREE")}
                  onBuyCrate={() => buy("BUY_CRATE")}
                  onBuyStand={() => buy("BUY_SALES_STAND")}
                />
              </div>
            )}
          </div>

          <aside className="sidebar">
            <motion.div
              className="panel panel--soft"
              key={`controls-${gameState.currentPhase}`}
              initial={reduceMotion ? false : { opacity: 0.9, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.26, ease: "easeOut" }}
            >
              <div className="panel__eyebrow">Next Move</div>
              <Controls
                phase={gameState.currentPhase}
                onNextPhase={handleNextPhase}
                buttonLabel={`Continue to ${getNextPhaseLabel(gameState.currentPhase)}`}
                statusText={controlsStatusText}
                disableNextPhase={controlsDisabled}
              />
            </motion.div>

            <motion.div
              className="panel panel--soft score-panel"
              initial={reduceMotion ? false : { opacity: 0.9, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
            >
              <ScoreBoard
                score={gameState.scoreTrack}
                money={gameState.money}
                currentSaleBonusPerApple={gameState.currentSaleBonusPerApple}
                waterManagementPenalty={
                  gameState.productionCardCostModifiers?.LT_WATER_MANAGEMENT_31 ||
                  gameState.productionCardCostModifiers?.LT_WATER_MANAGEMENT_PRIVATE_WELL_32 ||
                  gameState.productionCardCostModifiers?.LT_WATER_MANAGEMENT_ECO_35 ||
                  0
                }
                shadeNetsPenalty={
                  gameState.productionCardCostModifiers?.ST_USE_SHADE_NETS ?? 0
                }
              />
            </motion.div>
          </aside>
        </div>

        <div className="full-width">
          <ActiveCardsPanel
            activeCards={activeProductionCards}
            currentRound={gameState.currentRound}
          />
        </div>

        <div className="full-width">
          <Market
            market={market}
            mode={gameState.farmingMode}
            canBuy={gameState.currentPhase === "INVEST"}
            onBuy={handleBuyProductionCard}
          />
        </div>

        <GameHelpModal
          isOpen={isHelpModalOpen}
          guide={guide}
          isLoading={guideLoading}
          error={guideError}
          onClose={closeGuideModal}
          onRetry={loadGuide}
          currentPhase={gameState.currentPhase}
          isWelcome={isWelcomeHelp}
        />
      </div>
    </div>
  );
}
