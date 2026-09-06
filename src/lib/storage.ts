export const STORAGE_KEYS = {
  tasks: 'taskapp.tasks',
  notes: 'taskapp.notes',
} as const;

/** Set once the one-time localStorage → Supabase migration has run. */
export const MIGRATED_KEY = 'taskapp.migrated';

/**
 * Reads and JSON-parses a localStorage value. Falls back to `fallback` when
 * the key is absent, the stored value isn't valid JSON, or localStorage
 * itself is unavailable. Only used now by the one-time migration in
 * `migrateLocalData.ts` — the app's live data lives in Supabase.
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
