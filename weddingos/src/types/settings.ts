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

/** Section 41: thresholds and toggles for the Wedding Day execution layer. */
export interface WeddingDaySettings {
  commandCenterVisibilityDays: number;
  criticalIssueEscalationMinutes: number;
  highIssueEscalationMinutes: number;
  mediumIssueEscalationMinutes: number;
  vendorArrivalGraceMinutes: number;
  arrivalClusteringWindowMinutes: number;
  defaultCeremonyBufferMinutes: number;
  defaultReceptionBufferMinutes: number;
  /** Wedding Day Mode toggle (section 30) — persisted so it survives a refresh. */
  weddingDayModeEnabled: boolean;
  /** Manual simulation-time override (section 9) so the Command Center can be tested before the real wedding day. */
  simulationDateTimeISO?: string;
}

export const DEFAULT_WEDDING_DAY_SETTINGS: WeddingDaySettings = {
  commandCenterVisibilityDays: 7,
  criticalIssueEscalationMinutes: 5,
  highIssueEscalationMinutes: 15,
  mediumIssueEscalationMinutes: 30,
  vendorArrivalGraceMinutes: 30,
  arrivalClusteringWindowMinutes: 60,
  defaultCeremonyBufferMinutes: 30,
  defaultReceptionBufferMinutes: 30,
  weddingDayModeEnabled: false,
};

export interface AppSettings {
  couple: CoupleSettings;
  engagement: EngagementSettings;
  wedding: WeddingSettings;
  weddingDetails: WeddingDetailsSettings;
  finance: FinanceSettings;
  weddingPrep: WeddingPrepSettings;
  weddingDay: WeddingDaySettings;
}
