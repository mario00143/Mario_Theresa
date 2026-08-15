import { useCallback } from 'react';
import type { TransportAssignment } from '@/types';
import { transportAssignmentsStore } from '@/data/stores';
import {
  addTransportAssignment,
  deleteTransportAssignment,
  updateTransportAssignment,
  type NewTransportAssignmentInput,
} from '@/data/repositories/transportAssignmentRepository';
import { useStoreValue } from './useStore';

export function useTransportAssignments() {
  const transportAssignments = useStoreValue(transportAssignmentsStore);

  return {
    transportAssignments,
    addTransportAssignment: useCallback((input: NewTransportAssignmentInput) => addTransportAssignment(input), []),
    updateTransportAssignment: useCallback(
      (id: string, patch: Partial<Omit<TransportAssignment, 'id' | 'createdAt'>>) => updateTransportAssignment(id, patch),
      [],
    ),
    deleteTransportAssignment: useCallback((id: string) => deleteTransportAssignment(id), []),
  };
}

export function useTransportAssignmentsForGuest(guestId: string | undefined): TransportAssignment[] {
  const transportAssignments = useStoreValue(transportAssignmentsStore);
  return guestId ? transportAssignments.filter((a) => a.guestId === guestId) : [];
}

export function useTransportAssignmentsForRoute(routeId: string | undefined): TransportAssignment[] {
  const transportAssignments = useStoreValue(transportAssignmentsStore);
  return routeId ? transportAssignments.filter((a) => a.routeId === routeId) : [];
}
