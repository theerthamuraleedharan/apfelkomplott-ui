import { motion as Motion } from "framer-motion";

import BoardLayout from "../../components/BoardLayout";
import Controls from "../../components/Controls";
import InvestmentPanel from "../../components/InvestmentPanel";
import Market from "../../components/Market";
import ScoreBoard from "../../components/ScoreBoard";

export default function GameMainLayout({
  activeProductionCards,
  controls,
  gameState,
  market,
  reduceMotion,
  shouldSpotlightNextMove,
  onBuyInvestment,
  onBuyProductionCard,
}) {
  return (
    <>
      <div className={`game-layout${shouldSpotlightNextMove ? " game-layout--spotlight" : ""}`}>
        {shouldSpotlightNextMove ? (
          <div className="game-layout__spotlightMask" aria-hidden="true" />
        ) : null}

        <div className="board-col">
          <BoardLayout
            gameState={gameState}
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
                onBuySeedling={() => onBuyInvestment("BUY_SEEDLING")}
                onBuyPreGrown={() => onBuyInvestment("BUY_PRE_GROWN_TREE")}
                onBuyCrate={() => onBuyInvestment("BUY_CRATE")}
                onBuyStand={() => onBuyInvestment("BUY_SALES_STAND")}
              />
            </div>
          )}
        </div>

        <aside className="sidebar">
          <Motion.div
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
              onNextPhase={controls.onNextPhase}
              buttonLabel={controls.buttonLabel}
              statusText={controls.statusText}
              disableNextPhase={controls.disabled}
              spotlight={shouldSpotlightNextMove}
              headline={controls.headline}
              hint={controls.hint}
            />
          </Motion.div>

          <Motion.div
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
          </Motion.div>
        </aside>
      </div>

      <div
        id="production-card-market"
        className={`full-width${gameState.currentPhase === "INVEST" ? " invest-phase__section invest-phase__section--cards" : ""}`}
      >
        <Market
          market={market}
          mode={gameState.farmingMode}
          money={gameState.money}
          canBuy={gameState.currentPhase === "INVEST"}
          onBuy={onBuyProductionCard}
        />
      </div>
    </>
  );
}
