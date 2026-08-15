/** Classic Levenshtein edit distance between two strings. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }

  return matrix[rows - 1][cols - 1];
}

export function normalizeForComparison(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizePhone(value: string): string {
  return value.replace(/[^\d]/g, '');
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Similarity ratio in [0, 1]; 1 means identical after normalization. */
export function similarityRatio(a: string, b: string): number {
  const na = normalizeForComparison(a);
  const nb = normalizeForComparison(b);
  if (!na && !nb) return 1;
  if (!na || !nb) return 0;
  const maxLen = Math.max(na.length, nb.length);
  return 1 - levenshtein(na, nb) / maxLen;
}

/** "Very similar" threshold used for duplicate-name warnings (not exact-match only). */
export const SIMILARITY_THRESHOLD = 0.82;

export function isVerySimilar(a: string, b: string): boolean {
  return similarityRatio(a, b) >= SIMILARITY_THRESHOLD;
}
