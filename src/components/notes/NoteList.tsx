import type { Note } from '../../types';
import { EmptyState } from '../EmptyState';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  notes: Note[];
  hasAnyNotes: boolean;
  isSearching: boolean;
  onDelete: (id: string) => void;
}

export function NoteList({ notes, hasAnyNotes, isSearching, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        message={
          hasAnyNotes && isSearching ? 'No notes match your search.' : 'No notes yet — jot one down above.'
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} onDelete={onDelete} />
      ))}
    </ul>
  );
}
