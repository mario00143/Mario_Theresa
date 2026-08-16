import type { CeremonyItem, CeremonyItemMovement } from '@/types';
import { isCriticalCeremonyItem } from './ceremonyLogic';
import { daysUntil, todayISO } from './date';

/** Movements for one item, oldest first. */
export function movementsForItem(itemId: string, movements: CeremonyItemMovement[]): CeremonyItemMovement[] {
  return movements.filter((m) => m.ceremonyItemId === itemId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function lastMovement(itemId: string, movements: CeremonyItemMovement[]): CeremonyItemMovement | undefined {
  return movementsForItem(itemId, movements).at(-1);
}

/** The item's current location per its most recent movement's toLocation, falling back to its stored storageLocation. */
export function currentLocationForItem(item: CeremonyItem, movements: CeremonyItemMovement[]): string | undefined {
  const last = lastMovement(item.id, movements);
  return last?.toLocation ?? item.storageLocation;
}

/** Section 20: a checkout without a subsequent Received movement. */
export function isItemCheckedOutButNotReceived(itemId: string, movements: CeremonyItemMovement[]): boolean {
  const chain = movementsForItem(itemId, movements);
  const lastCheckoutIndex = chain.map((m) => m.action).lastIndexOf('Checked Out');
  if (lastCheckoutIndex === -1) return false;
  return !chain.slice(lastCheckoutIndex + 1).some((m) => m.action === 'Received');
}

/** Section 20: marked Used but never subsequently Secured or Returned. */
export function isItemUsedButNotSecured(itemId: string, movements: CeremonyItemMovement[]): boolean {
  const chain = movementsForItem(itemId, movements);
  const lastUsedIndex = chain.map((m) => m.action).lastIndexOf('Used');
  if (lastUsedIndex === -1) return false;
  return !chain.slice(lastUsedIndex + 1).some((m) => m.action === 'Secured' || m.action === 'Returned');
}

/** Section 20: critical item not yet Verified, checked within a window before the wedding (mirrors Phase 5's 7-day pattern, tightened to same-day for day-of operations). */
export function isCriticalItemUnverifiedBeforeDeparture(item: CeremonyItem, weddingDate: string, referenceDate: string = todayISO()): boolean {
  if (!isCriticalCeremonyItem(item) || item.applicability !== 'Applicable') return false;
  if (item.verificationStatus === 'Verified') return false;
  const daysLeft = daysUntil(weddingDate, new Date(referenceDate));
  return daysLeft !== null && daysLeft <= 1;
}

/** Section 20: current location doesn't match the item's required location, and its required time is close. */
export function isLocationMismatchNearDeadline(
  item: CeremonyItem,
  movements: CeremonyItemMovement[],
  referenceDateTimeISO: string = new Date().toISOString(),
  warningWindowMinutes = 60,
): boolean {
  if (!item.requiredAtLocation) return false;
  const current = currentLocationForItem(item, movements);
  if (current === item.requiredAtLocation) return false;
  if (!item.requiredByDate) return false;
  const deadlineISO = `${item.requiredByDate}T${item.requiredByTime ?? '23:59'}:00`;
  const deadline = new Date(deadlineISO).getTime();
  const now = new Date(referenceDateTimeISO).getTime();
  if (Number.isNaN(deadline) || Number.isNaN(now)) return false;
  return (deadline - now) / 60_000 <= warningWindowMinutes;
}

export function isCustodianMissing(item: CeremonyItem): boolean {
  return item.applicability === 'Applicable' && !item.custodian?.trim();
}
