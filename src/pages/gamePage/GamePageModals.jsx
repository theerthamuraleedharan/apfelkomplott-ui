import AnimatedModal from "../../components/AnimatedModal";

export default function GamePageModals({
  cardScoringPopup,
  errorPopup,
  gameState,
  isEarlyFlowPromptOpen,
  isInvestPromptOpen,
  modeChangePopup,
  quietPhasePopup,
  onCloseCardScoring,
  onCloseEarlyFlow,
  onCloseError,
  onCloseInvestPrompt,
  onCloseModeChange,
  onCloseQuietPhase,
  onFocusInvestSection,
}) {
  return (
    <>
      <AnimatedModal
        isOpen={isEarlyFlowPromptOpen}
        onClose={onCloseEarlyFlow}
        backdropClassName="phase-popup__backdrop"
        panelClassName="phase-popup"
      >
        <div className="phase-popup__eyebrow">Early Rounds</div>
        <h2 className="phase-popup__title">Why does the board look quiet at first?</h2>
        <div className="phase-popup__reasons">
          <p>
            The first rounds are setup rounds, as trees only produce apples after
            reaching field 3.
          </p>
          <p>
            Apples move step by step through the plantation: harvested during the
            harvest phase, moved to transport during delivery, placed in the sales
            area during sales, and finally sold in the sell phase.
          </p>
          <p>
            Early rounds should focus on buying trees, crates, and sales stands to
            prepare for later production.
          </p>
        </div>
        <button className="phase-popup__button" onClick={onCloseEarlyFlow}>
          I understand
        </button>
      </AnimatedModal>

      <AnimatedModal
        isOpen={Boolean(quietPhasePopup)}
        onClose={onCloseQuietPhase}
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
                onClick={onCloseQuietPhase}
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

            <button className="phase-popup__button" onClick={onCloseQuietPhase}>
              I understand
            </button>
          </>
        )}
      </AnimatedModal>

      <AnimatedModal
        isOpen={Boolean(cardScoringPopup)}
        onClose={onCloseCardScoring}
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

            <button className="phase-popup__button" onClick={onCloseCardScoring}>
              Continue
            </button>
          </>
        )}
      </AnimatedModal>

      <AnimatedModal
        isOpen={Boolean(modeChangePopup)}
        onClose={onCloseModeChange}
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
            <button className="phase-popup__button" onClick={onCloseModeChange}>
              Continue
            </button>
          </>
        )}
      </AnimatedModal>

      <AnimatedModal
        isOpen={Boolean(errorPopup)}
        onClose={onCloseError}
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
            <button className="phase-popup__button" onClick={onCloseError}>
              Close
            </button>
          </>
        )}
      </AnimatedModal>

      <AnimatedModal
        isOpen={isInvestPromptOpen}
        onClose={onCloseInvestPrompt}
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
            onClick={onCloseInvestPrompt}
            aria-label="Close investment popup"
          >
            x
          </button>
        </div>

        <div className="phase-popup__reasons">
          <p>This is the main buying round before the game moves on.</p>
          <p>
            Spend your <strong>{gameState.money} money</strong> across both kinds
            of investments: orchard upgrades and production cards.
          </p>
        </div>

        <div className="phase-popup__choiceGrid">
          <button
            type="button"
            className="phase-popup__choiceCard"
            onClick={() => {
              onCloseInvestPrompt();
              onFocusInvestSection("farm-investments");
            }}
          >
            <div className="phase-popup__choiceEyebrow">Basic Upgrades</div>
            <div className="phase-popup__choiceTitle">Farm Investments</div>
            <p className="phase-popup__choiceText">
              Buy seedlings, trees, crates, and sales stands to improve the
              orchard flow.
            </p>
          </button>

          <button
            type="button"
            className="phase-popup__choiceCard phase-popup__choiceCard--accent"
            onClick={() => {
              onCloseInvestPrompt();
              onFocusInvestSection("production-card-market");
            }}
          >
            <div className="phase-popup__choiceEyebrow">Special Upgrades</div>
            <div className="phase-popup__choiceTitle">Production Cards</div>
            <p className="phase-popup__choiceText">
              Inspect these too. They can create stronger long-term effects than
              basic upgrades.
            </p>
          </button>
        </div>
      </AnimatedModal>
    </>
  );
}
