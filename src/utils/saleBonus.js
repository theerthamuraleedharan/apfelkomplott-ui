// Utility for computing sale-related bonuses.
// Keeps sale bonus calculations reusable and easy to test.
export function formatSaleBonusPerApple(value) {
  const amount = Number(value) || 0;
  return `+${amount} per apple`;
}

export function formatSaleBonusMoneyLine(value) {
  const amount = Number(value) || 0;
  return `+${amount} money for each sold apple`;
}
