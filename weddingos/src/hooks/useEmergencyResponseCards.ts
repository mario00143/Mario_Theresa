import { useCallback } from 'react';
import type { EmergencyResponseCard } from '@/types';
import { emergencyResponseCardsStore } from '@/data/stores';
import {
  addEmergencyResponseCard,
  deleteEmergencyResponseCard,
  updateEmergencyResponseCard,
  type NewEmergencyResponseCardInput,
} from '@/data/repositories/emergencyResponseCardRepository';
import { useStoreValue } from './useStore';

export function useEmergencyResponseCards() {
  const cards = useStoreValue(emergencyResponseCardsStore);

  return {
    emergencyResponseCards: cards,
    addEmergencyResponseCard: useCallback((input: NewEmergencyResponseCardInput) => addEmergencyResponseCard(input), []),
    updateEmergencyResponseCard: useCallback((id: string, patch: Partial<Omit<EmergencyResponseCard, 'id' | 'createdAt'>>) => updateEmergencyResponseCard(id, patch), []),
    deleteEmergencyResponseCard: useCallback((id: string) => deleteEmergencyResponseCard(id), []),
  };
}
