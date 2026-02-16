export default function SalesZone({ plantation }) {
  return (
    <div>
      <h2>🧺 Sales</h2>

      {plantation.salesStands.length === 0 && (
        <p>No sales stands</p>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        {plantation.salesStands.map((stand) => {

          const applesInStand = plantation.apples.filter(
            (apple) =>
              apple.location === "IN_SALES_STAND" &&
              apple.containerId === stand.id
          );

          return (
            <div
              key={stand.id}
              style={{
                width: "90px",
                height: "80px",
                background: "#82e0aa",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}
            >
              🧺
              <div>
                {applesInStand.map((apple) => (
                  <span key={apple.id}>🍎</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
