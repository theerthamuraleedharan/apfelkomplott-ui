export default function TransportArea({ plantation }) {
  if (!plantation || !plantation.apples) {
    return <div className="zone">🚚 Transport (loading)</div>;
  }

  const apples = plantation.apples.filter(
    a => a.location === "IN_CRATE"
  );

  return (
    <div className="zone">
      <h3>🚚 Transport</h3>
      <div className="crate">
        {apples.length === 0
          ? <span className="empty">Empty</span>
          : apples.map(a => <span key={a.id}>🍎</span>)
        }
      </div>
    </div>
  );
}
