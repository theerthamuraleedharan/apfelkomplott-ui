import { motion } from "framer-motion";
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

export default function ModeSelection({ onSelect, onBack }) {
  return (
    <div className="mode-page">
      <div className="mode-page__backdrop" />

      <button className="mode-page__back" onClick={onBack}>
        Back
      </button>

      <motion.div
        className="mode-page__hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <div className="mode-page__eyebrow">Strategy Selection</div>
        <h1 className="mode-page__title">Choose the orchard model you want to test.</h1>
        <p className="mode-page__subtitle">
          Each mode changes the balance between output, environmental impact,
          and long-term system behavior. Select the strategy that matches the
          scenario you want to explore.
        </p>
      </motion.div>

      <div className="mode-grid">
        {modeCards.map((mode, index) => (
          <motion.button
            key={mode.id}
            type="button"
            className={mode.className}
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
              <span>Select Mode</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
