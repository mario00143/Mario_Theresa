import type { VendorDayStatus } from '@/types';

const ARRIVED_OR_BEYOND: VendorDayStatus['status'][] = ['Arrived', 'Setting Up', 'Ready', 'In Service', 'Completed'];

export function hasVendorArrived(status: VendorDayStatus): boolean {
  return ARRIVED_OR_BEYOND.includes(status.status);
}

/** Section 18: not yet arrived and past expected arrival time + grace period. */
export function isVendorLate(status: VendorDayStatus, graceMinutes: number, referenceDateTimeISO: string = new Date().toISOString()): boolean {
  if (hasVendorArrived(status) || status.status === 'No Show') return false;
  if (!status.expectedArrivalTime) return false;
  const expected = new Date(status.expectedArrivalTime).getTime();
  const now = new Date(referenceDateTimeISO).getTime();
  if (Number.isNaN(expected) || Number.isNaN(now)) return false;
  return now - expected > graceMinutes * 60_000;
}

/** Section 18: actual team size on-site is smaller than what was expected. */
export function isVendorTeamShort(status: VendorDayStatus): boolean {
  return status.teamSizeExpected !== undefined && status.teamSizeActual !== undefined && status.teamSizeActual < status.teamSizeExpected;
}

/** Section 18: setup still incomplete close to the vendor's expected service-start (its expected departure marks the far end of its window, so we use expectedArrivalTime + a short runway as the "near service start" proxy is unreliable — the caller should pass the actual service-start reference). */
export function isVendorSetupIncompleteNearServiceStart(status: VendorDayStatus, serviceStartDateTimeISO: string, warningWindowMinutes: number, referenceDateTimeISO: string = new Date().toISOString()): boolean {
  if (status.setupComplete) return false;
  const serviceStart = new Date(serviceStartDateTimeISO).getTime();
  const now = new Date(referenceDateTimeISO).getTime();
  if (Number.isNaN(serviceStart) || Number.isNaN(now)) return false;
  const minutesUntilService = (serviceStart - now) / 60_000;
  return minutesUntilService <= warningWindowMinutes;
}

export function isVendorNoShow(status: VendorDayStatus): boolean {
  return status.status === 'No Show';
}

/** Overall day-of readiness: arrived, contact confirmed, setup complete, service ready. */
export function isVendorFullyReady(status: VendorDayStatus): boolean {
  return status.primaryContactConfirmed && status.setupComplete && status.serviceReady;
}
