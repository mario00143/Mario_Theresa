import { useCallback } from 'react';
import type { CeremonyItemMovement } from '@/types';
import { ceremonyItemMovementsStore } from '@/data/stores';
import {
  addCeremonyItemMovement,
  deleteCeremonyItemMovement,
  updateCeremonyItemMovement,
  type NewCeremonyItemMovementInput,
} from '@/data/repositories/ceremonyItemMovementRepository';
import { useStoreValue } from './useStore';

export function useCeremonyItemMovements() {
  const movements = useStoreValue(ceremonyItemMovementsStore);

  return {
    ceremonyItemMovements: movements,
    addCeremonyItemMovement: useCallback((input: NewCeremonyItemMovementInput) => addCeremonyItemMovement(input), []),
    updateCeremonyItemMovement: useCallback((id: string, patch: Partial<Omit<CeremonyItemMovement, 'id' | 'createdAt'>>) => updateCeremonyItemMovement(id, patch), []),
    deleteCeremonyItemMovement: useCallback((id: string) => deleteCeremonyItemMovement(id), []),
  };
}

/** Movement history for one ceremony item, sorted oldest to newest. */
export function useCeremonyItemMovementsForItem(ceremonyItemId: string | undefined): CeremonyItemMovement[] {
  const movements = useStoreValue(ceremonyItemMovementsStore);
  return ceremonyItemId
    ? movements.filter((m) => m.ceremonyItemId === ceremonyItemId).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    : [];
}
