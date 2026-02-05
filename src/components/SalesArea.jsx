import "./SalesArea.css";

export default function SalesArea({ plantation, phase }) {
  if (!plantation) {
    return <div className="zone">🧺 Sales (loading)</div>;
  }

  const stands = plantation.salesStands || [];
  const apples = plantation.apples || [];

  return (
    <div className={`zone sales ${phase === "SELL" ? "active" : ""}`}>
      <h3>🧺 Sales Stands</h3>

      <div className="stands">
        {stands.length === 0 && <p className="empty">No sales stands</p>}

        {stands.map((stand) => {
          const applesInStand = apples.filter(
            (a) =>
              a.location === "IN_SALES_STAND" &&
              a.containerId === stand.id
          );

          return (
            <div key={stand.id} className="stand">
              <div className="stand-title">
                🧺 Stand ({applesInStand.length}/{stand.capacity})
              </div>

              <div className="stand-content">
                {applesInStand.length === 0
                  ? <span className="empty">Empty</span>
                  : applesInStand.map(a => (
                      <span key={a.id} className="apple">🍎</span>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
