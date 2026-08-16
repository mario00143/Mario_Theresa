import { useCallback } from 'react';
import type { DutyAssignment } from '@/types';
import { dutyAssignmentsStore } from '@/data/stores';
import { addDutyAssignment, deleteDutyAssignment, updateDutyAssignment, type NewDutyAssignmentInput } from '@/data/repositories/dutyAssignmentRepository';
import { useStoreValue } from './useStore';

export function useDutyAssignments() {
  const duties = useStoreValue(dutyAssignmentsStore);

  return {
    dutyAssignments: duties,
    addDutyAssignment: useCallback((input: NewDutyAssignmentInput) => addDutyAssignment(input), []),
    updateDutyAssignment: useCallback((id: string, patch: Partial<Omit<DutyAssignment, 'id' | 'createdAt'>>) => updateDutyAssignment(id, patch), []),
    deleteDutyAssignment: useCallback((id: string) => deleteDutyAssignment(id), []),
  };
}
