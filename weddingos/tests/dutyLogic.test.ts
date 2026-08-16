import { describe, expect, it } from 'vitest';
import type { DutyAssignment } from '@/types';
import { DEFAULT_CRITICAL_DUTY_ROLES } from '@/types';
import { criticalDutiesWithoutBackup, criticalDutiesWithoutPhone, detectDutyOverlaps, isCriticalDutyRole, isDutyShiftTooShort, missingCriticalDutyRoles } from '@/utils/dutyLogic';

function duty(overrides: Partial<DutyAssignment> = {}): DutyAssignment {
  return {
    id: 'duty-1',
    role: 'Other',
    personName: 'Test Person',
    status: 'Planned',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isCriticalDutyRole', () => {
  it('treats the default critical roles as critical', () => {
    expect(isCriticalDutyRole('Day-of Command Lead')).toBe(true);
  });

  it('treats a non-critical role as not critical', () => {
    expect(isCriticalDutyRole('Guest Registration')).toBe(false);
  });
});

describe('missingCriticalDutyRoles (section 16)', () => {
  it('returns critical roles with nobody assigned', () => {
    const duties = [duty({ role: 'Day-of Command Lead' })];
    const missing = missingCriticalDutyRoles(duties, DEFAULT_CRITICAL_DUTY_ROLES);
    expect(missing).not.toContain('Day-of Command Lead');
    expect(missing).toContain('Church Lead');
  });

  it('returns all critical roles when none are assigned', () => {
    expect(missingCriticalDutyRoles([], DEFAULT_CRITICAL_DUTY_ROLES)).toEqual(DEFAULT_CRITICAL_DUTY_ROLES);
  });

  it('returns an empty list when every critical role is covered', () => {
    const duties = DEFAULT_CRITICAL_DUTY_ROLES.map((role, i) => duty({ id: `d${i}`, role }));
    expect(missingCriticalDutyRoles(duties, DEFAULT_CRITICAL_DUTY_ROLES)).toEqual([]);
  });
});

describe('criticalDutiesWithoutPhone / criticalDutiesWithoutBackup (section 16)', () => {
  it('flags a critical duty with no phone', () => {
    const duties = [duty({ role: 'Church Lead', phone: undefined })];
    expect(criticalDutiesWithoutPhone(duties, DEFAULT_CRITICAL_DUTY_ROLES).map((d) => d.id)).toEqual(['duty-1']);
  });

  it('does not flag a critical duty with a phone', () => {
    const duties = [duty({ role: 'Church Lead', phone: '+91 90000 12345' })];
    expect(criticalDutiesWithoutPhone(duties, DEFAULT_CRITICAL_DUTY_ROLES)).toEqual([]);
  });

  it('does not flag a non-critical role for missing phone', () => {
    const duties = [duty({ role: 'Guest Registration', phone: undefined })];
    expect(criticalDutiesWithoutPhone(duties, DEFAULT_CRITICAL_DUTY_ROLES)).toEqual([]);
  });

  it('flags a critical duty with no backup person', () => {
    const duties = [duty({ role: 'Ceremony Item Custodian', backupPersonName: undefined })];
    expect(criticalDutiesWithoutBackup(duties, DEFAULT_CRITICAL_DUTY_ROLES).map((d) => d.id)).toEqual(['duty-1']);
  });

  it('does not flag a critical duty with a backup person', () => {
    const duties = [duty({ role: 'Ceremony Item Custodian', backupPersonName: 'Backup Person' })];
    expect(criticalDutiesWithoutBackup(duties, DEFAULT_CRITICAL_DUTY_ROLES)).toEqual([]);
  });
});

describe('detectDutyOverlaps (section 16)', () => {
  it('flags the same person assigned two duties with overlapping time windows', () => {
    const duties = [
      duty({ id: 'a', personName: 'Nikhil Thomas', startTime: '08:00', endTime: '10:00' }),
      duty({ id: 'b', personName: 'Nikhil Thomas', startTime: '09:00', endTime: '11:00' }),
    ];
    const overlaps = detectDutyOverlaps(duties);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].personName).toBe('Nikhil Thomas');
  });

  it('does not flag non-overlapping duties for the same person', () => {
    const duties = [
      duty({ id: 'a', personName: 'Nikhil Thomas', startTime: '08:00', endTime: '09:00' }),
      duty({ id: 'b', personName: 'Nikhil Thomas', startTime: '09:30', endTime: '10:30' }),
    ];
    expect(detectDutyOverlaps(duties)).toEqual([]);
  });

  it('is case-insensitive when matching the same person', () => {
    const duties = [
      duty({ id: 'a', personName: 'nikhil thomas', startTime: '08:00', endTime: '10:00' }),
      duty({ id: 'b', personName: 'Nikhil Thomas', startTime: '09:00', endTime: '11:00' }),
    ];
    expect(detectDutyOverlaps(duties)).toHaveLength(1);
  });

  it('does not flag overlapping duties for different people', () => {
    const duties = [
      duty({ id: 'a', personName: 'Person A', startTime: '08:00', endTime: '10:00' }),
      duty({ id: 'b', personName: 'Person B', startTime: '09:00', endTime: '11:00' }),
    ];
    expect(detectDutyOverlaps(duties)).toEqual([]);
  });

  it('ignores duties with no start time', () => {
    const duties = [duty({ id: 'a', personName: 'Person A' }), duty({ id: 'b', personName: 'Person A', startTime: '09:00', endTime: '11:00' })];
    expect(detectDutyOverlaps(duties)).toEqual([]);
  });
});

describe('isDutyShiftTooShort (section 16)', () => {
  it('flags a duty ending before the required end time', () => {
    expect(isDutyShiftTooShort(duty({ endTime: '20:00' }), '22:00')).toBe(true);
  });

  it('does not flag a duty ending at or after the required end time', () => {
    expect(isDutyShiftTooShort(duty({ endTime: '22:00' }), '22:00')).toBe(false);
  });

  it('does not flag a duty with no end time set', () => {
    expect(isDutyShiftTooShort(duty(), '22:00')).toBe(false);
  });
});
