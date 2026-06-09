import "./EventCard.css";
import { useState } from "react";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import {
  formatSaleBonusMoneyLine,
  formatSaleBonusPerApple,
} from "../utils/saleBonus";
import { formatHarvestLossText } from "../utils/eventEffects";
import CardMedia from "./CardMedia";
import AnimatedModal from "./AnimatedModal";

const EVENT_CARD_HELP_POINTS = [
  "Event cards introduce a temporary twist for the current round, so each turn feels a little less predictable.",
  "When you pick one face-down card, it reveals an effect that can change scoring, bonuses, costs, or harvest conditions.",
  "Read the revealed event carefully before moving on, because it can affect what choices make sense in the next phases.",
];

/**
 * Modal for choosing one hidden event card during the DRAW_EVENT phase.
 *
 * The modal presents face-down choices and keeps the phase mandatory by making
 * the parent page wait for `onSelect` before phase advancement is enabled. It
 * also includes inline help for explaining event-card mechanics.
 *
 * @component
 * @param {object} props - Component props.
 * @param {Array<object>} props.options - Event options returned by the backend.
 * @param {boolean} props.isLoading - Whether options are loading.
 * @param {boolean} props.isSubmitting - Whether a selection is being revealed.
 * @param {string} props.error - Error message for failed option loading.
 * @param {(optionIndex: number) => void} props.onSelect - Selection callback.
 * @param {() => void} props.onRetry - Retry callback for loading failures.
 * @param {() => void} props.onClose - Callback for dismissing the modal.
 * @returns {JSX.Element} Event-card draw modal.
 */
export function EventDrawModal({
  options,
  isLoading,
  isSubmitting,
  error,
  onSelect,
  onRetry,
  onClose,
}) {
  const reduceMotion = useReducedMotion();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <AnimatedModal
      isOpen={true}
      onClose={onClose}
      backdropClassName="event-popup__backdrop"
      panelClassName="event-popup event-popup--draw"
    >
        <div className="event-popup__topRow">
          <h3 className="event-popup__eyebrow">Draw Event</h3>
          <div className="event-popup__topActions">
            <button
              type="button"
              className="event-popup__infoButton"
              onClick={() => setIsHelpOpen((open) => !open)}
              aria-expanded={isHelpOpen}
              aria-controls="event-card-help"
              title="What is an event card?"
            >
              i
            </button>
            <button
              type="button"
              className="event-popup__close event-popup__close--inline"
              onClick={onClose}
              aria-label="Close event popup"
            >
              x
            </button>
          </div>
        </div>
        <h4 className="event-popup__title">Choose a face-down event card</h4>
        <p className="event-popup__description">
          Pick one hidden event to reveal the next twist in the round.
        </p>
        <div className="event-popup__mandatoryNote">
          This choice is required. Select one event card to continue the round.
        </div>

        <AnimatePresence initial={false}>
          {isHelpOpen && (
            <Motion.div
              id="event-card-help"
              className="event-popup__help"
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            >
              <div className="event-popup__helpTitle">What is an event card?</div>
              {EVENT_CARD_HELP_POINTS.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>

        {options.length > 0 && (
          <div className="event-draw__grid">
            {options.map((option) => (
              <Motion.button
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
              </Motion.button>
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

/**
 * Modal for displaying the event card revealed after selection.
 *
 * The reveal shows the event name, description, media, score or sale-bonus
 * effects, and upcoming harvest impacts. The parent page keeps phase controls
 * blocked until the player continues from this modal.
 *
 * @component
 * @param {object} props - Component props.
 * @param {object} props.event - Normalized event result to display.
 * @param {() => void} props.onContinue - Callback fired when the player has
 * reviewed the event.
 * @returns {JSX.Element} Revealed event-card modal.
 */
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
      panelClassName="event-popup event-popup--reveal"
    >
      <Motion.div
        className="event-popup__revealInner"
        initial={reduceMotion ? false : { rotateY: 10, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <button
          type="button"
          className="event-popup__close"
          onClick={onContinue}
          aria-label="Close event card"
        >
          x
        </button>

        <div className="event-popup__sparkles" aria-hidden="true">
          <span className="event-popup__sparkle event-popup__sparkle--one">✦</span>
          <span className="event-popup__sparkle event-popup__sparkle--two">✿</span>
          <span className="event-popup__sparkle event-popup__sparkle--three">✦</span>
        </div>

        <Motion.h3
          className="event-popup__eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        >
          Event Card
        </Motion.h3>
        <Motion.h4
          className="event-popup__title"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut", delay: 0.03 }}
        >
          {event.cardName}
        </Motion.h4>
        <Motion.p
          className="event-popup__description"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut", delay: 0.06 }}
        >
          {event.description}
        </Motion.p>

        {mediaItems.length > 0 && (
          <Motion.div
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
          </Motion.div>
        )}

        <AnimatePresence initial={false}>
        {hasSaleBonusIncrease && (
          <Motion.div
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
          </Motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
        {harvestLossText && (
          <Motion.div
            className="event-popup__bonus event-popup__bonus--warning"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut", delay: 0.05 }}
          >
            <p>
              Upcoming harvest impact: <strong>{harvestLossText}</strong>
            </p>
          </Motion.div>
        )}
        </AnimatePresence>

        {(event.effects ?? []).length > 0 && (
          <Motion.div
            className="event-popup__effects"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut", delay: 0.08 }}
          >
            {(event.effects ?? []).map((effect, index) => (
              <p key={`${event.cardId ?? event.cardName}-${index}`}>{effect}</p>
            ))}
          </Motion.div>
        )}

        <Motion.button
          className="event-popup__button"
          onClick={onContinue}
          whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          Continue
        </Motion.button>
      </Motion.div>
    </AnimatedModal>
  );
}
