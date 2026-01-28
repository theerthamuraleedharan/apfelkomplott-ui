import TransportArea from "./TransportArea.jsx";
import SalesArea from "./SalesArea.jsx";
import "./Board.css";
import ProductionArea from "./ProductionArea.jsx";


export default function Board({ gameState }) {
  return (
    <div className="board">
      {/* Round Timeline */}
      <div className="round-bar">
        <span>Round: {gameState.currentRound}</span>
        <span>Phase: {gameState.currentPhase}</span>
      </div>

      {/* Transport + Verkauf */}
      <div className="board-grid">
        <TransportArea plantation={gameState.plantation} />
        <SalesArea plantation={gameState.plantation} />
      </div>

      {/* Production Timeline */}
      <ProductionArea
        plantation={gameState.plantation}
        phase={gameState.currentPhase}
      />


    </div>
  );
}

