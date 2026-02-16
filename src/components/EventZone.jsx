export default function EventZone({ events }) {

  if (!events || events.length === 0) {
    return <div className="zone events">No Event</div>;
  }

  const event = events[0];

  return (
    <div className="zone events">
      <h3>🎴 Event</h3>
      <h4>{event.name}</h4>
      <p>{event.description}</p>
    </div>
  );
}
