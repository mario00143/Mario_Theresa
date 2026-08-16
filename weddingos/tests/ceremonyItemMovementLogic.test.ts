import { describe, expect, it } from 'vitest';
import type { CeremonyItem, CeremonyItemMovement } from '@/types';
import {
  currentLocationForItem,
  isCriticalItemUnverifiedBeforeDeparture,
  isCustodianMissing,
  isItemCheckedOutButNotReceived,
  isItemUsedButNotSecured,
  isLocationMismatchNearDeadline,
  lastMovement,
  movementsForItem,
} from '@/utils/ceremonyItemMovementLogic';

function ceremonyItem(overrides: Partial<CeremonyItem> = {}): CeremonyItem {
  return {
    id: 'item-1',
    name: 'Wedding rings (pair)',
    category: 'Rings',
    applicability: 'Applicable',
    status: 'Ready',
    verificationStatus: 'Not Verified',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function movement(overrides: Partial<CeremonyItemMovement> = {}): CeremonyItemMovement {
  return {
    id: 'mv-1',
    ceremonyItemId: 'item-1',
    action: 'Verified',
    timestamp: '2027-01-30T07:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('movementsForItem / lastMovement (section 19)', () => {
  it('returns only movements for the given item, sorted oldest first', () => {
    const movements = [
      movement({ id: 'm2', timestamp: '2027-01-30T08:00:00.000Z' }),
      movement({ id: 'm1', timestamp: '2027-01-30T07:00:00.000Z' }),
      movement({ id: 'other', ceremonyItemId: 'item-2' }),
    ];
    expect(movementsForItem('item-1', movements).map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('returns the most recent movement for the item', () => {
    const movements = [movement({ id: 'm1', timestamp: '2027-01-30T07:00:00.000Z' }), movement({ id: 'm2', timestamp: '2027-01-30T08:00:00.000Z' })];
    expect(lastMovement('item-1', movements)?.id).toBe('m2');
  });

  it('returns undefined when the item has no movements', () => {
    expect(lastMovement('item-1', [])).toBeUndefined();
  });
});

describe('currentLocationForItem', () => {
  it('uses the last movement toLocation when available', () => {
    const movements = [movement({ toLocation: 'Sacristy' })];
    expect(currentLocationForItem(ceremonyItem(), movements)).toBe('Sacristy');
  });

  it('falls back to the item storageLocation when there are no movements', () => {
    expect(currentLocationForItem(ceremonyItem({ storageLocation: 'Best man safe' }), [])).toBe('Best man safe');
  });
});

describe('isItemCheckedOutButNotReceived (section 20)', () => {
  it('flags an item checked out with no subsequent Received movement', () => {
    const movements = [movement({ action: 'Checked Out' })];
    expect(isItemCheckedOutButNotReceived('item-1', movements)).toBe(true);
  });

  it('does not flag once a Received movement follows the checkout', () => {
    const movements = [movement({ id: 'm1', action: 'Checked Out', timestamp: '2027-01-30T07:00:00.000Z' }), movement({ id: 'm2', action: 'Received', timestamp: '2027-01-30T08:00:00.000Z' })];
    expect(isItemCheckedOutButNotReceived('item-1', movements)).toBe(false);
  });

  it('does not flag an item with no checkout at all', () => {
    expect(isItemCheckedOutButNotReceived('item-1', [movement({ action: 'Verified' })])).toBe(false);
  });
});

describe('isItemUsedButNotSecured (section 20)', () => {
  it('flags an item marked Used with no subsequent Secured or Returned movement', () => {
    expect(isItemUsedButNotSecured('item-1', [movement({ action: 'Used' })])).toBe(true);
  });

  it('does not flag once Secured follows Used', () => {
    const movements = [movement({ id: 'm1', action: 'Used', timestamp: '2027-01-30T12:00:00.000Z' }), movement({ id: 'm2', action: 'Secured', timestamp: '2027-01-30T13:00:00.000Z' })];
    expect(isItemUsedButNotSecured('item-1', movements)).toBe(false);
  });

  it('does not flag once Returned follows Used', () => {
    const movements = [movement({ id: 'm1', action: 'Used', timestamp: '2027-01-30T12:00:00.000Z' }), movement({ id: 'm2', action: 'Returned', timestamp: '2027-01-30T13:00:00.000Z' })];
    expect(isItemUsedButNotSecured('item-1', movements)).toBe(false);
  });
});

describe('isCriticalItemUnverifiedBeforeDeparture (section 20)', () => {
  it('flags a critical unverified item within a day of the wedding', () => {
    const flagged = isCriticalItemUnverifiedBeforeDeparture(ceremonyItem({ category: 'Rings', verificationStatus: 'Not Verified' }), '2027-01-30', '2027-01-30');
    expect(flagged).toBe(true);
  });

  it('does not flag a critical item that is already Verified', () => {
    const flagged = isCriticalItemUnverifiedBeforeDeparture(ceremonyItem({ category: 'Rings', verificationStatus: 'Verified' }), '2027-01-30', '2027-01-30');
    expect(flagged).toBe(false);
  });

  it('does not flag a non-critical category', () => {
    const flagged = isCriticalItemUnverifiedBeforeDeparture(ceremonyItem({ category: 'Other', verificationStatus: 'Not Verified' }), '2027-01-30', '2027-01-30');
    expect(flagged).toBe(false);
  });

  it('does not flag well before the wedding', () => {
    const flagged = isCriticalItemUnverifiedBeforeDeparture(ceremonyItem({ category: 'Rings', verificationStatus: 'Not Verified' }), '2027-01-30', '2026-06-01');
    expect(flagged).toBe(false);
  });

  it('does not flag a Not Applicable item', () => {
    const flagged = isCriticalItemUnverifiedBeforeDeparture(ceremonyItem({ category: 'Rings', applicability: 'Not Applicable' }), '2027-01-30', '2027-01-30');
    expect(flagged).toBe(false);
  });
});

describe('isLocationMismatchNearDeadline (section 20)', () => {
  it('flags a location mismatch close to the required deadline', () => {
    const item = ceremonyItem({ requiredAtLocation: 'Church', requiredByDate: '2027-01-30', requiredByTime: '09:00' });
    const flagged = isLocationMismatchNearDeadline(item, [movement({ toLocation: 'Home' })], '2027-01-30T08:30:00.000Z', 60);
    expect(flagged).toBe(true);
  });

  it('does not flag when the current location already matches the required location', () => {
    const item = ceremonyItem({ requiredAtLocation: 'Church', requiredByDate: '2027-01-30', requiredByTime: '09:00' });
    const flagged = isLocationMismatchNearDeadline(item, [movement({ toLocation: 'Church' })], '2027-01-30T08:30:00.000Z', 60);
    expect(flagged).toBe(false);
  });

  it('does not flag well before the deadline window', () => {
    const item = ceremonyItem({ requiredAtLocation: 'Church', requiredByDate: '2027-01-30', requiredByTime: '09:00' });
    const flagged = isLocationMismatchNearDeadline(item, [movement({ toLocation: 'Home' })], '2027-01-29T08:00:00.000Z', 60);
    expect(flagged).toBe(false);
  });

  it('does not flag an item with no required location set', () => {
    const flagged = isLocationMismatchNearDeadline(ceremonyItem(), [movement({ toLocation: 'Home' })], '2027-01-30T08:30:00.000Z', 60);
    expect(flagged).toBe(false);
  });
});

describe('isCustodianMissing', () => {
  it('flags an Applicable item with no custodian', () => {
    expect(isCustodianMissing(ceremonyItem({ custodian: undefined }))).toBe(true);
  });

  it('does not flag an item with a custodian set', () => {
    expect(isCustodianMissing(ceremonyItem({ custodian: 'Best Man' }))).toBe(false);
  });

  it('does not flag a Not Applicable item', () => {
    expect(isCustodianMissing(ceremonyItem({ applicability: 'Not Applicable', custodian: undefined }))).toBe(false);
  });
});
