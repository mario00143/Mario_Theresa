import { describe, expect, it } from 'vitest';
import { createSeedBundle } from '@/data/seed';
import { isValidDateString } from '@/utils/date';

describe('household + guest seed data', () => {
  const bundle = createSeedBundle();

  it('includes 25-35 households', () => {
    expect(bundle.households.length).toBeGreaterThanOrEqual(25);
    expect(bundle.households.length).toBeLessThanOrEqual(35);
  });

  it('includes 90-120 guests', () => {
    expect(bundle.guests.length).toBeGreaterThanOrEqual(90);
    expect(bundle.guests.length).toBeLessThanOrEqual(120);
  });

  it('has unique household and guest ids', () => {
    expect(new Set(bundle.households.map((h) => h.id)).size).toBe(bundle.households.length);
    expect(new Set(bundle.guests.map((g) => g.id)).size).toBe(bundle.guests.length);
  });

  it('links most guests to a real household (one orphan is seeded intentionally)', () => {
    const householdIds = new Set(bundle.households.map((h) => h.id));
    const orphaned = bundle.guests.filter((g) => !householdIds.has(g.householdId));
    expect(orphaned.length).toBe(1);
  });

  it('gives every household valid invited-events and a valid side', () => {
    for (const household of bundle.households) {
      expect(['Groom', 'Bride', 'Both']).toContain(household.side);
      expect(household.invitedEvents.length).toBeGreaterThan(0);
      for (const event of household.invitedEvents) {
        expect(['Engagement', 'Wedding']).toContain(event);
      }
    }
  });

  it('gives guests an RSVP response entry for each invited event, with a couple of intentional exceptions', () => {
    let gaps = 0;
    for (const guest of bundle.guests) {
      for (const event of guest.invitedEvents) {
        const hasResponse = guest.rsvpResponses.some((r) => r.event === event);
        if (!hasResponse) gaps += 1;
      }
    }
    // The seed intentionally leaves a small number of gaps to exercise the data-quality report.
    expect(gaps).toBeGreaterThan(0);
    expect(gaps).toBeLessThan(5);
  });

  it('includes at least one duplicate-phone household pair and one similar-name household pair', () => {
    const phones = bundle.households.map((h) => h.primaryPhone).filter(Boolean);
    const dupPhones = phones.filter((p, i) => phones.indexOf(p) !== i);
    expect(dupPhones.length).toBeGreaterThan(0);

    const names = bundle.households.map((h) => h.householdName.toLowerCase());
    expect(names).toContain('varghese family');
    expect(names).toContain('vargheese family');
  });

  it('gives every guest a valid due-date-free but well-formed record', () => {
    for (const guest of bundle.guests) {
      expect(guest.fullName.length).toBeGreaterThan(0);
      expect(['Adult', 'Child', 'Infant']).toContain(guest.ageCategory);
      for (const response of guest.rsvpResponses) {
        if (response.respondedAt) expect(isValidDateString(response.respondedAt)).toBe(true);
      }
    }
  });

  it('includes a mix of RSVP outcomes across the guest list', () => {
    const statuses = new Set(bundle.guests.flatMap((g) => g.rsvpResponses.map((r) => r.status)));
    expect(statuses.has('Attending')).toBe(true);
    expect(statuses.has('Declined')).toBe(true);
    expect(statuses.has('Pending')).toBe(true);
  });
});
