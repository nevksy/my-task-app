import { isNote, isTask } from '../types';
import { MIGRATED_KEY, readJSON, STORAGE_KEYS } from './storage';
import { supabase } from './supabase';

/**
 * One-time import of any tasks/notes left in localStorage by the pre-auth
 * version of the app into the signed-in user's Supabase account.
 *
 * Runs at most once per browser: the `taskapp.migrated` flag is set on
 * completion (even when there was nothing to import). The old localStorage
 * keys are left in place as a manual backup.
 *
 * Returns `true` only when rows were actually inserted, so the caller can
 * refetch.
 */
export async function migrateLocalData(): Promise<boolean> {
  if (localStorage.getItem(MIGRATED_KEY)) return false;

  const rawTasks = readJSON<unknown>(STORAGE_KEYS.tasks, []);
  const rawNotes = readJSON<unknown>(STORAGE_KEYS.notes, []);
  const tasks = Array.isArray(rawTasks) ? rawTasks.filter(isTask) : [];
  const notes = Array.isArray(rawNotes) ? rawNotes.filter(isNote) : [];

  if (tasks.length === 0 && notes.length === 0) {
    localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
    return false;
  }

  if (tasks.length > 0) {
    const { error } = await supabase.from('tasks').insert(
      tasks.map((task) => ({
        title: task.title,
        priority: task.priority,
        completed: task.completed,
        tag: task.tag ?? null,
        created_at: new Date(task.createdAt).toISOString(),
      })),
    );
    if (error) throw error;
  }

  if (notes.length > 0) {
    const { error } = await supabase.from('notes').insert(
      notes.map((note) => ({
        content: note.content,
        created_at: new Date(note.createdAt).toISOString(),
      })),
    );
    if (error) throw error;
  }

  localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
  return true;
}
