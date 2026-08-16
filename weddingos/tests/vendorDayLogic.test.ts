import { describe, expect, it } from 'vitest';
import type { VendorDayStatus } from '@/types';
import { hasVendorArrived, isVendorFullyReady, isVendorLate, isVendorNoShow, isVendorSetupIncompleteNearServiceStart, isVendorTeamShort } from '@/utils/vendorDayLogic';

function status(overrides: Partial<VendorDayStatus> = {}): VendorDayStatus {
  return {
    id: 'vds-1',
    vendorId: 'vendor-1',
    primaryContactConfirmed: false,
    setupComplete: false,
    serviceReady: false,
    finalSettlementChecked: false,
    status: 'Expected',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('hasVendorArrived', () => {
  it('treats Arrived, Setting Up, Ready, In Service, and Completed as arrived', () => {
    for (const s of ['Arrived', 'Setting Up', 'Ready', 'In Service', 'Completed'] as const) {
      expect(hasVendorArrived(status({ status: s }))).toBe(true);
    }
  });

  it('treats Expected, En Route, Delayed, and No Show as not yet arrived', () => {
    for (const s of ['Expected', 'En Route', 'Delayed', 'No Show'] as const) {
      expect(hasVendorArrived(status({ status: s }))).toBe(false);
    }
  });
});

describe('isVendorLate (section 18)', () => {
  it('flags a vendor past its expected arrival plus the grace period', () => {
    const late = isVendorLate(status({ expectedArrivalTime: '2027-01-30T09:00:00.000Z' }), 30, '2027-01-30T09:45:00.000Z');
    expect(late).toBe(true);
  });

  it('does not flag a vendor still within the grace period', () => {
    const late = isVendorLate(status({ expectedArrivalTime: '2027-01-30T09:00:00.000Z' }), 30, '2027-01-30T09:15:00.000Z');
    expect(late).toBe(false);
  });

  it('never flags a vendor that has already arrived', () => {
    const late = isVendorLate(status({ expectedArrivalTime: '2027-01-30T09:00:00.000Z', status: 'Arrived' }), 30, '2027-01-30T12:00:00.000Z');
    expect(late).toBe(false);
  });

  it('never flags a No Show vendor as merely late', () => {
    const late = isVendorLate(status({ expectedArrivalTime: '2027-01-30T09:00:00.000Z', status: 'No Show' }), 30, '2027-01-30T12:00:00.000Z');
    expect(late).toBe(false);
  });

  it('does not flag a vendor with no expected arrival time on file', () => {
    expect(isVendorLate(status(), 30, '2027-01-30T12:00:00.000Z')).toBe(false);
  });
});

describe('isVendorTeamShort (section 18)', () => {
  it('flags an actual team size smaller than expected', () => {
    expect(isVendorTeamShort(status({ teamSizeExpected: 6, teamSizeActual: 4 }))).toBe(true);
  });

  it('does not flag a team meeting or exceeding the expected size', () => {
    expect(isVendorTeamShort(status({ teamSizeExpected: 6, teamSizeActual: 6 }))).toBe(false);
    expect(isVendorTeamShort(status({ teamSizeExpected: 6, teamSizeActual: 8 }))).toBe(false);
  });

  it('does not flag when either team size is unset', () => {
    expect(isVendorTeamShort(status({ teamSizeExpected: 6 }))).toBe(false);
    expect(isVendorTeamShort(status({ teamSizeActual: 4 }))).toBe(false);
  });
});

describe('isVendorSetupIncompleteNearServiceStart (section 18)', () => {
  it('flags incomplete setup within the warning window before service start', () => {
    const flagged = isVendorSetupIncompleteNearServiceStart(status({ setupComplete: false }), '2027-01-30T10:00:00.000Z', 60, '2027-01-30T09:30:00.000Z');
    expect(flagged).toBe(true);
  });

  it('does not flag when setup is already complete', () => {
    const flagged = isVendorSetupIncompleteNearServiceStart(status({ setupComplete: true }), '2027-01-30T10:00:00.000Z', 60, '2027-01-30T09:30:00.000Z');
    expect(flagged).toBe(false);
  });

  it('does not flag well before the warning window', () => {
    const flagged = isVendorSetupIncompleteNearServiceStart(status({ setupComplete: false }), '2027-01-30T10:00:00.000Z', 60, '2027-01-30T06:00:00.000Z');
    expect(flagged).toBe(false);
  });
});

describe('isVendorNoShow / isVendorFullyReady (section 18)', () => {
  it('identifies a No Show vendor', () => {
    expect(isVendorNoShow(status({ status: 'No Show' }))).toBe(true);
    expect(isVendorNoShow(status({ status: 'Arrived' }))).toBe(false);
  });

  it('requires contact confirmed, setup complete, and service ready to be fully ready', () => {
    expect(isVendorFullyReady(status({ primaryContactConfirmed: true, setupComplete: true, serviceReady: true }))).toBe(true);
    expect(isVendorFullyReady(status({ primaryContactConfirmed: true, setupComplete: true, serviceReady: false }))).toBe(false);
    expect(isVendorFullyReady(status())).toBe(false);
  });
});
