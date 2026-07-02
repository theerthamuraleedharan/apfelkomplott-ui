/**
 * Completes a successful production-card purchase workflow.
 *
 * The purchase request is authoritative: rejected HTTP responses are expected
 * to reject `buyCard`. After a successful response, the latest game state and
 * market are fetched before any score effects are displayed.
 *
 * @param {object} options - Purchase workflow dependencies.
 * @param {string} options.cardId - Production card identifier.
 * @param {function(string): Promise<object|null>} options.buyCard - Purchase
 * request.
 * @param {function(): Promise<object>} options.refreshGame - State and market
 * refresh.
 * @param {function(object): void} options.showEffects - Success-effect popup.
 * @returns {Promise<object>} Refreshed backend game state.
 */
export async function completeProductionCardPurchase({
  cardId,
  buyCard,
  refreshGame,
  showEffects,
}) {
  const result = await buyCard(cardId);
  const updatedState = await refreshGame();

  if (Array.isArray(result?.reasons) && result.reasons.length > 0) {
    showEffects(result);
  }

  return updatedState;
}
