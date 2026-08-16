import type { CloseoutItem } from '@/types';

export interface CloseoutProgress {
  total: number;
  complete: number;
  exceptions: number;
  percent: number;
}

export function computeCloseoutProgress(items: CloseoutItem[]): CloseoutProgress {
  const total = items.length;
  const complete = items.filter((i) => i.status === 'Complete').length;
  const exceptions = items.filter((i) => i.status === 'Exception').length;
  return { total, complete, exceptions, percent: total === 0 ? 0 : Math.round((complete / total) * 100) };
}

export function closeoutExceptions(items: CloseoutItem[]): CloseoutItem[] {
  return items.filter((i) => i.status === 'Exception');
}

export function pendingCloseoutItems(items: CloseoutItem[]): CloseoutItem[] {
  return items.filter((i) => i.status === 'Pending' || i.status === 'In Progress');
}

/** Overdue: not yet complete and past its dueTime (compared against the reference clock time — same wedding day). */
export function isCloseoutItemOverdue(item: CloseoutItem, referenceTime: string): boolean {
  if (item.status === 'Complete' || !item.dueTime) return false;
  return item.dueTime < referenceTime;
}
