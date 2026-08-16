import { useCallback } from 'react';
import type { CeremonyParticipant } from '@/types';
import { ceremonyParticipantsStore } from '@/data/stores';
import {
  addCeremonyParticipant,
  confirmCeremonyParticipant,
  deleteCeremonyParticipant,
  updateCeremonyParticipant,
  type NewCeremonyParticipantInput,
} from '@/data/repositories/ceremonyParticipantRepository';
import { useStoreValue } from './useStore';

export function useCeremonyParticipants() {
  const ceremonyParticipants = useStoreValue(ceremonyParticipantsStore);

  return {
    ceremonyParticipants,
    addCeremonyParticipant: useCallback((input: NewCeremonyParticipantInput) => addCeremonyParticipant(input), []),
    updateCeremonyParticipant: useCallback(
      (id: string, patch: Partial<Omit<CeremonyParticipant, 'id' | 'createdAt'>>) => updateCeremonyParticipant(id, patch),
      [],
    ),
    deleteCeremonyParticipant: useCallback((id: string) => deleteCeremonyParticipant(id), []),
    confirmCeremonyParticipant: useCallback((id: string, confirmed: boolean) => confirmCeremonyParticipant(id, confirmed), []),
  };
}
