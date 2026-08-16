import { describe, expect, it } from 'vitest';
import type { AttireItem, AttireProfile } from '@/types';
import { computeAttireProfileWarnings, detectAttireTimingConflicts, isAttirePacked, isAttireReady } from '@/utils/attireLogic';

function profile(overrides: Partial<AttireProfile> = {}): AttireProfile {
  return {
    id: 'profile-1',
    personRole: 'Groom',
    event: 'Wedding',
    outfitType: 'Sherwani',
    status: 'Researching',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function attireItem(overrides: Partial<AttireItem> = {}): AttireItem {
  return {
    id: 'item-1',
    attireProfileId: 'profile-1',
    itemName: 'Cufflinks',
    category: 'Cufflinks',
    required: true,
    status: 'Not Started',
    backupAvailable: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('attire readiness (section 21)', () => {
  it('treats Ready, Packed, and Worn as ready', () => {
    expect(isAttireReady(profile({ status: 'Ready' }))).toBe(true);
    expect(isAttireReady(profile({ status: 'Packed' }))).toBe(true);
    expect(isAttireReady(profile({ status: 'Worn' }))).toBe(true);
  });

  it('does not treat earlier statuses as ready', () => {
    expect(isAttireReady(profile({ status: 'Alteration' }))).toBe(false);
  });

  it('treats only Packed and Worn as packed', () => {
    expect(isAttirePacked(profile({ status: 'Ready' }))).toBe(false);
    expect(isAttirePacked(profile({ status: 'Packed' }))).toBe(true);
  });
});

describe('attire profile warnings (section 21)', () => {
  const eventDateTime = '2027-01-30T10:00:00.000Z';

  it('flags the main outfit not Ready within 14 days of the event', () => {
    const warnings = computeAttireProfileWarnings(profile({ status: 'Ordered' }), [], '2027-01-30', eventDateTime, '2027-01-20', eventDateTime);
    expect(warnings).toContain('Main outfit not Ready within 14 days of the event.');
  });

  it('flags no final fitting scheduled within 21 days of the event', () => {
    const warnings = computeAttireProfileWarnings(profile({ status: 'Ready' }), [], '2027-01-30', eventDateTime, '2027-01-15', '2027-01-15T00:00:00.000Z');
    expect(warnings).toContain('Final fitting not yet scheduled within 21 days of the event.');
  });

  it('flags a final fitting scheduled in the past but not completed, regardless of proximity to the event', () => {
    const warnings = computeAttireProfileWarnings(
      profile({ status: 'Selected', finalFittingDate: '2026-07-25' }),
      [],
      '2027-01-30',
      eventDateTime,
      '2026-08-01',
      '2026-08-01T00:00:00.000Z',
    );
    expect(warnings).toContain('Final fitting was scheduled for the past but has not been completed.');
  });

  it('does not flag a completed final fitting even if it was in the past', () => {
    const warnings = computeAttireProfileWarnings(
      profile({ status: 'Ready', finalFittingDate: '2026-07-25' }),
      [],
      '2027-01-30',
      eventDateTime,
      '2026-08-01',
      '2026-08-01T00:00:00.000Z',
    );
    expect(warnings).not.toContain('Final fitting was scheduled for the past but has not been completed.');
  });

  it('flags shoes not Ready within 14 days of the event', () => {
    const shoes = attireItem({ category: 'Shoes', status: 'Not Started' });
    const warnings = computeAttireProfileWarnings(profile({ status: 'Ready' }), [shoes], '2027-01-30', eventDateTime, '2027-01-20', eventDateTime);
    expect(warnings).toContain('Shoes not Ready within 14 days of the event.');
  });

  it('flags a required item that has not been started', () => {
    const cufflinks = attireItem({ itemName: 'Cufflinks', required: true, status: 'Not Started' });
    const warnings = computeAttireProfileWarnings(profile(), [cufflinks], '2027-01-30', eventDateTime, '2026-06-01', '2026-06-01T00:00:00.000Z');
    expect(warnings).toContain('Critical accessory missing: Cufflinks.');
  });

  it('does not flag optional items that have not been started', () => {
    const optional = attireItem({ itemName: 'Pocket square', required: false, status: 'Not Started' });
    const warnings = computeAttireProfileWarnings(profile(), [optional], '2027-01-30', eventDateTime, '2026-06-01', '2026-06-01T00:00:00.000Z');
    expect(warnings).not.toContain('Critical accessory missing: Pocket square.');
  });

  it('flags the outfit not packed within 48 hours of the event', () => {
    const warnings = computeAttireProfileWarnings(profile({ status: 'Ready' }), [], '2027-01-30', eventDateTime, '2027-01-29', '2027-01-29T00:00:00.000Z');
    expect(warnings).toContain('Outfit not packed within 48 hours of the event.');
  });

  it('does not flag a packed outfit close to the event', () => {
    const warnings = computeAttireProfileWarnings(profile({ status: 'Packed' }), [], '2027-01-30', eventDateTime, '2027-01-29', '2027-01-29T00:00:00.000Z');
    expect(warnings).not.toContain('Outfit not packed within 48 hours of the event.');
  });

  it('flags a missing backup shirt for the groom', () => {
    const warnings = computeAttireProfileWarnings(
      profile({ personRole: 'Groom', status: 'Ready' }),
      [attireItem({ category: 'Shirt', backupAvailable: false })],
      '2027-01-30',
      eventDateTime,
      '2026-06-01',
      '2026-06-01T00:00:00.000Z',
    );
    expect(warnings).toContain('Backup shirt missing for the groom.');
  });

  it('does not flag a backup shirt once one is available', () => {
    const warnings = computeAttireProfileWarnings(
      profile({ personRole: 'Groom', status: 'Ready' }),
      [attireItem({ category: 'Shirt', backupAvailable: true })],
      '2027-01-30',
      eventDateTime,
      '2026-06-01',
      '2026-06-01T00:00:00.000Z',
    );
    expect(warnings).not.toContain('Backup shirt missing for the groom.');
  });

  it('does not require a backup shirt for a non-groom role', () => {
    const warnings = computeAttireProfileWarnings(
      profile({ personRole: 'Bride', status: 'Ready' }),
      [],
      '2027-01-30',
      eventDateTime,
      '2026-06-01',
      '2026-06-01T00:00:00.000Z',
    );
    expect(warnings).not.toContain('Backup shirt missing for the groom.');
  });
});

describe('attire timing conflicts (section 21)', () => {
  it('flags two profiles for the same role ready the same day but stored in different locations', () => {
    const a = profile({ id: 'a', personRole: 'Bride', readyDate: '2027-01-25', storageLocation: 'Home' });
    const b = profile({ id: 'b', personRole: 'Bride', readyDate: '2027-01-25', storageLocation: 'Venue' });
    const conflicts = detectAttireTimingConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({ profileAId: 'a', profileBId: 'b' });
  });

  it('does not flag profiles for different roles', () => {
    const a = profile({ id: 'a', personRole: 'Bride', readyDate: '2027-01-25', storageLocation: 'Home' });
    const b = profile({ id: 'b', personRole: 'Groom', readyDate: '2027-01-25', storageLocation: 'Venue' });
    expect(detectAttireTimingConflicts([a, b])).toEqual([]);
  });

  it('does not flag profiles stored in the same location', () => {
    const a = profile({ id: 'a', personRole: 'Bride', readyDate: '2027-01-25', storageLocation: 'Home' });
    const b = profile({ id: 'b', personRole: 'Bride', readyDate: '2027-01-25', storageLocation: 'Home' });
    expect(detectAttireTimingConflicts([a, b])).toEqual([]);
  });
});
