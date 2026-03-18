export function formatHarvestLossText(event) {
  const amount = Number(event?.expectedHarvestLoss) || 0;
  if (amount <= 0) return "";

  const appleLabel = amount === 1 ? "apple" : "apples";
  const plantationSize = event?.plantationSize
    ? `${String(event.plantationSize).toLowerCase()} plantation`
    : "current plantation";

  return `${amount} ${appleLabel} will be lost from the next harvest for the ${plantationSize}.`;
}

export function formatHarvestLossBadge(event) {
  const amount = Number(event?.expectedHarvestLoss) || 0;
  if (amount <= 0) return "";

  const appleLabel = amount === 1 ? "apple" : "apples";
  return `Upcoming harvest loss: ${amount} ${appleLabel}`;
}
