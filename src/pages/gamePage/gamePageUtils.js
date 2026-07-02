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
