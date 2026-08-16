import { describe, expect, it } from 'vitest';
import type { RunSheetItem, TransportRoute } from '@/types';
import { seedSettings } from '@/data/settings.seed';
import { computeDelayPropagationPreview, detectDelayConflicts } from '@/utils/delayPropagation';

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

describe('detectDelayConflicts (section 11)', () => {
  it('flags a ceremony start conflict when a Ceremony item is proposed at/after ceremony start', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Ceremony' }), '2027-01-30T10:05:00', settings);
    expect(conflicts.some((c) => c.includes('Ceremony start conflict'))).toBe(true);
  });

  it('does not flag a ceremony conflict for a non-ceremony category', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Other' }), '2027-01-30T10:05:00', settings);
    expect(conflicts.some((c) => c.includes('Ceremony start conflict'))).toBe(false);
  });

  it('flags a venue access violation when a Church item is proposed before access opens', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Church' }), '2027-01-30T06:30:00', settings, {
      churchAccessStartDateTimeISO: '2027-01-30T07:00:00',
    });
    expect(conflicts.some((c) => c.includes('Venue access violation'))).toBe(true);
  });

  it('flags a catering timing conflict when proposed after reception start', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Catering' }), '2027-01-30T19:30:00', settings);
    expect(conflicts.some((c) => c.includes('Catering service timing conflict'))).toBe(true);
  });

  it('flags a transport departure conflict when the proposed time is after the route departure', () => {
    const route: TransportRoute = {
      id: 'route-1',
      name: 'Church Shuttle',
      event: 'Wedding',
      routeType: 'Church Shuttle',
      origin: 'Hotel',
      destination: 'Church',
      status: 'Planned',
      plannedDepartureDate: '2027-01-30',
      plannedDepartureTime: '07:30',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const conflicts = detectDelayConflicts(item({ relatedTransportRouteIds: ['route-1'] }), '2027-01-30T08:00:00', settings, { transportRoutes: [route] });
    expect(conflicts.some((c) => c.includes('Transport departure conflict'))).toBe(true);
  });

  it('flags a vendor contracted end time conflict', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Vendor', date: '2027-01-30', endTime: '16:00' }), '2027-01-30T16:30:00', settings);
    expect(conflicts.some((c) => c.includes('Vendor contracted end time conflict'))).toBe(true);
  });

  it('flags a guest arrival conflict when arrival is proposed at/after ceremony start', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Guest Arrival' }), '2027-01-30T10:15:00', settings);
    expect(conflicts.some((c) => c.includes('Guest arrival/departure conflict'))).toBe(true);
  });

  it('flags a music/AV window conflict when proposed after reception start', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Music / AV' }), '2027-01-30T19:15:00', settings);
    expect(conflicts.some((c) => c.includes('Sound/AV window conflict'))).toBe(true);
  });

  it('returns no conflicts for a well-timed proposal', () => {
    const conflicts = detectDelayConflicts(item({ category: 'Other' }), '2027-01-30T08:00:00', settings);
    expect(conflicts).toEqual([]);
  });
});

describe('computeDelayPropagationPreview (section 10)', () => {
  it('finds direct and transitive dependents of the source item', () => {
    const a = item({ id: 'a', startTime: '08:00' });
    const b = item({ id: 'b', startTime: '08:30', dependencyIds: ['a'] });
    const c = item({ id: 'c', startTime: '09:00', dependencyIds: ['b'] });
    const unrelated = item({ id: 'unrelated', startTime: '10:00' });
    const preview = computeDelayPropagationPreview('a', 15, [a, b, c, unrelated], settings);
    expect(preview.map((r) => r.itemId).sort()).toEqual(['b', 'c']);
  });

  it('proposes a time shifted by exactly shiftMinutes from the original', () => {
    const a = item({ id: 'a', startTime: '08:00' });
    const b = item({ id: 'b', startTime: '08:30', dependencyIds: ['a'] });
    const [row] = computeDelayPropagationPreview('a', 20, [a, b], settings);
    expect(new Date(row.proposedDateTimeISO!).getTime() - new Date(row.originalDateTimeISO!).getTime()).toBe(20 * 60_000);
  });

  it('never mutates the input items', () => {
    const a = item({ id: 'a', startTime: '08:00' });
    const b = item({ id: 'b', startTime: '08:30', dependencyIds: ['a'] });
    const snapshot = JSON.stringify([a, b]);
    computeDelayPropagationPreview('a', 30, [a, b], settings);
    expect(JSON.stringify([a, b])).toBe(snapshot);
  });

  it('returns an empty array when the source item has no dependents', () => {
    const a = item({ id: 'a', startTime: '08:00' });
    expect(computeDelayPropagationPreview('a', 15, [a], settings)).toEqual([]);
  });

  it('includes per-row conflict detection results', () => {
    const a = item({ id: 'a', startTime: '09:55' });
    const b = item({ id: 'b', category: 'Ceremony', startTime: '10:05', dependencyIds: ['a'] });
    const [row] = computeDelayPropagationPreview('a', 10, [a, b], settings);
    expect(row.conflicts.some((c) => c.includes('Ceremony start conflict'))).toBe(true);
  });

  it('carries owner and vendorIds through for caller display', () => {
    const a = item({ id: 'a', startTime: '08:00' });
    const b = item({ id: 'b', startTime: '08:30', dependencyIds: ['a'], owner: 'Best Man', vendorIds: ['v1'] });
    const [row] = computeDelayPropagationPreview('a', 10, [a, b], settings);
    expect(row.owner).toBe('Best Man');
    expect(row.vendorIds).toEqual(['v1']);
  });
});
