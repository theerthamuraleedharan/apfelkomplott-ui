import { useEffect, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
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

import GameOverModal from "../components/GameOverModal";
import EventCard, { EventDrawModal } from "../components/EventCard";
import PhaseProgressBar from "../components/PhaseProgressBar";
import GameHelpModal from "../components/GameHelpModal";
import { PHASE_LABELS } from "../constants/phases";
import GameHeader from "./gamePage/GameHeader";
import GameMainLayout from "./gamePage/GameMainLayout";
import GamePageModals from "./gamePage/GamePageModals";
import {
  buildMarketSlots,
  delay,
  getHelpModalPreference,
  getNextPhaseLabel,
  getQuietPhasePopup,
  mergeEventResults,
  setHelpModalPreference,
} from "./gamePage/gamePageUtils";
import { completeProductionCardPurchase } from "./gamePage/productionCardPurchase";
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

/**
 * Main screen for the Apfelkomplott game round.
 *
 * `GamePage` coordinates the complete playable React interface: it loads the
 * current backend state, displays the board, market, score, phase controls,
 * event choices, help content, and explanatory modals. It also mediates all
 * state-changing player actions, such as advancing phases, selecting event
 * cards, buying farm investments, and purchasing production cards.
 *
 * Important behavior:
 * - Synchronizes backend state, active production cards, and market slots after
 *   actions so the board and card market stay consistent.
 * - Preserves market slot positions outside refill phases to reduce visual
 *   reorientation for the player.
 * - Blocks phase advancement while mandatory event choices or event reveals are
 *   unresolved.
 * - Shows onboarding, investment, quiet-phase, scoring, error, and farming-mode
 *   modals at the moments where they explain game rules or backend results.
 * - Respects reduced-motion preferences and stores the local sound/help
 *   preferences in browser storage.
 *
 * @component
 * @param {object} props - Component props.
 * @param {Function} props.onRestart - Callback invoked by the game-over modal
 * when the player chooses to restart the game.
 * @returns {JSX.Element} The complete game page, or a loading state before the
 * first game-state snapshot has been fetched.
 */
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
  const [pendingInvestmentType, setPendingInvestmentType] = useState(null);
  const [pendingProductionCardIds, setPendingProductionCardIds] = useState(
    () => new Set()
  );
  const [isEarlyFlowPromptOpen, setIsEarlyFlowPromptOpen] = useState(false);
  const [quietPhasePopup, setQuietPhasePopup] = useState(null);
  const hasCheckedWelcomeHelpRef = useRef(false);
  const lastInvestPromptRef = useRef("");
  const hasShownEarlyFlowPromptRef = useRef(false);
  const shownQuietPhasePopupsRef = useRef(new Set());
  const lastGameOverSoundRef = useRef("");
  const investmentRequestRef = useRef(false);
  const pendingProductionCardIdsRef = useRef(new Set());
  const deferInvestPromptRef = useRef(false);

  /**
   * Shows a user-facing error modal and plays the matching feedback sound.
   *
   * @param {string} message - Error text returned by backend validation or API
   * failures.
   * @returns {void}
   */
  function showErrorPopup(message) {
    if (!message) return;
    playError();
    setErrorPopup(message);
  }

  /**
   * Opens the regular help dialog from the header help button.
   *
   * @returns {void}
   */
  function openGuideModal() {
    setIsWelcomeHelp(false);
    setIsHelpModalOpen(true);
  }

  /**
   * Closes the help dialog and stores the welcome dismissal when necessary.
   *
   * @returns {void}
   */
  function closeGuideModal() {
    if (isWelcomeHelp) {
      setHelpModalPreference();
      setIsWelcomeHelp(false);
    }

    setIsHelpModalOpen(false);
  }

  /**
   * Scrolls the player to a specific investment area from the Invest prompt.
   *
   * @param {string} sectionId - DOM id of the target investment section.
   * @returns {void}
   */
  function focusInvestSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  /**
   * Toggles sound effects and persists the preference for future sessions.
   *
   * @returns {void}
   */
  function handleSoundToggle() {
    const nextValue = !isSoundEnabled;
    setIsSoundEnabled(nextValue);
    storeSoundEnabledPreference(nextValue);

    if (nextValue) {
      playUiClick();
    }
  }

  /**
   * Loads the textual game guide used by the help modal.
   *
   * @returns {Promise<void>} Resolves after the guide request finishes.
   */
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

  /**
   * Loads the three event-card options that must be chosen in DRAW_EVENT.
   *
   * @returns {Promise<void>} Resolves after event options have been loaded or an
   * error has been shown.
   */
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

  /**
   * Fetches and arranges the card market for the current phase.
   *
   * Refill phases retry briefly because backend state can lag behind the phase
   * transition. Other phases preserve previous card positions when possible.
   *
   * @param {string} phase - Phase used to decide whether slots should refill.
   * @param {Array<object|null>} [previousSlots=[]] - Existing market slots.
   * @returns {Promise<Array<object|null>>} Market slots ready for rendering.
   */
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

  /**
   * Refreshes the main game data required by this page.
   *
   * The function fetches the backend game state, active production cards, and
   * visible market cards, then updates React state in one place so the rendered
   * board remains consistent after player actions.
   *
   * @param {object} [options] - Refresh options.
   * @param {boolean} [options.preserveSlots=true] - Whether existing market
   * slot positions should be reused.
   * @returns {Promise<object>} Latest game state returned by the backend.
   */
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

    if (deferInvestPromptRef.current) return;

    const investPromptKey = `${gameState.currentRound}-${gameState.currentPhase}`;
    if (lastInvestPromptRef.current === investPromptKey) return;

    lastInvestPromptRef.current = investPromptKey;
    setIsInvestPromptOpen(true);
  }, [gameState]);

  /**
   * Advances the game to the next backend phase and refreshes dependent UI data.
   *
   * Production-card scoring results are shown immediately after the transition
   * so score changes are explained before the player continues.
   *
   * @returns {Promise<void>} Resolves after the next phase, active cards, and
   * market have been synchronized.
   */
  async function handleNextPhase() {
    playUiClick();
    let updated = await nextPhase();

    // Intermediate scoring is resolved when that backend phase is completed.
    // Complete it immediately so the score appears from the button that enters
    // scoring, rather than requiring a second "Continue to Invest" click.
    if (updated.currentPhase === "INTERMEDIATE_SCORING") {
      updated = await nextPhase();
    }

    if (updated.productionCardFinalScoreResult?.reasons?.length > 0) {
      setCardScoringPopup(updated.productionCardFinalScoreResult);
    }

    playPhaseAdvance();

    if (updated.currentPhase === "INVEST") {
      const investPromptKey = `${updated.currentRound}-${updated.currentPhase}`;
      lastInvestPromptRef.current = investPromptKey;
      const score = updated.lastScoreResult;
      const hasScoreResult =
        score &&
        (score.economyChange !== 0 ||
          score.environmentChange !== 0 ||
          score.healthChange !== 0 ||
          (score.reasons?.length ?? 0) > 0);

      deferInvestPromptRef.current = Boolean(hasScoreResult);
      setIsInvestPromptOpen(!hasScoreResult);
    }

    setGameState(updated);
    const activeCards = await getActiveProductionCards();
    setActiveProductionCards(Array.isArray(activeCards) ? activeCards : []);
    setMarket((prev) => prev);
    const currentMarket = await fetchMarketForPhase(updated.currentPhase, market);
    setMarket(currentMarket);
  }

  /**
   * Submits the selected event option and displays the revealed event card.
   *
   * @param {number} optionIndex - Index of the event option selected by the
   * player in the draw modal.
   * @returns {Promise<void>} Resolves after the selection is processed and the
   * game state is refreshed.
   */
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

  /**
   * Purchases a basic farm investment through the backend.
   *
   * @param {string} type - Backend investment action identifier.
   * @returns {Promise<boolean>} True when the purchase succeeds, false when the
   * backend rejects it.
   */
  async function buy(type) {
    if (investmentRequestRef.current) return false;

    investmentRequestRef.current = true;
    setPendingInvestmentType(type);

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
    } finally {
      investmentRequestRef.current = false;
      setPendingInvestmentType(null);
    }
  }

  /**
   * Purchases a production card and reconciles visual market state afterwards.
   *
   * The selected slot is cleared optimistically while the backend confirms the
   * purchase. If the card changes the farming mode, a modal explains the change
   * after the refreshed state is available.
   *
   * @param {string} cardId - Identifier of the production card to buy.
   * @returns {Promise<void>} Resolves after purchase handling and refresh.
   */
  async function handleBuyProductionCard(cardId) {
    if (!cardId || pendingProductionCardIdsRef.current.has(cardId)) return;

    const previousMode = gameState?.farmingMode ?? null;
    const cardExists = market.some((card) => card?.id === cardId);
    if (!cardExists) return;

    pendingProductionCardIdsRef.current.add(cardId);
    setPendingProductionCardIds(
      new Set(pendingProductionCardIdsRef.current)
    );

    try {
      playUiClick();
      const updatedState = await completeProductionCardPurchase({
        cardId,
        buyCard: buyProductionCard,
        refreshGame,
        showEffects: setCardScoringPopup,
      });
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
    } finally {
      pendingProductionCardIdsRef.current.delete(cardId);
      setPendingProductionCardIds(
        new Set(pendingProductionCardIdsRef.current)
      );
    }
  }

  if (!gameState) return <div className="game-loading">Loading game...</div>;

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

        <GameHeader
          gameState={gameState}
          reduceMotion={reduceMotion}
          isSoundEnabled={isSoundEnabled}
          onHelpClick={openGuideModal}
          onSoundToggle={handleSoundToggle}
        />

        <Motion.div
          key={`phase-bar-${gameState.currentPhase}`}
          initial={reduceMotion ? false : { opacity: 0.8, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        >
          <PhaseProgressBar
            currentPhase={gameState.currentPhase}
            round={gameState.currentRound}
          />
        </Motion.div>

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

        <GamePageModals
          cardScoringPopup={cardScoringPopup}
          errorPopup={errorPopup}
          gameState={gameState}
          isEarlyFlowPromptOpen={isEarlyFlowPromptOpen}
          isInvestPromptOpen={isInvestPromptOpen}
          modeChangePopup={modeChangePopup}
          quietPhasePopup={quietPhasePopup}
          onCloseCardScoring={() => setCardScoringPopup(null)}
          onCloseEarlyFlow={() => setIsEarlyFlowPromptOpen(false)}
          onCloseError={() => setErrorPopup("")}
          onCloseInvestPrompt={() => setIsInvestPromptOpen(false)}
          onCloseModeChange={() => setModeChangePopup(null)}
          onCloseQuietPhase={() => setQuietPhasePopup(null)}
          onFocusInvestSection={focusInvestSection}
        />

        <GameMainLayout
          activeProductionCards={activeProductionCards}
          controls={{
            buttonLabel: controlsButtonLabel,
            disabled: controlsDisabled,
            headline: controlsHeadline,
            hint: controlsHint,
            onNextPhase: handleControlsNext,
            statusText: controlsStatusText,
          }}
          gameState={gameState}
          market={market}
          reduceMotion={reduceMotion}
          shouldSpotlightNextMove={shouldSpotlightNextMove}
          onRoundScoreClose={() => {
            if (!deferInvestPromptRef.current) return;

            deferInvestPromptRef.current = false;
            setIsInvestPromptOpen(true);
          }}
          onBuyInvestment={buy}
          pendingInvestmentType={pendingInvestmentType}
          pendingProductionCardIds={pendingProductionCardIds}
          onBuyProductionCard={handleBuyProductionCard}
        />

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
