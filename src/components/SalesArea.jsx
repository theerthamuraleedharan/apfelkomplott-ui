export default function SalesArea({ plantation }) {
  if (!plantation || !plantation.apples) {
    return <div className="zone">🧺 Verkauf (loading)</div>;
  }

  const applesForSale = plantation.apples.filter(
    (a) => a.location === "IN_SALES_STAND"
  );

  return (
    <div className="zone">
      <h3>🧺 Verkauf</h3>

      <div className="stand">
        {applesForSale.length === 0
          ? <span className="empty">Empty</span>
          : applesForSale.map(a => <span key={a.id}>🍎</span>)
        }
      </div>
    </div>
  );
}
