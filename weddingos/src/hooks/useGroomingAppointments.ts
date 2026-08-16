import { useCallback } from 'react';
import type { GroomingAppointment } from '@/types';
import { groomingAppointmentsStore } from '@/data/stores';
import {
  addGroomingAppointment,
  deleteGroomingAppointment,
  updateGroomingAppointment,
  type NewGroomingAppointmentInput,
} from '@/data/repositories/groomingAppointmentRepository';
import { useStoreValue } from './useStore';

export function useGroomingAppointments() {
  const groomingAppointments = useStoreValue(groomingAppointmentsStore);

  return {
    groomingAppointments,
    addGroomingAppointment: useCallback((input: NewGroomingAppointmentInput) => addGroomingAppointment(input), []),
    updateGroomingAppointment: useCallback(
      (id: string, patch: Partial<Omit<GroomingAppointment, 'id' | 'createdAt'>>) => updateGroomingAppointment(id, patch),
      [],
    ),
    deleteGroomingAppointment: useCallback((id: string) => deleteGroomingAppointment(id), []),
  };
}
