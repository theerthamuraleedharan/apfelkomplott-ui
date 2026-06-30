import { motion as Motion } from "framer-motion";

import HelpButton from "../../components/HelpButton";
import SoundToggleButton from "../../components/SoundToggleButton";

export default function GameHeader({
  gameState,
  reduceMotion,
  isSoundEnabled,
  onHelpClick,
  onSoundToggle,
}) {
  return (
    <Motion.header
      className="game-hero"
      key={`hero-${gameState.currentPhase}-${gameState.currentRound}`}
      initial={reduceMotion ? false : { opacity: 0.92, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.26, ease: "easeOut" }}
    >
      <div className="game-hero__copy">
        <p className="game-kicker">Orchard Strategy Board</p>
        <h1 className="game-title">Apfelkomplott</h1>
      </div>

      <div className="game-hero__meta">
        <Motion.div
          className="hero-chip"
          animate={
            reduceMotion
              ? undefined
              : gameState.currentPhase
                ? { scale: [1, 1.02, 1] }
                : undefined
          }
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <span className="hero-chip__label">Mode</span>
          <strong>{gameState.farmingMode}</strong>
        </Motion.div>
        <Motion.div className="hero-chip" layout>
          <span className="hero-chip__label">Round</span>
          <strong>{gameState.currentRound}</strong>
        </Motion.div>
        <Motion.div
          className="hero-chip hero-chip--phase"
          key={gameState.currentPhase}
          initial={reduceMotion ? false : { opacity: 0.6, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
        >
          <span className="hero-chip__label">Phase</span>
          <strong>{gameState.currentPhase.replaceAll("_", " ")}</strong>
        </Motion.div>
        <Motion.div className="hero-chip game-help-chip" layout>
          <HelpButton onClick={onHelpClick} />
        </Motion.div>
        <Motion.div className="hero-chip game-sound-chip" layout>
          <SoundToggleButton enabled={isSoundEnabled} onToggle={onSoundToggle} />
        </Motion.div>
      </div>
    </Motion.header>
  );
}
