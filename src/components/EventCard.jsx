import "./EventCard.css";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  formatSaleBonusMoneyLine,
  formatSaleBonusPerApple,
} from "../utils/saleBonus";
import { formatHarvestLossText } from "../utils/eventEffects";
import CardMedia from "./CardMedia";
import AnimatedModal from "./AnimatedModal";

export function EventDrawModal({
  options,
  isLoading,
  isSubmitting,
  error,
  onSelect,
  onRetry,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatedModal
      isOpen={true}
      onClose={() => {}}
      backdropClassName="event-popup__backdrop"
      panelClassName="event-popup event-popup--draw"
    >
        <h3 className="event-popup__eyebrow">Draw Event</h3>
        <h4 className="event-popup__title">Choose a face-down event card</h4>
        <p className="event-popup__description">
          Pick one hidden event to reveal the next twist in the round.
        </p>

        {options.length > 0 && (
          <div className="event-draw__grid">
            {options.map((option) => (
              <motion.button
                key={option.optionIndex}
                type="button"
                className="event-draw__card"
                onClick={() => onSelect(option.optionIndex)}
                disabled={isLoading || isSubmitting}
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.01 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.28,
                  ease: "easeOut",
                  delay: reduceMotion ? 0 : option.optionIndex * 0.06,
                }}
              >
                <span className="event-draw__badge">Face Down</span>
                <span className="event-draw__mark">?</span>
                <span className="event-draw__label">Event Card</span>
              </motion.button>
            ))}
          </div>
        )}

        {isLoading && <p className="event-popup__status">Loading event choices...</p>}
        {isSubmitting && <p className="event-popup__status">Revealing event...</p>}
        {!isLoading && !isSubmitting && error && (
          <div className="event-popup__effects event-popup__effects--centered">
            <p>{error}</p>
            <button className="event-popup__button" onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
    </AnimatedModal>
  );
}

export default function EventRevealModal({ event, onContinue }) {
  const reduceMotion = useReducedMotion();
  const hasSaleBonusIncrease = (event.saleBonusPerAppleChange ?? 0) > 0;
  const harvestLossText = formatHarvestLossText(event);
  const mediaItems = (event.media ?? []).filter(
    (item) => item && (item.src || item.value)
  );

  return (
    <AnimatedModal
      isOpen={true}
      onClose={onContinue}
      backdropClassName="event-popup__backdrop"
      panelClassName="event-popup"
    >
      <motion.div
        initial={reduceMotion ? false : { rotateY: 10, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <h3 className="event-popup__eyebrow">Event Card</h3>
        <h4 className="event-popup__title">{event.cardName}</h4>
        <p className="event-popup__description">{event.description}</p>

        {mediaItems.length > 0 && (
          <motion.div
            className="event-popup__media"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut", delay: 0.05 }}
          >
            {mediaItems.map((item, index) => (
              <div
                key={`${event.cardId ?? event.cardName}-media-${index}`}
                className={`event-popup__mediaItem event-popup__mediaItem--${item.type}`}
              >
                <CardMedia
                  item={item}
                  alt={item.type === "qr" ? `${event.cardName} QR` : event.cardName}
                />
              </div>
            ))}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
        {hasSaleBonusIncrease && (
          <motion.div
            className="event-popup__bonus"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            <p>
              New ongoing bonus:{" "}
              <strong>
                {formatSaleBonusMoneyLine(event.saleBonusPerAppleChange)}
              </strong>
            </p>
            <p>
              Current total sale bonus:{" "}
              <strong>
                {formatSaleBonusPerApple(event.resultingSaleBonusPerApple)}
              </strong>
            </p>
          </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
        {harvestLossText && (
          <motion.div
            className="event-popup__bonus event-popup__bonus--warning"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut", delay: 0.05 }}
          >
            <p>
              Upcoming harvest impact: <strong>{harvestLossText}</strong>
            </p>
          </motion.div>
        )}
        </AnimatePresence>

        {(event.effects ?? []).length > 0 && (
          <motion.div
            className="event-popup__effects"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut", delay: 0.08 }}
          >
            {(event.effects ?? []).map((effect, index) => (
              <p key={`${event.cardId ?? event.cardName}-${index}`}>{effect}</p>
            ))}
          </motion.div>
        )}

        <button className="event-popup__button" onClick={onContinue}>
          Continue
        </button>
      </motion.div>
    </AnimatedModal>
  );
}
