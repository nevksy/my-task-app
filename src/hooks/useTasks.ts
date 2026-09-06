import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Priority, Tag, Task } from '../types';
import { generateId } from '../utils/id';
import { isBlank, sanitizeText } from '../utils/text';

export const TASKS_KEY = ['tasks'] as const;

interface TaskRow {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  tag: Tag | null;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    completed: row.completed,
    tag: row.tag ?? undefined,
    createdAt: Date.parse(row.created_at),
  };
}

/**
 * Owns task state, now backed by Supabase (Postgres + RLS) via React Query.
 * The exported action names/signatures match the pre-auth localStorage
 * version so call sites (form, list item) are unchanged; validation still
 * lives here as the single source of truth.
 */
export function useTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TASKS_KEY,
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as TaskRow[]).map(rowToTask);
    },
  });

  /** Optimistically rewrite the cached list, returning a rollback snapshot. */
  async function optimistic(apply: (tasks: Task[]) => Task[]) {
    await queryClient.cancelQueries({ queryKey: TASKS_KEY });
    const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
    queryClient.setQueryData<Task[]>(TASKS_KEY, (curr) => apply(curr ?? []));
    return { previous };
  }

  function rollback(context: { previous?: Task[] } | undefined) {
    if (context?.previous) queryClient.setQueryData(TASKS_KEY, context.previous);
  }

  function settle() {
    void queryClient.invalidateQueries({ queryKey: TASKS_KEY });
  }

  const addMutation = useMutation({
    mutationFn: async (input: { title: string; priority: Priority; tag?: Tag }) => {
      const { error } = await supabase.from('tasks').insert({
        title: input.title,
        priority: input.priority,
        tag: input.tag ?? null,
      });
      if (error) throw error;
    },
    onMutate: (input) =>
      optimistic((tasks) => [
        ...tasks,
        {
          id: `optimistic-${generateId()}`,
          title: input.title,
          priority: input.priority,
          completed: false,
          tag: input.tag,
          createdAt: Date.now(),
        },
      ]),
    onError: (_e, _v, context) => rollback(context),
    onSettled: settle,
  });

  const toggleMutation = useMutation({
    mutationFn: async (input: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: input.completed })
        .eq('id', input.id);
      if (error) throw error;
    },
    onMutate: (input) =>
      optimistic((tasks) =>
        tasks.map((task) => (task.id === input.id ? { ...task, completed: input.completed } : task)),
      ),
    onError: (_e, _v, context) => rollback(context),
    onSettled: settle,
  });

  const setTagMutation = useMutation({
    mutationFn: async (input: { id: string; tag: Tag | undefined }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ tag: input.tag ?? null })
        .eq('id', input.id);
      if (error) throw error;
    },
    onMutate: (input) =>
      optimistic((tasks) =>
        tasks.map((task) => (task.id === input.id ? { ...task, tag: input.tag } : task)),
      ),
    onError: (_e, _v, context) => rollback(context),
    onSettled: settle,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => optimistic((tasks) => tasks.filter((task) => task.id !== id)),
    onError: (_e, _v, context) => rollback(context),
    onSettled: settle,
  });

  function addTask(title: string, priority: Priority = 'medium', tag?: Tag) {
    const clean = sanitizeText(title);
    if (isBlank(clean)) return; // reject empty/whitespace-only titles
    addMutation.mutate({ title: clean, priority, tag });
  }

  function toggleTask(id: string) {
    const current = query.data?.find((task) => task.id === id);
    if (!current) return;
    toggleMutation.mutate({ id, completed: !current.completed });
  }

  function setTaskTag(id: string, tag: Tag | undefined) {
    setTagMutation.mutate({ id, tag });
  }

  function deleteTask(id: string) {
    deleteMutation.mutate(id);
  }

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving:
      addMutation.isPending ||
      toggleMutation.isPending ||
      setTagMutation.isPending ||
      deleteMutation.isPending,
    addTask,
    toggleTask,
    setTaskTag,
    deleteTask,
  };
}
