import "./EventCard.css";

export default function EventCard({ event, onContinue }) {
  return (
    <div className="event-popup__backdrop">
      <div className="event-popup" role="dialog" aria-modal="true">
        <h3 className="event-popup__eyebrow">Event Card</h3>
        <h4 className="event-popup__title">{event.name}</h4>
        <p className="event-popup__description">{event.description}</p>

        <button className="event-popup__button" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
