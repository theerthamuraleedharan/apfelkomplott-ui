import TransportZone from "./TransportZone";
import SalesZone from "./SalesZone";
import ProductionZone from "./ProductionZone";
import EventZone from "./EventZone";
import ScoreBoard from "./ScoreBoard";
import AppleAnimation from "./appleAnimation";


import "./BoardLayout.css";

export default function BoardLayout({ gameState, animationPhase }) {
  return (
    <div className="board-grid">

        {/* {animationPhase && (
        <AppleAnimation type={animationPhase} />
        )} */}


      {/* TOP ROW */}
      <div className="zone transport">
        <TransportZone plantation={gameState.plantation} />
      </div>

      <div className="zone sales">
        <SalesZone plantation={gameState.plantation} />
      </div>

      {/* MIDDLE ROW */}
      <div className="zone production">
        <ProductionZone plantation={gameState.plantation} />
      </div>

      {/* BOTTOM ROW */}
      {/* <div className="zone event">
        {gameState.activeEvents[0] && (
          <EventZone event={gameState.activeEvents[0]} />
        )}
      </div> */}

      {/* <div className="zone scores">
        <ScoreBoard
          score={gameState.scoreTrack}
          money={gameState.money}
        />
      </div> */}

    </div>
  );
}
