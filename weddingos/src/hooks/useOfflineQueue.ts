import { useCallback, useEffect, useState } from 'react';
import { getOfflineQueueState, onOfflineQueueChange, setOfflineQueueMutations, markOfflineQueueReplayed, type OfflineQueueState } from '@/lib/offlineQueueStatus';
import { listOfflineMutations, replayOfflineMutationQueue, discardOfflineMutation, resolveConflictKeepServer, resolveConflictApplyMine, manualRetryOfflineMutation } from '@/data/offline/offlineMutationQueue';
import { isSupabaseSyncActive } from '@/lib/runtimeSession';

export function useOfflineQueue() {
  const [state, setState] = useState<OfflineQueueState>(getOfflineQueueState());

  const refresh = useCallback(async () => {
    const mutations = await listOfflineMutations();
    setOfflineQueueMutations(mutations);
  }, []);

  useEffect(() => onOfflineQueueChange(() => setState(getOfflineQueueState())), []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const replay = useCallback(async () => {
    if (!isSupabaseSyncActive()) return;
    await replayOfflineMutationQueue();
    markOfflineQueueReplayed();
    await refresh();
  }, [refresh]);

  const discard = useCallback(
    async (id: string) => {
      await discardOfflineMutation(id);
      await refresh();
    },
    [refresh],
  );

  const keepServer = useCallback(
    async (id: string) => {
      await resolveConflictKeepServer(id);
      await refresh();
    },
    [refresh],
  );

  const applyMine = useCallback(
    async (id: string) => {
      await resolveConflictApplyMine(id);
      await replay();
    },
    [replay],
  );

  const retry = useCallback(
    async (id: string) => {
      await manualRetryOfflineMutation(id);
      await replay();
    },
    [replay],
  );

  return { ...state, refresh, replay, discard, keepServer, applyMine, retry };
}
