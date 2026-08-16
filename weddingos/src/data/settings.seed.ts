import type { AppSettings } from '@/types';
import { DEFAULT_WEDDING_PREP_SECTION_WEIGHTS } from '@/types';
import {
  DEFAULT_BUDGET_VARIANCE_WARNING_PERCENT,
  DEFAULT_CRITICAL_VENDOR_CATEGORIES,
  DEFAULT_CURRENCY,
  DEFAULT_LARGE_CASH_WARNING_THRESHOLD,
  ENGAGEMENT_DATE,
  TIMEZONE,
  WEDDING_DATE,
} from '@/lib/constants';

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
    finance: {
      currency: DEFAULT_CURRENCY,
      largeCashWarningThreshold: DEFAULT_LARGE_CASH_WARNING_THRESHOLD,
      budgetVarianceWarningPercent: DEFAULT_BUDGET_VARIANCE_WARNING_PERCENT,
      criticalVendorCategories: [...DEFAULT_CRITICAL_VENDOR_CATEGORIES],
    },
    weddingPrep: {
      sectionWeights: { ...DEFAULT_WEDDING_PREP_SECTION_WEIGHTS },
    },
  };
}
