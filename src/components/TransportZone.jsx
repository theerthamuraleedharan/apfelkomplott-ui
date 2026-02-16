export default function TransportZone({ plantation }) {
  return (
    <div>
      <h2>🚚 Transport</h2>

      {plantation.crates.length === 0 && (
        <p>No transport crates</p>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        {plantation.crates.map((crate) => {

          const applesInCrate = plantation.apples.filter(
            (apple) =>
              apple.location === "IN_TRANSPORT" &&
              apple.containerId === crate.id
          );

          return (
            <div
              key={crate.id}
              style={{
                width: "80px",
                height: "80px",
                background: "#f4d03f",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}
            >
              📦
              <div>
                {applesInCrate.map((apple) => (
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
