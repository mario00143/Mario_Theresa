import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRuntimeSession, isSupabaseSyncActive, onRuntimeSessionChange, resetRuntimeSession, setRuntimeSession } from '@/lib/runtimeSession';

describe('runtimeSession', () => {
  beforeEach(() => {
    resetRuntimeSession();
  });

  it('defaults to local mode with no workspace/user', () => {
    expect(getRuntimeSession()).toEqual({ mode: 'local', workspaceId: null, userId: null });
  });

  it('isSupabaseSyncActive is false in local mode', () => {
    expect(isSupabaseSyncActive()).toBe(false);
  });

  it('isSupabaseSyncActive requires mode=supabase AND a workspaceId AND a userId', () => {
    setRuntimeSession({ mode: 'supabase' });
    expect(isSupabaseSyncActive()).toBe(false);
    setRuntimeSession({ workspaceId: 'ws-1' });
    expect(isSupabaseSyncActive()).toBe(false);
    setRuntimeSession({ userId: 'user-1' });
    expect(isSupabaseSyncActive()).toBe(true);
  });

  it('resetRuntimeSession returns to local mode', () => {
    setRuntimeSession({ mode: 'supabase', workspaceId: 'ws-1', userId: 'user-1' });
    expect(isSupabaseSyncActive()).toBe(true);
    resetRuntimeSession();
    expect(isSupabaseSyncActive()).toBe(false);
  });

  it('notifies listeners on every setRuntimeSession call', () => {
    const listener = vi.fn();
    const unsubscribe = onRuntimeSessionChange(listener);
    setRuntimeSession({ mode: 'supabase' });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    setRuntimeSession({ mode: 'local' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
