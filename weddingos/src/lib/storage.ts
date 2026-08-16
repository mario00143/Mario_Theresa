/**
 * Thin, safe wrapper around window.localStorage.
 * This is the ONLY module allowed to touch window.localStorage directly —
 * everything else goes through lib/store.ts so Phase 2 can swap the
 * backing implementation (e.g. Supabase) without touching call sites.
 */

const PREFIX = 'weddingos:';

export function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeRaw(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* no-op */
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  writeRaw(key, JSON.stringify(value));
}

export const STORAGE_KEYS = {
  settings: 'settings',
  tasks: 'tasks',
  decisions: 'decisions',
  owners: 'owners',
  households: 'households',
  guests: 'guests',
  travelSegments: 'travelSegments',
  hotels: 'hotels',
  roomTypes: 'roomTypes',
  rooms: 'rooms',
  roomAssignments: 'roomAssignments',
  vehicles: 'vehicles',
  drivers: 'drivers',
  transportRoutes: 'transportRoutes',
  transportAssignments: 'transportAssignments',
  vendors: 'vendors',
  vendorContacts: 'vendorContacts',
  vendorQuotes: 'vendorQuotes',
  contracts: 'contracts',
  budgetCategories: 'budgetCategories',
  budgetItems: 'budgetItems',
  paymentSchedules: 'paymentSchedules',
  payments: 'payments',
  refunds: 'refunds',
  seeded: 'seeded',
} as const;
