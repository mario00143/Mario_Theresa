import type { AppSettings, Owner, Hotel, Vendor } from '@/types';

export interface OnboardingChecklistItem {
  label: string;
  complete: boolean;
  detail: string;
}

/**
 * Section 63's Real Data Onboarding Checklist — run once Demo Data
 * Cleanup is done, before relying on WeddingOS for the actual wedding.
 * Pure presence/non-placeholder checks only, no judgement on quality.
 */
export function computeOnboardingChecklist(settings: AppSettings, owners: Owner[], hotels: Hotel[], vendors: Vendor[]): OnboardingChecklistItem[] {
  return [
    { label: 'Couple names', complete: Boolean(settings.couple.groomName.trim() && settings.couple.brideName.trim()), detail: 'Settings → Event Details' },
    { label: 'Denomination', complete: settings.weddingDetails.denomination !== 'To Be Confirmed', detail: 'Settings → Event Details' },
    { label: 'Church', complete: Boolean(settings.wedding.church.trim()), detail: 'Settings → Event Details' },
    { label: 'Reception venue', complete: Boolean(settings.wedding.receptionVenue.trim()), detail: 'Settings → Event Details' },
    { label: 'Ceremony time', complete: Boolean(settings.wedding.ceremonyTime.trim()), detail: 'Settings → Event Details' },
    { label: 'Reception time', complete: Boolean(settings.wedding.receptionTime.trim()), detail: 'Settings → Event Details' },
    { label: 'Guest count target', complete: settings.weddingDetails.targetGuestCount > 0, detail: 'Settings → Event Details' },
    { label: 'Overall budget', complete: settings.weddingDetails.overallBudget > 0, detail: 'Settings → Event Details' },
    { label: 'Owner roles assigned', complete: owners.length > 0, detail: 'Settings → Owner Roles' },
    { label: 'Primary hotel(s) added', complete: hotels.length > 0, detail: 'Logistics → Hotels' },
    { label: 'Key vendor(s) added', complete: vendors.length > 0, detail: 'Vendors & Budget → Vendors' },
  ];
}
