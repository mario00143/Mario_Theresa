import { useCallback } from 'react';
import type { ChurchRequirement } from '@/types';
import { churchRequirementsStore } from '@/data/stores';
import {
  addChurchRequirement,
  deleteChurchRequirement,
  updateChurchRequirement,
  verifyChurchRequirement,
  type NewChurchRequirementInput,
} from '@/data/repositories/churchRequirementRepository';
import { useStoreValue } from './useStore';

export function useChurchRequirements() {
  const churchRequirements = useStoreValue(churchRequirementsStore);

  return {
    churchRequirements,
    addChurchRequirement: useCallback((input: NewChurchRequirementInput) => addChurchRequirement(input), []),
    updateChurchRequirement: useCallback(
      (id: string, patch: Partial<Omit<ChurchRequirement, 'id' | 'createdAt'>>) => updateChurchRequirement(id, patch),
      [],
    ),
    deleteChurchRequirement: useCallback((id: string) => deleteChurchRequirement(id), []),
    verifyChurchRequirement: useCallback((id: string, verifiedBy: string) => verifyChurchRequirement(id, verifiedBy), []),
  };
}

export function useChurchRequirementsForProfile(churchProfileId: string | undefined): ChurchRequirement[] {
  const requirements = useStoreValue(churchRequirementsStore);
  return churchProfileId ? requirements.filter((r) => r.churchProfileId === churchProfileId) : [];
}
