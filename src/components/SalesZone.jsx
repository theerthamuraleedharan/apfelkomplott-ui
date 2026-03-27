import "./SalesArea.css";

export default function SalesZone({ plantation }) {
  return (
    <div className="salesZone">
      <div className="zoneSection__header">
        <div>
          <h2 className="zoneSection__title">Sales</h2>
          <p className="zoneSection__subtitle">
            Sales stands are where ready apples wait to be sold.
          </p>
        </div>
        <div className="zoneSection__count">
          {plantation.salesStands.length} stand{plantation.salesStands.length === 1 ? "" : "s"}
        </div>
      </div>

      {plantation.salesStands.length === 0 && (
        <div className="zoneSection__empty">No sales stands yet.</div>
      )}

      <div className="zoneSection__grid">
        {plantation.salesStands.map((stand) => {
          const applesInStand = plantation.apples.filter(
            (apple) =>
              apple.location === "IN_SALES_STAND" &&
              apple.containerId === stand.id
          );

          return (
            <div key={stand.id} className="zoneCard zoneCard--sales">
              <div className="zoneCard__icon">🧺</div>
              <div className="zoneCard__title">Stand</div>
              <div className="zoneCard__value">
                {applesInStand.length} apple{applesInStand.length === 1 ? "" : "s"}
              </div>
              <div className="zoneCard__items">
                {applesInStand.map((apple) => (
                  <span key={apple.id} className="zoneCard__item">
                    🍎
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
