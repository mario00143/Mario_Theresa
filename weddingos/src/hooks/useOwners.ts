import { useCallback } from 'react';
import { ownersStore } from '@/data/stores';
import { addOwner, countTasksForOwner, deleteOwner, renameOwner } from '@/data/repositories/ownerRepository';
import { useStoreValue } from './useStore';

export function useOwners() {
  const owners = useStoreValue(ownersStore);

  return {
    owners,
    addOwner: useCallback((name: string) => addOwner(name), []),
    renameOwner: useCallback((id: string, name: string) => renameOwner(id, name), []),
    deleteOwner: useCallback((id: string) => deleteOwner(id), []),
    countTasksForOwner: useCallback((name: string) => countTasksForOwner(name), []),
  };
}
