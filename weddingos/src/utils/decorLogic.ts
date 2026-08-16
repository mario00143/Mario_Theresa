import type { ChurchProfile, DecorDeliverable, DecorPlan } from '@/types';

const CHURCH_AREAS: DecorPlan['area'][] = ['Church Entrance', 'Church Aisle', 'Altar'];

export function isChurchAreaDecorPlan(plan: DecorPlan): boolean {
  return CHURCH_AREAS.includes(plan.area);
}

/** Section 18 warnings for a décor plan, given the church profile it may need to be checked against. */
export function computeDecorPlanWarnings(plan: DecorPlan, church: ChurchProfile | undefined): string[] {
  const warnings: string[] = [];
  const atChurch = isChurchAreaDecorPlan(plan);

  if (atChurch && church?.decorRestrictions?.trim()) {
    warnings.push('Church décor restrictions are on file — review this plan against them.');
  }

  if (atChurch && plan.installStartTime && church?.accessStartTime && plan.installDate === church.ceremonyDate) {
    if (plan.installStartTime < church.accessStartTime) {
      warnings.push('Installation is scheduled to begin before church access time.');
    }
  }

  const ceremonyDate = church?.ceremonyDate;
  if (atChurch && ceremonyDate && plan.installDeadline && plan.installDeadline > ceremonyDate) {
    warnings.push('Install deadline falls after the ceremony date.');
  }

  if (plan.approvalStatus === 'Approved' && !plan.vendorId) {
    warnings.push('Approved décor has no vendor linked.');
  }

  if (!atChurch && !plan.teardownDeadline) {
    warnings.push('Teardown deadline is missing.');
  }

  return warnings;
}

/** Section 18: "power required but no production/vendor link" — checked at the deliverable level against its plan. */
export function decorDeliverableNeedsVendorLink(deliverable: DecorDeliverable, plan: DecorPlan | undefined): boolean {
  return deliverable.powerRequired && !plan?.vendorId;
}

/** Section 18: final walkthrough incomplete within 24 hours of the event. */
export function isDecorWalkthroughOverdue(plan: DecorPlan, eventDateTimeISO: string, referenceDateTimeISO: string = new Date().toISOString()): boolean {
  if (plan.finalWalkthroughComplete) return false;
  const eventTime = new Date(eventDateTimeISO).getTime();
  const now = new Date(referenceDateTimeISO).getTime();
  if (Number.isNaN(eventTime) || Number.isNaN(now)) return false;
  const hoursUntil = (eventTime - now) / (1000 * 60 * 60);
  return hoursUntil <= 24 && hoursUntil >= -24;
}
