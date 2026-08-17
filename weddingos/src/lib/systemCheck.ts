import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { isIndexedDbAvailable, putSnapshot, getSnapshot } from '@/data/offline/offlineDb';

export type SystemCheckStatus = 'pass' | 'warning' | 'fail';

export interface SystemCheckResult {
  label: string;
  status: SystemCheckStatus;
  detail: string;
}

/**
 * Section 45's "Run System Check" — a lightweight, on-demand set of live
 * checks (not a passive dashboard) with plain-language remediation. Every
 * check is read-only or writes only a disposable probe value, never real
 * wedding data.
 */
export async function runSystemCheck(): Promise<SystemCheckResult[]> {
  const results: SystemCheckResult[] = [];

  if (!isSupabaseConfigured()) {
    results.push({ label: 'Backend (Supabase)', status: 'pass', detail: 'Demo/Local Mode — no backend is configured, so nothing to check here. All data stays on this device.' });
  } else {
    const client = getSupabaseClient();
    if (!client) {
      results.push({ label: 'Backend (Supabase)', status: 'fail', detail: 'Supabase client failed to initialize despite env vars being present. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.' });
    } else {
      try {
        const { error } = await client.auth.getSession();
        results.push(error ? { label: 'Auth reachable', status: 'fail', detail: error.message } : { label: 'Auth reachable', status: 'pass', detail: 'Auth service responded normally.' });
      } catch (err) {
        results.push({ label: 'Auth reachable', status: 'fail', detail: err instanceof Error ? err.message : 'Could not reach the auth service — check your connection.' });
      }

      try {
        const { error } = await client.from('workspaces').select('id').limit(1);
        results.push(error ? { label: 'Database reachable', status: 'fail', detail: error.message } : { label: 'Database reachable', status: 'pass', detail: 'A test query succeeded.' });
      } catch (err) {
        results.push({ label: 'Database reachable', status: 'fail', detail: err instanceof Error ? err.message : 'Could not reach the database — check your connection.' });
      }

      try {
        const { error } = await client.storage.from('documents').list('', { limit: 1 });
        results.push(error ? { label: 'Document storage reachable', status: 'warning', detail: error.message } : { label: 'Document storage reachable', status: 'pass', detail: 'Storage bucket responded normally.' });
      } catch (err) {
        results.push({ label: 'Document storage reachable', status: 'warning', detail: err instanceof Error ? err.message : 'Could not reach document storage.' });
      }
    }
  }

  if (!isIndexedDbAvailable()) {
    results.push({ label: 'Offline snapshot storage writable', status: 'fail', detail: 'IndexedDB is unavailable in this browser/context — the Offline Pack cannot be saved on this device. Try a different browser or disable private browsing.' });
  } else {
    try {
      const probe = await getSnapshot();
      if (probe) await putSnapshot(probe);
      results.push({ label: 'Offline snapshot storage writable', status: 'pass', detail: 'This device can save the Offline Pack.' });
    } catch (err) {
      results.push({ label: 'Offline snapshot storage writable', status: 'fail', detail: err instanceof Error ? err.message : 'Could not write to this device\'s offline storage — it may be full.' });
    }
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    results.push(
      registration
        ? { label: 'Service worker active', status: 'pass', detail: 'The offline app shell is installed and active on this device.' }
        : { label: 'Service worker active', status: 'warning', detail: 'No service worker is registered yet on this device — reload the app once while online, or the browser may not support installable apps.' },
    );
  } else {
    results.push({ label: 'Service worker active', status: 'warning', detail: 'This browser does not support service workers — offline mode and installability will not work here.' });
  }

  return results;
}
