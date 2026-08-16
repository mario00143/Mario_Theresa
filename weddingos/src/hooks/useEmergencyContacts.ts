import { useCallback } from 'react';
import type { EmergencyContact } from '@/types';
import { emergencyContactsStore } from '@/data/stores';
import { addEmergencyContact, deleteEmergencyContact, updateEmergencyContact, type NewEmergencyContactInput } from '@/data/repositories/emergencyContactRepository';
import { useStoreValue } from './useStore';

export function useEmergencyContacts() {
  const contacts = useStoreValue(emergencyContactsStore);

  return {
    emergencyContacts: contacts,
    addEmergencyContact: useCallback((input: NewEmergencyContactInput) => addEmergencyContact(input), []),
    updateEmergencyContact: useCallback((id: string, patch: Partial<Omit<EmergencyContact, 'id' | 'createdAt'>>) => updateEmergencyContact(id, patch), []),
    deleteEmergencyContact: useCallback((id: string) => deleteEmergencyContact(id), []),
  };
}
