import { motion } from "framer-motion";
import "./StartScreen.css";

export default function StartScreen({ onPlay }) {
  return (
    <div className="start-container">
      <motion.div
        className="start-card"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🍎 Apfelkomplott
        </motion.h1>

        <motion.button
          className="play-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlay}
        >
          ▶ Play
        </motion.button>
      </motion.div>
    </div>
  );
}
