import { Trash2 } from 'lucide-react';
import type { Tag, Task } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { TagBadge } from './TagBadge';
import { TAG_OPTIONS } from './tags';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onSetTag: (id: string, tag: Tag | undefined) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onSetTag, onDelete }: TaskItemProps) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="size-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
      />
      <span
        className={`min-w-0 flex-1 basis-40 break-words text-sm ${
          task.completed ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {task.title}
      </span>
      {/* Meta cluster wraps to its own line on narrow screens rather than
          squeezing the title. */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {task.tag && <TagBadge tag={task.tag} />}
        <PriorityBadge priority={task.priority} />
        {/* Quiet inline control for re-tagging an existing task. */}
        <select
          value={task.tag ?? ''}
          onChange={(e) => onSetTag(task.id, (e.target.value as Tag) || undefined)}
          aria-label={`Tag for "${task.title}"`}
          className="rounded border border-gray-200 bg-transparent px-1 py-0.5 text-xs text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:text-gray-400"
        >
          <option value="">No tag</option>
          {TAG_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task "${task.title}"`}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
