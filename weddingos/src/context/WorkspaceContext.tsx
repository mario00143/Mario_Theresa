import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { NewWorkspaceInput, Workspace, WorkspaceMember } from '@/types';
import { useAuth } from './AuthContext';
import { createWorkspace, listMyWorkspaces } from '@/data/supabase/workspaceRepository';
import { getMyMembership } from '@/data/supabase/membershipRepository';
import { fetchWorkspaceSettings, saveWorkspaceSettings } from '@/data/supabase/workspaceSettingsRepository';
import { hydrateAllSyncedStores, settingsStore } from '@/data/stores';
import { isSupabaseSyncActive, resetRuntimeSession, setRuntimeSession } from '@/lib/runtimeSession';
import { setSyncStatus } from '@/lib/syncStatus';
import { logAuditAction } from '@/data/supabase/auditLogRepository';

const LAST_WORKSPACE_KEY = 'weddingos:lastWorkspaceId';

export interface WorkspaceContextValue {
  loading: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentMembership: WorkspaceMember | null;
  error: string | null;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createNewWorkspace: (input: NewWorkspaceInput) => Promise<void>;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { supabaseEnabled, session, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentMembership, setCurrentMembership] = useState<WorkspaceMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const suppressSettingsPush = useRef(false);

  // Push local settings edits up to Supabase whenever they change while a
  // workspace is active — settings aren't part of SYNCED_STORES (it's a
  // single JSONB blob per workspace, not an array collection), so it gets
  // its own small sync loop here instead of the generic store-diff path.
  useEffect(() => {
    return settingsStore.subscribe(() => {
      if (suppressSettingsPush.current) return;
      if (!isSupabaseSyncActive() || !currentWorkspace) return;
      setSyncStatus('saving');
      void saveWorkspaceSettings(currentWorkspace.id, settingsStore.get())
        .then(() => {
          setSyncStatus('synced');
          logAuditAction({
            action: 'workspaceSettings.update',
            entityType: 'Workspace',
            entityId: currentWorkspace.id,
            summary: 'Updated workspace settings',
          });
        })
        .catch((err) => setSyncStatus('error', err instanceof Error ? err.message : 'Failed to save settings'));
    });
  }, [currentWorkspace]);

  const activateWorkspace = useCallback(async (workspace: Workspace, userId: string) => {
    const membership = await getMyMembership(workspace.id, userId);
    if (!membership || membership.status !== 'Active') {
      setError('Your access to this workspace is no longer active. Contact your workspace Admin.');
      setCurrentWorkspace(null);
      setCurrentMembership(null);
      resetRuntimeSession();
      return;
    }
    setRuntimeSession({ mode: 'supabase', workspaceId: workspace.id, userId });
    setCurrentWorkspace(workspace);
    setCurrentMembership(membership);
    localStorage.setItem(LAST_WORKSPACE_KEY, workspace.id);

    setSyncStatus('saving');
    try {
      await hydrateAllSyncedStores();
      const remoteSettings = await fetchWorkspaceSettings(workspace.id);
      if (remoteSettings) {
        suppressSettingsPush.current = true;
        settingsStore.set(remoteSettings);
        suppressSettingsPush.current = false;
      }
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error', err instanceof Error ? err.message : 'Failed to load workspace data');
    }
  }, []);

  const loadWorkspaces = useCallback(async () => {
    if (!supabaseEnabled || !session || !profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listMyWorkspaces();
      setWorkspaces(list);
      const lastId = localStorage.getItem(LAST_WORKSPACE_KEY);
      const target = list.find((w) => w.id === lastId) ?? (list.length === 1 ? list[0] : null);
      if (target) {
        await activateWorkspace(target, profile.id);
      } else {
        setCurrentWorkspace(null);
        setCurrentMembership(null);
        resetRuntimeSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  }, [supabaseEnabled, session, profile, activateWorkspace]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      loading,
      workspaces,
      currentWorkspace,
      currentMembership,
      error,
      async selectWorkspace(workspaceId) {
        const workspace = workspaces.find((w) => w.id === workspaceId);
        if (!workspace || !profile) return;
        setLoading(true);
        await activateWorkspace(workspace, profile.id);
        setLoading(false);
      },
      async createNewWorkspace(input) {
        setError(null);
        try {
          await createWorkspace(input);
          await loadWorkspaces();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to create workspace.');
          throw err;
        }
      },
      refresh: loadWorkspaces,
    }),
    [loading, workspaces, currentWorkspace, currentMembership, error, profile, activateWorkspace, loadWorkspaces],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

/**
 * WorkspaceProvider is only mounted once a user is authenticated (see
 * App.tsx's AuthenticatedGate) — Demo/Local Mode, and the pre-auth
 * Supabase-mode screens, render plenty of shared components (DocumentsPage,
 * etc.) with no provider above them at all. Rather than force every such
 * component to special-case "am I inside a WorkspaceProvider?", this
 * returns an inert "no workspace" value outside one — a real, meaningful
 * state (there genuinely is no active workspace), not an error.
 */
const NO_WORKSPACE_VALUE: WorkspaceContextValue = {
  loading: false,
  workspaces: [],
  currentWorkspace: null,
  currentMembership: null,
  error: null,
  async selectWorkspace() {},
  async createNewWorkspace() {},
  async refresh() {},
};

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  return ctx ?? NO_WORKSPACE_VALUE;
}
