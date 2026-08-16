import { describe, expect, it } from 'vitest';
import type { DutyAssignment, EmergencyContact, LiveIssue, Task } from '@/types';
import { buildFinalReadinessExceptions, buildFinalReadinessSnapshot, type FinalReadinessInput } from '@/utils/finalReadinessLogic';

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Test task',
    description: '',
    event: 'Wedding',
    workstream: 'Governance',
    owner: 'Groom',
    status: 'Not Started',
    priority: 'Medium',
    dependencies: [],
    completionCriteria: '',
    tags: [],
    subtasks: [],
    ...overrides,
  };
}

function baseInput(overrides: Partial<FinalReadinessInput> = {}): FinalReadinessInput {
  return {
    tasks: [],
    churchRequirements: [],
    ceremonyItems: [],
    vendors: [],
    guests: [],
    cateringPlans: [],
    roomingListStable: false,
    pickupDropStable: false,
    dutyAssignments: [],
    runSheetItems: [],
    emergencyContacts: [],
    paymentSchedules: [],
    payments: [],
    liveIssues: [],
    weddingDate: '2027-01-30',
    referenceDate: '2027-01-25',
    ...overrides,
  };
}

describe('buildFinalReadinessSnapshot (section 29)', () => {
  it('returns exactly 13 named checks', () => {
    const snapshot = buildFinalReadinessSnapshot(baseInput());
    expect(snapshot).toHaveLength(13);
    expect(snapshot.map((s) => s.label)).toContain('Critical tasks complete');
    expect(snapshot.map((s) => s.label)).toContain('High/critical risks unresolved');
  });

  it('marks critical tasks complete once all Critical-priority tasks are Done', () => {
    const input = baseInput({ tasks: [task({ priority: 'Critical', status: 'Done' })] });
    const check = buildFinalReadinessSnapshot(input).find((s) => s.label === 'Critical tasks complete');
    expect(check?.ready).toBe(true);
  });

  it('flags critical tasks incomplete when a Critical task is not Done', () => {
    const input = baseInput({ tasks: [task({ priority: 'Critical', status: 'In Progress' })] });
    const check = buildFinalReadinessSnapshot(input).find((s) => s.label === 'Critical tasks complete');
    expect(check?.ready).toBe(false);
  });

  it('marks emergency contacts ready once all required categories are on file', () => {
    const contacts: EmergencyContact[] = (['Hospital', 'Ambulance', 'Venue Security', 'Family Emergency'] as const).map((category, i) => ({
      id: `ec-${i}`,
      category,
      name: 'Test',
      phone: '+91 90000 00001',
      priority: 'Primary',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }));
    const check = buildFinalReadinessSnapshot(baseInput({ emergencyContacts: contacts })).find((s) => s.label === 'Emergency contacts complete');
    expect(check?.ready).toBe(true);
  });

  it('flags emergency contacts incomplete when a required category is missing', () => {
    const check = buildFinalReadinessSnapshot(baseInput({ emergencyContacts: [] })).find((s) => s.label === 'Emergency contacts complete');
    expect(check?.ready).toBe(false);
  });

  it('marks the duty roster ready once every critical role is assigned', () => {
    const duties: DutyAssignment[] = [
      'Day-of Command Lead', 'Church Lead', 'Ceremony Lead', 'Clergy Coordinator', 'Ceremony Item Custodian', 'Gift / Cash Custodian', 'Emergency / Medical Contact', 'Venue Closeout Lead',
    ].map((role, i) => ({
      id: `duty-${i}`,
      role: role as DutyAssignment['role'],
      personName: 'Test Person',
      status: 'Planned',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }));
    const check = buildFinalReadinessSnapshot(baseInput({ dutyAssignments: duties })).find((s) => s.label === 'Duty roster assigned');
    expect(check?.ready).toBe(true);
  });

  it('flags high/critical risks unresolved when an open High-severity issue exists', () => {
    const issue: LiveIssue = {
      id: 'issue-1',
      title: 'Test issue',
      category: 'Other',
      severity: 'High',
      status: 'Open',
      reportedAt: '2027-01-25T10:00:00.000Z',
      followUpRequired: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const check = buildFinalReadinessSnapshot(baseInput({ liveIssues: [issue] })).find((s) => s.label === 'High/critical risks unresolved');
    expect(check?.ready).toBe(false);
  });

  it('marks high/critical risks unresolved as ready when there are no open issues', () => {
    const check = buildFinalReadinessSnapshot(baseInput()).find((s) => s.label === 'High/critical risks unresolved');
    expect(check?.ready).toBe(true);
  });

  it('reflects rooming list and pickup/drop stability flags directly', () => {
    const ready = buildFinalReadinessSnapshot(baseInput({ roomingListStable: true, pickupDropStable: true }));
    expect(ready.find((s) => s.label === 'Rooming list stable')?.ready).toBe(true);
    expect(ready.find((s) => s.label === 'Pickup / drop assignments stable')?.ready).toBe(true);
    const notReady = buildFinalReadinessSnapshot(baseInput());
    expect(notReady.find((s) => s.label === 'Rooming list stable')?.ready).toBe(false);
  });
});

describe('buildFinalReadinessExceptions (section 29)', () => {
  it('returns only the not-ready checks, as label/detail exceptions', () => {
    const snapshot = [
      { label: 'A', ready: true, detail: 'ok' },
      { label: 'B', ready: false, detail: 'not ok' },
    ];
    expect(buildFinalReadinessExceptions(snapshot)).toEqual([{ label: 'B', detail: 'not ok' }]);
  });

  it('returns an empty array when everything is ready', () => {
    const snapshot = [{ label: 'A', ready: true, detail: 'ok' }];
    expect(buildFinalReadinessExceptions(snapshot)).toEqual([]);
  });

  it('matches the exceptions derived from a real snapshot with unresolved items', () => {
    const snapshot = buildFinalReadinessSnapshot(baseInput());
    const exceptions = buildFinalReadinessExceptions(snapshot);
    expect(exceptions.length).toBeGreaterThan(0);
    expect(exceptions.every((e) => snapshot.some((s) => s.label === e.label && !s.ready))).toBe(true);
  });
});
