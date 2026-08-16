import { describe, expect, it } from 'vitest';
import type { CateringPlan, PhotoGroup, PhotographyPlan } from '@/types';
import { computePhotographyPlanWarnings, isCoverageStartTooLate, mustHaveGroupsWithoutCoordinator } from '@/utils/photographyLogic';

function plan(overrides: Partial<PhotographyPlan> = {}): PhotographyPlan {
  return {
    id: 'plan-1',
    event: 'Wedding',
    droneRequired: false,
    liveStreamingRequired: false,
    sameDayEditRequired: false,
    rawFilesIncluded: false,
    albumIncluded: false,
    highlightsVideoIncluded: false,
    fullFilmIncluded: false,
    churchRestrictionsConfirmed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function group(overrides: Partial<PhotoGroup> = {}): PhotoGroup {
  return {
    id: 'group-1',
    event: 'Wedding',
    groupName: 'Immediate family',
    sequenceOrder: 1,
    participants: [],
    priority: 'Must Have',
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function cateringPlan(overrides: Partial<CateringPlan> = {}): CateringPlan {
  return {
    id: 'catering-1',
    event: 'Wedding',
    serviceStyle: 'Buffet',
    coupleMealReserved: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('coverage start timing (section 25)', () => {
  it('flags coverage starting at or after the ceremony', () => {
    expect(isCoverageStartTooLate(plan({ coverageStart: '2027-01-30T10:00:00.000Z' }), '2027-01-30T09:00:00.000Z')).toBe(true);
  });

  it('does not flag coverage starting before the ceremony', () => {
    expect(isCoverageStartTooLate(plan({ coverageStart: '2027-01-30T07:00:00.000Z' }), '2027-01-30T10:00:00.000Z')).toBe(false);
  });

  it('does not flag when coverage start or ceremony time is missing', () => {
    expect(isCoverageStartTooLate(plan(), '2027-01-30T10:00:00.000Z')).toBe(false);
    expect(isCoverageStartTooLate(plan({ coverageStart: '2027-01-30T07:00:00.000Z' }), undefined)).toBe(false);
  });
});

describe('photography plan warnings (section 25)', () => {
  it('flags church restrictions not confirmed', () => {
    expect(computePhotographyPlanWarnings(plan(), [], [group()])).toContain('Church restrictions not confirmed.');
  });

  it('flags a missing delivery due date', () => {
    expect(computePhotographyPlanWarnings(plan(), [], [group()])).toContain('Delivery due date missing.');
  });

  it('flags a drone planned without confirmed restrictions', () => {
    const warnings = computePhotographyPlanWarnings(plan({ droneRequired: true }), [], [group()]);
    expect(warnings).toContain('Drone coverage planned but restrictions are unknown.');
  });

  it('flags photographer/videographer meals not included in a vendor meal count', () => {
    const warnings = computePhotographyPlanWarnings(plan({ photographerCount: 1 }), [cateringPlan({ vendorMealCount: undefined })], [group()]);
    expect(warnings).toContain('Photographer/videographer meals not included in any vendor meal count.');
  });

  it('does not flag meals when a vendor meal count is planned', () => {
    const warnings = computePhotographyPlanWarnings(plan({ photographerCount: 1 }), [cateringPlan({ vendorMealCount: 2 })], [group()]);
    expect(warnings).not.toContain('Photographer/videographer meals not included in any vendor meal count.');
  });

  it('flags an incomplete group list when no photo groups exist for the event', () => {
    expect(computePhotographyPlanWarnings(plan(), [], [])).toContain('Family group list incomplete — no photo groups defined for this event.');
  });

  it('does not flag the group list once groups are defined for the event', () => {
    expect(computePhotographyPlanWarnings(plan(), [], [group({ event: 'Wedding' })])).not.toContain(
      'Family group list incomplete — no photo groups defined for this event.',
    );
  });

  it('produces no warnings for a fully confirmed plan with a defined group list', () => {
    const warnings = computePhotographyPlanWarnings(plan({ churchRestrictionsConfirmed: true, deliveryDueDate: '2027-03-01' }), [], [group()]);
    expect(warnings).toEqual([]);
  });
});

describe('must-have photo groups without a coordinator (section 25)', () => {
  it('flags a must-have group with no coordinator', () => {
    expect(mustHaveGroupsWithoutCoordinator([group({ priority: 'Must Have', coordinator: undefined })])).toHaveLength(1);
  });

  it('does not flag once a coordinator is assigned', () => {
    expect(mustHaveGroupsWithoutCoordinator([group({ priority: 'Must Have', coordinator: 'Aunt Mary' })])).toHaveLength(0);
  });

  it('does not flag lower-priority groups', () => {
    expect(mustHaveGroupsWithoutCoordinator([group({ priority: 'Nice to Have', coordinator: undefined })])).toHaveLength(0);
  });
});
