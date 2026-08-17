import { useMemo, useState } from 'react';

/**
 * Section 43's lightweight pagination for large lists — "only where
 * necessary, not everywhere": a plain client-side "show first N, Load
 * more" window rather than a virtualization library, used only on the
 * list views most likely to hold 1,000+ rows (Guests, Tasks). `.slice()`
 * naturally clamps to a shorter array, so applying a new filter that
 * narrows the result set below the current `visibleCount` just shows
 * everything that matches — no explicit reset needed for that case;
 * `reset()` is offered for callers that want to snap back to page one
 * anyway (e.g. on tab switch).
 */
export function usePagedList<T>(items: T[], pageSize = 200) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visible = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  function loadMore() {
    setVisibleCount((c) => c + pageSize);
  }

  function reset() {
    setVisibleCount(pageSize);
  }

  return { visible, hasMore, loadMore, reset, remaining: Math.max(0, items.length - visibleCount) };
}
