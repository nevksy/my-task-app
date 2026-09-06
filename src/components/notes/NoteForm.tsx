import { Plus } from 'lucide-react';
import { useState } from 'react';
import { isBlank } from '../../utils/text';

interface NoteFormProps {
  onAdd: (content: string) => void;
}

/** Add-note form. Uses a textarea + explicit submit button rather than
 * submit-on-Enter, since Enter/Shift+Enter need to insert newlines for
 * markdown-friendly multi-line notes. */
export function NoteForm({ onAdd }: NoteFormProps) {
  const [content, setContent] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBlank(content)) return;
    onAdd(content);
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Jot down a quick note… (markdown-friendly)"
        aria-label="Note content"
        rows={3}
        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
      <button
        type="submit"
        disabled={isBlank(content)}
        className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add note
      </button>
    </form>
  );
}
