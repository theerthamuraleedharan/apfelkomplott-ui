import "./TransportArea.css";

/**
 * Transport-zone panel for the main board layout.
 *
 * The component summarizes available crates and lists apples currently stored in
 * transport. It helps players judge whether harvested apples can move toward
 * sales stands.
 *
 * @component
 * @param {object} props - Component props.
 * @param {object} props.plantation - Plantation state with crates and apples.
 * @returns {JSX.Element} Transport area summary cards.
 */
export default function TransportZone({ plantation }) {
  return (
    <div className="transportZone">
      <div className="zoneSection__header">
        <div>
          <h2 className="zoneSection__title">Transport Area</h2>
          <p className="zoneSection__subtitle">
            Crates hold apples that are on the way to market.
          </p>
        </div>
        <div className="zoneSection__count">
          {plantation.crates.length} crate{plantation.crates.length === 1 ? "" : "s"}
        </div>
      </div>

      {plantation.crates.length === 0 && (
        <div className="zoneSection__empty">No transport crates yet.</div>
      )}

      <div className="zoneSection__grid">
        {plantation.crates.map((crate) => {
          const applesInCrate = plantation.apples.filter(
            (apple) =>
              apple.location === "IN_TRANSPORT" &&
              apple.containerId === crate.id
          );

          return (
            <div key={crate.id} className="zoneCard zoneCard--transport">
              <div className="zoneCard__icon">📦</div>
              <div className="zoneCard__title">Crate</div>
              <div className="zoneCard__value">
                {applesInCrate.length} apple{applesInCrate.length === 1 ? "" : "s"}
              </div>
              <div className="zoneCard__items">
                {applesInCrate.map((apple) => (
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
