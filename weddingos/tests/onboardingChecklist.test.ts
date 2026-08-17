import { describe, expect, it } from 'vitest';
import { computeOnboardingChecklist } from '@/utils/onboardingChecklist';
import { seedSettings } from '@/data/settings.seed';
import type { Owner, Hotel, Vendor } from '@/types';

describe('computeOnboardingChecklist (section 63)', () => {
  it('flags every field incomplete for a blank settings object', () => {
    const settings = seedSettings();
    settings.couple = { groomName: '', brideName: '' };
    settings.weddingDetails.denomination = 'To Be Confirmed';
    settings.wedding.church = '';
    settings.wedding.receptionVenue = '';
    settings.wedding.ceremonyTime = '';
    settings.wedding.receptionTime = '';
    settings.weddingDetails.targetGuestCount = 0;
    settings.weddingDetails.overallBudget = 0;

    const items = computeOnboardingChecklist(settings, [], [], []);
    expect(items.every((i) => !i.complete)).toBe(true);
  });

  it('marks fields complete once filled in', () => {
    const settings = seedSettings();
    settings.couple = { groomName: 'Aju', brideName: 'Nithya' };
    settings.weddingDetails.denomination = 'Roman Catholic';
    settings.wedding.church = 'St. Mary\'s';
    settings.wedding.receptionVenue = 'Grand Hall';
    settings.wedding.ceremonyTime = '10:00';
    settings.wedding.receptionTime = '19:00';
    settings.weddingDetails.targetGuestCount = 300;
    settings.weddingDetails.overallBudget = 2000000;

    const owners: Owner[] = [{ id: 'o1', name: 'Groom', isCustom: false }];
    const hotels: Hotel[] = [
      {
        id: 'h1',
        name: 'Test Hotel',
        area: 'Area',
        city: 'City',
        breakfastIncluded: false,
        parkingAvailable: false,
        busAccess: false,
        accessibleRoomsAvailable: false,
        createdAt: '',
        updatedAt: '',
      },
    ];
    const vendors: Vendor[] = [
      { id: 'v1', name: 'Test Vendor', category: 'Catering', status: 'Confirmed', city: 'City', createdAt: '', updatedAt: '' } as Vendor,
    ];

    const items = computeOnboardingChecklist(settings, owners, hotels, vendors);
    expect(items.every((i) => i.complete)).toBe(true);
  });
});
