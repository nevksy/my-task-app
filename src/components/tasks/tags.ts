import type { Tag } from '../../types';
import { TAGS } from '../../types';

/** Colours deliberately avoid PriorityBadge's red/amber/slate so a tag pill
 * and a priority pill on the same row stay distinguishable. */
const TAG_STYLES: Record<Tag, string> = {
  work: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  personal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  urgent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

export const TAG_LABELS: Record<Tag, string> = {
  work: 'Work',
  personal: 'Personal',
  urgent: 'Urgent',
};

/** Shared by the add form and the per-row tag select. */
export const TAG_OPTIONS: { value: Tag; label: string }[] = TAGS.map((value) => ({
  value,
  label: TAG_LABELS[value],
}));

export function tagChipClass(tag: Tag): string {
  return TAG_STYLES[tag];
}
