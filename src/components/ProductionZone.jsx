import "./ProductionZone.css";

export default function ProductionZone({ plantation, phase }) {

  if (!plantation || !plantation.trees) {
    return (
      <div className="zone production">
        🌱 Production (loading)
      </div>
    );
  }

  const fields = [1, 2, 3, 4, 5, 6];

  return (
    <div className="zone production">
      <h3>🌱 Production (Tree Aging)</h3>

      <div className="production-grid">

        {fields.map(field => {

          const trees = plantation.trees.filter(
            t => t.fieldPosition === field
          );

          return (
            <div key={field} className="field">

              <div className="field-label">
                Field {field}
                {field >= 3 && <span> 🌳</span>}
              </div>

              <div className="field-content">

                {trees.length === 0 && (
                  <span className="empty">Empty</span>
                )}

                {trees.map(tree => (
                  <div key={tree.id} className="tree-wrapper">

                    <span className={
                      tree.fieldPosition >= 3
                        ? "tree mature"
                        : "tree young"
                    }>
                      {tree.type === "SEEDLING" ? "🌱" : "🌳"}
                    </span>

                    {/* Harvest indicator */}
                    {phase === "HARVEST" && tree.fieldPosition >= 3 && (
                      <span className="harvest-apple">🍎</span>
                    )}

                  </div>
                ))}

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
