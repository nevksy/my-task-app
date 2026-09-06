import type { Tag } from '../../types';
import { TAG_LABELS, tagChipClass } from './tags';

/** Color-coded tag pill. The label text is always shown alongside the color so
 * the tag is never conveyed by color alone (mirrors PriorityBadge). */
export function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${tagChipClass(tag)}`}
    >
      {TAG_LABELS[tag]}
    </span>
  );
}
