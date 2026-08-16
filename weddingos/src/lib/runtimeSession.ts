/**
 * Bridges React auth/workspace state into plain (non-React) library code —
 * lib/store.ts and lib/supabaseSync.ts need to know "are we in Supabase
 * mode, and for which workspace" without importing React context. This is
 * a small observable singleton, updated by AuthProvider/WorkspaceProvider
 * via useEffect, and read imperatively everywhere else.
 */

export type SyncMode = 'local' | 'supabase';

export interface RuntimeSession {
  /** 'local' = Demo/Local Mode (localStorage only). 'supabase' = signed in with an active workspace. */
  mode: SyncMode;
  workspaceId: string | null;
  userId: string | null;
}

let session: RuntimeSession = { mode: 'local', workspaceId: null, userId: null };
const listeners = new Set<() => void>();

export function getRuntimeSession(): RuntimeSession {
  return session;
}

export function setRuntimeSession(next: Partial<RuntimeSession>): void {
  session = { ...session, ...next };
  for (const listener of listeners) listener();
}

export function onRuntimeSessionChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True only when Supabase is the active backend AND a workspace is selected — the gate every sync path checks. */
export function isSupabaseSyncActive(): boolean {
  return session.mode === 'supabase' && Boolean(session.workspaceId) && Boolean(session.userId);
}

export function resetRuntimeSession(): void {
  setRuntimeSession({ mode: 'local', workspaceId: null, userId: null });
}
