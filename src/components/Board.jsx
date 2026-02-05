import TransportArea from "./TransportArea";
import SalesArea from "./SalesArea";
import ProductionArea from "./ProductionArea";
import "./Board.css";

export default function Board({ gameState }) {
  const { plantation, currentPhase } = gameState;

  return (
    <div className="board">

      <div className="board-grid">
        <TransportArea plantation={plantation} />
        <SalesArea plantation={plantation} />
      </div>

      <ProductionArea
        plantation={plantation}
        phase={currentPhase}
      />

    </div>
  );
}
