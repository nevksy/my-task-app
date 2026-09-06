import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Note } from '../types';
import { generateId } from '../utils/id';
import { isBlank, sanitizeText } from '../utils/text';

export const NOTES_KEY = ['notes'] as const;

interface NoteRow {
  id: string;
  content: string;
  created_at: string;
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    content: row.content,
    createdAt: Date.parse(row.created_at),
  };
}

/**
 * Owns note state, backed by Supabase via React Query. Notes come back
 * newest-first straight from the query `order`, so no client-side sort.
 */
export function useNotes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTES_KEY,
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as NoteRow[]).map(rowToNote);
    },
  });

  async function optimistic(apply: (notes: Note[]) => Note[]) {
    await queryClient.cancelQueries({ queryKey: NOTES_KEY });
    const previous = queryClient.getQueryData<Note[]>(NOTES_KEY);
    queryClient.setQueryData<Note[]>(NOTES_KEY, (curr) => apply(curr ?? []));
    return { previous };
  }

  function rollback(context: { previous?: Note[] } | undefined) {
    if (context?.previous) queryClient.setQueryData(NOTES_KEY, context.previous);
  }

  function settle() {
    void queryClient.invalidateQueries({ queryKey: NOTES_KEY });
  }

  const addMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from('notes').insert({ content });
      if (error) throw error;
    },
    onMutate: (content) =>
      optimistic((notes) => [
        { id: `optimistic-${generateId()}`, content, createdAt: Date.now() },
        ...notes,
      ]),
    onError: (_e, _v, context) => rollback(context),
    onSettled: settle,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => optimistic((notes) => notes.filter((note) => note.id !== id)),
    onError: (_e, _v, context) => rollback(context),
    onSettled: settle,
  });

  function addNote(content: string) {
    const clean = sanitizeText(content);
    if (isBlank(clean)) return; // reject empty/whitespace-only notes
    addMutation.mutate(clean);
  }

  function deleteNote(id: string) {
    deleteMutation.mutate(id);
  }

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving: addMutation.isPending || deleteMutation.isPending,
    addNote,
    deleteNote,
  };
}
