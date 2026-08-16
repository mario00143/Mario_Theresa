import type { EmergencyContact, EmergencyContactPriority, EmergencyResponseCard, EmergencyResponseCardType } from '@/types';

const PRIORITY_ORDER: Record<EmergencyContactPriority, number> = { Primary: 0, Secondary: 1, Reference: 2 };

/** Primary contacts first, then Secondary, then Reference; alphabetical by category within each group (section 24). */
export function sortEmergencyContacts(contacts: EmergencyContact[]): EmergencyContact[] {
  return [...contacts].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.category.localeCompare(b.category);
  });
}

export function primaryEmergencyContacts(contacts: EmergencyContact[]): EmergencyContact[] {
  return sortEmergencyContacts(contacts).filter((c) => c.priority === 'Primary');
}

export function findEmergencyResponseCard(cards: EmergencyResponseCard[], type: EmergencyResponseCardType): EmergencyResponseCard | undefined {
  return cards.find((c) => c.type === type);
}
