import { describe, expect, it } from 'vitest';
import type { CeremonyItem, GuestOperationalStatus, LiveIssue, RunSheetItem, TransportAssignment, TransportRoute, Vendor, VendorDayStatus } from '@/types';
import { seedSettings } from '@/data/settings.seed';
import { computeCommandCenterAlerts, computeEmergencyAlerts, type CommandCenterAlertsInput } from '@/utils/commandCenterLogic';

const settings = seedSettings();

function runSheetItem(overrides: Partial<RunSheetItem> = {}): RunSheetItem {
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

function ceremonyItem(overrides: Partial<CeremonyItem> = {}): CeremonyItem {
  return {
    id: 'ci-1',
    name: 'Wedding rings',
    category: 'Rings',
    applicability: 'Applicable',
    status: 'Ready',
    verificationStatus: 'Not Verified',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function issue(overrides: Partial<LiveIssue> = {}): LiveIssue {
  return {
    id: 'issue-1',
    title: 'Test issue',
    category: 'Other',
    severity: 'High',
    status: 'Open',
    reportedAt: '2027-01-30T10:00:00.000Z',
    followUpRequired: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function route(overrides: Partial<TransportRoute> = {}): TransportRoute {
  return {
    id: 'route-1',
    name: 'Church Shuttle',
    event: 'Wedding',
    routeType: 'Church Shuttle',
    origin: 'Hotel',
    destination: 'Church',
    status: 'Planned',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function vendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: 'vendor-1',
    name: 'Test Vendor',
    category: 'Catering',
    status: 'Confirmed',
    event: 'Wedding',
    gstApplicable: false,
    finalPrimaryContactConfirmed: false,
    finalBackupContactConfirmed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function vendorDayStatus(overrides: Partial<VendorDayStatus> = {}): VendorDayStatus {
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

function guestStatus(overrides: Partial<GuestOperationalStatus> = {}): GuestOperationalStatus {
  return {
    id: 'gos-1',
    guestId: 'guest-1',
    state: 'Expected',
    isVip: false,
    lastUpdatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function baseInput(overrides: Partial<CommandCenterAlertsInput> = {}): CommandCenterAlertsInput {
  return {
    runSheetItems: [],
    ceremonyItems: [],
    liveIssues: [],
    transportRoutes: [],
    transportAssignments: [],
    vendors: [],
    vendorDayStatuses: [],
    guestOperationalStatuses: [],
    settings,
    referenceDateTimeISO: '2027-01-30T10:00:00.000Z',
    ...overrides,
  };
}

describe('computeCommandCenterAlerts (section 8)', () => {
  it('flags a Delayed run-sheet item', () => {
    const alerts = computeCommandCenterAlerts(baseInput({ runSheetItems: [runSheetItem({ status: 'Delayed', delayMinutes: 10 })] }));
    expect(alerts.some((a) => a.linkType === 'runSheetItem' && a.severity === 'critical' && a.message.includes('delayed'))).toBe(true);
  });

  it('flags an upcoming item with no owner within the next 2 hours', () => {
    const alerts = computeCommandCenterAlerts(
      baseInput({ runSheetItems: [runSheetItem({ startTime: '11:00' })], referenceDateTimeISO: '2027-01-30T10:00:00.000Z' }),
    );
    expect(alerts.some((a) => a.message.includes('no owner'))).toBe(true);
  });

  it('does not flag a no-owner item more than 2 hours away', () => {
    const alerts = computeCommandCenterAlerts(
      baseInput({ runSheetItems: [runSheetItem({ startTime: '18:00' })], referenceDateTimeISO: '2027-01-30T10:00:00.000Z' }),
    );
    expect(alerts.some((a) => a.message.includes('no owner'))).toBe(false);
  });

  it('flags a Vendor-category item with no vendor linked', () => {
    const alerts = computeCommandCenterAlerts(baseInput({ runSheetItems: [runSheetItem({ category: 'Vendor', vendorIds: [] })] }));
    expect(alerts.some((a) => a.message.includes('no vendor linked'))).toBe(true);
  });

  it('flags a required ceremony item that is not yet Verified', () => {
    const alerts = computeCommandCenterAlerts(
      baseInput({
        runSheetItems: [runSheetItem({ requiredItemIds: ['ci-1'] })],
        ceremonyItems: [ceremonyItem({ id: 'ci-1', verificationStatus: 'Not Verified' })],
      }),
    );
    expect(alerts.some((a) => a.severity === 'critical' && a.message.includes('not yet verified'))).toBe(true);
  });

  it('does not flag a required ceremony item once Verified', () => {
    const alerts = computeCommandCenterAlerts(
      baseInput({
        runSheetItems: [runSheetItem({ requiredItemIds: ['ci-1'] })],
        ceremonyItems: [ceremonyItem({ id: 'ci-1', verificationStatus: 'Verified' })],
      }),
    );
    expect(alerts.some((a) => a.message.includes('not yet verified'))).toBe(false);
  });

  it('flags an open High or Critical live issue', () => {
    const alerts = computeCommandCenterAlerts(baseInput({ liveIssues: [issue({ severity: 'Critical' })] }));
    expect(alerts.some((a) => a.linkType === 'liveIssue' && a.severity === 'critical')).toBe(true);
  });

  it('does not flag a Low-severity open issue', () => {
    const alerts = computeCommandCenterAlerts(baseInput({ liveIssues: [issue({ severity: 'Low' })] }));
    expect(alerts.some((a) => a.linkType === 'liveIssue')).toBe(false);
  });

  it('flags a transport route that has not departed past its planned time', () => {
    const alerts = computeCommandCenterAlerts(
      baseInput({
        transportRoutes: [route({ plannedDepartureDate: '2027-01-30', plannedDepartureTime: '07:00', status: 'Planned' })],
        referenceDateTimeISO: '2027-01-30T08:00:00.000Z',
      }),
    );
    expect(alerts.some((a) => a.linkType === 'route')).toBe(true);
  });

  it('flags a vendor past its grace period as late', () => {
    const alerts = computeCommandCenterAlerts(
      baseInput({
        vendors: [vendor()],
        vendorDayStatuses: [vendorDayStatus({ expectedArrivalTime: '2027-01-30T08:00:00.000Z' })],
        referenceDateTimeISO: '2027-01-30T09:30:00.000Z',
      }),
    );
    expect(alerts.some((a) => a.linkType === 'vendor' && a.message.includes('not checked in'))).toBe(true);
  });

  it('flags a No Show vendor', () => {
    const alerts = computeCommandCenterAlerts(baseInput({ vendors: [vendor()], vendorDayStatuses: [vendorDayStatus({ status: 'No Show' })] }));
    expect(alerts.some((a) => a.linkType === 'vendor' && a.message.includes('No Show'))).toBe(true);
  });

  it('flags a tracked guest in Assistance Required state', () => {
    const alerts = computeCommandCenterAlerts(baseInput({ guestOperationalStatuses: [guestStatus({ state: 'Assistance Required' })] }));
    expect(alerts.some((a) => a.linkType === 'guest' && a.message.includes('assistance'))).toBe(true);
  });

  it('flags a transport exception for a tracked guest', () => {
    const assignment: TransportAssignment = {
      id: 'ta-1',
      routeId: 'route-1',
      guestId: 'guest-1',
      seatCount: 1,
      assistanceRequired: false,
      assignmentStatus: 'No Show',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const alerts = computeCommandCenterAlerts(baseInput({ guestOperationalStatuses: [guestStatus()], transportAssignments: [assignment] }));
    expect(alerts.some((a) => a.linkType === 'guest' && a.message.includes('Transport exception'))).toBe(true);
  });

  it('returns no alerts for a clean, fully-planned input', () => {
    const alerts = computeCommandCenterAlerts(baseInput());
    expect(alerts).toEqual([]);
  });
});

describe('computeEmergencyAlerts', () => {
  it('returns only open Critical issues in Medical or Security categories', () => {
    const issues = [issue({ id: 'a', severity: 'Critical', category: 'Medical' }), issue({ id: 'b', severity: 'Critical', category: 'Security' }), issue({ id: 'c', severity: 'Critical', category: 'Catering' })];
    expect(computeEmergencyAlerts(issues).map((i) => i.id).sort()).toEqual(['a', 'b']);
  });

  it('excludes non-Critical issues even in Medical/Security categories', () => {
    const issues = [issue({ severity: 'High', category: 'Medical' })];
    expect(computeEmergencyAlerts(issues)).toEqual([]);
  });

  it('excludes resolved Critical issues', () => {
    const issues = [issue({ severity: 'Critical', category: 'Medical', status: 'Resolved' })];
    expect(computeEmergencyAlerts(issues)).toEqual([]);
  });
});
