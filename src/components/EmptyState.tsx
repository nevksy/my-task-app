interface EmptyStateProps {
  message: string;
}

/** Shown in place of a list when there's nothing to render, with copy that
 * differs depending on *why* the list is empty (no data at all vs. a search
 * query with no matches) — that distinction is decided by the caller, since
 * an empty array alone can't tell those two cases apart. */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      {message}
    </p>
  );
}
