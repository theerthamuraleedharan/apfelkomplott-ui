import { useEffect, useRef } from "react";
import "./ProductionZone.css";
import { formatHarvestLossBadge, formatHarvestLossText } from "../utils/eventEffects";

const fields = [1, 2, 3, 4, 5, 6];
const sectorStartAngle = -90;
const phasesAfterRotation = new Set([
  "ROTATE",
  "INTERMEDIATE_SCORING",
  "INVEST",
  "CARD_SCORING",
]);

function getPolarStyle(slotIndex, radiusPercent, angleOffset = 0) {
  const angle = sectorStartAngle + 30 + slotIndex * 60 + angleOffset;
  const radians = (angle * Math.PI) / 180;

  return {
    left: `calc(50% + ${Math.cos(radians) * radiusPercent}%)`,
    top: `calc(50% + ${Math.sin(radians) * radiusPercent}%)`,
  };
}

function normalizeSlot(field, rotationSteps) {
  return ((field - 1 - rotationSteps) % 6 + 6) % 6;
}

function getTreeSlotStyle(field, rotationSteps) {
  const slotIndex = normalizeSlot(field, rotationSteps);
  return getPolarStyle(slotIndex, 23);
}

function getTreeOffsets(index) {
  const positions = [
    { x: -18, y: -16 },
    { x: 10, y: -18 },
    { x: -20, y: 12 },
    { x: 12, y: 10 },
  ];

  return positions[index] ?? { x: 0, y: 0 };
}

export default function ProductionZone({ plantation, phase, round, lastEventResult }) {
  const previousPlantationRef = useRef(null);
  const previousPhaseRef = useRef(null);
  const rotateSnapshotRef = useRef(null);

  if (!plantation || !plantation.trees) {
    return <div className="zone production">Production (loading)</div>;
  }

  if (phase === "ROTATE" && previousPhaseRef.current !== "ROTATE") {
    rotateSnapshotRef.current = previousPlantationRef.current ?? plantation;
  } else if (phase !== "ROTATE") {
    rotateSnapshotRef.current = null;
  }

  const completedRotations = phasesAfterRotation.has(phase)
    ? round ?? 0
    : Math.max((round ?? 1) - 1, 0);
  const rotationSteps = completedRotations % 6;
  const treeRotationSteps =
    phase === "ROTATE"
      ? Math.max(completedRotations - 1, 0) % 6
      : rotationSteps;
  const rotationDegrees = completedRotations * 60;
  const harvestLossBadge = formatHarvestLossBadge(lastEventResult);
  const harvestLossText = formatHarvestLossText(lastEventResult);
  const visiblePlantation =
    phase === "ROTATE"
      ? {
          ...(rotateSnapshotRef.current ?? plantation),
          trees: (rotateSnapshotRef.current ?? plantation).trees.filter(
            (tree) => tree.fieldPosition !== 6
          ),
        }
      : plantation;

  useEffect(() => {
    previousPlantationRef.current = plantation;
    previousPhaseRef.current = phase;
  }, [phase, plantation]);

  return (
    <div className="zone production">
      <div className="production-header">
        <div>
          <h3>Production Disk</h3>
          <p>Fields 3-6 produce apples. Trees age by one field every rotation.</p>
        </div>
        {harvestLossBadge && (
          <div className="production-warning" title={harvestLossText}>
            <span className="production-warning__label">Weather Effect</span>
            <strong>{harvestLossBadge}</strong>
          </div>
        )}
      </div>

      <div className="production-disk-layout">
        <div className="production-disk" aria-label="Plantation rotation disk">
          <div className="disk-base">
            {fields.map((field) => (
              <div
                key={`label-${field}`}
                className="disk-label"
                style={getPolarStyle(field - 1, 43)}
              >
                {field}
              </div>
            ))}
          </div>

          <div
            className="disk-overlay"
            style={{ transform: `rotate(${rotationDegrees}deg)` }}
          >
            <div className="disk-overlay-ring" />

            {fields.map((field) => {
              const trees = visiblePlantation.trees.filter(
                (tree) => tree.fieldPosition === field
              );
              const visibleTrees = trees.slice(0, 4);
              const hiddenTreeCount = trees.length - visibleTrees.length;

              if (trees.length === 0) {
                return null;
              }

              return (
                <div
                  key={`trees-${field}`}
                  className="disk-tree-slot"
                  style={getTreeSlotStyle(field, treeRotationSteps)}
                >
                  <div
                    className="tree-cluster"
                    style={{ transform: `rotate(${-rotationDegrees}deg)` }}
                  >
                    {visibleTrees.map((tree, index) => (
                      <div
                        key={tree.id}
                        className="tree-wrapper"
                        style={{
                          transform: `translate(${getTreeOffsets(index).x}px, ${getTreeOffsets(index).y}px)`,
                        }}
                      >
                        <span
                          className={
                            tree.fieldPosition >= 3 ? "tree mature" : "tree young"
                          }
                        >
                          {tree.type === "SEEDLING" ? "🌱" : "🌳"}
                        </span>

                        {phase === "HARVEST" && tree.fieldPosition >= 3 && (
                          <span className="harvest-apple">🍎</span>
                        )}
                      </div>
                    ))}

                    {hiddenTreeCount > 0 && (
                      <span className="tree-count-badge">+{hiddenTreeCount}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="disk-center-note">
            <span className="disk-center-dot" />
          </div>
        </div>

        <div className="production-legend">
          <div className="legend-item">
            <span className="legend-chip young" />
            <span>Fields 1-2: growing</span>
          </div>
          <div className="legend-item">
            <span className="legend-chip mature" />
            <span>Fields 3-6: producing</span>
          </div>
          <div className="legend-item">
            <span className="legend-chip expired" />
            <span>After field 6, trees are removed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
