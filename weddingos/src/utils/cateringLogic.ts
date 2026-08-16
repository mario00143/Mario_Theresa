import type { AgeCategory, CateringPlan, DietaryPreference, Guest, GuestEvent, MenuItem } from '@/types';
import { todayISO } from './date';

export interface SuggestedCateringCounts {
  confirmedAttendees: number;
  adults: number;
  children: number;
  infants: number;
  vegetarian: number;
  nonVegetarian: number;
  vegan: number;
  jain: number;
  unspecifiedDiet: number;
  allergiesCount: number;
}

/** Section 15: RSVP-derived suggestion only — never auto-overwrites the user-entered guaranteed count. */
export function computeSuggestedCateringCounts(guests: Guest[], event: GuestEvent): SuggestedCateringCounts {
  const attending = guests.filter((g) => g.rsvpResponses.some((r) => r.event === event && r.status === 'Attending'));
  const countByAge = (age: AgeCategory) => attending.filter((g) => g.ageCategory === age).length;
  const countByDiet = (diet: DietaryPreference) => attending.filter((g) => g.dietaryPreference === diet).length;

  return {
    confirmedAttendees: attending.length,
    adults: countByAge('Adult'),
    children: countByAge('Child'),
    infants: countByAge('Infant'),
    vegetarian: countByDiet('Vegetarian'),
    nonVegetarian: countByDiet('Non-Vegetarian'),
    vegan: countByDiet('Vegan'),
    jain: countByDiet('Jain'),
    unspecifiedDiet: countByDiet('Not Specified'),
    allergiesCount: attending.filter((g) => !!g.allergies?.trim()).length,
  };
}

const SIGNIFICANT_GAP_PERCENT = 15;

/** Section 15 warnings. */
export function computeCateringWarnings(
  plan: CateringPlan,
  suggested: SuggestedCateringCounts,
  menuItems: MenuItem[],
  referenceDate: string = todayISO(),
): string[] {
  const warnings: string[] = [];
  const guaranteed = plan.guaranteedCount;

  if (guaranteed !== undefined) {
    if (guaranteed < suggested.confirmedAttendees) warnings.push('Guaranteed count is below confirmed RSVP attendance.');
    if (suggested.confirmedAttendees > 0) {
      const gapPercent = (Math.abs(guaranteed - suggested.confirmedAttendees) / suggested.confirmedAttendees) * 100;
      if (gapPercent >= SIGNIFICANT_GAP_PERCENT) warnings.push('Significant gap between RSVP-confirmed attendance and the guaranteed count.');
    }
  } else if (suggested.confirmedAttendees > 0) {
    warnings.push('No guaranteed count set yet.');
  }

  if (plan.finalCountDueDate && plan.finalCountDueDate < referenceDate && guaranteed === undefined) {
    warnings.push('Final count due date has passed with no guaranteed count recorded.');
  }

  if (suggested.allergiesCount > 0) {
    const hasAllergenPlan = menuItems.some((m) => m.allergens?.trim());
    if (!hasAllergenPlan) warnings.push('Guests with allergies exist but no allergen plan is documented on the menu.');
  }

  if (plan.vendorId && !plan.vendorMealCount) warnings.push('Vendor meals not planned.');
  if (!plan.coupleMealReserved) warnings.push('Couple meal not reserved.');
  if (suggested.unspecifiedDiet > 0) {
    warnings.push(`${suggested.unspecifiedDiet} confirmed guest${suggested.unspecifiedDiet === 1 ? '' : 's'} with unspecified dietary preference.`);
  }

  return warnings;
}
