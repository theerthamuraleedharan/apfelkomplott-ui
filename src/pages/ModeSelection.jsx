import { motion } from "framer-motion";
import "./ModeSelection.css";

export default function ModeSelection({ onSelect }) {
  return (
    <div className="mode-container">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Choose Your Farming Strategy
      </motion.h2>

      <div className="mode-options">

        <motion.div
          className="mode-card"
          whileHover={{ scale: 1.05 }}
          onClick={() => onSelect("CONVENTIONAL")}
        >
          <h3>🌾 Conventional</h3>
          <p>Higher yield</p>
          <p>⚠ Environmental risk</p>
        </motion.div>

        <motion.div
          className="mode-card organic"
          whileHover={{ scale: 1.05 }}
          onClick={() => onSelect("ORGANIC")}
        >
          <h3>🌱 Organic</h3>
          <p>Lower yield</p>
          <p>🌍 Better sustainability</p>
        </motion.div>

      </div>
    </div>
  );
}
