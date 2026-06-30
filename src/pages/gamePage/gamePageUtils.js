import { PHASE_LABELS, PHASE_ORDER } from "../../constants/phases";

const HELP_DISMISSED_STORAGE_KEY = "apfelkomplott-help-dismissed";

function shuffleCards(cards) {
  const copy = [...cards];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function buildMarketSlots(cards, previousSlots = []) {
  const availableCards = (cards ?? []).filter(Boolean);
  const shortTerm = shuffleCards(
    availableCards.filter((card) => card.deck === "SHORT_TERM")
  );
  const longTerm = shuffleCards(
    availableCards.filter((card) => card.deck === "LONG_TERM")
  );

  const picked = [
    ...shortTerm.slice(0, 3),
    ...longTerm.slice(0, 2),
  ];

  if (picked.length < 5) {
    const usedIds = new Set(picked.map((card) => card.id));
    const leftovers = shuffleCards(
      availableCards.filter((card) => !usedIds.has(card.id))
    );
    picked.push(...leftovers.slice(0, 5 - picked.length));
  }

  const pickedById = new Map(picked.map((card) => [card.id, card]));
  const nextSlots = Array(5).fill(null);

  previousSlots.forEach((card, index) => {
    if (!card) return;
    if (!pickedById.has(card.id)) return;

    nextSlots[index] = pickedById.get(card.id);
    pickedById.delete(card.id);
  });

  const remainingCards = shuffleCards(Array.from(pickedById.values()));

  for (let i = 0; i < nextSlots.length; i += 1) {
    if (!nextSlots[i]) {
      nextSlots[i] = remainingCards.shift() ?? null;
    }
  }

  return nextSlots;
}

export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeEventResult(payload) {
  if (!payload) return null;

  if (payload.lastEventResult) {
    return normalizeEventResult(payload.lastEventResult);
  }

  return {
    ...payload,
    cardId: payload.cardId ?? payload.id ?? null,
    cardName: payload.cardName ?? payload.name ?? "Event",
    description: payload.description ?? "",
    effects: Array.isArray(payload.effects) ? payload.effects : [],
    media: Array.isArray(payload.media) ? payload.media : [],
  };
}

export function mergeEventResults(primary, fallback) {
  const normalizedPrimary = normalizeEventResult(primary);
  const normalizedFallback = normalizeEventResult(fallback);

  if (!normalizedPrimary) return normalizedFallback;
  if (!normalizedFallback) return normalizedPrimary;

  return {
    ...normalizedFallback,
    ...normalizedPrimary,
    effects:
      normalizedPrimary.effects.length > 0
        ? normalizedPrimary.effects
        : normalizedFallback.effects,
    media:
      normalizedPrimary.media.length > 0
        ? normalizedPrimary.media
        : normalizedFallback.media,
  };
}

export function getHelpModalPreference() {
  try {
    return localStorage.getItem(HELP_DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setHelpModalPreference() {
  try {
    localStorage.setItem(HELP_DISMISSED_STORAGE_KEY, "1");
  } catch {
    // Ignore storage errors so help still works in restricted environments.
  }
}

export function getPhaseCoach(phase, gameState) {
  const round = gameState?.currentRound ?? 1;
  const crateCount = gameState?.plantation?.crates?.length ?? 0;
  const standCount = gameState?.plantation?.salesStands?.length ?? 0;

  if (phase === "HARVEST" && round < 3) {
    return {
      summary: "This is still a preview step in the opening rounds. Trees need time to mature before the first real harvest begins.",
      tip: "Keep investing in trees now so round 3 has enough apples to start the orchard flow.",
      urgency: "Preview step",
    };
  }

  if (phase === "DELIVER" && (round < 4 || crateCount === 0)) {
    return {
      summary:
        crateCount === 0
          ? "Delivery looks quiet because no transport crates exist yet. Apples need crates before they can move toward the market."
          : "Delivery is mostly a preview before round 4. Once harvest fills your crates, this step will move apples toward sales.",
      tip:
        crateCount === 0
          ? "Buy crates during Invest, and remember that the first harvest normally starts in round 3."
          : "Your crates are ready. Keep growing trees so future harvests give delivery something to move.",
      urgency: "Preview step",
    };
  }

  if (phase === "SELL" && (round < 5 || standCount === 0)) {
    return {
      summary:
        standCount === 0
          ? "Selling feels empty because no sales stands exist yet. Apples must be harvested, delivered, and placed on stands before money is earned."
          : "Selling usually stays quiet until round 5. Apples need to pass through harvest and delivery before this area becomes active.",
      tip:
        standCount === 0
          ? "Buy sales stands during Invest so the orchard can turn delivered apples into money later."
          : "Your stands are ready. Focus on trees, crates, and delivery capacity so later rounds reach the market.",
      urgency: "Preview step",
    };
  }

  const guidance = {
    MOVE_MARKER: {
      summary: "Start the new round and get the board ready for the next sequence of actions.",
      tip: "This is a transition step. Once the round marker is updated, you can move ahead.",
      urgency: "Quick setup",
    },
    DRAW_EVENT: {
      summary: "Pick one event card. The revealed event can change costs, bonuses, or upcoming harvest outcomes.",
      tip: "You must choose one event card before the round can continue.",
      urgency: "Required choice",
    },
    REFILL_CARDS: {
      summary: "The market refreshes here so you can see what production cards are available later.",
      tip: "Scan the new cards now so your next investment decision is easier.",
      urgency: "Preview market",
    },
    SELL: {
      summary: "Resolve apple sales and convert your orchard output into money.",
      tip: "Check any active bonus or event effect before moving on.",
      urgency: "Money step",
    },
    DELIVER: {
      summary: "Move apples through delivery so they can actually be sold.",
      tip: "Think of this as preparing your stock for the market.",
      urgency: "Board action",
    },
    HARVEST: {
      summary: "Collect apples from the plantation and see how this round's conditions affect yield.",
      tip: "Harvest is often influenced by event cards, so keep the latest event result in mind.",
      urgency: "Board action",
    },
    ROTATE: {
      summary: "Rotate the plantation to advance the orchard cycle.",
      tip: "This helps reset the board for the next round structure.",
      urgency: "Board update",
    },
    INTERMEDIATE_SCORING: {
      summary: "Review how the round changed Economy, Environment, and Health.",
      tip: "Use this moment to see whether your strategy is helping or hurting the orchard balance.",
      urgency: "Score check",
    },
    INVEST: {
      summary: "Spend money on investments or production cards to improve future rounds.",
      tip: "Compare card effects before buying. Long-term cards shape your strategy more heavily.",
      urgency: "Best time to act",
    },
    CARD_SCORING: {
      summary: "Apply end-of-round production card effects before the next round begins.",
      tip: "Watch for popups here, because this step can change scores or even farming mode.",
      urgency: "End of round",
    },
  };

  return guidance[phase] ?? {
    summary: "Follow the current board step, then continue when the phase is complete.",
    tip: "Open Help anytime if you need the full explanation.",
    urgency: "Current step",
  };
}

export function getNextPhaseLabel(currentPhase) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === PHASE_ORDER.length - 1) {
    return "Next round";
  }

  const nextPhase = PHASE_ORDER[currentIndex + 1];
  return PHASE_LABELS[nextPhase] ?? "Next step";
}

export function getQuietPhasePopup(phase, gameState) {
  const plantation = gameState?.plantation;
  if (!plantation) return null;

  const round = gameState.currentRound ?? 1;
  const crateCount = plantation.crates?.length ?? 0;
  const standCount = plantation.salesStands?.length ?? 0;
  const matureTreeCount = (plantation.trees ?? []).filter(
    (tree) => tree.fieldPosition >= 3
  ).length;
  const applesInTransport = (plantation.apples ?? []).filter(
    (apple) => apple.location === "IN_TRANSPORT"
  ).length;
  const applesInSales = (plantation.apples ?? []).filter(
    (apple) => apple.location === "IN_SALES_STAND"
  ).length;

  if (phase === "HARVEST") {
    if (round < 3) {
      return {
        key: "harvest-preview",
        eyebrow: "Harvest Preview",
        title: "Nothing happens here yet",
        reasons: [
          `Round ${round} is still part of the orchard setup. Trees need time before they can produce apples.`,
          "The first real harvest normally starts in round 3, once trees have reached the producing fields.",
          "For now, focus on building your orchard so later harvest phases feel more active.",
        ],
      };
    }

    if (matureTreeCount === 0) {
      return {
        key: "harvest-no-mature-trees",
        eyebrow: "Harvest Result",
        title: "No apples were harvested",
        reasons: [
          "No trees are mature enough to produce apples right now.",
          "Trees only begin producing after they move into the later fields of the production disk.",
          "Keep investing in trees now so future harvest rounds can feed transport and sales.",
        ],
      };
    }
  }

  if (phase === "DELIVER") {
    if (round < 4) {
      return {
        key: "deliver-preview",
        eyebrow: "Delivery Preview",
        title: "Nothing is delivered yet",
        reasons: [
          `Round ${round} is still before the normal delivery stage.`,
          "Apples are usually harvested from round 3 onward and delivered from round 4 onward.",
          "This step is here to teach the full orchard flow before crates start filling up.",
        ],
      };
    }

    if (crateCount === 0) {
      return {
        key: "deliver-no-crates",
        eyebrow: "Delivery Result",
        title: "No transport happened",
        reasons: [
          "There are no transport crates yet, so apples cannot move toward the market.",
          "Buy crates during the Invest phase to unlock this part of the orchard flow.",
          "Once crates exist, harvested apples will appear here before moving to sales stands.",
        ],
      };
    }

    if (applesInTransport === 0) {
      return {
        key: "deliver-no-apples",
        eyebrow: "Delivery Result",
        title: "There was nothing to move",
        reasons: [
          "No apples are currently waiting in transport crates.",
          "This can happen when harvest has not produced enough apples yet, or when crates stayed empty.",
          "Keep building trees and transport capacity so later rounds have something to deliver.",
        ],
      };
    }
  }

  if (phase === "SELL") {
    if (round < 5) {
      return {
        key: "sell-preview",
        eyebrow: "Sales Preview",
        title: "Nothing is sold yet",
        reasons: [
          `Round ${round} is still before the normal selling stage.`,
          "Selling usually begins in round 5, after apples have been harvested and delivered.",
          "These early rounds are mainly for preparing trees, crates, and sales stands.",
        ],
      };
    }

    if (standCount === 0) {
      return {
        key: "sell-no-stands",
        eyebrow: "Sales Result",
        title: "No sales happened",
        reasons: [
          "There are no sales stands yet, so apples have nowhere to be sold from.",
          "Buy sales stands during the Invest phase to turn delivered apples into money.",
          "The full money loop is: harvest, deliver, then sell.",
        ],
      };
    }

    if (applesInSales === 0) {
      return {
        key: "sell-no-apples",
        eyebrow: "Sales Result",
        title: "There was nothing to sell",
        reasons: [
          "No apples are waiting on the sales stands right now.",
          "Apples must first be harvested and delivered before this step becomes active.",
          "This is normal in quieter rounds while the orchard is still developing.",
        ],
      };
    }
  }

  return null;
}
