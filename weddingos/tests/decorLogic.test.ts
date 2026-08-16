import { describe, expect, it } from 'vitest';
import type { ChurchProfile, DecorDeliverable, DecorPlan } from '@/types';
import { computeDecorPlanWarnings, decorDeliverableNeedsVendorLink, isChurchAreaDecorPlan, isDecorWalkthroughOverdue } from '@/utils/decorLogic';

function plan(overrides: Partial<DecorPlan> = {}): DecorPlan {
  return {
    id: 'plan-1',
    event: 'Wedding',
    area: 'Church Aisle',
    approvalStatus: 'Pending',
    finalWalkthroughComplete: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function church(overrides: Partial<ChurchProfile> = {}): ChurchProfile {
  return {
    id: 'church-1',
    event: 'Wedding',
    churchName: "St. Sebastian's",
    denomination: 'Syro-Malabar',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function deliverable(overrides: Partial<DecorDeliverable> = {}): DecorDeliverable {
  return {
    id: 'deliverable-1',
    decorPlanId: 'plan-1',
    name: 'Aisle flowers',
    freshFlowers: true,
    powerRequired: false,
    status: 'Concept',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('church-area décor plans (section 18)', () => {
  it('recognizes the three church areas', () => {
    expect(isChurchAreaDecorPlan(plan({ area: 'Church Entrance' }))).toBe(true);
    expect(isChurchAreaDecorPlan(plan({ area: 'Church Aisle' }))).toBe(true);
    expect(isChurchAreaDecorPlan(plan({ area: 'Altar' }))).toBe(true);
  });

  it('does not treat reception areas as church areas', () => {
    expect(isChurchAreaDecorPlan(plan({ area: 'Stage' }))).toBe(false);
  });
});

describe('décor plan warnings (section 18)', () => {
  it('flags church décor restrictions on file for a church-area plan', () => {
    const warnings = computeDecorPlanWarnings(plan(), church({ decorRestrictions: 'No open flames.' }));
    expect(warnings).toContain('Church décor restrictions are on file — review this plan against them.');
  });

  it('does not flag restrictions for a non-church area', () => {
    const warnings = computeDecorPlanWarnings(plan({ area: 'Stage' }), church({ decorRestrictions: 'No open flames.' }));
    expect(warnings).not.toContain('Church décor restrictions are on file — review this plan against them.');
  });

  it('flags installation scheduled before church access time', () => {
    const warnings = computeDecorPlanWarnings(
      plan({ installDate: '2027-01-30', installStartTime: '06:30' }),
      church({ ceremonyDate: '2027-01-30', accessStartTime: '07:00' }),
    );
    expect(warnings).toContain('Installation is scheduled to begin before church access time.');
  });

  it('does not flag installation scheduled after church access time', () => {
    const warnings = computeDecorPlanWarnings(
      plan({ installDate: '2027-01-30', installStartTime: '08:00' }),
      church({ ceremonyDate: '2027-01-30', accessStartTime: '07:00' }),
    );
    expect(warnings).not.toContain('Installation is scheduled to begin before church access time.');
  });

  it('flags an install deadline after the ceremony date', () => {
    const warnings = computeDecorPlanWarnings(plan({ installDeadline: '2027-01-31' }), church({ ceremonyDate: '2027-01-30' }));
    expect(warnings).toContain('Install deadline falls after the ceremony date.');
  });

  it('flags approved décor with no vendor linked', () => {
    const warnings = computeDecorPlanWarnings(plan({ approvalStatus: 'Approved' }), undefined);
    expect(warnings).toContain('Approved décor has no vendor linked.');
  });

  it('does not flag approved décor once a vendor is linked', () => {
    const warnings = computeDecorPlanWarnings(plan({ approvalStatus: 'Approved', vendorId: 'vendor-1' }), undefined);
    expect(warnings).not.toContain('Approved décor has no vendor linked.');
  });

  it('flags a missing teardown deadline for a non-church area', () => {
    const warnings = computeDecorPlanWarnings(plan({ area: 'Stage' }), undefined);
    expect(warnings).toContain('Teardown deadline is missing.');
  });

  it('does not require a teardown deadline for a church area', () => {
    const warnings = computeDecorPlanWarnings(plan({ area: 'Church Aisle' }), undefined);
    expect(warnings).not.toContain('Teardown deadline is missing.');
  });
});

describe('décor deliverable vendor linkage (section 18)', () => {
  it('flags power-required deliverables when the plan has no vendor', () => {
    expect(decorDeliverableNeedsVendorLink(deliverable({ powerRequired: true }), plan())).toBe(true);
  });

  it('does not flag when the plan has a vendor', () => {
    expect(decorDeliverableNeedsVendorLink(deliverable({ powerRequired: true }), plan({ vendorId: 'vendor-1' }))).toBe(false);
  });

  it('does not flag deliverables that do not require power', () => {
    expect(decorDeliverableNeedsVendorLink(deliverable({ powerRequired: false }), plan())).toBe(false);
  });
});

describe('décor walkthrough overdue (section 18)', () => {
  it('flags an incomplete walkthrough within 24 hours of the event', () => {
    expect(isDecorWalkthroughOverdue(plan(), '2027-01-30T10:00:00.000Z', '2027-01-29T12:00:00.000Z')).toBe(true);
  });

  it('does not flag a completed walkthrough', () => {
    expect(isDecorWalkthroughOverdue(plan({ finalWalkthroughComplete: true }), '2027-01-30T10:00:00.000Z', '2027-01-29T12:00:00.000Z')).toBe(false);
  });

  it('does not flag well outside the 24-hour window', () => {
    expect(isDecorWalkthroughOverdue(plan(), '2027-01-30T10:00:00.000Z', '2026-06-01T00:00:00.000Z')).toBe(false);
  });
});
