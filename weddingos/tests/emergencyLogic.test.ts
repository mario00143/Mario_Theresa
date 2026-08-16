import { describe, expect, it } from 'vitest';
import type { EmergencyContact, EmergencyResponseCard } from '@/types';
import { findEmergencyResponseCard, primaryEmergencyContacts, sortEmergencyContacts } from '@/utils/emergencyLogic';

function contact(overrides: Partial<EmergencyContact> = {}): EmergencyContact {
  return {
    id: 'ec-1',
    category: 'Hospital',
    name: 'Test Hospital',
    phone: '+91 90000 00001',
    priority: 'Primary',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function card(overrides: Partial<EmergencyResponseCard> = {}): EmergencyResponseCard {
  return {
    id: 'card-1',
    type: 'Medical Emergency',
    title: 'Medical Emergency',
    immediateActions: ['Call the primary medical contact.'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('sortEmergencyContacts / primaryEmergencyContacts (section 24)', () => {
  it('orders Primary contacts before Secondary before Reference', () => {
    const contacts = [contact({ id: 'ref', priority: 'Reference' }), contact({ id: 'primary', priority: 'Primary' }), contact({ id: 'secondary', priority: 'Secondary' })];
    expect(sortEmergencyContacts(contacts).map((c) => c.id)).toEqual(['primary', 'secondary', 'ref']);
  });

  it('sorts alphabetically by category within the same priority', () => {
    const contacts = [contact({ id: 'b', category: 'Police', priority: 'Primary' }), contact({ id: 'a', category: 'Ambulance', priority: 'Primary' })];
    expect(sortEmergencyContacts(contacts).map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('filters to only Primary contacts, still sorted', () => {
    const contacts = [contact({ id: 'sec', priority: 'Secondary' }), contact({ id: 'b', category: 'Police', priority: 'Primary' }), contact({ id: 'a', category: 'Ambulance', priority: 'Primary' })];
    expect(primaryEmergencyContacts(contacts).map((c) => c.id)).toEqual(['a', 'b']);
  });
});

describe('findEmergencyResponseCard (section 25)', () => {
  it('finds a card by its type', () => {
    const cards = [card({ type: 'Medical Emergency' }), card({ id: 'card-2', type: 'Power Failure', title: 'Power Failure' })];
    expect(findEmergencyResponseCard(cards, 'Power Failure')?.id).toBe('card-2');
  });

  it('returns undefined when no card of that type exists', () => {
    expect(findEmergencyResponseCard([card({ type: 'Medical Emergency' })], 'Weather Disruption')).toBeUndefined();
  });
});
