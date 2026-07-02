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
  return getPolarStyle(slotIndex, 31);
}

function getTreeOffsets(index) {
  const positions = [
    { x: -17, y: -16 },
    { x: 17, y: -16 },
    { x: -17, y: 16 },
    { x: 17, y: 16 },
  ];

  return positions[index] ?? { x: 0, y: 0 };
}

/**
 * Visual production disk for tree aging, harvesting, and rotation.
 *
 * The component positions trees around a six-field disk, animates the rotation
 * phase, and preserves a pre-rotation snapshot so disappearing trees remain
 * understandable while the disk moves. Event-based harvest loss warnings are
 * displayed in the header when active.
 *
 * @component
 * @param {object} props - Component props.
 * @param {object|null} props.plantation - Plantation state with tree data.
 * @param {string} props.phase - Current phase identifier.
 * @param {number} props.round - Current round number.
 * @param {object|null} props.lastEventResult - Latest event result that may
 * affect harvest display.
 * @returns {JSX.Element} Animated production-disk zone.
 */
export default function ProductionZone({
  plantation,
  phase,
  round,
  lastEventResult,
}) {
  if (!plantation || !plantation.trees) {
    return <div className="zone production">Production (loading)</div>;
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
          ...plantation,
          trees: plantation.trees.filter((tree) => tree.fieldPosition !== 6),
        }
      : plantation;

  return (
    <div className="productionZone">
      <div className="production-header">
        <div>
          <h3>Production Disk</h3>
          <p>Fields 3-6 produce apples. Trees age by one field every rotation.</p>
        </div>
        {phase === "ROTATE" && (
          <div className="production-rotationBadge">Rotating orchard...</div>
        )}
        {harvestLossBadge && (
          <div className="production-warning" title={harvestLossText}>
            <span className="production-warning__label">Weather Effect</span>
            <strong>{harvestLossBadge}</strong>
          </div>
        )}
      </div>

      <div className="production-disk-layout">
        <div
          className={`production-disk${phase === "ROTATE" ? " is-rotating" : ""}`}
          aria-label="Plantation rotation disk"
        >
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
                          transform: `translate(-50%, -50%) translate(${getTreeOffsets(index).x}px, ${getTreeOffsets(index).y}px)`,
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
      </div>
    </div>
  );
}
