import type { CateringPlan, PhotoGroup, PhotographyPlan } from '@/types';

/** Section 25: coverage should start before the ceremony itself, to capture preparation. */
export function isCoverageStartTooLate(plan: PhotographyPlan, ceremonyStartDateTimeISO: string | undefined): boolean {
  if (!plan.coverageStart || !ceremonyStartDateTimeISO) return false;
  const coverageStart = new Date(plan.coverageStart).getTime();
  const ceremonyStart = new Date(ceremonyStartDateTimeISO).getTime();
  if (Number.isNaN(coverageStart) || Number.isNaN(ceremonyStart)) return false;
  return coverageStart >= ceremonyStart;
}

/** Section 25 warnings for a photography plan. */
export function computePhotographyPlanWarnings(
  plan: PhotographyPlan,
  cateringPlans: CateringPlan[],
  photoGroups: PhotoGroup[],
  ceremonyStartDateTimeISO?: string,
): string[] {
  const warnings: string[] = [];

  if (!plan.churchRestrictionsConfirmed) warnings.push('Church restrictions not confirmed.');
  if (!plan.deliveryDueDate) warnings.push('Delivery due date missing.');
  if (plan.droneRequired && !plan.churchRestrictionsConfirmed) warnings.push('Drone coverage planned but restrictions are unknown.');
  if (isCoverageStartTooLate(plan, ceremonyStartDateTimeISO)) warnings.push('Coverage starts after preparation likely begins.');

  const teamSize = (plan.photographerCount ?? 0) + (plan.videographerCount ?? 0);
  if (teamSize > 0) {
    const mealsPlanned = cateringPlans.some((c) => c.event === plan.event && (c.vendorMealCount ?? 0) > 0);
    if (!mealsPlanned) warnings.push('Photographer/videographer meals not included in any vendor meal count.');
  }

  const relevantGroups = photoGroups.filter((g) => g.event === plan.event);
  if (relevantGroups.length === 0) warnings.push('Family group list incomplete — no photo groups defined for this event.');

  return warnings;
}

/** Section 25: must-have groups need a coordinator. */
export function mustHaveGroupsWithoutCoordinator(groups: PhotoGroup[]): PhotoGroup[] {
  return groups.filter((g) => g.priority === 'Must Have' && !g.coordinator);
}
