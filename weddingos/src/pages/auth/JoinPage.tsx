import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { acceptInvite } from '@/data/supabase/membershipRepository';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from './AuthLayout';

/** Reached via a workspace invite link (`#/join?token=...`, section 19). Works whether the visitor is already signed in or not. */
export function JoinPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { session, loading: authLoading } = useAuth();
  const { refresh } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'idle' | 'joining' | 'joined' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || authLoading || status !== 'idle') return;
    setStatus('joining');
    acceptInvite(token)
      .then(async () => {
        await refresh();
        setStatus('joined');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not accept this invite.');
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, authLoading, status, token]);

  if (!token) {
    return (
      <AuthLayout title="Invalid invite link" subtitle="This link is missing an invite token.">
        <Button variant="primary" fullWidth onClick={() => navigate('/')}>
          Go to WeddingOS
        </Button>
      </AuthLayout>
    );
  }

  if (authLoading) {
    return <AuthLayout title="Loading…">{null}</AuthLayout>;
  }

  if (!session) {
    return (
      <AuthLayout title="Join a wedding workspace" subtitle="Sign in or create an account to accept this invite.">
        <div className="space-y-2">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/login', { state: { redirectTo: `/join${location.search}` } })}
          >
            Sign in
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/signup', { state: { redirectTo: `/join${location.search}` } })}
          >
            Create account
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'joined') {
    return (
      <AuthLayout title="You're in!" subtitle="Your membership has been activated.">
        <Button variant="primary" fullWidth onClick={() => navigate('/', { replace: true })}>
          Go to workspace
        </Button>
      </AuthLayout>
    );
  }

  if (status === 'error') {
    return (
      <AuthLayout title="Couldn't join this workspace" subtitle={error ?? undefined}>
        <Button variant="primary" fullWidth onClick={() => navigate('/')}>
          Go to WeddingOS
        </Button>
      </AuthLayout>
    );
  }

  return <AuthLayout title="Joining workspace…">{null}</AuthLayout>;
}
