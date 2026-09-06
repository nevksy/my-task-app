/**
 * Case-insensitive substring match used by the unified search bar.
 * An empty/whitespace-only query matches everything (callers typically
 * skip filtering entirely in that case, but this stays correct either way).
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return haystack.toLowerCase().includes(q);
}
