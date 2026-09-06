export type Priority = 'high' | 'medium' | 'low';

export type Tag = 'work' | 'personal' | 'urgent';

// Client-side shapes. Data is stored in Supabase (snake_case columns,
// `created_at` as an ISO timestamp); the hooks in `src/hooks/` map DB rows to
// these shapes, deriving `createdAt` (epoch ms) from `created_at`.

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number; // epoch ms, derived from DB created_at
  tag?: Tag; // optional; undefined means untagged
}

export interface Note {
  id: string;
  content: string;
  createdAt: number; // epoch ms, derived from DB created_at
}

const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
}

export const TAGS: readonly Tag[] = ['work', 'personal', 'urgent'];

export function isTag(value: unknown): value is Tag {
  return typeof value === 'string' && (TAGS as readonly string[]).includes(value);
}

/**
 * Runtime guard for legacy data read out of localStorage during the one-time
 * migration to Supabase — untyped `unknown` that may be missing fields,
 * corrupted, or hand-edited. Used to drop malformed entries before import.
 */
export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    isPriority(v.priority) &&
    typeof v.completed === 'boolean' &&
    typeof v.createdAt === 'number' &&
    (v.tag === undefined || isTag(v.tag))
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
