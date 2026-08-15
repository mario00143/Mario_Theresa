import { useCallback } from 'react';
import type { Guest, GuestEvent, RsvpResponse, RsvpStatus } from '@/types';
import { guestsStore } from '@/data/stores';
import { addGuest, deleteGuest, moveGuestToHousehold, updateGuest, type NewGuestInput } from '@/data/repositories/guestRepository';
import {
  bulkSetHouseholdRsvpStatus,
  resetHouseholdRsvpToPending,
  setGuestRsvpStatus,
  updateGuestRsvp,
} from '@/data/repositories/rsvpRepository';
import { useStoreValue } from './useStore';

export function useGuests() {
  const guests = useStoreValue(guestsStore);

  return {
    guests,
    addGuest: useCallback((input: NewGuestInput) => addGuest(input), []),
    updateGuest: useCallback((id: string, patch: Partial<Omit<Guest, 'id' | 'createdAt'>>) => updateGuest(id, patch), []),
    deleteGuest: useCallback((id: string) => deleteGuest(id), []),
    moveGuestToHousehold: useCallback((guestId: string, householdId: string) => moveGuestToHousehold(guestId, householdId), []),
    updateGuestRsvp: useCallback(
      (guestId: string, event: GuestEvent, patch: Partial<Omit<RsvpResponse, 'event'>>) => updateGuestRsvp(guestId, event, patch),
      [],
    ),
    setGuestRsvpStatus: useCallback((guestId: string, event: GuestEvent, status: RsvpStatus) => setGuestRsvpStatus(guestId, event, status), []),
    bulkSetHouseholdRsvpStatus: useCallback(
      (householdId: string, event: GuestEvent, status: RsvpStatus) => bulkSetHouseholdRsvpStatus(householdId, event, status),
      [],
    ),
    resetHouseholdRsvpToPending: useCallback((householdId: string, event: GuestEvent) => resetHouseholdRsvpToPending(householdId, event), []),
  };
}

export function useGuest(id: string | undefined): Guest | undefined {
  const guests = useStoreValue(guestsStore);
  return id ? guests.find((g) => g.id === id) : undefined;
}

export function useGuestsForHousehold(householdId: string | undefined): Guest[] {
  const guests = useStoreValue(guestsStore);
  return householdId ? guests.filter((g) => g.householdId === householdId) : [];
}
