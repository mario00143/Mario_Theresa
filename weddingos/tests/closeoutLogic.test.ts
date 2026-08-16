import { describe, expect, it } from 'vitest';
import type { CloseoutItem } from '@/types';
import { closeoutExceptions, computeCloseoutProgress, isCloseoutItemOverdue, pendingCloseoutItems } from '@/utils/closeoutLogic';

function item(overrides: Partial<CloseoutItem> = {}): CloseoutItem {
  return {
    id: 'co-1',
    category: 'Other',
    title: 'Test closeout item',
    status: 'Pending',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computeCloseoutProgress (section 27)', () => {
  it('computes total/complete/exceptions/percent', () => {
    const items = [item({ status: 'Complete' }), item({ status: 'Complete' }), item({ status: 'Exception' }), item({ status: 'Pending' })];
    const progress = computeCloseoutProgress(items);
    expect(progress).toEqual({ total: 4, complete: 2, exceptions: 1, percent: 50 });
  });

  it('returns 0 percent for an empty checklist without dividing by zero', () => {
    expect(computeCloseoutProgress([])).toEqual({ total: 0, complete: 0, exceptions: 0, percent: 0 });
  });

  it('rounds the percentage', () => {
    const items = [item({ status: 'Complete' }), item({ status: 'Pending' }), item({ status: 'Pending' })];
    expect(computeCloseoutProgress(items).percent).toBe(33);
  });
});

describe('closeoutExceptions / pendingCloseoutItems', () => {
  it('filters to only Exception-status items', () => {
    const items = [item({ id: 'a', status: 'Exception' }), item({ id: 'b', status: 'Complete' })];
    expect(closeoutExceptions(items).map((i) => i.id)).toEqual(['a']);
  });

  it('filters to Pending and In Progress items', () => {
    const items = [item({ id: 'a', status: 'Pending' }), item({ id: 'b', status: 'In Progress' }), item({ id: 'c', status: 'Complete' })];
    expect(pendingCloseoutItems(items).map((i) => i.id).sort()).toEqual(['a', 'b']);
  });
});

describe('isCloseoutItemOverdue (section 27)', () => {
  it('flags an incomplete item past its due time', () => {
    expect(isCloseoutItemOverdue(item({ dueTime: '22:00' }), '23:00')).toBe(true);
  });

  it('does not flag an item not yet at its due time', () => {
    expect(isCloseoutItemOverdue(item({ dueTime: '22:00' }), '21:00')).toBe(false);
  });

  it('never flags a Complete item, regardless of time', () => {
    expect(isCloseoutItemOverdue(item({ dueTime: '22:00', status: 'Complete' }), '23:59')).toBe(false);
  });

  it('does not flag an item with no due time set', () => {
    expect(isCloseoutItemOverdue(item(), '23:59')).toBe(false);
  });
});
