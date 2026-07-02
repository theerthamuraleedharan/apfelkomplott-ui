import { motion as Motion } from "framer-motion";
import "./ModeSelection.css";

const modeCards = [
  {
    id: "CONVENTIONAL",
    className: "mode-card mode-card--conventional",
    eyebrow: "Productivity First",
    title: "Conventional",
    summary:
      "Favor stronger short-term output and faster scaling across the orchard.",
    traits: [
      "Higher production potential",
      "More aggressive operational strategy",
      "Greater environmental pressure",
    ],
  },
  {
    id: "ORGANIC",
    className: "mode-card mode-card--organic",
    eyebrow: "Sustainability First",
    title: "Organic",
    summary:
      "Prioritize ecological balance and long-term resilience in orchard management.",
    traits: [
      "Lower initial yield",
      "Stronger sustainability alignment",
      "Health and environment oriented decisions",
    ],
  },
];

/**
 * Screen for choosing the initial farming strategy.
 *
 * The selected mode determines the backend game setup and influences available
 * production decisions. While the backend starts the game, the component shows a
 * loading overlay and disables further mode changes.
 *
 * @component
 * @param {object} props - Component props.
 * @param {function(string): void} props.onSelect - Called with the selected
 * farming mode identifier.
 * @param {Function} props.onBack - Callback for returning to the previous
 * screen.
 * @param {boolean} [props.isLoading=false] - Whether game creation is in
 * progress.
 * @returns {JSX.Element} Mode-selection interface.
 */
export default function ModeSelection({ onSelect, onBack, isLoading = false }) {
  return (
    <div className="mode-page">
      <div className="mode-page__backdrop" />

      {isLoading && (
        <div className="mode-page__loadingOverlay" role="status" aria-live="polite">
          <div className="mode-page__loadingCard">
            <div className="mode-page__spinner" aria-hidden="true" />
            <h2 className="mode-page__loadingTitle">Preparing the orchard</h2>
            <p className="mode-page__loadingText">
              The game board is loading. This can take a few seconds.
            </p>
          </div>
        </div>
      )}

      <button className="mode-page__back" onClick={onBack} disabled={isLoading}>
        Back
      </button>

      <Motion.div
        className="mode-page__hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <div className="mode-page__eyebrow">Strategy Selection</div>
        <h1 className="mode-page__title">Choose the orchard model you want to test.</h1>
        <p className="mode-page__subtitle">
          Choose a strategy for your apple plantation: organic or conventional farming. 
          This choice affects the available production options and decisions. 
          You can change the strategy later in the game by converting the plantation to a different farming mode.
        </p>
      </Motion.div>

      <div className="mode-grid">
        {modeCards.map((mode, index) => (
          <Motion.button
            key={mode.id}
            type="button"
            className={mode.className}
            disabled={isLoading}
            onClick={() => onSelect(mode.id)}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.12, duration: 0.55 }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.985 }}
          >
            <div className="mode-card__eyebrow">{mode.eyebrow}</div>
            <h2 className="mode-card__title">{mode.title}</h2>
            <p className="mode-card__summary">{mode.summary}</p>

            <div className="mode-card__sectionLabel">Key Characteristics</div>
            <div className="mode-card__traits">
              {mode.traits.map((trait) => (
                <div key={trait} className="mode-card__trait">
                  {trait}
                </div>
              ))}
            </div>

            <div className="mode-card__footer">
              <span>{isLoading ? "Loading..." : "Select Mode"}</span>
            </div>
          </Motion.button>
        ))}
      </div>
    </div>
  );
}
