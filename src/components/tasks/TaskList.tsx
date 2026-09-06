import type { Tag, Task } from '../../types';
import { EmptyState } from '../EmptyState';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  hasAnyTasks: boolean;
  isFiltering: boolean;
  isLoading: boolean;
  isError: boolean;
  onToggle: (id: string) => void;
  onSetTag: (id: string, tag: Tag | undefined) => void;
  onDelete: (id: string) => void;
}

export function TaskList({
  tasks,
  hasAnyTasks,
  isFiltering,
  isLoading,
  isError,
  onToggle,
  onSetTag,
  onDelete,
}: TaskListProps) {
  if (isError) {
    return <EmptyState message="Couldn't load your tasks. Refresh to try again." />;
  }

  if (isLoading) {
    return <EmptyState message="Loading tasks…" />;
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        message={
          hasAnyTasks && isFiltering
            ? 'No tasks match your filters.'
            : 'No tasks yet — add one above.'
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onSetTag={onSetTag}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
