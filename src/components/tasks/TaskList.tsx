import type { Tag, Task } from '../../types';
import { EmptyState } from '../EmptyState';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  hasAnyTasks: boolean;
  isFiltering: boolean;
  onToggle: (id: string) => void;
  onSetTag: (id: string, tag: Tag | undefined) => void;
  onDelete: (id: string) => void;
}

export function TaskList({
  tasks,
  hasAnyTasks,
  isFiltering,
  onToggle,
  onSetTag,
  onDelete,
}: TaskListProps) {
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
