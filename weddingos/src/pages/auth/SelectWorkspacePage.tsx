import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from './AuthLayout';

export function SelectWorkspacePage() {
  const { workspaces, selectWorkspace } = useWorkspace();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthLayout title="Choose a workspace" subtitle="You belong to more than one wedding workspace.">
      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => void selectWorkspace(workspace.id)}
            className="border-line bg-surface hover:bg-surface-subtle w-full rounded-lg border p-3 text-left transition-colors"
          >
            <p className="text-ink text-sm font-semibold">{workspace.name}</p>
            <p className="text-ink-faint text-xs">
              {workspace.groomName} &amp; {workspace.brideName}
            </p>
          </button>
        ))}
      </div>
      <Button variant="secondary" fullWidth className="mt-4" onClick={() => navigate('/create-workspace')}>
        Create a new workspace
      </Button>
      <button type="button" onClick={() => void signOut()} className="text-ink-faint mt-4 w-full text-center text-sm hover:underline">
        Sign out
      </button>
    </AuthLayout>
  );
}
