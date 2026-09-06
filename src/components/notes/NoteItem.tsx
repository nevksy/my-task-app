import { Trash2 } from 'lucide-react';
import type { Note } from '../../types';

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
}

export function NoteItem({ note, onDelete }: NoteItemProps) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
      {/* whitespace-pre-wrap preserves the note's line breaks/spacing
          verbatim, without pulling in a markdown-rendering dependency. */}
      <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-gray-900 dark:text-gray-100">
        {note.content}
      </p>
      <button
        type="button"
        onClick={() => onDelete(note.id)}
        aria-label="Delete note"
        className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}
