// Column counts that divide the item count evenly, so every row holds the same number of items.
// Desktop: up to 5 items sit in one row, otherwise the largest of 4, 3 or 2 that divides the count.
// Tablet: 2 columns when the count is even, otherwise 1. Phones always use 1 (see .grid-even in styles.css).
export function evenGrid(count, vars = {}) {
  const n = Math.max(1, count || 1);
  const cols = n <= 5 ? n : [4, 3, 2].find((c) => n % c === 0) || 3;
  return { '--cols': cols, '--cols-md': n % 2 === 0 ? 2 : 1, ...vars };
}
