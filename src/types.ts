export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number; // epoch ms
}

export interface Note {
  id: string;
  content: string;
  createdAt: number; // epoch ms
}

const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
}

/**
 * Runtime guard for data coming back out of localStorage, which is
 * untyped `unknown` and may be missing fields, corrupted, or hand-edited.
 * Used to drop malformed entries instead of letting them crash render.
 */
export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    isPriority(v.priority) &&
    typeof v.completed === 'boolean' &&
    typeof v.createdAt === 'number'
  );
}

export function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.content === 'string' &&
    typeof v.createdAt === 'number'
  );
}
