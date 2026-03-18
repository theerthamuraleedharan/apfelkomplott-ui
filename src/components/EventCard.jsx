import "./EventCard.css";
import {
  formatSaleBonusMoneyLine,
  formatSaleBonusPerApple,
} from "../utils/saleBonus";
import { formatHarvestLossText } from "../utils/eventEffects";
import CardMedia from "./CardMedia";

export function EventDrawModal({
  options,
  isLoading,
  isSubmitting,
  error,
  onSelect,
  onRetry,
}) {
  return (
    <div className="event-popup__backdrop">
      <div className="event-popup event-popup--draw" role="dialog" aria-modal="true">
        <h3 className="event-popup__eyebrow">Draw Event</h3>
        <h4 className="event-popup__title">Choose a face-down event card</h4>
        <p className="event-popup__description">
          Pick one hidden event to reveal the next twist in the round.
        </p>

        {options.length > 0 && (
          <div className="event-draw__grid">
            {options.map((option) => (
              <button
                key={option.optionIndex}
                type="button"
                className="event-draw__card"
                onClick={() => onSelect(option.optionIndex)}
                disabled={isLoading || isSubmitting}
              >
                <span className="event-draw__badge">Face Down</span>
                <span className="event-draw__mark">?</span>
                <span className="event-draw__label">Event Card</span>
              </button>
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
      </div>
    </div>
  );
}

export default function EventRevealModal({ event, onContinue }) {
  const hasSaleBonusIncrease = (event.saleBonusPerAppleChange ?? 0) > 0;
  const harvestLossText = formatHarvestLossText(event);
  const mediaItems = (event.media ?? []).filter(
    (item) => item && (item.src || item.value)
  );

  return (
    <div className="event-popup__backdrop">
      <div className="event-popup" role="dialog" aria-modal="true">
        <h3 className="event-popup__eyebrow">Event Card</h3>
        <h4 className="event-popup__title">{event.cardName}</h4>
        <p className="event-popup__description">{event.description}</p>

        {mediaItems.length > 0 && (
          <div className="event-popup__media">
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
          </div>
        )}

        {hasSaleBonusIncrease && (
          <div className="event-popup__bonus">
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
          </div>
        )}

        {harvestLossText && (
          <div className="event-popup__bonus event-popup__bonus--warning">
            <p>
              Upcoming harvest impact: <strong>{harvestLossText}</strong>
            </p>
          </div>
        )}

        {(event.effects ?? []).length > 0 && (
          <div className="event-popup__effects">
            {(event.effects ?? []).map((effect, index) => (
              <p key={`${event.cardId ?? event.cardName}-${index}`}>{effect}</p>
            ))}
          </div>
        )}

        <button className="event-popup__button" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
