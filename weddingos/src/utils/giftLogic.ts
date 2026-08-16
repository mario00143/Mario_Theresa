import type { GiftPlan, WelcomeKit } from '@/types';
import { daysUntil, todayISO } from './date';

const READY_GIFT_STATUSES: GiftPlan['status'][] = ['Received', 'Packed', 'Distributed'];

/** Section 32 warnings for a single gift plan. */
export function computeGiftPlanWarnings(plan: GiftPlan, weddingDate: string, referenceDate: string = todayISO()): string[] {
  const warnings: string[] = [];
  if (!plan.distributionOwner) warnings.push('Distribution owner missing.');

  const daysLeft = daysUntil(weddingDate, new Date(referenceDate));
  const isFamilyGift = plan.recipientType === 'Bride Parents' || plan.recipientType === 'Groom Parents';
  if (isFamilyGift && !READY_GIFT_STATUSES.includes(plan.status) && daysLeft !== null && daysLeft <= 7) {
    warnings.push('Important family gift not Ready within 7 days of the wedding.');
  }
  if (plan.recipientType === 'Clergy' && plan.status === 'Planned') {
    warnings.push('Clergy gift unresolved.');
  }

  return warnings;
}

/** Section 32: total guest-favor quantity across gift plans vs. confirmed attendance + buffer. */
export function isGuestFavorCountInsufficient(guestGiftPlans: GiftPlan[], confirmedAttendance: number, buffer: number): boolean {
  const totalQuantity = guestGiftPlans.filter((p) => p.recipientType === 'Guests').reduce((sum, p) => sum + p.quantity, 0);
  return totalQuantity < confirmedAttendance + buffer;
}

/** Section 32 warnings for a welcome kit. confirmedTargetCount comes from the caller's guest-grouping logic. */
export function computeWelcomeKitWarnings(kit: WelcomeKit, confirmedTargetCount?: number): string[] {
  const warnings: string[] = [];
  if (confirmedTargetCount !== undefined) {
    if (kit.quantityPrepared < confirmedTargetCount) warnings.push('Quantity prepared is below the confirmed target guest count.');
  } else if (kit.quantityPrepared < kit.quantityPlanned) {
    warnings.push('Quantity prepared is below the planned quantity.');
  }
  if (!kit.distributionOwner) warnings.push('Distribution owner missing.');
  return warnings;
}

/** Section 32: kit not yet delivered even though the earliest guest arrival date has passed/arrived. */
export function isWelcomeKitLateForArrival(kit: WelcomeKit, earliestArrivalDate: string | undefined, referenceDate: string = todayISO()): boolean {
  if (kit.status === 'Delivered' || !earliestArrivalDate) return false;
  return earliestArrivalDate <= referenceDate;
}
