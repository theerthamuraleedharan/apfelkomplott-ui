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
import SoundToggleButton from "../components/SoundToggleButton";
import { PHASE_LABELS, PHASE_ORDER } from "../constants/phases";
import {
  isSoundEnabled as getSoundEnabledPreference,
  playCardReveal,
  playError,
  playGameLoss,
  playGameWin,
  playPhaseAdvance,
  playRotation,
  playSuccess,
  playUiClick,
  setSoundEnabled as storeSoundEnabledPreference,
} from "../utils/soundManager";

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

function getPhaseCoach(phase, gameState) {
  const round = gameState?.currentRound ?? 1;
  const crateCount = gameState?.plantation?.crates?.length ?? 0;
  const standCount = gameState?.plantation?.salesStands?.length ?? 0;

  if (phase === "HARVEST" && round < 3) {
    return {
      summary: "This is still a preview step in the opening rounds. Trees need time to mature before the first real harvest begins.",
      tip: "Keep investing in trees now so round 3 has enough apples to start the orchard flow.",
      urgency: "Preview step",
    };
  }

  if (phase === "DELIVER" && (round < 4 || crateCount === 0)) {
    return {
      summary:
        crateCount === 0
          ? "Delivery looks quiet because no transport crates exist yet. Apples need crates before they can move toward the market."
          : "Delivery is mostly a preview before round 4. Once harvest fills your crates, this step will move apples toward sales.",
      tip:
        crateCount === 0
          ? "Buy crates during Invest, and remember that the first harvest normally starts in round 3."
          : "Your crates are ready. Keep growing trees so future harvests give delivery something to move.",
      urgency: "Preview step",
    };
  }

  if (phase === "SELL" && (round < 5 || standCount === 0)) {
    return {
      summary:
        standCount === 0
          ? "Selling feels empty because no sales stands exist yet. Apples must be harvested, delivered, and placed on stands before money is earned."
          : "Selling usually stays quiet until round 5. Apples need to pass through harvest and delivery before this area becomes active.",
      tip:
        standCount === 0
          ? "Buy sales stands during Invest so the orchard can turn delivered apples into money later."
          : "Your stands are ready. Focus on trees, crates, and delivery capacity so later rounds reach the market.",
      urgency: "Preview step",
    };
  }

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

function getQuietPhasePopup(phase, gameState) {
  const plantation = gameState?.plantation;
  if (!plantation) return null;

  const round = gameState.currentRound ?? 1;
  const crateCount = plantation.crates?.length ?? 0;
  const standCount = plantation.salesStands?.length ?? 0;
  const matureTreeCount = (plantation.trees ?? []).filter(
    (tree) => tree.fieldPosition >= 3
  ).length;
  const applesInTransport = (plantation.apples ?? []).filter(
    (apple) => apple.location === "IN_TRANSPORT"
  ).length;
  const applesInSales = (plantation.apples ?? []).filter(
    (apple) => apple.location === "IN_SALES_STAND"
  ).length;

  if (phase === "HARVEST") {
    if (round < 3) {
      return {
        key: "harvest-preview",
        eyebrow: "Harvest Preview",
        title: "Nothing happens here yet",
        reasons: [
          `Round ${round} is still part of the orchard setup. Trees need time before they can produce apples.`,
          "The first real harvest normally starts in round 3, once trees have reached the producing fields.",
          "For now, focus on building your orchard so later harvest phases feel more active.",
        ],
      };
    }

    if (matureTreeCount === 0) {
      return {
        key: "harvest-no-mature-trees",
        eyebrow: "Harvest Result",
        title: "No apples were harvested",
        reasons: [
          "No trees are mature enough to produce apples right now.",
          "Trees only begin producing after they move into the later fields of the production disk.",
          "Keep investing in trees now so future harvest rounds can feed transport and sales.",
        ],
      };
    }
  }

  if (phase === "DELIVER") {
    if (round < 4) {
      return {
        key: "deliver-preview",
        eyebrow: "Delivery Preview",
        title: "Nothing is delivered yet",
        reasons: [
          `Round ${round} is still before the normal delivery stage.`,
          "Apples are usually harvested from round 3 onward and delivered from round 4 onward.",
          "This step is here to teach the full orchard flow before crates start filling up.",
        ],
      };
    }

    if (crateCount === 0) {
      return {
        key: "deliver-no-crates",
        eyebrow: "Delivery Result",
        title: "No transport happened",
        reasons: [
          "There are no transport crates yet, so apples cannot move toward the market.",
          "Buy crates during the Invest phase to unlock this part of the orchard flow.",
          "Once crates exist, harvested apples will appear here before moving to sales stands.",
        ],
      };
    }

    if (applesInTransport === 0) {
      return {
        key: "deliver-no-apples",
        eyebrow: "Delivery Result",
        title: "There was nothing to move",
        reasons: [
          "No apples are currently waiting in transport crates.",
          "This can happen when harvest has not produced enough apples yet, or when crates stayed empty.",
          "Keep building trees and transport capacity so later rounds have something to deliver.",
        ],
      };
    }
  }

  if (phase === "SELL") {
    if (round < 5) {
      return {
        key: "sell-preview",
        eyebrow: "Sales Preview",
        title: "Nothing is sold yet",
        reasons: [
          `Round ${round} is still before the normal selling stage.`,
          "Selling usually begins in round 5, after apples have been harvested and delivered.",
          "These early rounds are mainly for preparing trees, crates, and sales stands.",
        ],
      };
    }

    if (standCount === 0) {
      return {
        key: "sell-no-stands",
        eyebrow: "Sales Result",
        title: "No sales happened",
        reasons: [
          "There are no sales stands yet, so apples have nowhere to be sold from.",
          "Buy sales stands during the Invest phase to turn delivered apples into money.",
          "The full money loop is: harvest, deliver, then sell.",
        ],
      };
    }

    if (applesInSales === 0) {
      return {
        key: "sell-no-apples",
        eyebrow: "Sales Result",
        title: "There was nothing to sell",
        reasons: [
          "No apples are waiting on the sales stands right now.",
          "Apples must first be harvested and delivered before this step becomes active.",
          "This is normal in quieter rounds while the orchard is still developing.",
        ],
      };
    }
  }

  return null;
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
  const [isEventDrawModalOpen, setIsEventDrawModalOpen] = useState(false);
  const [revealedEvent, setRevealedEvent] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null);
  const [cardScoringPopup, setCardScoringPopup] = useState(null);
  const [modeChangePopup, setModeChangePopup] = useState(null);
  const [errorPopup, setErrorPopup] = useState("");
  const [guide, setGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [isSoundEnabled, setIsSoundEnabled] = useState(() =>
    getSoundEnabledPreference()
  );
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isWelcomeHelp, setIsWelcomeHelp] = useState(false);
  const [isInvestPromptOpen, setIsInvestPromptOpen] = useState(false);
  const [isEarlyFlowPromptOpen, setIsEarlyFlowPromptOpen] = useState(false);
  const [quietPhasePopup, setQuietPhasePopup] = useState(null);
  const hasCheckedWelcomeHelpRef = useRef(false);
  const lastInvestPromptRef = useRef("");
  const hasShownEarlyFlowPromptRef = useRef(false);
  const shownQuietPhasePopupsRef = useRef(new Set());
  const lastGameOverSoundRef = useRef("");

  function showErrorPopup(message) {
    if (!message) return;
    playError();
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

  function focusInvestSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function handleSoundToggle() {
    const nextValue = !isSoundEnabled;
    setIsSoundEnabled(nextValue);
    storeSoundEnabledPreference(nextValue);

    if (nextValue) {
      playUiClick();
    }
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
      setIsEventDrawModalOpen(true);
      loadEventOptions();
      return;
    }

    setIsEventDrawModalOpen(false);
    setEventOptions([]);
    setEventOptionsError("");
  }, [gameState?.currentPhase]);

  useEffect(() => {
    if (!gameState) return;

    if (
      gameState.currentPhase === "ROTATE" ||
      gameState.currentPhase === "HARVEST" ||
      gameState.currentPhase === "DELIVER" ||
      gameState.currentPhase === "SELL"
    ) {
      setAnimationPhase(gameState.currentPhase);

      const timer = setTimeout(() => {
        setAnimationPhase(null);
      }, gameState.currentPhase === "ROTATE" ? 1200 : 800);

      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPhase]);

  useEffect(() => {
    if (gameState?.currentPhase === "ROTATE") {
      playRotation();
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

  useEffect(() => {
    if (!gameState || hasShownEarlyFlowPromptRef.current || isHelpModalOpen) return;
    if (gameState.currentRound > 2) return;

    hasShownEarlyFlowPromptRef.current = true;
    setIsEarlyFlowPromptOpen(true);
  }, [gameState, isHelpModalOpen]);

  useEffect(() => {
    if (!gameState) return;
    if (isHelpModalOpen || isWelcomeHelp || isEarlyFlowPromptOpen) return;
    if (revealedEvent || eventSelectionLoading) return;

    const popup = getQuietPhasePopup(gameState.currentPhase, gameState);
    if (!popup) return;
    if (shownQuietPhasePopupsRef.current.has(popup.key)) return;

    shownQuietPhasePopupsRef.current.add(popup.key);
    setQuietPhasePopup(popup);
  }, [
    gameState,
    isHelpModalOpen,
    isWelcomeHelp,
    isEarlyFlowPromptOpen,
    revealedEvent,
    eventSelectionLoading,
  ]);

  useEffect(() => {
    if (!revealedEvent) return;
    playCardReveal();
  }, [revealedEvent]);

  useEffect(() => {
    if (!gameState?.gameOver) return;

    const resultKey = `${gameState.gameResult ?? "LOSS"}-${gameState.currentRound}`;
    if (lastGameOverSoundRef.current === resultKey) return;

    lastGameOverSoundRef.current = resultKey;
    if (gameState.gameResult === "WIN") {
      playGameWin();
      return;
    }

    playGameLoss();
  }, [gameState?.gameOver, gameState?.gameResult, gameState?.currentRound]);

  useEffect(() => {
    if (!gameState) return;

    if (gameState.currentPhase !== "INVEST") {
      setIsInvestPromptOpen(false);
      return;
    }

    const investPromptKey = `${gameState.currentRound}-${gameState.currentPhase}`;
    if (lastInvestPromptRef.current === investPromptKey) return;

    lastInvestPromptRef.current = investPromptKey;
    setIsInvestPromptOpen(true);
  }, [gameState]);

  async function handleNextPhase() {
    playUiClick();
    const updated = await nextPhase();

    if (updated.productionCardFinalScoreResult?.reasons?.length > 0) {
      setCardScoringPopup(updated.productionCardFinalScoreResult);
    }

    playPhaseAdvance();
    setGameState(updated);
    const activeCards = await getActiveProductionCards();
    setActiveProductionCards(Array.isArray(activeCards) ? activeCards : []);
    setMarket((prev) => prev);
    const currentMarket = await fetchMarketForPhase(updated.currentPhase, market);
    setMarket(currentMarket);
  }

  async function handleEventSelection(optionIndex) {
    playUiClick();
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
      playUiClick();
      await buyInvestment(type);
      const updated = await getGameState();
      playSuccess();
      setGameState(updated);
      return true;
    } catch (err) {
      // Backend owns investment rules, so business-rule failures show here as a user-facing popup.
      showErrorPopup(err.message);
      return false;
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
      playUiClick();
      const result = await buyProductionCard(cardId);

      if (result?.reasons?.length) {
        showErrorPopup(result.reasons.join("\n"));
      }

      const updatedState = await refreshGame();
      playSuccess();

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

  const phaseCoach = getPhaseCoach(gameState.currentPhase, gameState);
  const isEventChoiceHidden =
    gameState.currentPhase === "DRAW_EVENT" && !isEventDrawModalOpen;
  const controlsDisabled =
    (gameState.currentPhase === "DRAW_EVENT" && !isEventChoiceHidden) ||
    eventSelectionLoading ||
    Boolean(revealedEvent);
  const shouldSpotlightNextMove =
    !controlsDisabled &&
    gameState.currentPhase === "MOVE_MARKER" &&
    gameState.currentRound === 1;
  const controlsHeadline = shouldSpotlightNextMove
    ? `Start Round ${gameState.currentRound}`
    : isEventChoiceHidden
      ? "Continue to Draw Event"
    : "Ready for the next step?";
  const controlsHint = shouldSpotlightNextMove ? (
    <>
      This is the first action for the round. Click the button below to begin
      <strong>{` Round ${gameState.currentRound}`}</strong>.
    </>
  ) : isEventChoiceHidden ? (
    <>
      The event popup was closed. Reopen it with the <strong>Open Event Cards</strong> button above so you can choose the required event.
    </>
  ) : (
    <>
      Continue when you have finished the current <strong>{PHASE_LABELS[gameState.currentPhase]}</strong> actions.
    </>
  );
  const controlsButtonLabel = shouldSpotlightNextMove
    ? `Start Round ${gameState.currentRound}`
    : `Continue to ${getNextPhaseLabel(gameState.currentPhase)}`;
  const controlsStatusText =
    gameState.currentPhase === "DRAW_EVENT"
      ? isEventChoiceHidden
        ? "Reopen the event popup above and choose one event card to continue the round."
        : "Choose an event card in the popup to unlock the next step."
      : revealedEvent
        ? "Review the revealed event, then continue."
        : eventSelectionLoading
          ? "The selected event is being revealed."
          : `After this, the game will move to ${getNextPhaseLabel(gameState.currentPhase)}.`;
  const handleControlsNext = isEventChoiceHidden
    ? () => setIsEventDrawModalOpen(true)
    : handleNextPhase;

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
            {/* <p className="game-subtitle">
              Guide your orchard through shifting seasons, production choices, and
              careful investments while balancing economy, environment, and health.
            </p> */}
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
            <motion.div className="hero-chip game-sound-chip" layout>
              <SoundToggleButton
                enabled={isSoundEnabled}
                onToggle={handleSoundToggle}
              />
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

        {gameState.currentPhase === "DRAW_EVENT" && isEventDrawModalOpen && (
          <EventDrawModal
            options={eventOptions}
            isLoading={eventOptionsLoading}
            isSubmitting={eventSelectionLoading}
            error={eventOptionsError}
            onSelect={handleEventSelection}
            onRetry={loadEventOptions}
            onClose={() => setIsEventDrawModalOpen(false)}
          />
        )}

        {revealedEvent && (
          <EventCard
            event={revealedEvent}
            onContinue={() => setRevealedEvent(null)}
          />
        )}

        <AnimatedModal
          isOpen={isEarlyFlowPromptOpen}
          onClose={() => setIsEarlyFlowPromptOpen(false)}
          backdropClassName="phase-popup__backdrop"
          panelClassName="phase-popup"
        >
          <div className="phase-popup__eyebrow">Early Rounds</div>
          <h2 className="phase-popup__title">Why does the board look quiet at first?</h2>
          <div className="phase-popup__reasons">
            <p>
             The first rounds are setup rounds, as trees only produce apples after reaching 
             field 3.
             </p>
            <p>
             Apples move step by step through the plantation: harvested during the 
             harvest phase, moved to transport during delivery, 
             placed in the sales area during sales, 
             and finally sold in the sell phase. 
             </p>
             <p>
             Early rounds should focus on buying trees, crates, and sales stands to
              prepare for later production.
            </p>
          </div>
          <button
            className="phase-popup__button"
            onClick={() => setIsEarlyFlowPromptOpen(false)}
          >
            I understand
          </button>
        </AnimatedModal>

        <AnimatedModal
          isOpen={Boolean(quietPhasePopup)}
          onClose={() => setQuietPhasePopup(null)}
          backdropClassName="phase-popup__backdrop"
          panelClassName="phase-popup"
        >
          {quietPhasePopup && (
            <>
              <div className="phase-popup__topbar">
                <div>
                  <div className="phase-popup__eyebrow">{quietPhasePopup.eyebrow}</div>
                  <h2 className="phase-popup__title">{quietPhasePopup.title}</h2>
                </div>

                <button
                  type="button"
                  className="phase-popup__iconClose"
                  onClick={() => setQuietPhasePopup(null)}
                  aria-label="Close quiet phase explanation"
                >
                  x
                </button>
              </div>

              <div className="phase-popup__reasons">
                {quietPhasePopup.reasons.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}
              </div>

              <button
                className="phase-popup__button"
                onClick={() => setQuietPhasePopup(null)}
              >
                I understand
              </button>
            </>
          )}
        </AnimatedModal>

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

        <AnimatedModal
          isOpen={isInvestPromptOpen}
          onClose={() => setIsInvestPromptOpen(false)}
          backdropClassName="phase-popup__backdrop"
          panelClassName="phase-popup"
        >
          <div className="phase-popup__topbar">
            <div>
              <div className="phase-popup__eyebrow">Invest Phase</div>
              <h2 className="phase-popup__title">Do you want to buy something?</h2>
            </div>

            <button
              type="button"
              className="phase-popup__iconClose"
              onClick={() => setIsInvestPromptOpen(false)}
              aria-label="Close investment popup"
            >
              x
            </button>
          </div>

          <div className="phase-popup__reasons">
            <p>
              This is the main buying round before the game moves on.
            </p>
            <p>
              Spend your <strong>{gameState.money} money</strong> across both kinds of investments:
              orchard upgrades and production cards.
            </p>
          </div>

          <div className="phase-popup__choiceGrid">
            <button
              type="button"
              className="phase-popup__choiceCard"
              onClick={() => {
                setIsInvestPromptOpen(false);
                focusInvestSection("farm-investments");
              }}
            >
              <div className="phase-popup__choiceEyebrow">Basic Upgrades</div>
              <div className="phase-popup__choiceTitle">Farm Investments</div>
              <p className="phase-popup__choiceText">
                Buy seedlings, trees, crates, and sales stands to improve the orchard flow.
              </p>
            </button>

            <button
              type="button"
              className="phase-popup__choiceCard phase-popup__choiceCard--accent"
              onClick={() => {
                setIsInvestPromptOpen(false);
                focusInvestSection("production-card-market");
              }}
            >
              <div className="phase-popup__choiceEyebrow">Special Upgrades</div>
              <div className="phase-popup__choiceTitle">Production Cards</div>
              <p className="phase-popup__choiceText">
                Inspect these too. They can create stronger long-term effects than basic upgrades.
              </p>
            </button>
          </div>

          <button
            className="phase-popup__button phase-popup__button--secondary"
            onClick={() => setIsInvestPromptOpen(false)}
          >
            Ok
          </button>
        </AnimatedModal>

        <div className={`game-layout${shouldSpotlightNextMove ? " game-layout--spotlight" : ""}`}>
          {shouldSpotlightNextMove ? (
            <div className="game-layout__spotlightMask" aria-hidden="true" />
          ) : null}

          <div className="board-col">
            <BoardLayout
              gameState={gameState}
              animationPhase={animationPhase}
              activeProductionCards={activeProductionCards}
            />

            {gameState.currentPhase === "INVEST" && (
              <div
                id="farm-investments"
                className="full-width invest-phase__section invest-phase__section--farm"
              >
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
              className={`panel panel--soft${shouldSpotlightNextMove ? " panel--next-move" : ""}`}
              key={`controls-${gameState.currentPhase}`}
              initial={reduceMotion ? false : { opacity: 0.9, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.26, ease: "easeOut" }}
            >
              <div className="panel__eyebrow">
                {shouldSpotlightNextMove ? "Start Here" : "Next Move"}
              </div>
              <Controls
                phase={gameState.currentPhase}
                onNextPhase={handleControlsNext}
                buttonLabel={controlsButtonLabel}
                statusText={controlsStatusText}
                disableNextPhase={controlsDisabled}
                spotlight={shouldSpotlightNextMove}
                headline={controlsHeadline}
                hint={controlsHint}
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

        <div
          id="production-card-market"
          className={`full-width${gameState.currentPhase === "INVEST" ? " invest-phase__section invest-phase__section--cards" : ""}`}
        >
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
