import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Priority, Tag } from '../../types';
import { isBlank } from '../../utils/text';
import { TAG_OPTIONS } from './tags';

interface TaskFormProps {
  onAdd: (title: string, priority: Priority, tag?: Tag) => void;
}

/** Add-task form: title + priority. Rejecting blank input is enforced again
 * inside `useTasks().addTask` — the disabled button here is just a UX
 * affordance, not the source of truth for validation. */
export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [tag, setTag] = useState<Tag | ''>('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBlank(title)) return;
    onAdd(title, priority, tag || undefined);
    setTitle('');
    // Priority and tag selections are left as-is so adding several tasks with
    // the same priority/tag in a row doesn't require reselecting them.
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        aria-label="Task title"
        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="Task priority"
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value as Tag | '')}
        aria-label="Task tag"
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">No tag</option>
        {TAG_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isBlank(title)}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add
      </button>
    </form>
  );
}
