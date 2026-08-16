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

/** Relative weights (not required to sum to 100) used to combine per-section wedding-prep readiness into one overall score. */
export interface WeddingPrepSectionWeights {
  church: number;
  ceremony: number;
  catering: number;
  decor: number;
  attire: number;
  photography: number;
  musicAV: number;
  giftsKits: number;
}

export const DEFAULT_WEDDING_PREP_SECTION_WEIGHTS: WeddingPrepSectionWeights = {
  church: 20,
  ceremony: 20,
  catering: 15,
  decor: 10,
  attire: 10,
  photography: 10,
  musicAV: 5,
  giftsKits: 10,
};

export interface WeddingPrepSettings {
  sectionWeights: WeddingPrepSectionWeights;
}

export interface AppSettings {
  couple: CoupleSettings;
  engagement: EngagementSettings;
  wedding: WeddingSettings;
  weddingDetails: WeddingDetailsSettings;
  finance: FinanceSettings;
  weddingPrep: WeddingPrepSettings;
}
