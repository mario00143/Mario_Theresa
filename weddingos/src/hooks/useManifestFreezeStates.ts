import { useCallback } from 'react';
import type { ManifestType } from '@/types';
import { manifestFreezeStatesStore } from '@/data/stores';
import { freezeManifest, unfreezeManifest } from '@/data/repositories/manifestFreezeStateRepository';
import { useStoreValue } from './useStore';

export function useManifestFreezeStates() {
  const states = useStoreValue(manifestFreezeStatesStore);

  return {
    manifestFreezeStates: states,
    freezeManifest: useCallback((manifestType: ManifestType, frozenBy: string) => freezeManifest(manifestType, frozenBy), []),
    unfreezeManifest: useCallback((manifestType: ManifestType) => unfreezeManifest(manifestType), []),
  };
}

export function useManifestFreezeState(manifestType: ManifestType) {
  const states = useStoreValue(manifestFreezeStatesStore);
  return states.find((s) => s.manifestType === manifestType);
}
