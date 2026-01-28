import "./TransportArea.css";

export default function TransportArea({ plantation, phase }) {
  if (!plantation) return null;

  const { crates = [], apples = [] } = plantation;

  return (
   <div className={`zone transport ${phase === "DELIVER" ? "active" : ""}`}>
      <h3>🚚 Transport</h3>

      <div className="crate-list">
        {crates.length === 0 && (
          <span className="empty">No transport crates</span>
        )}

        {crates.map((crate) => {
          const applesInCrate = apples.filter(
            (a) =>
              a.location === "IN_CRATE" &&
              a.containerId === crate.id
          );

          return (
            <div key={crate.id} className="crate">
              <div className="crate-label">📦</div>

              <div className="crate-content">
                {applesInCrate.length === 0 ? (
                  <span className="empty">Empty</span>
                ) : (
                  applesInCrate.map((a) => (
                    <span
                          key={a.id}
                          className={`apple apple-${a.location.toLowerCase()}`}
                        >
                          🍎
                        </span>

                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
