import { useEffect, useState } from "react";
import "./GamePage.css";

import {
  getGameState,
  nextPhase,
  getMarket,
  getActiveProductionCards,
  buyInvestment,
  buyProductionCard,
} from "../api/gameApi";

import BoardLayout from "../components/BoardLayout";
import ActiveCardsPanel from "../components/ActiveCardsPanel";
import Market from "../components/Market";
import ScoreBoard from "../components/ScoreBoard";
import Controls from "../components/Controls";
import InvestmentPanel from "../components/InvestmentPanel";
import GameOverModal from "../components/GameOverModal";
import EventCard from "../components/EventCard";
import PhaseProgressBar from "../components/PhaseProgressBar";

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

export default function GamePage({ onRestart }) {
  const [gameState, setGameState] = useState(null);
  const [market, setMarket] = useState([]);
  const [activeProductionCards, setActiveProductionCards] = useState([]);
  const [eventVisible, setEventVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(null);
  const [cardScoringPopup, setCardScoringPopup] = useState(null);
  const [modeChangePopup, setModeChangePopup] = useState(null);

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
    if (gameState?.currentPhase === "DRAW_EVENT") {
      setEventVisible(true);
    }
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

  async function buy(type) {
    try {
      await buyInvestment(type);
      const updated = await getGameState();
      setGameState(updated);
    } catch (err) {
      alert(err.message);
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
        alert(result.reasons.join("\n"));
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
      alert(err.message);
      await refreshGame();
    }
  }

  if (!gameState) return <div className="game-loading">Loading game...</div>;

  return (
    <div className="game-root">
      <div className="game-shell">
        <GameOverModal gameState={gameState} onRestart={onRestart} />

        <header className="game-hero">
          <div className="game-hero__copy">
            <p className="game-kicker">Orchard Strategy Board</p>
            <h1 className="game-title">Apfelkomplott</h1>
            <p className="game-subtitle">
              Guide your orchard through shifting seasons, production choices, and
              careful investments while balancing economy, environment, and health.
            </p>
          </div>

          <div className="game-hero__meta">
            <div className="hero-chip">
              <span className="hero-chip__label">Mode</span>
              <strong>{gameState.farmingMode}</strong>
            </div>
            <div className="hero-chip">
              <span className="hero-chip__label">Round</span>
              <strong>{gameState.currentRound}</strong>
            </div>
            <div className="hero-chip">
              <span className="hero-chip__label">Phase</span>
              <strong>{gameState.currentPhase.replaceAll("_", " ")}</strong>
            </div>
          </div>
        </header>

        <PhaseProgressBar
          currentPhase={gameState.currentPhase}
          round={gameState.currentRound}
        />

        {eventVisible && gameState.activeEvents.length > 0 && (
          <EventCard
            event={gameState.activeEvents[0]}
            onContinue={() => setEventVisible(false)}
          />
        )}

        {cardScoringPopup && (
          <div
            className="phase-popup__backdrop"
            onClick={() => setCardScoringPopup(null)}
          >
            <div
              className="phase-popup"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
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
            </div>
          </div>
        )}

        {modeChangePopup && (
          <div
            className="phase-popup__backdrop"
            onClick={() => setModeChangePopup(null)}
          >
            <div
              className="phase-popup phase-popup--compact"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
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
            </div>
          </div>
        )}

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
            <div className="panel panel--soft score-panel">
              <ScoreBoard score={gameState.scoreTrack} money={gameState.money} />
            </div>

            <div className="panel panel--soft">
              <div className="panel__eyebrow">Turn Controls</div>
              <Controls
                phase={gameState.currentPhase}
                mode={gameState.farmingMode}
                onNextPhase={handleNextPhase}
              />
            </div>
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
      </div>
    </div>
  );
}
