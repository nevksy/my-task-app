import type { Task } from '../../types';
import { EmptyState } from '../EmptyState';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  hasAnyTasks: boolean;
  isSearching: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, hasAnyTasks, isSearching, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        message={
          hasAnyTasks && isSearching ? 'No tasks match your search.' : 'No tasks yet — add one above.'
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
