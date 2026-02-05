export default function EventCard({ event, onContinue }) {
  return (
    <div className="event-popup">
      <h3>📜 Event Card</h3>
      <h4>{event.name}</h4>
      <p>{event.description}</p>

      <button onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
