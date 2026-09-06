import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

/**
 * React state that is transparently persisted to localStorage under `key`.
 *
 * - Reads once on mount via a lazy initializer, not on every render.
 * - `isValid`, if given, is a coarse whole-value shape check (e.g. "is this
 *   even an array?") run once at load time; a stored value that fails it is
 *   discarded in favour of `initialValue` rather than trusted. Finer-grained
 *   per-item validation is the caller's responsibility.
 * - Writes to localStorage on every state change.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  isValid?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const stored = readJSON<unknown>(key, initialValue);
    if (isValid && !isValid(stored)) return initialValue;
    return stored as T;
  });

  useEffect(() => {
    writeJSON(key, state);
  }, [key, state]);

  return [state, setState];
}
