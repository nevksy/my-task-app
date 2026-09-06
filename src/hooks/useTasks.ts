import { useMemo } from 'react';
import { STORAGE_KEYS } from '../lib/storage';
import { isTask, type Priority, type Task } from '../types';
import { generateId } from '../utils/id';
import { isBlank, sanitizeText } from '../utils/text';
import { useLocalStorageState } from './useLocalStorageState';

/**
 * Owns task state and is the only place that constructs task mutations, so
 * every call site (form, list item) shares the same validation/id/timestamp
 * logic.
 */
export function useTasks() {
  const [tasks, setTasks] = useLocalStorageState<Task[]>(
    STORAGE_KEYS.tasks,
    [],
    (value): value is Task[] => Array.isArray(value),
  );

  // Defensive per-item filter: drops any malformed entries a corrupted or
  // hand-edited storage blob might contain, instead of crashing on render.
  const safeTasks = useMemo(() => tasks.filter(isTask), [tasks]);

  function addTask(title: string, priority: Priority = 'medium') {
    const clean = sanitizeText(title);
    if (isBlank(clean)) return; // reject empty/whitespace-only titles
    setTasks((prev) => [
      ...prev,
      {
        id: generateId(),
        title: clean,
        priority,
        completed: false,
        createdAt: Date.now(),
      },
    ]);
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  return { tasks: safeTasks, addTask, toggleTask, deleteTask };
}
