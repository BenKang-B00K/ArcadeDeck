/**
 * Compare two leaderboard entries for sorting.
 * Primary: higher score first.
 * Secondary: depends on subSortAsc — true means lower subScore is better.
 */
export function compareLeaderboardEntries(
  a: { score: number; subScore?: number },
  b: { score: number; subScore?: number },
  subSortAsc: boolean
): number {
  if (b.score !== a.score) return b.score - a.score;
  return subSortAsc
    ? (a.subScore || 0) - (b.subScore || 0)
    : (b.subScore || 0) - (a.subScore || 0);
}

/**
 * Check if a new score beats the previous personal best.
 */
export function isNewPersonalBest(
  newScore: number,
  newSubScore: number,
  prevScore: number,
  prevSubScore: number,
  subSortAsc: boolean
): boolean {
  if (newScore > prevScore) return true;
  if (newScore === prevScore) {
    return subSortAsc ? newSubScore < prevSubScore : newSubScore > prevSubScore;
  }
  return false;
}
