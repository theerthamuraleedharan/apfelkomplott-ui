import { motion as Motion } from "framer-motion";
import "./StartScreen.css";

const highlights = [
  "Strategic orchard management",
  "Organic vs. Conventional",
  "Research-focused game prototype",
];

/**
 * Landing screen for the Apfelkomplott prototype.
 *
 * The page introduces the research prototype and gives the player a single
 * entry point into the mode-selection flow. Motion is used to present the
 * title, summary, and thesis-relevant simulation metrics.
 *
 * @component
 * @param {object} props - Component props.
 * @param {Function} props.onPlay - Callback fired when the player starts the
 * experience.
 * @returns {JSX.Element} Animated start screen for the game.
 */
export default function StartScreen({ onPlay }) {
  return (
    <div className="start-screen">
      <div className="start-screen__backdrop" />

      <Motion.div
        className="start-screen__content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >

        <Motion.h1
          className="start-screen__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Apfelkomplott
        </Motion.h1>

        <Motion.p
          className="start-screen__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          An interactive orchard strategy experience exploring production,
          sustainability, and decision-making in a digital board game format.
        </Motion.p>

        <Motion.div
          className="start-screen__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <button className="start-screen__primary" onClick={onPlay}>
            Start Experience
          </button>
          <div className="start-screen__supporting">
            {/* Thesis presentation prototype for browser-based play */}
          </div>
        </Motion.div>

        <Motion.div
          className="start-screen__highlights"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          {highlights.map((item) => (
            <div key={item} className="start-screen__highlight">
              {item}
            </div>
          ))}
        </Motion.div>
      </Motion.div>

      <Motion.div
        className="start-screen__panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
      >
        <div className="start-screen__panelInner">
          <div className="start-screen__panelLabel">Simulation Focus</div>
          <h2>Manage the orchard across multiple rounds and competing priorities.</h2>
          <p>
            The players work together to build an apple orchard and are 
            required to consider ecological, economic and health aspects.
          </p>

          <div className="start-screen__metrics">
            <div>
              <strong>15</strong>
              <span>Rounds</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Farming Modes</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Core Impact Scores</span>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}
