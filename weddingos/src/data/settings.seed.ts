import type { AppSettings } from '@/types';
import { DEFAULT_CURRENCY, ENGAGEMENT_DATE, TIMEZONE, WEDDING_DATE } from '@/lib/constants';

export function seedSettings(): AppSettings {
  return {
    couple: {
      groomName: 'Groom',
      brideName: 'Bride',
    },
    engagement: {
      date: ENGAGEMENT_DATE,
      location: 'Goa, India',
      venue: 'Venue to be confirmed',
      startTime: '18:00',
    },
    wedding: {
      date: WEDDING_DATE,
      location: 'Hyderabad, Telangana, India',
      church: 'Church to be confirmed',
      receptionVenue: 'Venue to be confirmed',
      ceremonyTime: '10:00',
      receptionTime: '19:00',
    },
    weddingDetails: {
      denomination: 'Syro-Malabar',
      targetGuestCount: 400,
      maximumGuestCount: 500,
      overallBudget: 4500000,
      currency: DEFAULT_CURRENCY,
      timezone: TIMEZONE,
    },
  };
}
