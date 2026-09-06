import { useMemo } from 'react';
import { STORAGE_KEYS } from '../lib/storage';
import { isNote, type Note } from '../types';
import { generateId } from '../utils/id';
import { isBlank, sanitizeText } from '../utils/text';
import { useLocalStorageState } from './useLocalStorageState';

/**
 * Owns note state and is the only place that constructs note mutations.
 * Notes are always returned newest-first, regardless of storage order.
 */
export function useNotes() {
  const [notes, setNotes] = useLocalStorageState<Note[]>(
    STORAGE_KEYS.notes,
    [],
    (value): value is Note[] => Array.isArray(value),
  );

  const safeNotes = useMemo(
    () => notes.filter(isNote).sort((a, b) => b.createdAt - a.createdAt),
    [notes],
  );

  function addNote(content: string) {
    const clean = sanitizeText(content);
    if (isBlank(clean)) return; // reject empty/whitespace-only notes
    setNotes((prev) => [...prev, { id: generateId(), content: clean, createdAt: Date.now() }]);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }

  return { notes: safeNotes, addNote, deleteNote };
}
