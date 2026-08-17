import { useEffect, useRef } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { isSupabaseSyncActive } from '@/lib/runtimeSession';
import { refreshOfflineSnapshot } from '@/data/offline/offlineSnapshot';

/**
 * Mounted once near the root of the authenticated app tree. Has no visible
 * UI of its own — it watches for the offline -> online transition and
 * triggers the queued-mutation replay (section 15) plus an Offline Pack
 * refresh, so reconnecting is automatic rather than requiring the user to
 * remember to do anything.
 */
export function OfflineSyncManager() {
  const isOnline = useOnlineStatus();
  const { replay } = useOfflineQueue();
  const wasOffline = useRef(!isOnline);

  useEffect(() => {
    if (isOnline && wasOffline.current && isSupabaseSyncActive()) {
      void (async () => {
        await replay();
        await refreshOfflineSnapshot();
      })();
    }
    wasOffline.current = !isOnline;
  }, [isOnline, replay]);

  return null;
}
