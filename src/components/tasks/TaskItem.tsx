import { Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { PriorityBadge } from './PriorityBadge';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="size-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
      />
      <span
        className={`min-w-0 flex-1 break-words text-sm ${
          task.completed ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {task.title}
      </span>
      <PriorityBadge priority={task.priority} />
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task "${task.title}"`}
        className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}
