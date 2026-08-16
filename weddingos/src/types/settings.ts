import type { VendorCategory } from './vendor';

export const DENOMINATIONS = [
  'To Be Confirmed',
  'Roman Catholic',
  'Syro-Malabar',
  'Syro-Malankara',
  'Orthodox',
  'Jacobite',
  'Mar Thoma',
  'CSI',
  'Pentecostal',
  'Other',
] as const;
export type Denomination = (typeof DENOMINATIONS)[number];

export interface CoupleSettings {
  groomName: string;
  brideName: string;
}

export interface EngagementSettings {
  date: string;
  location: string;
  venue: string;
  startTime: string;
}

export interface WeddingSettings {
  date: string;
  location: string;
  church: string;
  receptionVenue: string;
  ceremonyTime: string;
  receptionTime: string;
}

export interface WeddingDetailsSettings {
  denomination: Denomination;
  targetGuestCount: number;
  maximumGuestCount: number;
  overallBudget: number;
  currency: string;
  timezone: string;
}

export interface FinanceSettings {
  currency: string;
  /** Cash payments at or above this amount trigger a large-cash warning. */
  largeCashWarningThreshold: number;
  /** A budget category's forecast exceeding its plan by this percentage or more is flagged. */
  budgetVarianceWarningPercent: number;
  /** Vendor categories treated as critical for the 72-hour reconfirmation alert. */
  criticalVendorCategories: VendorCategory[];
}

export interface AppSettings {
  couple: CoupleSettings;
  engagement: EngagementSettings;
  wedding: WeddingSettings;
  weddingDetails: WeddingDetailsSettings;
  finance: FinanceSettings;
}
