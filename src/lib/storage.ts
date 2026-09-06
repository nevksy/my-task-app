export const STORAGE_KEYS = {
  tasks: 'taskapp.tasks',
  notes: 'taskapp.notes',
} as const;

/**
 * Reads and JSON-parses a localStorage value. Falls back to `fallback` when
 * the key is absent, the stored value isn't valid JSON, or localStorage
 * itself is unavailable (e.g. disabled, or thrown in some private-browsing
 * modes) — the app should always be able to start with an empty state
 * rather than crash on a corrupted or missing value.
 */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to read "${key}" from localStorage; using fallback.`, error);
    return fallback;
  }
}

/**
 * JSON-stringifies and writes a value to localStorage. Swallows failures
 * (quota exceeded, storage disabled/full, private-mode restrictions) so a
 * write failure never crashes the app — state still updates in memory for
 * the rest of the session even if it can't be persisted.
 */
export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write "${key}" to localStorage.`, error);
  }
}
