import { describe, expect, it } from 'vitest';
import type { CeremonyItem, CeremonyParticipant } from '@/types';
import { computeCeremonyItemWarnings, isCeremonyItemReady, isCriticalCeremonyItem, isCustodianConfirmed } from '@/utils/ceremonyLogic';

function item(overrides: Partial<CeremonyItem> = {}): CeremonyItem {
  return {
    id: 'item-1',
    name: 'Wedding rings',
    category: 'Rings',
    applicability: 'Applicable',
    status: 'Not Procured',
    verificationStatus: 'Not Verified',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function participant(overrides: Partial<CeremonyParticipant> = {}): CeremonyParticipant {
  return {
    id: 'p-1',
    role: 'Ring Custodian',
    name: 'Groom Father',
    confirmed: true,
    rehearsalRequired: false,
    rehearsalConfirmed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ceremony item readiness (section 11)', () => {
  it('treats Ready and beyond as ready', () => {
    expect(isCeremonyItemReady(item({ status: 'Ready' }))).toBe(true);
    expect(isCeremonyItemReady(item({ status: 'Used' }))).toBe(true);
    expect(isCeremonyItemReady(item({ status: 'Not Applicable' }))).toBe(true);
  });

  it('treats Not Procured and Ordered as not ready', () => {
    expect(isCeremonyItemReady(item({ status: 'Not Procured' }))).toBe(false);
    expect(isCeremonyItemReady(item({ status: 'Ordered' }))).toBe(false);
  });

  it('flags the default critical categories', () => {
    expect(isCriticalCeremonyItem(item({ category: 'Rings' }))).toBe(true);
    expect(isCriticalCeremonyItem(item({ category: 'Bouquet' }))).toBe(false);
  });
});

describe('custodian confirmation (section 11)', () => {
  it('returns null when no custodian is set', () => {
    expect(isCustodianConfirmed(item(), [])).toBeNull();
  });

  it('returns null when the custodian does not match a tracked participant', () => {
    expect(isCustodianConfirmed(item({ custodian: 'Unknown Person' }), [participant()])).toBeNull();
  });

  it('returns true when the matching participant has confirmed', () => {
    expect(isCustodianConfirmed(item({ custodian: 'Groom Father' }), [participant({ confirmed: true })])).toBe(true);
  });

  it('returns false when the matching participant has not confirmed', () => {
    expect(isCustodianConfirmed(item({ custodian: 'Groom Father' }), [participant({ confirmed: false })])).toBe(false);
  });
});

describe('ceremony item warnings (section 11)', () => {
  it('produces no warnings for a Not Applicable item', () => {
    expect(computeCeremonyItemWarnings(item({ applicability: 'Not Applicable' }), '2027-01-30', [])).toEqual([]);
  });

  it('flags Minnu applicability unresolved within 30 days of the wedding', () => {
    const warnings = computeCeremonyItemWarnings(item({ category: 'Minnu', applicability: 'Confirm with Parish / Family' }), '2027-01-30', [], '2027-01-05');
    expect(warnings).toContain('Minnu applicability still unresolved within 30 days of the wedding.');
  });

  it('does not flag Minnu applicability far ahead of the wedding', () => {
    const warnings = computeCeremonyItemWarnings(item({ category: 'Minnu', applicability: 'Confirm with Parish / Family' }), '2027-01-30', [], '2026-06-01');
    expect(warnings).toEqual([]);
  });

  it('flags missing owner, custodian, and storage location for an incomplete applicable item', () => {
    const warnings = computeCeremonyItemWarnings(item(), '2027-01-30', [], '2026-06-01');
    expect(warnings).toContain('No owner assigned.');
    expect(warnings).toContain('No custodian assigned.');
    expect(warnings).toContain('Storage location unknown.');
  });

  it('flags a critical unverified item within 7 days of the wedding', () => {
    const warnings = computeCeremonyItemWarnings(
      item({ category: 'Rings', status: 'Ready', verificationStatus: 'Not Verified' }),
      '2027-01-30',
      [],
      '2027-01-25',
    );
    expect(warnings).toContain('Critical item not verified within 7 days of the wedding.');
  });

  it('flags rings not Ready within 14 days of the wedding', () => {
    const warnings = computeCeremonyItemWarnings(item({ category: 'Rings', status: 'Not Procured' }), '2027-01-30', [], '2027-01-20');
    expect(warnings).toContain('Rings not Ready within 14 days of the wedding.');
  });

  it('flags an unconfirmed custodian', () => {
    const warnings = computeCeremonyItemWarnings(
      item({ custodian: 'Groom Father', storageLocation: 'Safe', owner: 'Groom' }),
      '2027-01-30',
      [participant({ name: 'Groom Father', confirmed: false })],
      '2026-06-01',
    );
    expect(warnings).toContain('Custodian "Groom Father" has not confirmed participation.');
  });
});
