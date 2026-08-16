export const GUEST_OPERATIONAL_STATES = [
  'Expected',
  'Arrived',
  'At Hotel',
  'En Route to Church',
  'At Church',
  'At Reception',
  'Departed',
  'Assistance Required',
] as const;
export type GuestOperationalState = (typeof GUEST_OPERATIONAL_STATES)[number];

/**
 * Lightweight day-of operational tracking for a guest — created only for
 * VIPs, elderly guests, accessibility cases, and key family members, never
 * for the full guest list (section 26: "not surveillance").
 */
export interface GuestOperationalStatus {
  id: string;
  guestId: string;
  state: GuestOperationalState;
  isVip: boolean;
  assistanceNote?: string;
  lastUpdatedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
