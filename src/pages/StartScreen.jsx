import { motion } from "framer-motion";
import "./StartScreen.css";

const highlights = [
  "Strategic orchard management",
  "Organic vs. Conventional",
  "Research-focused game prototype",
];

export default function StartScreen({ onPlay }) {
  return (
    <div className="start-screen">
      <div className="start-screen__backdrop" />

      <motion.div
        className="start-screen__content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >

        <motion.h1
          className="start-screen__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Apfelkomplott
        </motion.h1>

        <motion.p
          className="start-screen__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          An interactive orchard strategy experience exploring production,
          sustainability, and decision-making in a digital board game format.
        </motion.p>

        <motion.div
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
        </motion.div>

        <motion.div
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
        </motion.div>
      </motion.div>

      <motion.div
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
      </motion.div>
    </div>
  );
}
