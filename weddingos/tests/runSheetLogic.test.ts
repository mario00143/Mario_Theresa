import { describe, expect, it } from 'vitest';
import type { RunSheetItem } from '@/types';
import { seedSettings } from '@/data/settings.seed';
import {
  computeRunSheetTimingStatus,
  formatRunSheetClockTime,
  formatRunSheetRelativeLabel,
  getCurrentRunSheetItem,
  getNextRunSheetItems,
  resolveRunSheetPlannedDateTimeISO,
  sortRunSheetItems,
} from '@/utils/runSheetLogic';

const settings = seedSettings(); // wedding.date=2027-01-30, ceremonyTime=10:00, receptionTime=19:00

function item(overrides: Partial<RunSheetItem> = {}): RunSheetItem {
  return {
    id: 'rs-1',
    event: 'Wedding',
    date: '2027-01-30',
    relativeReference: 'None',
    activity: 'Test activity',
    category: 'Other',
    status: 'Planned',
    participantIds: [],
    vendorIds: [],
    requiredItemIds: [],
    relatedTaskIds: [],
    relatedTransportRouteIds: [],
    dependencyIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('resolveRunSheetPlannedDateTimeISO (section 6)', () => {
  it('resolves a fixed-time item from its startTime', () => {
    const iso = resolveRunSheetPlannedDateTimeISO(item({ startTime: '08:00' }), settings);
    expect(iso).toBe('2027-01-30T08:00:00');
  });

  it('returns null for a fixed-time item with no startTime', () => {
    expect(resolveRunSheetPlannedDateTimeISO(item(), settings)).toBeNull();
  });

  it('resolves a Ceremony Start relative item using the offset', () => {
    const iso = resolveRunSheetPlannedDateTimeISO(item({ relativeReference: 'Ceremony Start', relativeOffsetMinutes: 30 }), settings);
    expect(new Date(iso!).getTime() - new Date('2027-01-30T10:00:00').getTime()).toBe(30 * 60_000);
  });

  it('resolves a Reception Start relative item with a negative offset (before reception)', () => {
    const iso = resolveRunSheetPlannedDateTimeISO(item({ relativeReference: 'Reception Start', relativeOffsetMinutes: -60 }), settings);
    expect(new Date(iso!).getTime() - new Date('2027-01-30T19:00:00').getTime()).toBe(-60 * 60_000);
  });

  it('live-recomputes when the ceremony time changes in settings, without persisting a stale value', () => {
    const relativeItem = item({ relativeReference: 'Ceremony Start', relativeOffsetMinutes: 0 });
    const original = resolveRunSheetPlannedDateTimeISO(relativeItem, settings);
    const laterCeremony = { ...settings, wedding: { ...settings.wedding, ceremonyTime: '11:00' } };
    const updated = resolveRunSheetPlannedDateTimeISO(relativeItem, laterCeremony);
    expect(updated).not.toBe(original);
    expect(new Date(updated!).getTime() - new Date(original!).getTime()).toBe(60 * 60_000);
  });
});

describe('formatRunSheetRelativeLabel', () => {
  it('shows the fixed startTime for a None-reference item', () => {
    expect(formatRunSheetRelativeLabel(item({ startTime: '07:00' }))).toBe('07:00');
  });

  it('shows a placeholder for a fixed item with no time', () => {
    expect(formatRunSheetRelativeLabel(item())).toBe('—');
  });

  it('formats a positive Ceremony Start offset', () => {
    const label = formatRunSheetRelativeLabel(item({ relativeReference: 'Ceremony Start', relativeOffsetMinutes: 35 }));
    expect(label).toContain('C+35');
    expect(label).toContain('after Ceremony Start');
  });

  it('formats a negative Reception Start offset', () => {
    const label = formatRunSheetRelativeLabel(item({ relativeReference: 'Reception Start', relativeOffsetMinutes: -180 }));
    expect(label).toContain('R-180');
    expect(label).toContain('before Reception Start');
  });
});

describe('sortRunSheetItems', () => {
  it('sorts items chronologically by resolved planned time', () => {
    const items = [item({ id: 'late', startTime: '18:00' }), item({ id: 'early', startTime: '06:00' }), item({ id: 'mid', startTime: '12:00' })];
    expect(sortRunSheetItems(items, settings).map((i) => i.id)).toEqual(['early', 'mid', 'late']);
  });

  it('sorts items with no resolvable time to the end', () => {
    const items = [item({ id: 'unresolved' }), item({ id: 'resolved', startTime: '09:00' })];
    expect(sortRunSheetItems(items, settings).map((i) => i.id)).toEqual(['resolved', 'unresolved']);
  });
});

describe('getCurrentRunSheetItem (section 8)', () => {
  it('prefers an In Progress item over a past-planned one', () => {
    const items = [item({ id: 'past', startTime: '06:00', status: 'Complete' }), item({ id: 'active', startTime: '08:00', status: 'In Progress' })];
    expect(getCurrentRunSheetItem(items, settings, '2027-01-30T09:00:00.000Z')?.id).toBe('active');
  });

  it('prefers a Delayed item over a past-planned one', () => {
    const items = [item({ id: 'delayed', startTime: '08:00', status: 'Delayed' })];
    expect(getCurrentRunSheetItem(items, settings, '2027-01-30T09:00:00.000Z')?.id).toBe('delayed');
  });

  it('falls back to the most recent passed-but-unfinished item', () => {
    const items = [item({ id: 'a', startTime: '06:00' }), item({ id: 'b', startTime: '07:00' })];
    expect(getCurrentRunSheetItem(items, settings, '2027-01-30T08:00:00.000Z')?.id).toBe('b');
  });

  it('returns undefined when nothing has started yet', () => {
    const items = [item({ id: 'future', startTime: '20:00' })];
    expect(getCurrentRunSheetItem(items, settings, '2027-01-30T05:00:00.000Z')).toBeUndefined();
  });

  it('excludes Complete/Skipped/Cancelled items from the fallback', () => {
    const items = [item({ id: 'done', startTime: '06:00', status: 'Complete' })];
    expect(getCurrentRunSheetItem(items, settings, '2027-01-30T09:00:00.000Z')).toBeUndefined();
  });
});

describe('getNextRunSheetItems (section 8)', () => {
  it('returns the next N future items in order, excluding the current one', () => {
    const items = [
      item({ id: 'now', startTime: '08:00', status: 'In Progress' }),
      item({ id: 'n1', startTime: '09:00' }),
      item({ id: 'n2', startTime: '10:00' }),
      item({ id: 'n3', startTime: '11:00' }),
      item({ id: 'n4', startTime: '12:00' }),
    ];
    const next = getNextRunSheetItems(items, settings, '2027-01-30T08:30:00.000Z', 3);
    expect(next.map((i) => i.id)).toEqual(['n1', 'n2', 'n3']);
  });

  it('excludes finished, skipped, and cancelled items', () => {
    const items = [
      item({ id: 'past-done', startTime: '05:00', status: 'Complete' }),
      item({ id: 'skipped', startTime: '09:00', status: 'Skipped' }),
      item({ id: 'future', startTime: '10:00' }),
    ];
    const next = getNextRunSheetItems(items, settings, '2027-01-30T08:00:00.000Z');
    expect(next.map((i) => i.id)).toEqual(['future']);
  });
});

describe('computeRunSheetTimingStatus (section 9)', () => {
  it('reports On Time within the 5-minute tolerance band', () => {
    expect(computeRunSheetTimingStatus(item({ startTime: '10:00' }), settings, '2027-01-30T10:03:00.000Z')).toBe('On Time');
  });

  it('reports Ahead when well before the planned time', () => {
    expect(computeRunSheetTimingStatus(item({ startTime: '10:00' }), settings, '2027-01-30T09:30:00.000Z')).toBe('Ahead');
  });

  it('reports a running-late message beyond the tolerance band', () => {
    const status = computeRunSheetTimingStatus(item({ startTime: '10:00' }), settings, '2027-01-30T10:20:00.000Z');
    expect(status).toContain('Running');
    expect(status).toContain('20 min late');
  });

  it('uses actualStartTime instead of the reference time once the item has started', () => {
    const status = computeRunSheetTimingStatus(item({ startTime: '10:00', actualStartTime: '2027-01-30T10:45:00.000Z' }), settings, '2027-01-30T09:00:00.000Z');
    expect(status).toContain('45 min late');
  });

  it('returns On Time for an item with no resolvable planned time', () => {
    expect(computeRunSheetTimingStatus(item(), settings, '2027-01-30T10:00:00.000Z')).toBe('On Time');
  });
});

describe('formatRunSheetClockTime', () => {
  it('formats a valid ISO datetime as HH:mm', () => {
    expect(formatRunSheetClockTime('2027-01-30T10:05:00.000Z')).toMatch(/^\d{2}:\d{2}$/);
  });

  it('returns a placeholder for null/undefined/invalid input', () => {
    expect(formatRunSheetClockTime(null)).toBe('—');
    expect(formatRunSheetClockTime(undefined)).toBe('—');
    expect(formatRunSheetClockTime('not-a-date')).toBe('—');
  });
});
