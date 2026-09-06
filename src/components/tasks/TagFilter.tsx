import type { Tag } from '../../types';
import { TAGS } from '../../types';
import { TAG_LABELS, tagChipClass } from './tags';

interface TagFilterProps {
  selected: Tag | null;
  onChange: (tag: Tag | null) => void;
}

const INACTIVE_CHIP =
  'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800';

/** Single-select tag filter for the task list. Clicking the active chip (or
 * "All") clears the filter. ANDs with the search box in App. */
export function TagFilter({ selected, onChange }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tasks by tag">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={selected === null}
        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
          selected === null
            ? 'border-transparent bg-indigo-600 text-white'
            : INACTIVE_CHIP
        }`}
      >
        All
      </button>
      {TAGS.map((tag) => {
        const active = selected === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(active ? null : tag)}
            aria-pressed={active}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              active ? `border-transparent ${tagChipClass(tag)}` : INACTIVE_CHIP
            }`}
          >
            {TAG_LABELS[tag]}
          </button>
        );
      })}
    </div>
  );
}
