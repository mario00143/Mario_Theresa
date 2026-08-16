import { useCallback } from 'react';
import type { PhotoGroup } from '@/types';
import { photoGroupsStore } from '@/data/stores';
import { addPhotoGroup, deletePhotoGroup, updatePhotoGroup, type NewPhotoGroupInput } from '@/data/repositories/photoGroupRepository';
import { useStoreValue } from './useStore';

export function usePhotoGroups() {
  const groups = useStoreValue(photoGroupsStore);

  return {
    photoGroups: [...groups].sort((a, b) => a.sequenceOrder - b.sequenceOrder),
    addPhotoGroup: useCallback((input: NewPhotoGroupInput) => addPhotoGroup(input), []),
    updatePhotoGroup: useCallback((id: string, patch: Partial<Omit<PhotoGroup, 'id' | 'createdAt'>>) => updatePhotoGroup(id, patch), []),
    deletePhotoGroup: useCallback((id: string) => deletePhotoGroup(id), []),
  };
}
