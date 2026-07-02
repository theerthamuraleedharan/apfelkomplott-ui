import test from "node:test";
import assert from "node:assert/strict";

import { completeProductionCardPurchase } from "../src/pages/gamePage/productionCardPurchase.js";

test("supports two consecutive successful production-card purchases", async () => {
  const purchasedCardIds = [];
  const refreshedStates = [
    { money: 15, market: [{ id: "card-2" }] },
    { money: 10, market: [] },
  ];
  const shownEffects = [];
  let refreshCount = 0;

  const buyCard = async (cardId) => {
    purchasedCardIds.push(cardId);
    return {
      economyChange: 1,
      environmentChange: 1,
      healthChange: 0,
      reasons: [`Effects for ${cardId}`],
    };
  };

  const refreshGame = async () => {
    const state = refreshedStates[refreshCount];
    refreshCount += 1;
    return state;
  };

  const firstState = await completeProductionCardPurchase({
    cardId: "card-1",
    buyCard,
    refreshGame,
    showEffects: (result) => shownEffects.push(result),
  });
  const secondState = await completeProductionCardPurchase({
    cardId: "card-2",
    buyCard,
    refreshGame,
    showEffects: (result) => shownEffects.push(result),
  });

  assert.deepEqual(purchasedCardIds, ["card-1", "card-2"]);
  assert.equal(refreshCount, 2);
  assert.deepEqual(firstState, refreshedStates[0]);
  assert.deepEqual(secondState, refreshedStates[1]);
  assert.equal(shownEffects.length, 2);
  assert.deepEqual(shownEffects[0].reasons, ["Effects for card-1"]);
  assert.deepEqual(shownEffects[1].reasons, ["Effects for card-2"]);
});

test("does not refresh or show effects when a purchase request fails", async () => {
  let refreshCount = 0;
  let effectCount = 0;
  const backendError = new Error("Insufficient money");

  await assert.rejects(
    completeProductionCardPurchase({
      cardId: "card-1",
      buyCard: async () => {
        throw backendError;
      },
      refreshGame: async () => {
        refreshCount += 1;
      },
      showEffects: () => {
        effectCount += 1;
      },
    }),
    backendError
  );

  assert.equal(refreshCount, 0);
  assert.equal(effectCount, 0);
});
