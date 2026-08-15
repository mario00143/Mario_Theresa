import { useCallback } from 'react';
import type { Household, InvitationMethod, InvitationStatus } from '@/types';
import { householdsStore } from '@/data/stores';
import { addHousehold, countGuestsForHousehold, deleteHousehold, updateHousehold, type NewHouseholdInput } from '@/data/repositories/householdRepository';
import {
  bulkSetFollowUpOwner,
  bulkSetInvitationMethod,
  bulkSetInvitationOwner,
  bulkSetInvitationStatus,
  markComplete,
  markDelivered,
  markFollowUpRequired,
  markReady,
  markSent,
  recordFollowUp,
} from '@/data/repositories/invitationRepository';
import { useStoreValue } from './useStore';

export function useHouseholds() {
  const households = useStoreValue(householdsStore);

  return {
    households,
    addHousehold: useCallback((input: NewHouseholdInput) => addHousehold(input), []),
    updateHousehold: useCallback((id: string, patch: Partial<Omit<Household, 'id' | 'createdAt'>>) => updateHousehold(id, patch), []),
    deleteHousehold: useCallback((id: string) => deleteHousehold(id), []),
    countGuestsForHousehold: useCallback((id: string) => countGuestsForHousehold(id), []),
    markReady: useCallback((id: string) => markReady(id), []),
    markSent: useCallback((id: string) => markSent(id), []),
    markDelivered: useCallback((id: string) => markDelivered(id), []),
    markFollowUpRequired: useCallback((id: string) => markFollowUpRequired(id), []),
    markComplete: useCallback((id: string) => markComplete(id), []),
    bulkSetInvitationStatus: useCallback((ids: string[], status: InvitationStatus) => bulkSetInvitationStatus(ids, status), []),
    bulkSetInvitationOwner: useCallback((ids: string[], owner: string) => bulkSetInvitationOwner(ids, owner), []),
    bulkSetInvitationMethod: useCallback((ids: string[], methods: InvitationMethod[]) => bulkSetInvitationMethod(ids, methods), []),
    bulkSetFollowUpOwner: useCallback((ids: string[], owner: string) => bulkSetFollowUpOwner(ids, owner), []),
    recordFollowUp: useCallback(
      (id: string, patch: { nextFollowUpAt?: string; followUpNotes?: string }) => recordFollowUp(id, patch),
      [],
    ),
  };
}

export function useHousehold(id: string | undefined): Household | undefined {
  const households = useStoreValue(householdsStore);
  return id ? households.find((h) => h.id === id) : undefined;
}
