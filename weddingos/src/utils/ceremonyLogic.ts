import type { CeremonyItem, CeremonyParticipant } from '@/types';
import { DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES } from '@/types';
import { daysUntil, todayISO } from './date';

const READY_OR_BEYOND: CeremonyItem['status'][] = ['Ready', 'In Transit', 'At Venue', 'Used', 'Returned', 'Not Applicable'];

export function isCeremonyItemReady(item: CeremonyItem): boolean {
  return READY_OR_BEYOND.includes(item.status);
}

export function isCriticalCeremonyItem(item: CeremonyItem, criticalCategories: string[] = DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES): boolean {
  return criticalCategories.includes(item.category);
}

/** Whether an item's named custodian matches a known participant, and if so whether that participant has confirmed. Null = no custodian set, or custodian doesn't match a tracked participant. */
export function isCustodianConfirmed(item: CeremonyItem, participants: CeremonyParticipant[]): boolean | null {
  if (!item.custodian) return null;
  const match = participants.find((p) => p.name === item.custodian);
  return match ? match.confirmed : null;
}

/** Section 11: per-item warnings. */
export function computeCeremonyItemWarnings(
  item: CeremonyItem,
  weddingDate: string,
  participants: CeremonyParticipant[],
  referenceDate: string = todayISO(),
  criticalCategories: string[] = DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES,
): string[] {
  const warnings: string[] = [];
  const daysToWedding = daysUntil(weddingDate, new Date(referenceDate));

  if (item.applicability === 'Confirm with Parish / Family') {
    if (item.category === 'Minnu' && daysToWedding !== null && daysToWedding <= 30) {
      warnings.push('Minnu applicability still unresolved within 30 days of the wedding.');
    }
    if (item.category === 'Manthrakodi' && daysToWedding !== null && daysToWedding <= 30) {
      warnings.push('Manthrakodi applicability still unresolved within 30 days of the wedding.');
    }
    return warnings;
  }
  if (item.applicability !== 'Applicable') return warnings;

  if (!item.owner) warnings.push('No owner assigned.');
  if (!item.custodian) warnings.push('No custodian assigned.');
  if (!item.storageLocation) warnings.push('Storage location unknown.');

  if (
    isCriticalCeremonyItem(item, criticalCategories) &&
    item.verificationStatus !== 'Verified' &&
    daysToWedding !== null &&
    daysToWedding <= 7
  ) {
    warnings.push('Critical item not verified within 7 days of the wedding.');
  }

  if (item.category === 'Rings' && !isCeremonyItemReady(item) && daysToWedding !== null && daysToWedding <= 14) {
    warnings.push('Rings not Ready within 14 days of the wedding.');
  }

  if (
    (item.category === 'Marriage Documents' || item.category === 'Church Program' || item.category === 'Scripture / Reading') &&
    !isCeremonyItemReady(item) &&
    daysToWedding !== null &&
    daysToWedding <= 7
  ) {
    warnings.push('Ceremony documents not Ready within 7 days of the wedding.');
  }

  const custodianConfirmed = isCustodianConfirmed(item, participants);
  if (custodianConfirmed === false) {
    warnings.push(`Custodian "${item.custodian}" has not confirmed participation.`);
  }

  return warnings;
}
