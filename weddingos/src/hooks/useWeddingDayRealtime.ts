import { useEffect } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/context/WorkspaceContext';
import { isSupabaseSyncActive } from '@/lib/runtimeSession';
import { hydrateSyncedStore } from '@/lib/supabaseSync';
import {
  ceremonyItemMovementsStore,
  closeoutItemsStore,
  liveIssuesStore,
  runSheetItemsStore,
  vendorDayStatusesStore,
} from '@/data/stores';

/** table -> a thunk that re-hydrates the matching store. Bound per-store so each keeps its own generic type — see stores.ts's SYNCED_STORE_HYDRATORS for the same pattern. */
const REALTIME_TABLES: Array<{ table: string; refetch: () => Promise<void> }> = [
  { table: 'live_issues', refetch: () => hydrateSyncedStore(liveIssuesStore) },
  { table: 'run_sheet_items', refetch: () => hydrateSyncedStore(runSheetItemsStore) },
  { table: 'vendor_day_statuses', refetch: () => hydrateSyncedStore(vendorDayStatusesStore) },
  { table: 'ceremony_item_movements', refetch: () => hydrateSyncedStore(ceremonyItemMovementsStore) },
  { table: 'closeout_items', refetch: () => hydrateSyncedStore(closeoutItemsStore) },
];

/**
 * Section 27-28: Realtime is deliberately scoped to only the five Wedding
 * Day operational tables (not subscribed by default anywhere else), is
 * workspace-filtered, and is only mounted by pages under /wedding-day —
 * so a device sitting on the Guests tab isn't holding five open
 * websocket-backed subscriptions it doesn't need. On any change, the
 * affected table is simply re-fetched in full rather than patched
 * row-by-row — correct and simple at this data volume (hundreds of rows,
 * not thousands), and it reuses the exact same hydrate path bootstrap
 * already uses, so there's one code path for "get this table's current
 * state from Supabase," not two.
 *
 * RLS remains authoritative for every read this triggers — a realtime
 * change notification is never trusted for authorization by itself
 * (section 72), it only tells us "something changed, go re-fetch," and
 * the re-fetch goes through the same RLS-protected select every other
 * read does.
 */
export function useWeddingDayRealtime(): void {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !workspaceId || !isSupabaseSyncActive()) return;

    const channels: RealtimeChannel[] = REALTIME_TABLES.map(({ table, refetch }) => {
      const channel = client.channel(`wedding-day:${table}:${workspaceId}`).on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `workspace_id=eq.${workspaceId}` },
        () => {
          void refetch();
        },
      );
      channel.subscribe();
      return channel;
    });

    return () => {
      for (const channel of channels) {
        void client.removeChannel(channel);
      }
    };
  }, [workspaceId]);
}
