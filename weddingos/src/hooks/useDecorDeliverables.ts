import { useCallback } from 'react';
import type { DecorDeliverable } from '@/types';
import { decorDeliverablesStore } from '@/data/stores';
import {
  addDecorDeliverable,
  deleteDecorDeliverable,
  updateDecorDeliverable,
  type NewDecorDeliverableInput,
} from '@/data/repositories/decorDeliverableRepository';
import { useStoreValue } from './useStore';

export function useDecorDeliverables() {
  const decorDeliverables = useStoreValue(decorDeliverablesStore);

  return {
    decorDeliverables,
    addDecorDeliverable: useCallback((input: NewDecorDeliverableInput) => addDecorDeliverable(input), []),
    updateDecorDeliverable: useCallback(
      (id: string, patch: Partial<Omit<DecorDeliverable, 'id' | 'createdAt'>>) => updateDecorDeliverable(id, patch),
      [],
    ),
    deleteDecorDeliverable: useCallback((id: string) => deleteDecorDeliverable(id), []),
  };
}

export function useDecorDeliverablesForPlan(decorPlanId: string | undefined): DecorDeliverable[] {
  const deliverables = useStoreValue(decorDeliverablesStore);
  return decorPlanId ? deliverables.filter((d) => d.decorPlanId === decorPlanId) : [];
}
