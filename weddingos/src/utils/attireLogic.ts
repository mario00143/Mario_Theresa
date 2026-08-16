import type { AttireItem, AttireProfile } from '@/types';
import { daysUntil, todayISO } from './date';

const READY_STATUSES: AttireProfile['status'][] = ['Ready', 'Packed', 'Worn'];
const PACKED_STATUSES: AttireProfile['status'][] = ['Packed', 'Worn'];

export function isAttireReady(profile: AttireProfile): boolean {
  return READY_STATUSES.includes(profile.status);
}

export function isAttirePacked(profile: AttireProfile): boolean {
  return PACKED_STATUSES.includes(profile.status);
}

/** Section 21 warnings for one attire profile and its items. */
export function computeAttireProfileWarnings(
  profile: AttireProfile,
  items: AttireItem[],
  eventDate: string,
  eventDateTimeISO: string,
  referenceDate: string = todayISO(),
  referenceDateTimeISO: string = new Date().toISOString(),
): string[] {
  const warnings: string[] = [];
  const daysLeft = daysUntil(eventDate, new Date(referenceDate));

  if (!isAttireReady(profile) && daysLeft !== null && daysLeft <= 14) {
    warnings.push('Main outfit not Ready within 14 days of the event.');
  }
  if (!profile.finalFittingDate && daysLeft !== null && daysLeft <= 21) {
    warnings.push('Final fitting not yet scheduled within 21 days of the event.');
  }
  if (profile.finalFittingDate && profile.finalFittingDate < referenceDate && !isAttireReady(profile)) {
    warnings.push('Final fitting was scheduled for the past but has not been completed.');
  }

  const shoes = items.filter((i) => i.category === 'Shoes');
  if (shoes.length > 0 && shoes.some((s) => s.status !== 'Ready' && s.status !== 'Packed') && daysLeft !== null && daysLeft <= 14) {
    warnings.push('Shoes not Ready within 14 days of the event.');
  }

  for (const item of items) {
    if (item.required && item.status === 'Not Started') {
      warnings.push(`Critical accessory missing: ${item.itemName}.`);
    }
  }

  const eventTime = new Date(eventDateTimeISO).getTime();
  const now = new Date(referenceDateTimeISO).getTime();
  if (!Number.isNaN(eventTime) && !Number.isNaN(now)) {
    const hoursLeft = (eventTime - now) / (1000 * 60 * 60);
    if (!isAttirePacked(profile) && hoursLeft <= 48 && hoursLeft >= -48) {
      warnings.push('Outfit not packed within 48 hours of the event.');
    }
  }

  if (profile.personRole.trim().toLowerCase() === 'groom') {
    const hasBackupShirt = items.some((i) => i.category === 'Shirt' && i.backupAvailable);
    if (!hasBackupShirt) warnings.push('Backup shirt missing for the groom.');
  }

  return warnings;
}

export interface AttireTimingConflict {
  profileAId: string;
  profileBId: string;
  message: string;
}

/** Section 21: same person's outfits across events/occasions ready the same day but stored in different places. */
export function detectAttireTimingConflicts(profiles: AttireProfile[]): AttireTimingConflict[] {
  const conflicts: AttireTimingConflict[] = [];
  const byRole = new Map<string, AttireProfile[]>();
  for (const profile of profiles) {
    const list = byRole.get(profile.personRole) ?? [];
    list.push(profile);
    byRole.set(profile.personRole, list);
  }

  for (const [role, list] of byRole) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.readyDate && b.readyDate && a.readyDate === b.readyDate && a.storageLocation && b.storageLocation && a.storageLocation !== b.storageLocation) {
          conflicts.push({
            profileAId: a.id,
            profileBId: b.id,
            message: `${role}'s outfits are both ready ${a.readyDate} but stored in different locations (${a.storageLocation} vs ${b.storageLocation}).`,
          });
        }
      }
    }
  }
  return conflicts;
}
