import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { migrateLocalData } from '../lib/migrateLocalData';
import { NOTES_KEY } from '../hooks/useNotes';
import { TASKS_KEY } from '../hooks/useTasks';
import { useAuth } from './useAuth';

/**
 * Runs the one-time localStorage → Supabase import once a user is signed in,
 * then refetches tasks/notes if anything was imported. Guarded so it fires at
 * most once per mount even under React StrictMode's double-invoke.
 */
export function useMigrateLocalData() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!session || startedRef.current) return;
    startedRef.current = true;

    migrateLocalData()
      .then((imported) => {
        if (imported) {
          queryClient.invalidateQueries({ queryKey: TASKS_KEY });
          queryClient.invalidateQueries({ queryKey: NOTES_KEY });
        }
      })
      .catch((error) => {
        console.warn('Local data migration failed; leaving localStorage intact.', error);
      });
  }, [session, queryClient]);
}
