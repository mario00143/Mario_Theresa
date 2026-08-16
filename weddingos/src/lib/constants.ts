export const TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_CURRENCY = 'INR';
export const DATE_DISPLAY_FORMAT = 'dd MMM yyyy';

export const ENGAGEMENT_DATE = '2027-01-11';
export const WEDDING_DATE = '2027-01-30';

/** Protected engagement period: inclusive ISO date bounds. */
export const PROTECTED_PERIOD_START = '2027-01-08';
export const PROTECTED_PERIOD_END = '2027-01-13';

export const PROTECTED_PERIOD_MESSAGE =
  'Protected engagement period — consider completing this task earlier.';

export const DUE_SOON_SHORT_DAYS = 7;
export const DUE_SOON_LONG_DAYS = 14;

export const APP_NAME = 'WeddingOS';
export const APP_SUBTITLE = 'Wedding Command Center';

export const DEFAULT_LARGE_CASH_WARNING_THRESHOLD = 50000;
export const DEFAULT_BUDGET_VARIANCE_WARNING_PERCENT = 10;
/** Vendor categories critical enough to require reconfirmation within 72 hours of the wedding. */
export const DEFAULT_CRITICAL_VENDOR_CATEGORIES = [
  'Church / Parish',
  'Reception Venue',
  'Catering',
  'Décor',
  'Lighting',
  'Sound / AV',
  'Photography',
  'Videography',
  'Transportation',
] as const;
export const CRITICAL_VENDOR_RECONFIRMATION_HOURS = 72;
