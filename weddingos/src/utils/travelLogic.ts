import type { TravelSegment } from '@/types';
import { ENGAGEMENT_DATE, WEDDING_DATE } from '@/lib/constants';
import { daysUntil, parseDate } from './date';

export interface TravelValidationWarning {
  field: string;
  message: string;
}

const EVENT_WINDOW_DAYS = 6;

function isFarFromEventWindow(dateISO: string | undefined, eventDate: string): boolean {
  if (!dateISO) return false;
  const diff = daysUntil(eventDate, parseDate(dateISO) ?? new Date());
  return diff === null ? false : Math.abs(diff) > EVENT_WINDOW_DAYS;
}

/**
 * Non-blocking, per-segment validation warnings (Phase 3 section 6). None of
 * these block saving — outstation guests genuinely have unusual itineraries
 * sometimes, so these are surfaced as warnings for a human to confirm.
 */
export function validateTravelSegment(segment: TravelSegment): TravelValidationWarning[] {
  const warnings: TravelValidationWarning[] = [];

  if (segment.arrivalDate && !segment.arrivalTime) {
    warnings.push({ field: 'arrivalTime', message: 'Arrival date is set but arrival time is missing.' });
  }
  if (segment.departureDate && !segment.departureTime) {
    warnings.push({ field: 'departureTime', message: 'Departure date is set but departure time is missing.' });
  }

  if (segment.pickupRequired && segment.direction === 'Arrival' && !segment.destination.trim()) {
    warnings.push({ field: 'destination', message: 'Pickup is required but the arrival location is missing.' });
  }
  if (segment.dropRequired && segment.direction === 'Departure' && !segment.origin.trim()) {
    warnings.push({ field: 'origin', message: 'Drop is required but the departure location is missing.' });
  }

  if (segment.bookingStatus === 'Confirmed' && !segment.bookingReference?.trim()) {
    warnings.push({ field: 'bookingReference', message: 'Booking status is Confirmed but no booking reference is on file.' });
  }

  if (segment.arrivalDate && segment.departureDate) {
    const arrival = parseDate(segment.arrivalDate);
    const departure = parseDate(segment.departureDate);
    if (arrival && departure && departure.getTime() < arrival.getTime()) {
      warnings.push({ field: 'departureDate', message: 'Departure date is before the arrival date on this segment.' });
    }
  }

  if (segment.event === 'Engagement') {
    if (isFarFromEventWindow(segment.arrivalDate, ENGAGEMENT_DATE) || isFarFromEventWindow(segment.departureDate, ENGAGEMENT_DATE)) {
      warnings.push({ field: 'event', message: 'Travel dates look far from the Engagement date — confirm this segment is tagged to the right event.' });
    }
  } else if (segment.event === 'Wedding') {
    if (isFarFromEventWindow(segment.arrivalDate, WEDDING_DATE) || isFarFromEventWindow(segment.departureDate, WEDDING_DATE)) {
      warnings.push({ field: 'event', message: 'Travel dates look far from the Wedding date — confirm this segment is tagged to the right event.' });
    }
  }

  return warnings;
}
