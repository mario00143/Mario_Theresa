import { useCallback } from 'react';
import type { GuestOperationalState, GuestOperationalStatus } from '@/types';
import { guestOperationalStatusesStore } from '@/data/stores';
import {
  addGuestOperationalStatus,
  deleteGuestOperationalStatus,
  setGuestOperationalState,
  updateGuestOperationalStatus,
  type NewGuestOperationalStatusInput,
} from '@/data/repositories/guestOperationalStatusRepository';
import { useStoreValue } from './useStore';

export function useGuestOperationalStatuses() {
  const statuses = useStoreValue(guestOperationalStatusesStore);

  return {
    guestOperationalStatuses: statuses,
    addGuestOperationalStatus: useCallback((input: NewGuestOperationalStatusInput) => addGuestOperationalStatus(input), []),
    updateGuestOperationalStatus: useCallback((id: string, patch: Partial<Omit<GuestOperationalStatus, 'id' | 'createdAt'>>) => updateGuestOperationalStatus(id, patch), []),
    deleteGuestOperationalStatus: useCallback((id: string) => deleteGuestOperationalStatus(id), []),
    setGuestOperationalState: useCallback((id: string, state: GuestOperationalState) => setGuestOperationalState(id, state), []),
  };
}

export function useGuestOperationalStatusForGuest(guestId: string | undefined): GuestOperationalStatus | undefined {
  const statuses = useStoreValue(guestOperationalStatusesStore);
  return guestId ? statuses.find((s) => s.guestId === guestId) : undefined;
}
