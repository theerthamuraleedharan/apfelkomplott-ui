import "./ProductionArea.css";

export default function ProductionArea({ plantation, phase }) {
  if (!plantation || !plantation.trees) {
    return <div className="zone">🌱 Production (loading)</div>;
  }

  // Fields 1–6
  const fields = [1, 2, 3, 4, 5, 6];

  return (
    <div className="zone production">
      <h3>🌱 Production (Trees Aging)</h3>

      {/* 🔎 DEBUG — remove later */}
      <pre style={{ fontSize: "10px", background: "#f5f5f5", padding: "6px" }}>
        {JSON.stringify(plantation.trees, null, 2)}
      </pre>

      <div className="production-grid">
        {fields.map((field) => {
          const treesInField = plantation.trees.filter(
            (tree) => tree.fieldPosition === field
          );

          return (
            <div key={field} className="field">
              <div className="field-label">
                Field {field}
                {field >= 3 && <span className="mature-label"> 🌳</span>}
              </div>

              <div className="field-content">
                {treesInField.length === 0 ? (
                  <span className="empty">Empty</span>
                ) : (
                  treesInField.map((tree) => (
                    <div key={tree.id} className="tree-wrapper">
                      <span
                        className={
                          tree.fieldPosition >= 3
                            ? "tree mature"
                            : "tree young"
                        }
                      >
                        {tree.type === "SEEDLING" ? "🌱" : "🌳"}
                      </span>

                      {/* 🍎 Apple appears ONLY during HARVEST */}
                      {phase === "HARVEST" &&
                        tree.fieldPosition >= 3 && (
                          <span className="harvest-apple">🍎</span>
                        )}
                    </div>
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
